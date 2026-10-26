"""CNDC Lab paper review deck: 10 slides in the brief's order.

    python slides.py    # writes presentation/ (needs python-pptx, Pillow, LibreOffice)
"""

import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE.parent.parent / "_shared"))
from deck import Slide, save  # noqa: E402

F = HERE / "figures"

slides = [
    Slide(
        "Load is not what you should balance:\nIntroducing Prequal",
        [
            "Wydrowski, Kleinberg, Rumble & Archer (Google Research, Cornell, YouTube)",
            "USENIX NSDI 2024",
            "",
            "Presented by Hammad Majid (2312200), Haris Qaiser Lodhi (2312458),",
            "Syed Muhammad Ahsan (2312421), Taha Mustafa (2312412)",
            "CNDC Lab (CSCL 3205), Mr. Adeel Ahmed, BS(CS)-6C, SZABIST Islamabad",
        ],
        kind="title",
        notes=(
            "Assalam o alaikum. Our paper review is on \"Load is not what you should balance: "
            "Introducing Prequal\", published at USENIX NSDI 2024 by researchers from Google, "
            "Cornell and YouTube. It describes the load balancer YouTube has used for more than "
            "two years. The title is the whole argument: the usual way of balancing servers, by "
            "keeping their CPU load equal, is the wrong goal."
        ),
    ),
    Slide(
        "Introduction: load balancing at scale",
        [
            "A service runs as hundreds of identical replicas",
            "For every query, the client must pick a replica",
            "Users feel the slowest requests: the p99 tail",
            "Standard rule (WRR): keep every replica's CPU use equal",
        ],
        images=[F / "fleet.png"],
        notes=(
            "Big services like YouTube are split into many jobs that call each other. Each job "
            "runs as hundreds of copies, called replicas. Every time one job calls another, the "
            "client has to choose which replica gets the query, and this is load balancing. What "
            "users notice is not the average request but the slowest ones, the 99th percentile or "
            "tail latency. At Google the standard choice was weighted round-robin, or WRR, which "
            "sends traffic so that every replica uses about the same CPU."
        ),
    ),
    Slide(
        "Problem statement: CPU is the wrong signal",
        [
            "Replicas share machines with antagonists (other jobs)",
            "Same CPU reading, very different queues",
            "CPU is an average over seconds: stale",
            "At peak load, hidden queues cause tail latency and timeouts",
        ],
        images=[F / "cpu-vs-rif.png"],
        notes=(
            "Here is the problem. Each replica shares its physical machine with other jobs, which "
            "the paper calls antagonists. Look at these two servers: both show 60% CPU. But on "
            "server B the antagonist is taking most of the processor, so requests pile up. Server A "
            "has 2 requests in flight, server B has 9, and the next request on B waits about eight "
            "times longer. A CPU-based balancer sees them as equal. CPU is also an average over "
            "seconds, so it is always out of date. When traffic peaks, these hidden queues are "
            "what create the long tail and the timeouts."
        ),
    ),
    Slide(
        "Approach 1: what each server reports",
        [
            "RIF: requests in flight, right now",
            ("+1 on arrival, −1 on finish", 1),
            ("shows a queue before CPU moves", 1),
            "Latency: median recent latency at the current RIF",
            "Both are cheap, local and fresh",
        ],
        images=[F / "signals.png"],
        notes=(
            "Prequal uses two signals instead of CPU. The first is requests in flight, RIF: a "
            "counter that goes up when a request arrives and down when it finishes. It is "
            "instantaneous, and it shows a queue building up before the CPU average changes. The "
            "second is latency: each server remembers how long recent requests took at each RIF "
            "level and reports the median for its current RIF. Both are cheap to keep and always "
            "fresh."
        ),
    ),
    Slide(
        "Approach 2: asynchronous probes and the probe pool",
        [
            "Power of d choices: ask a few random servers, not all",
            "~3 probes per query, sent in the background",
            "Replies kept in a pool: max 16, each ≤ 1 s old",
            "The query picks from the pool and never waits",
        ],
        images=[F / "probe-pool.png"],
        notes=(
            "To collect the signals, Prequal uses the power of d choices idea from theory: asking "
            "a few random servers is almost as good as asking all of them. Older systems probe "
            "while the request waits, which adds a network round trip. Prequal sends about three "
            "probes per query in the background and stores the replies in a small probe pool of at "
            "most 16 entries. When a query arrives, it picks a server from the pool immediately. "
            "Probes older than one second are dropped, and on every query one probe is removed, "
            "alternating between the oldest and the worst, so the pool stays fresh and does not "
            "fill up with busy servers."
        ),
    ),
    Slide(
        "Approach 3: hot-cold selection",
        [
            "Hot = RIF above the 84th percentile of recent RIF values",
            "Some cold → lowest-latency cold server.  All hot → lowest-RIF server.",
        ],
        images=[F / "hot-cold.png"],
        layout="top",
        notes=(
            "This is the selection rule, called hot-cold lexicographic. A probe is hot if its RIF "
            "is above a threshold, by default the 84th percentile of recent RIF values, and cold "
            "otherwise. On the left, some probes are cold, so Prequal picks the cold server with "
            "the lowest latency, which is M, even though D has fewer requests. On the right, every "
            "probe is hot, so it falls back to the server with the lowest RIF, which is E. RIF keeps "
            "us away from overloaded servers, and latency picks the fastest of the safe ones. The "
            "authors show this beats any weighted mix of the two signals."
        ),
    ),
    Slide(
        "Results 1: YouTube Homepage switched to Prequal",
        [],
        images=[F / "paper-fig4.png", F / "paper-fig5.png"],
        big="2× lower tail latency  ·  5–10× lower tail RIF  ·  2× lower tail CPU  ·  errors ≈ 0",
        caption="Left: CPU, memory and RIF across replicas (paper Fig. 4). Right: errors and latency "
                "(paper Fig. 5). WRR until about 08:00, then Prequal.",
        notes=(
            "Now the results. The authors switched YouTube's Homepage service from WRR to Prequal "
            "on live traffic at about 08:00. On the left you can see the spread of CPU, memory and "
            "requests in flight tighten the moment Prequal takes over; tail RIF dropped from about "
            "225 to 50. On the right, error spikes disappear and latency drops. Overall they "
            "measured two times lower tail latency, five to ten times lower tail RIF, two times "
            "lower tail CPU and almost no imbalance errors. This let YouTube run its servers at "
            "higher utilisation and save machines."
        ),
    ),
    Slide(
        "Results 2: testbed experiments",
        [],
        images=[F / "paper-fig6.png", F / "paper-fig7.png"],
        big="Above the CPU allocation: WRR hits the 5 s timeout, Prequal stays under 0.7 s",
        caption="Left: load ramp from 75% to 174% of allocation, WRR grey, Prequal white (paper Fig. 6). "
                "Right: p90/p99 of nine selection rules at 70% and 90% load (paper Fig. 7).",
        notes=(
            "They also ran controlled tests on 100 client and 100 server replicas. On the left, "
            "traffic is raised step by step from 75% to 174% of the CPU allocation. Below 100% both "
            "policies are the same. Above it, WRR's tail hits the 5 second timeout and it starts "
            "returning thousands of errors, while Prequal's p99.9 stays around 700 milliseconds with "
            "zero errors. The bottom panel shows the key point: WRR keeps CPU perfectly balanced "
            "and still fails. On the right, Prequal is compared with eight other rules at 70% and "
            "90% load. Round-robin, random and WRR time out at 90%. Prequal and C3 are the best, "
            "and Prequal is 3 to 8 percent better while keeping much less state."
        ),
    ),
    Slide(
        "Conclusion and future work",
        [
            "Balance on fresh queue signals (RIF + latency), not CPU averages",
            "Cheap: ~3 async probes per query, a 16-entry pool per client",
            "Two years on YouTube: lower tail, fewer errors, fewer machines",
            "Limitations and future work:",
            ("YouTube Homepage still on synchronous probes (5 per query); move to async", 1),
            ("Reused probes update RIF but not latency", 1),
            ("Parameters (Q_RIF, probe rate) need tuning per service", 1),
            ("Only tested on Google's CPU-bound workloads", 1),
        ],
        notes=(
            "To conclude: the paper shows that keeping CPU equal does not keep latency low, and "
            "that a load balancer should route on what the queue looks like right now. Prequal "
            "does this cheaply, with a few background probes and a small pool, and it has run on "
            "YouTube for two years with lower tail latency, fewer errors and fewer machines. Its "
            "limitations: the YouTube Homepage still uses the older synchronous probes, and the "
            "authors plan to move it to asynchronous ones. Reused probes do not update their latency "
            "estimate. The parameters need tuning for each service. And all results come from "
            "Google's own environment and CPU-bound work."
        ),
    ),
    Slide(
        "Reference",
        [
            "Wydrowski, B., Kleinberg, R., Rumble, S. M., & Archer, A. (2024). Load is not what you "
            "should balance: Introducing Prequal. In 21st USENIX Symposium on Networked Systems "
            "Design and Implementation (NSDI '24) (pp. 1285–1299). USENIX Association. "
            "https://www.usenix.org/conference/nsdi24/presentation/wydrowski",
            "",
            "Thank you. Questions?",
        ],
        notes="This is the APA reference for the paper. Thank you, we are happy to take questions.",
    ),
]

if __name__ == "__main__":
    save(slides, HERE / "presentation", "2312200-2312458-2312421-2312412",
         footer="Prequal (Wydrowski et al., NSDI '24)  ·  CNDC Lab paper review")
