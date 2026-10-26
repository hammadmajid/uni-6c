"""A small load-balancing simulator for the Prequal paper (Wydrowski et al., NSDI '24).

The environment is a fleet of servers that share their machines with "antagonists"
(other jobs whose CPU use goes up and down), so each server's speed changes over time.
Requests arrive at random and have random sizes. Each server works on all its requests
at once (processor sharing), so a server with more requests in flight (RIF) answers
each of them more slowly.

Four agents pick a server for every request:
  RoundRobin  - no sensing, next server in a cycle
  LowestCPU   - senses each server's average CPU over the last second (stale)
  PowerOfTwo  - two random servers, the one with fewer of this client's requests running
  Prequal     - async probes into a probe pool, hot/cold rule on RIF and latency

The simulation steps time forward in 1 ms ticks.
"""

from collections import deque
import heapq
import random

import numpy as np

DT = 1.0  # ms per tick


class Server:
    def __init__(self, sid):
        self.sid = sid
        self.speed = 1.0           # work units per ms left over after the antagonist
        self.antagonist = 0.0      # share of the machine the antagonist is using
        self.active = []           # [remaining_work, arrival_ms, rif_at_arrival]
        self.lat_by_rif = {}       # RIF at arrival -> recent latencies, the paper's L(r)
        # CPU signal for LowestCPU: busy share averaged over a 1 s window,
        # published once per second at a random phase per server.
        self.cpu_window = 0.0
        self.cpu_reported = 0.0
        self.next_report = random.uniform(0, 1000)

    @property
    def rif(self):
        return len(self.active)

    def latency_estimate(self):
        """Median recent latency of requests that arrived at the current RIF (nearest bucket)."""
        if not self.lat_by_rif:
            return 0.0
        r = min(self.lat_by_rif, key=lambda k: abs(k - self.rif))
        return float(np.median(self.lat_by_rif[r]))

    def add(self, work, now):
        self.active.append([work, now, self.rif])

    def tick(self, now, done):
        busy = 1.0 if self.active else 0.0
        self.cpu_window += (self.antagonist + (1 - self.antagonist) * busy) * DT
        if now >= self.next_report:
            self.cpu_reported = self.cpu_window / 1000.0
            self.cpu_window = 0.0
            self.next_report += 1000.0
        if not self.active:
            return
        share = self.speed * DT / len(self.active)
        still = []
        for req in self.active:
            req[0] -= share
            if req[0] <= 0:
                lat = now + DT - req[1]
                done.append((req[1], lat))
                self.lat_by_rif.setdefault(req[2], deque(maxlen=16)).append(lat)
            else:
                still.append(req)
        self.active = still


# ---------------------------------------------------------------- agents

class RoundRobin:
    name = "Round-robin"

    def __init__(self, servers, rng):
        self.servers, self.i = servers, rng.randrange(len(servers))

    def pick(self, now):
        s = self.servers[self.i % len(self.servers)]
        self.i += 1
        return s


class LowestCPU:
    """The paper's baseline balances on CPU. Picking the single lowest reading would send
    every request to one server until the next report, so like weighted round-robin it
    picks at random, weighted towards servers with spare CPU (never below `floor`)."""
    name = "Lowest-CPU"

    def __init__(self, servers, rng, floor=0.2):
        self.servers, self.rng, self.floor = servers, rng, floor

    def pick(self, now):
        w = [max(self.floor, 1.0 - s.cpu_reported) for s in self.servers]
        return self.servers[self.rng.choices(range(len(self.servers)), weights=w)[0]]


class PowerOfTwo:
    """The paper's LL-Po2C: two random servers, take the one with fewer of *this client's*
    requests in flight. A client cannot see the other clients' requests without probing."""
    name = "Power of two"

    def __init__(self, servers, rng):
        self.servers, self.rng = servers, rng
        self.mine = {}  # server id -> arrival times of this client's requests still running

    def pick(self, now):
        a, b = self.rng.sample(self.servers, 2)
        ra, rb = self.outstanding(a), self.outstanding(b)
        s = a if ra <= rb else b
        self.mine.setdefault(s.sid, set()).add(now)
        return s

    def outstanding(self, s):
        live = {r[1] for r in s.active}
        mine = self.mine.get(s.sid, set()) & live
        self.mine[s.sid] = mine
        return len(mine)


class Probe:
    __slots__ = ("server", "rif", "latency", "born", "uses")

    def __init__(self, server, now):
        self.server, self.rif, self.latency = server, server.rif, server.latency_estimate()
        self.born, self.uses = now, 0


class Prequal:
    name = "Prequal"

    def __init__(self, servers, rng, probes_per_query=3, pool_size=16, max_age=1000.0,
                 q_rif=0.84, reuse=1, probe_delay=1.0):
        self.servers, self.rng = servers, rng
        self.probes_per_query = probes_per_query
        self.pool_size, self.max_age = pool_size, max_age
        self.q_rif, self.reuse, self.probe_delay = q_rif, reuse, probe_delay
        self.pool = []
        self.in_flight = []                 # heap of (arrival_ms, seq, server)
        self.recent_rif = deque(maxlen=64)  # RIF of recent probe replies, for the hot threshold
        self.seq = 0
        self.probe_debt = 0.0
        self.remove_oldest_next = True

    def deliver(self, now):
        """Probe replies that reached the client by now join the pool."""
        while self.in_flight and self.in_flight[0][0] <= now:
            _, _, s = heapq.heappop(self.in_flight)
            p = Probe(s, now)
            self.recent_rif.append(p.rif)
            if len(self.pool) >= self.pool_size:           # full: drop the oldest
                self.pool.remove(min(self.pool, key=lambda q: q.born))
            self.pool.append(p)

    def send_probes(self, now):
        # Fractional rates allowed: carry the remainder to the next query.
        self.probe_debt += self.probes_per_query
        k = int(self.probe_debt)
        self.probe_debt -= k
        for s in self.rng.sample(self.servers, min(k, len(self.servers))):
            self.seq += 1
            heapq.heappush(self.in_flight, (now + self.probe_delay, self.seq, s))

    def pick(self, now):
        self.deliver(now)
        self.pool = [p for p in self.pool if now - p.born <= self.max_age]
        # Probes go out in the background; the query does not wait for them.
        self.send_probes(now)
        if not self.pool:
            return self.rng.choice(self.servers)

        threshold = np.quantile(self.recent_rif, self.q_rif)
        cold = [p for p in self.pool if p.rif <= threshold]
        if cold:
            best = min(cold, key=lambda p: p.latency)   # coldest: lowest latency wins
        else:
            best = min(self.pool, key=lambda p: p.rif)  # all hot: lowest RIF wins

        best.rif += 1        # we just added a request to that server
        best.uses += 1
        if best.uses >= self.reuse:
            self.pool.remove(best)
        # r_remove = 1: drop one probe per query, alternating between the oldest
        # (staleness) and the worst by the selection ranking (degradation).
        if self.pool:
            if self.remove_oldest_next:
                worst = min(self.pool, key=lambda p: p.born)
            else:
                hot = [p for p in self.pool if p.rif > threshold]
                worst = max(hot, key=lambda p: p.rif) if hot else max(self.pool, key=lambda p: p.latency)
            self.pool.remove(worst)
            self.remove_oldest_next = not self.remove_oldest_next
        return best.server


AGENTS = {"rr": RoundRobin, "cpu": LowestCPU, "p2c": PowerOfTwo, "prequal": Prequal}


# ---------------------------------------------------------------- environment

def make_world(n_servers, duration_ms, seed):
    """Antagonist schedule for every server: (time_ms, server, share). Same seed, same world."""
    rng = np.random.default_rng(seed)
    noisiness = rng.uniform(0.0, 0.5, n_servers)   # some machines are much busier than others
    events = []
    for sid in range(n_servers):
        t = 0.0
        while t < duration_ms:
            share = float(np.clip(rng.normal(noisiness[sid], 0.2), 0.0, 0.85))
            events.append((t, sid, share))
            t += rng.exponential(3000.0)           # antagonist changes every ~3 s
    events.sort()
    # Mean fleet capacity in work units per ms, averaged over the run.
    speed = np.ones(n_servers)
    capacity, last = 0.0, 0.0
    for t, sid, share in events:
        capacity += speed.sum() * (t - last)
        speed[sid], last = 1.0 - share, t
    capacity += speed.sum() * (duration_ms - last)
    return events, capacity / duration_ms


def make_requests(rate_per_ms, duration_ms, seed, mean_work=10.0):
    """Poisson arrivals. As in the paper's testbed, request cost is normal with standard
    deviation equal to its mean, truncated at zero (we keep a small floor)."""
    rng = np.random.default_rng(seed + 1)
    n = rng.poisson(rate_per_ms * duration_ms)
    times = np.sort(rng.uniform(0, duration_ms, n))
    return times, np.maximum(rng.normal(mean_work, mean_work, n), 0.1)


def run(agent="prequal", load=0.8, n_servers=40, n_clients=10, duration_s=30, warmup_s=5,
        seed=1, mean_work=10.0, agent_kwargs=None, trace=False):
    """Run one experiment and return latencies (ms) of requests that arrived after warm-up."""
    random.seed(seed + 2)
    duration = duration_s * 1000.0
    events, capacity = make_world(n_servers, duration, seed)
    times, works = make_requests(load * capacity / mean_work, duration, seed, mean_work)

    servers = [Server(i) for i in range(n_servers)]
    # Every client runs its own copy of the agent (its own probe pool for Prequal);
    # each request comes from a random client.
    rng = random.Random(seed + 3)
    clients = [AGENTS[agent](servers, rng, **(agent_kwargs or {})) for _ in range(n_clients)]
    done, rif_trace = [], []
    ev = ai = 0
    for step in range(int(duration / DT)):
        now = step * DT
        while ev < len(events) and events[ev][0] <= now:
            _, sid, share = events[ev]
            servers[sid].antagonist, servers[sid].speed = share, 1.0 - share
            ev += 1
        while ai < len(times) and times[ai] < now + DT:
            rng.choice(clients).pick(now).add(works[ai], now)
            ai += 1
        for s in servers:
            s.tick(now, done)
        if trace and step % 100 == 0:
            rif_trace.append([s.rif for s in servers])

    warm = warmup_s * 1000.0
    lat = np.array([l for (t, l) in done if t >= warm])
    unfinished = sum(1 for s in servers for r in s.active if r[1] >= warm)
    out = {"agent": agent, "load": load, "latencies": lat, "unfinished": unfinished}
    if trace:
        out["rif_trace"] = np.array(rif_trace)
    return out
