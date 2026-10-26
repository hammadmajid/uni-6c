// AI Lab project report: Prequal as an intelligent agent, from the paper and from our simulation.
// Build: zabkit sheet build submissions/ai-lab/project-report   (group PDF + individual 2312200.pdf)
// Figures: figures/paper-fig*.png are cropped from the paper; the method diagrams come from
// ../../cndc-lab/semester-project-report/diagrams.py; sim/figures/*.png from sim/experiments.py.

#import "@zabkit/cover:1.0.0": *

// Two versions from one source, as in the proposal: the wording follows the number of students.
#let group = item-data().Students.len() > 1
#let I = if group [we] else [I]
#let We = if group [We] else [I]
#let my = if group [our] else [my]
#let My = if group [Our] else [My]

#item-cover()

#show: item-body

#set par(justify: true)
#show figure.caption: set text(size: 9.5pt)
#show figure: set block(above: 1.1em, below: 1.1em)

#let fig(path, caption, width: 100%) = figure(image(path, width: width), caption: caption)

#align(center, text(size: 15pt, weight: "bold")[Smarter Load Balancing with an AI Agent: \ Prequal in Simulation])

= 1. The Paper

#table(
  columns: (auto, 1fr),
  stroke: 0.5pt + luma(180),
  inset: 6pt,
  [*Title*], [_Load is not what you should balance: Introducing Prequal_],
  [*Authors*], [Bartek Wydrowski, Robert Kleinberg, Stephen M. Rumble, Aaron Archer (Google Research, Cornell University, YouTube)],
  [*Venue*], [21st USENIX Symposium on Networked Systems Design and Implementation (NSDI '24), pp. 1285–1299, April 2024],
)

#My project takes the load balancer from this paper, describes it as an intelligent agent in the sense of the AI course, builds it in a Python simulation together with three simpler agents, and compares them under the same traffic. This report has two kinds of figures: diagrams and results _from the paper_ (Sections 3 and 4), and results _from running #my code_ (Section 7).

= 2. Introduction and Problem Statement

A large website such as YouTube runs each of its internal services as hundreds of identical copies, called *replicas* (@fig-fleet). For every request, a *load balancer* has to choose a replica. The usual rule is to balance *CPU utilisation*: send more traffic to replicas that use less CPU. Google used weighted round-robin (WRR) on this principle.

#fig("figures/fleet.png", [Each client chooses a server replica for every query. The aim is low latency, especially for the slowest 1% of requests (the p99 tail).], width: 70%) <fig-fleet>

The paper shows that CPU is the wrong signal. Each replica shares its machine with other jobs (*antagonists*) whose CPU use changes without warning, so two replicas with the same CPU reading can have very different queues (@fig-cpu). CPU is also averaged over seconds, so it shows what a server _was_ doing. At peak traffic these hidden queues make the slowest requests many times slower than the median and cause timeouts.

#fig("figures/cpu-vs-rif.png", [Same CPU reading, different queues. On server B the antagonist takes most of the CPU, so requests pile up, but a CPU-based balancer sees A and B as equal.], width: 72%) <fig-cpu>

*The problem, stated as an AI problem:* for every incoming request, choose the server that will answer it fastest, using only cheap, partial and slightly out-of-date observations of a world that keeps changing.

= 3. The Paper's Solution: Prequal

Prequal (Probing to Reduce Queuing and Latency) replaces CPU with two fresh signals that every server keeps (@fig-signals): *requests in flight* (RIF), a counter of requests it is working on right now, and *latency*, the median time recent requests took when the server's RIF was at its current level.

#fig("figures/signals.png", [What every server tracks: requests in flight (RIF) and recent latency at each RIF level.], width: 68%) <fig-signals>

The client does not ask every server. It follows the *power of d choices* idea: ask a few random servers and choose the best of them. For each query it sends about three probes in the background and keeps the replies in a *probe pool* of at most 16 entries (@fig-pool). The query is sent at once to the best server in the pool and never waits for a probe.

#fig("figures/probe-pool.png", [Asynchronous probing: probe replies fill a small pool, and each query is sent to the best server in the pool without waiting.], width: 72%) <fig-pool>

To choose from the pool, Prequal uses the *hot-cold lexicographic rule* (@fig-hc). A probe is *hot* if its RIF is above the _Q_#sub[RIF] quantile (default 0.84) of recent RIF values, and *cold* otherwise. If some probes are cold, the cold server with the *lowest latency* wins; if all are hot, the server with the *lowest RIF* wins. The pool is kept healthy by four rules (@fig-upkeep): probes expire after one second, a full pool drops its oldest probe, a probe is used at most _b_#sub[reuse] times (its RIF goes up by one each time), and every query removes one probe, alternating between the oldest and the worst.

#fig("figures/hot-cold.png", [The hot-cold rule. Left: the lowest-latency cold server (M) wins. Right: all probes are hot, so the lowest-RIF server (E) wins.], width: 88%) <fig-hc>

#fig("figures/pool-upkeep.png", [How probes leave the pool, so that it does not fill up with stale or overloaded servers.], width: 68%) <fig-upkeep>

= 4. Results Reported in the Paper

*YouTube.* When the YouTube Homepage service was switched from WRR to Prequal on live traffic, the spread of CPU use and requests in flight across replicas tightened immediately (@fig-p4). Over the rollout the authors report 2× lower tail latency, 5–10× lower tail RIF, 2× lower tail CPU, 10–20% less tail memory and a near-elimination of errors caused by imbalance (@fig-p5).

#grid(columns: (1fr, 1fr), column-gutter: 1.2em, align: bottom,
  [#fig("figures/paper-fig4.png", [Paper Fig. 4: CPU, memory and RIF heatmaps of YouTube Homepage replicas; WRR until about 08:00, then Prequal.]) <fig-p4>],
  [#fig("figures/paper-fig5.png", [Paper Fig. 5: error rate (top) and normalised p99.9, p99 and p50 latency (bottom) for the same cutover.]) <fig-p5>],
)

*Testbed.* On 100 client and 100 server replicas, traffic was raised from 75% to 174% of the CPU allocation (@fig-p6). Above 100%, WRR's tail latency hits the 5 s timeout and errors climb into thousands per second, while Prequal's p99.9 stays near 700 ms with no errors. Compared with eight other selection rules at 70% and 90% load (@fig-p7), Prequal and C3 were best, with Prequal 3–8% ahead; round-robin, random and WRR timed out at 90%.

#grid(columns: (1fr, 1fr), column-gutter: 1.2em, align: bottom,
  [#fig("figures/paper-fig6.png", [Paper Fig. 6: load ramp; grey is WRR, white is Prequal; latency on a log scale.]) <fig-p6>],
  [#fig("figures/paper-fig7.png", [Paper Fig. 7: p90 (dark) and p99 (light) latency of nine selection rules; "TO" = timed out.]) <fig-p7>],
)

All paper figures: Wydrowski et al. (2024).

= 5. Prequal as an Intelligent Agent

A Prequal client fits the agent model from the AI course: it perceives its environment through sensors, keeps an internal state, and acts through actuators to maximise a performance measure. @tab-peas gives its PEAS description.

#figure(
  table(
    columns: (auto, 1fr),
    stroke: 0.5pt + luma(180),
    inset: 6pt,
    align: left,
    [*Performance measure*], [Low tail latency (p99 and p99.9) of requests, few timeouts, and low probing cost],
    [*Environment*], [A fleet of server replicas sharing machines with antagonists, requests of varying size arriving at random, other clients sending traffic at the same time],
    [*Actuators*], [Send the request to a chosen server; send a probe to a random server],
    [*Sensors*], [Probe replies (a server's RIF and latency estimate at the time of the probe)],
  ),
  caption: [PEAS description of a Prequal client.],
) <tab-peas>

*Environment properties.* The environment is *partially observable* (the agent sees only the servers it probed, and only as they were when the probe answered), *stochastic* (request sizes, arrivals and antagonists are random), *dynamic* (servers change while the agent decides), *continuous* in time, and *multi-agent* (many clients send traffic to the same servers, so each one changes what the others see).

*Agent type.* Prequal is a *model-based reflex agent*. The probe pool is its internal model of the world: a small, constantly refreshed memory of what part of the fleet looked like in the last second. The pool-upkeep rules play the role of "how the world evolves": old observations are forgotten, and when the agent sends a request to a server it updates its own model by adding one to that server's RIF. Its condition-action rule is the hot-cold rule.

*The selection rule as a heuristic.* The hot-cold rule ranks the candidates in the pool like a heuristic ranks the frontier in *greedy best-first search*: it does not plan ahead, it simply takes the candidate that looks best now. The ranking is lexicographic: first by "hot or cold" (a constraint that rules out overloaded servers), then by estimated latency. Like greedy search, it is fast and usually good, but it can be misled by stale or noisy estimates, which is why the pool forgets old probes.

The three simpler agents in #my comparison sit at different points on the same scale: *round-robin* is a simple reflex agent with no sensors at all; *lowest-CPU* senses a stale, averaged signal; *power of two* senses only its own past actions (how many of _its_ requests each server still has).

= 6. Implementation: #My Simulator

#We wrote the simulator in Python (about 300 lines, using NumPy for random numbers and Matplotlib for plots). It recreates the paper's testbed in miniature: what matters is that servers have *different and changing speeds* that the agents cannot see directly.

*Environment.* The fleet has 40 servers and 10 clients. Time moves forward in 1 ms steps. Each server shares its machine with an antagonist that uses between 0% and 85% of the CPU; every server has its own typical level ("noisy" and "quiet" machines), and the antagonist changes on average every 3 s. A server works on all of its requests at once (processor sharing), so with _n_ requests in flight each one gets 1/_n_ of the CPU that is left. Requests arrive at random (a Poisson process); their size is drawn from a normal distribution whose standard deviation equals its mean (10 ms of work), truncated at zero, exactly as in the paper's testbed. The arrival rate is set as a percentage of the fleet's average capacity, from 50% to 90%.

*Agents.* Every client runs its own copy of the agent, and each request comes from a random client (@tab-agents). All four agents see exactly the same requests and antagonists, because the random seeds are fixed. Each setting is run for 30 simulated seconds with two seeds; the first 5 s are a warm-up and are not counted. A request that takes more than 5 s, or has not finished when the run ends, counts as a *timeout*, like the paper's 5 s deadline.

#figure(
  table(
    columns: (auto, 1fr, 1.6fr),
    stroke: 0.5pt + luma(180),
    inset: 6pt,
    align: left,
    table.header([*Agent*], [*Senses*], [*How it picks a server*]),
    [Round-robin], [nothing], [Next server in a fixed cycle (simple reflex agent with no sensors)],
    [Lowest-CPU], [each server's CPU use, averaged over 1 s and published once a second], [At random, weighted towards servers with spare CPU. Taking only the single lowest reading would send every request to one server until the next report.],
    [Power of two], [how many of _its own_ requests each server still has], [The less busy of two random servers; this is the paper's LL-Po2C rule],
    [Prequal], [probe replies: RIF and latency], [Probe pool and the hot-cold rule, with the paper's settings: 3 probes per query, pool of 16, 1 s expiry, _Q_#sub[RIF] = 0.84, one probe removed per query (alternating oldest and worst), each probe used once],
  ),
  caption: [The four agents in #my comparison.],
) <tab-agents>

*How a step works.* In every 1 ms step the simulator (1) applies any antagonist changes, (2) asks a client's agent to choose a server for each request that arrives, (3) delivers probe replies that are due (probes take 1 ms), and (4) lets every server do 1 ms of work, recording the latency of each request that finishes. The core of the Prequal agent is short:

```python
threshold = np.quantile(self.recent_rif, self.q_rif)
cold = [p for p in self.pool if p.rif <= threshold]
if cold:
    best = min(cold, key=lambda p: p.latency)   # coldest: lowest latency wins
else:
    best = min(self.pool, key=lambda p: p.rif)  # all hot: lowest RIF wins
best.rif += 1        # update the agent's own model: we just sent it a request
```

The full code is in the appendix and in the `sim/` folder. `python experiments.py` reruns everything (about 10 minutes on four cores) and redraws every figure in Section 7.

= 7. Results from Running #My Code

== Latency as the load rises

@fig-ramp is #my version of the paper's load-ramp experiment. The *median* (left) stays within a few tens of milliseconds for round-robin, power of two and Prequal, and only lowest-CPU's median grows clearly with load: a typical request is fast under most balancers. The *tail* (right, log scale) is where they separate. Prequal's p99 stays between 110 ms and 280 ms up to 85% load, while round-robin's is already 4 s at 50% load, because the slowest servers get the same share as the fastest ones and their queues never empty. Lowest-CPU does better than round-robin at light load, but its tail grows rapidly with load: the CPU average is one second old, and once a server is busy at all its CPU reads close to 100%, so the signal cannot tell a busy server from an overloaded one. This is the paper's main point, reproduced.

#fig("sim/figures/load-ramp.png", [Median (left) and p99 (right, log scale) latency of the four agents as load rises from 50% to 90% of fleet capacity (mean of two seeds).]) <fig-ramp>

#figure(
  table(
    columns: (auto, auto, auto, auto, auto, auto),
    stroke: 0.5pt + luma(180),
    inset: 5pt,
    align: (left, right, right, right, right, right),
    table.header([*Agent*], [*Load*], [*p50*], [*p99*], [*p99.9*], [*> 5 s*]),
    [Round-robin], [70%], [35 ms], [7,772 ms], [15,052 ms], [6.30%],
    [Lowest-CPU], [70%], [46 ms], [4,049 ms], [9,830 ms], [2.21%],
    [Power of two], [70%], [30 ms], [543 ms], [1,348 ms], [0.20%],
    [*Prequal*], [70%], [*27 ms*], [*150 ms*], [*251 ms*], [*0.12%*],
    [Round-robin], [90%], [92 ms], [11,813 ms], [18,793 ms], [18.02%],
    [Lowest-CPU], [90%], [146 ms], [10,545 ms], [17,445 ms], [14.94%],
    [Power of two], [90%], [97 ms], [1,193 ms], [2,496 ms], [0.79%],
    [*Prequal*], [90%], [96 ms], [*573 ms*], [*1,089 ms*], [*0.69%*],
  ),
  caption: [Latency quantiles and timeouts at 70% and 90% load (mean of two seeds, from `sim/results/results.json`).],
) <tab-results>

At 85% load Prequal's p99 is *3× lower than power of two* (280 ms against 851 ms) and *33× lower than lowest-CPU* (9,255 ms) (@tab-results). Power of two is the closest competitor, because it also uses a queue-length signal, but it can only count its own requests, not the other nine clients' traffic. Prequal's probes report the server's _total_ RIF, which is why it wins. The paper found the same ordering among these rules (@fig-p7). At 90% load the gap narrows (573 ms against 1,193 ms), because a few servers are briefly overloaded whatever the agent does. The share of requests over 5 s (@fig-timeouts) tells the same story: round-robin and lowest-CPU lose 15–18% of requests at 90% load, while power of two and Prequal lose less than 1%.

#grid(columns: (1fr, 1fr), column-gutter: 1.2em, align: bottom,
  [#fig("sim/figures/latency-cdf.png", [Share of requests finished by each latency at 85% load (log scale). Prequal's curve reaches 100% first.]) <fig-cdf>],
  [#fig("sim/figures/timeouts.png", [Share of requests that took more than 5 s or never finished.]) <fig-timeouts>],
)

== Where the slow requests come from

@fig-heat is #my version of the paper's RIF heatmap (@fig-p4): each row is a server and the colour is its number of requests in flight. Under round-robin and lowest-CPU, some servers have long queues for many seconds (dark rows); these are the machines whose antagonist is busy, and every request sent there waits. Under power of two the queues are short but uneven. Under Prequal, after the first second (while the pools fill), no server builds up a queue. @fig-cdf shows the same thing as a distribution: about 99% of Prequal's requests finish within 300 ms, while the round-robin and lowest-CPU curves have a long tail out to 10 s and more.

#fig("sim/figures/rif-heatmap.png", [Requests in flight on each of the 40 servers over a 30 s run at 85% load (darker = longer queue). The first 5 s are warm-up and are not counted in the statistics.], width: 90%) <fig-heat>

== Prequal's two knobs

#My last two experiments repeat the paper's parameter studies at 85% load (@fig-knobs and @fig-qrif). *Probing rate:* with 2 to 4 probes per query the results are flat; at 6 they are slightly worse, because each probe is used once and more probes means more turnover. Below 2 probes per query Prequal collapses, because with one probe removed per query and every probe used once, the pool empties and Prequal falls back to random choice. The paper avoids this with a formula that lets probes be reused more often when the probing rate is low; #my simulator keeps the reuse limit fixed at 1, so it shows what happens without that formula. *Hot threshold:* any _Q_#sub[RIF] from 0 to 0.84 works well, and using latency alone (_Q_#sub[RIF] = 1) is by far the worst, with a p99 of 15 s. The paper found the same: RIF-only control is already effective, and latency-only is the worst choice, because RIF warns of a queue before it shows up in latency.

#grid(columns: (1fr, 1fr), column-gutter: 1.2em, align: bottom,
  [#fig("sim/figures/probe-rate.png", [Prequal's probing rate at 85% load (compare paper Fig. 8).]) <fig-knobs>],
  [#fig("sim/figures/q-rif.png", [Prequal's hot threshold _Q_#sub[RIF] at 85% load (compare paper Fig. 9).]) <fig-qrif>],
)

= 8. Discussion and Limitations

#My results agree with the paper in direction and shape: balancing on CPU fails at high load, a queue-length signal helps a lot, and Prequal's server-side RIF and latency give the shortest tail. The numbers are not the paper's, and they should not be compared directly. In #my simulator:

- the workload is one simple CPU-bound job, and antagonists are random numbers rather than real programs;
- the network has no delay except the 1 ms probe trip, and probes cost nothing;
- the latency signal adds little over RIF alone (_Q_#sub[RIF] = 0 was slightly best), probably because with processor sharing a slow server's RIF already rises as fast as its latency;
- the reuse limit is fixed, which is why low probing rates fail, unlike in the paper;
- each setting was run with only two seeds for 30 s, so the tail numbers (especially p99.9) are noisy.

Natural next steps would be to add the paper's reuse formula, model network delay for queries as well as probes, add the C3 rule, and try a *learning* agent (for example reinforcement learning) that learns its own ranking rule from the latencies it observes, in place of the hand-made hot-cold heuristic.

= 9. Conclusion

The paper's message is that a load balancer should act on what servers are doing now, not on an average of what they did. #We described the Prequal client as a model-based reflex agent: its sensors are cheap probes, its internal model is a small probe pool that forgets anything older than a second, and its decision rule is a greedy hot-cold heuristic. In #my simulation of 40 servers with changing antagonist load, this agent kept the slowest 1% of requests 3× faster than a power-of-two agent and more than 30× faster than an agent that balances CPU, at 85% load, while its median was as good as or better than the others'. The lesson for AI is that an agent with the _right_ sensor and a small, fresh memory can beat agents that sense more but sense stale or averaged information.

= 10. References

#set par(hanging-indent: 1.27cm, justify: false)
Russell, S., & Norvig, P. (2021). _Artificial intelligence: A modern approach_ (4th ed.). Pearson.

Wydrowski, B., Kleinberg, R., Rumble, S. M., & Archer, A. (2024). Load is not what you should balance: Introducing Prequal. In _21st USENIX Symposium on Networked Systems Design and Implementation (NSDI '24)_ (pp. 1285–1299). USENIX Association. https://www.usenix.org/conference/nsdi24/presentation/wydrowski

#set par(hanging-indent: 0cm)



= Appendix A: Simulation Code

The full code is in the `sim/` folder: `prequal_sim.py` (environment and agents, listed below) and `experiments.py` (runs every experiment and draws the figures in Section 7). Run `pip install -r requirements.txt` and then `python experiments.py`.

#set text(size: 7.5pt)
#raw(read("sim/prequal_sim.py"), lang: "python", block: true)

#set text(size: 11pt)

= Appendix B: Program Output

The output of `python experiments.py`, which prints every result used in Section 7: latency in milliseconds (p50 to p99.9) and the share of requests over 5 s for each agent and load (mean of two seeds), then Prequal's probing-rate and _Q_#sub[RIF] experiments at 85% load. The figure is drawn by `sim/terminal.py` from the saved results.

#figure(image("figures/terminal-output.png", width: 68%), caption: [Terminal output of `experiments.py`.])
