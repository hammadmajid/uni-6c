// CNDC Lab semester project: research paper review report.
// Brief: ~/Developer/uni/Semester Project Report for CNDC.pdf (45 marks).
// Build: zabkit sheet build submissions/cndc-lab/semester-project-report
// Figures: figures/paper-fig*.png are cropped from the paper; the rest come from diagrams.py.

#import "@zabkit/cover:1.0.0": *

#item-cover()

#show: item-body

#set par(justify: true)
#show figure.caption: set text(size: 9.5pt)
#show figure: set block(above: 1.1em, below: 1.1em)

#let fig(path, caption, width: 100%) = figure(image(path, width: width), caption: caption)

= 1. Title of the Paper

_Load is not what you should balance: Introducing Prequal_

= 2. Authors and Publication Details

#table(
  columns: (auto, 1fr),
  stroke: 0.5pt + luma(180),
  inset: 6pt,
  [*Authors*], [Bartek Wydrowski (Google Research), Robert Kleinberg (Google Research and Cornell University), Stephen M. Rumble (Google / YouTube), Aaron Archer (Google Research)],
  [*Venue*], [21st USENIX Symposium on Networked Systems Design and Implementation (NSDI '24), Santa Clara, CA, USENIX Association, pp. 1285–1299],
  [*Year*], [2024 (April 16–18)],
)

= 3. Introduction and Problem Statement

== The problem

A large web service such as YouTube runs hundreds of copies (*replicas*) of each of its internal services. Every time one service calls another, a *load balancer* decides which replica gets the request. The standard rule at Google, and in most of the industry, is to keep every replica's *CPU utilisation* equal, using weighted round-robin (WRR): each replica gets traffic in proportion to how much work it finished per unit of CPU in the recent past @prequal.

The paper argues that CPU load is the wrong thing to balance. Each replica shares its physical machine with other jobs, called *antagonists*, whose CPU use goes up and down without warning. Two replicas can show the same CPU reading while one of them has a long queue of waiting requests because its antagonist is taking the processor (@fig-cpu). CPU is also measured as an average over seconds or minutes, so it describes what a server _was_ doing, not what it is doing now. When traffic peaks, these hidden queues produce *tail latency*: the slowest 1% (p99) of requests become many times slower than the median, and some requests time out. At YouTube's scale, the tail is what users notice and what breaks service-level objectives.

#fig("figures/cpu-vs-rif.png", [Two replicas with the same 60% CPU reading. On server B the antagonist uses most of the CPU, so requests pile up and the next one waits much longer. A CPU-based balancer treats A and B as equal.], width: 72%) <fig-cpu>

The authors' answer is *Prequal* (Probing to Reduce Queuing and Latency). Prequal does not balance CPU. It sends small, cheap *probes* to a few random replicas, asks each one how many *requests it has in flight* (RIF) and how long its recent requests took, and sends each request to the best replica it has heard from.

== Why it matters in computer networks

A load balancer is a traffic-distribution device: it decides where packets and requests go inside a data centre or a content-delivery network, so it directly sets the *delay, throughput and loss* that users get, the three measures this course uses to judge any network. The paper shows that the choice of routing signal (stale load versus fresh queue length and latency) changes the tail delay of a real network service by a factor of two. It also applies ideas from the course directly: queueing delay, the trade-off between probing overhead and fresh information, and the fact that the queue in front of a resource, not its average utilisation, is what causes delay. The brief also asks about operating systems: the same idea, scheduling work by queue length rather than average CPU use, is how an OS scheduler and its run queues avoid one overloaded core.

= 4. Summary of the Paper

== Objectives

The paper has three goals: (1) show that balancing CPU load backfires in a shared, multi-tenant data centre; (2) design a load balancer that minimises *real-time latency*, especially the tail, when replicas have different and changing capacity; and (3) report what happened when it replaced WRR on YouTube, where it has run for more than two years, and test each design choice on a controlled testbed.

== Method: how Prequal works

Prequal is built on the *power of d choices* idea from theory: instead of asking every server how busy it is (too expensive) or picking one at random (too blind), ask a few random servers and pick the best of them. This is known to remove almost all of the imbalance of random choice. Prequal changes two things in that idea: _which_ signal it uses and _how_ it collects it.

*Signals.* Each replica tracks two numbers (@fig-signals). *RIF* goes up by one when a request arrives and down by one when it finishes. It is an instant, leading signal: it shows load building up before the CPU average moves. *Latency* is estimated per RIF level: the replica keeps the median latency of recent requests that arrived when its RIF was _r_, and reports the value for its current RIF.

#fig("figures/signals.png", [What every replica tracks: requests in flight (RIF) and the median latency of recent requests at each RIF level.], width: 70%) <fig-signals>

*Asynchronous probing.* Classic power-of-_d_ probes the servers _while the request waits_, which adds a network round trip to every request. Prequal instead sends about three probes per query in the background and keeps the replies in a small *probe pool* of at most 16 entries (@fig-pool). When a request arrives, the client picks from the pool immediately, without waiting. Probes are sampled at random, so no single server gets probed by everyone at once.

#fig("figures/probe-pool.png", [Asynchronous probing. A background sender keeps the pool filled with replies (RIF and latency) from random replicas; the request is sent to the best replica in the pool without waiting for any probe.], width: 72%) <fig-pool>

*Hot-cold lexicographic (HCL) selection.* To choose from the pool, Prequal marks each probe *hot* if its RIF is above a quantile _Q_#sub[RIF] (by default the 84th percentile) of recent RIF values, and *cold* otherwise. If any probe is cold, it picks the cold replica with the *lowest latency*. If all probes are hot, it picks the one with the *lowest RIF* (@fig-hc). So RIF is used as a safety limit to avoid overloaded replicas, and latency is used to pick the fastest among the safe ones. The authors found that this rule beats any linear mix of RIF and latency. If the pool is empty, Prequal falls back to a random replica.

#fig("figures/hot-cold.png", [The hot-cold rule. Left: some probes are cold, so the lowest-latency cold replica (M) wins even though D has fewer requests. Right: every probe is hot, so the replica with the lowest RIF (E) wins.], width: 88%) <fig-hc>

*Pool upkeep.* A pool can go wrong in three ways: probes get *stale*, the pool *empties*, or it *degrades* because the good replicas keep being picked and removed, leaving only busy ones. Prequal handles this with four rules (@fig-upkeep): probes older than one second are dropped; a full pool drops its oldest probe; a probe is reused at most _b_#sub[reuse] times, and its RIF is raised by one each time the client sends it a request; and on every query one probe is removed, alternating between the oldest and the worst one.

#fig("figures/pool-upkeep.png", [How probes leave the pool. Together these rules keep the pool fresh and stop it filling up with overloaded replicas.], width: 70%) <fig-upkeep>

== Results and evaluation

*Deployment on YouTube.* The authors switched the YouTube Homepage service (personalised recommendations) from WRR to Prequal on live traffic. @fig-yt-rif shows the change at about 08:00: the spread of CPU use, memory and RIF across replicas tightens immediately. Tail RIF fell from about 225 to about 50. Over the whole rollout they report *2× lower tail latency*, *5–10× lower tail RIF*, *2× lower tail CPU*, *10–20% less tail memory* and a near-elimination of errors caused by load imbalance. Error spikes of 0.01–0.1% dropped to nearly zero, median latency improved by 10–20% and tail latency by 40–50% (@fig-yt-lat). Because the tail was under control, YouTube could raise its utilisation targets and serve the same traffic with fewer machines. This was achieved even though the Homepage still used the older synchronous probing with 5 probes per query, which adds latency to every request.

#fig("figures/paper-fig4.png", [Paper Fig. 4: CPU, memory and requests-in-flight heatmaps across YouTube Homepage replicas, WRR until about 08:00, then Prequal. Source: Wydrowski et al. (2024).], width: 66%) <fig-yt-rif>

#fig("figures/paper-fig5.png", [Paper Fig. 5: YouTube Homepage error rate (top) and normalised p99.9, p99 and p50 latency (bottom). Prequal took over shortly after 08:00. Source: Wydrowski et al. (2024).], width: 66%) <fig-yt-lat>

*Load ramp on the testbed.* On a controlled testbed of 100 client and 100 server replicas running a CPU-heavy hash workload with real antagonists, the authors increased traffic in steps from 75% to 174% of the CPU allocation (@fig-ramp). Below the allocation both policies are the same (about 80 ms p50, 265 ms p99). As soon as load passes the allocation, WRR breaks down: its p99.9 hits the 5 s timeout at 103%, its p99 at 127%, and errors climb into thousands per second. Prequal's p99.9 is still only about 700 ms at 174%, and it has zero errors at every step. The bottom panel shows why: WRR keeps CPU use nearly equal on all replicas, which is exactly what it is designed to do, but that balance does not prevent the queues that cause the tail. Prequal lets CPU use spread out and keeps latency low.

#fig("figures/paper-fig6.png", [Paper Fig. 6: load ramp experiment. Grey background is WRR, white is Prequal; tail latency (a) is on a log scale. Source: Wydrowski et al. (2024).], width: 48%) <fig-ramp>

*Comparison with other selection rules.* At 70% and 90% of allocation the authors compared Prequal with eight other rules, including round-robin, random, WRR, least-loaded, two power-of-two variants (one from Microsoft's YARP proxy), a linear mix of RIF and latency, and C3 (@fig-rules). At 90% load, round-robin, random and WRR time out completely, while Prequal's p99 is 286 ms. The best rules were Prequal and C3. Both use server-side signals, punish high RIF hard, and prefer low latency when RIF is low. Prequal was 3–8% better than C3 and needs much less state, only a 16-entry pool per client.

#grid(columns: (1fr, 1fr), column-gutter: 1.2em, align: bottom,
  [#fig("figures/paper-fig7.png", [Paper Fig. 7: p90 (dark) and p99 (light) latency of nine replica selection rules at 70% and 90% of allocation; "TO" means requests timed out. Source: Wydrowski et al. (2024).]) <fig-rules>],
  [#fig("figures/paper-fig8.png", [Paper Fig. 8: probing rate experiment, from 4 down to ½ probes per query. Source: Wydrowski et al. (2024).]) <fig-probe>],
)

*Tunable parameters.* The probing rate can drop to about 1–2 probes per query before tail latency gets worse (@fig-probe), so probing costs little. For the hot threshold, any _Q_#sub[RIF] from 0.6 to 0.9 works well; using RIF alone (_Q_#sub[RIF] = 0) is already good, and using latency alone is the worst choice, because RIF is the signal that warns of a queue before it shows up in latency.



== Contribution to performance, resource management and scalability

- *Performance:* tail latency and errors drop sharply exactly when the system is busiest, which is the opposite of how a CPU-balanced system behaves.
- *Resource management:* with the tail under control, servers can safely run at higher utilisation, so the same traffic needs fewer machines. Lower tail RIF also means less memory spent on queued requests.
- *Scalability:* each client keeps only a 16-entry pool and sends about three small probes per query, so the design has no central load balancer and no per-server state at the clients, and it scales to services with hundreds of replicas.

== Limitations and future work

- *Probing overhead.* Every query sends extra RPCs. The YouTube Homepage still uses synchronous probing with 5 probes per query (six RPCs per query), and the authors say they _intend_ to move it to asynchronous probing. For services with very light requests, the probe cost is a larger share of the work.
- *Stale latency on reused probes.* When a probe is reused, Prequal raises its RIF but not its latency estimate. The authors note they would ideally update both.
- *Tuning.* The results depend on _Q_#sub[RIF], the probing rate, the pool size and the removal rate. The paper gives good default values but no rule for setting them on a new service.
- *Evaluation scope.* All results come from Google's own infrastructure and a CPU-bound hash workload with whatever antagonists happened to run, so they cannot be exactly repeated outside Google, and services that are limited by memory or I/O are not tested.

= 5. Conclusion

The paper's main contribution is to overturn a default that most of the industry takes for granted: balancing CPU load does not minimise latency in a shared data centre, and it can make the tail much worse exactly when traffic peaks. Prequal replaces the stale CPU average with two fresh signals, requests in flight and latency, collects them with cheap background probes, and combines them with a simple hot-cold rule. On YouTube it halved tail latency, nearly removed load-imbalance errors and let the service run at higher utilisation on fewer machines. For computer networks, the lesson is general: route traffic on what the queue looks like now, not on how busy the server was on average.

= 6. Reference (APA 7th Edition)

#set par(hanging-indent: 1.27cm, justify: false)
Wydrowski, B., Kleinberg, R., Rumble, S. M., & Archer, A. (2024). Load is not what you should balance: Introducing Prequal. In _21st USENIX Symposium on Networked Systems Design and Implementation (NSDI '24)_ (pp. 1285–1299). USENIX Association. https://www.usenix.org/conference/nsdi24/presentation/wydrowski

#show bibliography: none
#bibliography("refs.bib", style: "apa")
