"""AI Lab project deck: Prequal as an intelligent agent, with results from our simulation.

    python slides.py    # writes presentation/ (needs python-pptx, Pillow, LibreOffice)
"""

import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent.parent / "_shared"))
sys.path.insert(0, str(HERE / "sim"))
from deck import Slide, save  # noqa: E402
from experiments import ramp_table  # noqa: E402

F, SF = HERE / "figures", HERE / "sim" / "figures"
T = ramp_table(json.loads((HERE / "sim" / "results" / "results.json").read_text()))


def p99(agent, load):
    return f"{T[(agent, load)]['99']:,.0f} ms"


slides = [
    Slide(
        "Smarter Load Balancing with an AI Agent:\nPrequal in Simulation",
        [
            "Based on Wydrowski et al., \"Load is not what you should balance: Introducing Prequal\", NSDI 2024",
            "",
            "Hammad Majid (2312200), Haris Qaiser Lodhi (2312458),",
            "Syed Muhammad Ahsan (2312421), Taha Mustafa (2312412)",
            "AI Lab (CSCL 4101), Mr. Muhammad Ishfaq, BS(CS)-6C, SZABIST Islamabad",
        ],
        kind="title",
        notes=(
            "Assalam o alaikum. Our AI Lab project takes a load balancer from a 2024 Google and "
            "YouTube paper, Prequal, describes it as an intelligent agent, and tests it in our own "
            "Python simulation against three simpler agents."
        ),
    ),
    Slide(
        "Problem: which server should get this request?",
        [
            "Services run on hundreds of replicas",
            "Usual rule: balance CPU use",
            "But replicas share machines with other jobs",
            "Same CPU, very different queues → slow tail (p99)",
            "Goal: pick the fastest server from cheap, partial, stale observations",
        ],
        images=[F / "cpu-vs-rif.png"],
        notes=(
            "Every request to a big service has to be sent to one of hundreds of identical "
            "servers. The usual rule is to balance CPU. The paper shows this fails: servers share "
            "their machines with other jobs, so two servers can show the same CPU while one has a "
            "long queue. Here both show 60%, but server B has 9 requests waiting and answers eight "
            "times slower. As an AI problem: choose the fastest server for each request, using only "
            "cheap, partial and slightly old information about a world that keeps changing."
        ),
    ),
    Slide(
        "Prequal: probes and a probe pool",
        [
            "Each server reports RIF (requests in flight) and recent latency",
            "Client sends ~3 random probes per query, in the background",
            "Replies kept in a pool: max 16, each ≤ 1 s old",
            "Oldest / worst probes removed every query",
        ],
        images=[F / "probe-pool.png"],
        notes=(
            "Prequal replaces CPU with two fresh signals: requests in flight, a live counter, and "
            "recent latency at that load. The client asks only a few random servers, about three per "
            "query, in the background, and keeps the answers in a pool of at most 16. The query never "
            "waits for a probe. Probes older than one second are dropped, and one probe is removed "
            "per query, alternating between the oldest and the worst."
        ),
    ),
    Slide(
        "Prequal: the hot-cold rule",
        [
            "Hot = RIF above the 84th percentile of recent RIF values",
            "Some cold → lowest-latency cold server.  All hot → lowest-RIF server.",
        ],
        images=[F / "hot-cold.png"],
        layout="top",
        notes=(
            "To choose from the pool, a server is hot if its requests in flight are above the 84th "
            "percentile, and cold otherwise. If any server is cold, Prequal takes the cold one with "
            "the lowest latency, here M. If all are hot, it takes the lowest RIF, here E. RIF works "
            "as a safety limit and latency picks the fastest of the safe servers."
        ),
    ),
    Slide(
        "Prequal as an intelligent agent (PEAS)",
        [],
        table=[
            ["", "Prequal client"],
            ["Performance", "Low p99 / p99.9 latency, few timeouts, low probing cost"],
            ["Environment", "Server fleet with antagonists, random requests, other clients"],
            ["Actuators", "Send request to a server; send a probe"],
            ["Sensors", "Probe replies: a server's RIF and latency"],
            ["Agent type", "Model-based reflex: the probe pool is its model of the world"],
            ["Properties", "Partially observable, stochastic, dynamic, continuous, multi-agent"],
            ["Decision rule", "Greedy heuristic, like best-first search: best-looking server now"],
        ],
        widths=[1, 3.2],
        notes=(
            "In AI terms, a Prequal client is an agent. Its performance measure is tail latency and "
            "timeouts. Its environment is the server fleet. Its actuators are sending a request or a "
            "probe, and its sensors are probe replies. It is a model-based reflex agent: the probe "
            "pool is its internal model, a short memory of what the fleet looked like in the last "
            "second, and it even updates that model itself by adding one to a server's RIF when it "
            "sends a request there. The environment is partially observable, stochastic, dynamic "
            "and multi-agent. The hot-cold rule is a greedy heuristic, like greedy best-first search "
            "ranking the frontier: no planning ahead, just the best-looking choice right now."
        ),
    ),
    Slide(
        "What the paper found",
        [],
        images=[F / "paper-fig4.png", F / "paper-fig6.png"],
        big="YouTube: 2× lower tail latency, 5–10× lower tail RIF, errors ≈ 0",
        caption="Left: YouTube Homepage switches from WRR to Prequal at about 08:00 (paper Fig. 4). "
                "Right: testbed load ramp, WRR grey, Prequal white (paper Fig. 6).",
        notes=(
            "On YouTube, switching from CPU-based WRR to Prequal immediately tightened the spread of "
            "load, which you see on the left at 08:00, and halved tail latency with almost no "
            "imbalance errors. On the right, in the testbed, once traffic passes the CPU allocation "
            "WRR's tail hits the 5 second timeout while Prequal stays under a second. We wanted to "
            "see whether a small simulation reproduces this."
        ),
    ),
    Slide(
        "Our simulator: the environment",
        [
            "40 servers, 10 clients, Python, 1 ms time steps",
            "Each server shares its machine with an antagonist (0–85% of the CPU, changes every ~3 s)",
            ("so server speed differs and changes over time", 1),
            "Servers work on all their requests at once (processor sharing)",
            "Random (Poisson) arrivals; request size normal with sd = mean, as in the paper",
            "Load from 50% to 90% of fleet capacity, 30 s per run, 2 seeds",
            "Same seeds → every agent sees exactly the same traffic and antagonists",
        ],
        notes=(
            "Our simulator is about 300 lines of Python. It has 40 servers and 10 clients and steps "
            "time in 1 millisecond ticks. Each server shares its machine with an antagonist that "
            "takes between 0 and 85 percent of the CPU and changes every few seconds, so servers "
            "have different and changing speeds, just like the paper's environment. Requests "
            "arrive at random and their sizes follow the paper's testbed. We raise the load from 50 "
            "to 90 percent of capacity, and every agent sees exactly the same traffic because we "
            "fix the random seeds."
        ),
    ),
    Slide(
        "The four agents",
        [],
        table=[
            ["Agent", "Senses", "Picks"],
            ["Round-robin", "nothing", "next server in a cycle"],
            ["Lowest-CPU", "each server's CPU, averaged over 1 s", "random, weighted towards low CPU"],
            ["Power of two", "its own requests on each server", "less busy of 2 random servers"],
            ["Prequal", "probe replies: RIF + latency", "probe pool + hot-cold rule"],
        ],
        widths=[1.2, 2.2, 2.2],
        notes=(
            "These are the four agents. Round-robin senses nothing. Lowest-CPU is the paper's "
            "baseline idea: it sees each server's CPU averaged over the last second and favours "
            "servers with spare CPU. Power of two picks two random servers and takes the one with "
            "fewer of its own requests, the paper's LL-Po2C. Prequal uses the probe pool and the "
            "hot-cold rule with the paper's settings: 3 probes per query, a pool of 16, one second "
            "expiry and a hot threshold at the 84th percentile."
        ),
    ),
    Slide(
        "Our results: latency as load rises",
        [],
        images=[SF / "load-ramp.png"],
        big=f"p99 at 85% load: Prequal {p99('prequal', 0.85)} · power of two {p99('p2c', 0.85)} · lowest-CPU {p99('cpu', 0.85)}",
        notes=(
            "This is our version of the paper's load ramp. On the left, the median stays low for "
            "every agent except lowest-CPU: a typical request is fast under most balancers. On the right, on a log scale, "
            "is the tail, the slowest 1 percent. Round-robin is already at 4 seconds at 50 percent "
            "load, because slow servers get the same share as fast ones. Lowest-CPU is better at "
            "light load but climbs fast: its CPU signal is a second old, and a busy server reads "
            "nearly 100 percent whether it is fine or overloaded. Power of two is much better, and "
            "Prequal is best at every load: at 85 percent its p99 is about 3 times lower than power of "
            "two and more than 30 times lower than lowest-CPU. That is the paper's result, reproduced."
        ),
    ),
    Slide(
        "Our results: where the slow requests come from",
        [],
        images=[SF / "latency-cdf.png", SF / "rif-heatmap.png"],
        caption="Left: share of requests finished by each latency at 85% load. Right: requests in flight "
                "on each server over time (darker = longer queue).",
        notes=(
            "Where do the slow requests come from? On the right, each row is one server and the colour "
            "is how many requests it has in flight. Under round-robin and lowest-CPU, some servers have "
            "long queues for many seconds: these are the machines with a busy antagonist. Under "
            "Prequal, after the first second while the probe pools fill, no server builds a queue. "
            "On the left, the same thing as a distribution: about 99 percent of Prequal's requests "
            "finish within 300 milliseconds, while round-robin and lowest-CPU have a tail out to 10 "
            "seconds."
        ),
    ),
    Slide(
        "Our results: Prequal's two knobs",
        [],
        images=[SF / "probe-rate.png", SF / "q-rif.png"],
        caption="Prequal at 85% load. Left: probes per query (paper Fig. 8). Right: hot threshold Q_RIF (paper Fig. 9).",
        notes=(
            "We also repeated the paper's two parameter studies. On the left, 2 to 4 probes per query "
            "work equally well. Below 2 Prequal collapses, because in our simulator each probe is used "
            "once and one is removed per query, so the pool empties and Prequal falls back to random. "
            "The paper avoids that with a formula for probe reuse, which we did not implement. On the "
            "right, any hot threshold from 0 to 0.84 works, and using latency alone, at 1.0, is by far "
            "the worst. The paper found the same: RIF warns of a queue before latency does."
        ),
    ),
    Slide(
        "Conclusion",
        [
            "Our simulation reproduces the paper: Prequal has the shortest tail at every load",
            "Sensing the right signal matters more than sensing more",
            "A model-based agent with a tiny, fresh memory beats agents that sense stale averages",
            "Limits of our model: one simple workload, simulated antagonists, no network delay except probes",
            "Next: async probes with real delays, a C3 agent, a learned (RL) selection rule",
        ],
        notes=(
            "To conclude: our small simulation reproduces the paper's main result. The median changes "
            "little between agents, but the tail changes a lot, and Prequal has the shortest tail at every "
            "load. The AI lesson is that sensing the right signal matters more than sensing more: a "
            "model-based agent with a tiny, fresh memory beats agents that sense stale averages. Our "
            "model is simple: one workload, simulated antagonists and no network delay except for "
            "probes. Next steps would be the paper's probe-reuse formula, a C3 agent, and a learning "
            "agent that learns its own selection rule with reinforcement learning."
        ),
    ),
    Slide(
        "References",
        [
            "Wydrowski, B., Kleinberg, R., Rumble, S. M., & Archer, A. (2024). Load is not what you "
            "should balance: Introducing Prequal. In 21st USENIX Symposium on Networked Systems "
            "Design and Implementation (NSDI '24) (pp. 1285–1299). USENIX Association.",
            "Russell, S., & Norvig, P. (2021). Artificial intelligence: A modern approach (4th ed.). Pearson.",
            "",
            "Thank you. Questions?",
        ],
        notes="These are our references. Thank you, we are happy to take questions.",
    ),
]

if __name__ == "__main__":
    save(slides, HERE / "presentation", "2312200-2312458-2312421-2312412",
         footer="Prequal as an AI agent  ·  AI Lab project")
