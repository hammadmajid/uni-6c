#import "../../_shared/zabdoc/cover.typ": cover, body-page-setup

#let course-code = "CSC 3109"
#let class = "BsCS-5D"

#cover(
  students: ((Name: "Hammad Majid", RegNo: "2312200"),),
  class: class,
  course: "Software Engineering",
  course-code: course-code,
  instructor: "Awais Mahmood",
  doc-type: "Assignment",
  number: "1",
  date: "27 Sep 2026",
  marks: "3.5",
)

#body-page-setup(course-code, class)[

= LatencyRoute: a latency-aware request router.

= Problem Statement

Most small self-hosted setups put a handful of app instances behind a reverse proxy and split traffic round-robin, or by connection count. Neither looks at how fast a backend is actually responding. When one instance slows down (a GC pause, a cold cache, a noisy neighbour on a shared VPS), round-robin keeps sending it its usual share of traffic, so some users get hit with high latency while other instances sit idle. Bigger setups fix this with a full service mesh or a load-balancer cluster that tracks global state, which is overkill for two to ten machines. I want a router that watches each backend's live latency and picks the fastest one for each request, without needing a heavyweight system to do it.

= Scope

The router sits in front of N backend workers. Each worker tracks its own recent response time as an exponential moving average, and how many requests it is currently handling. For each incoming request, the router picks a few workers at random, checks their current numbers, and sends the request to the better one. This is the *power of two choices* idea @mitzenmacher, so it never has to poll every worker on every request. The design is a scaled-down version of Google's Prequal load balancer @prequal, which routes by probed latency and requests in flight instead of CPU load.

== What I Will Build

- the router itself, with the probing and routing logic
- a few demo backend workers, plus a way to make one of them artificially slow, to show the router routing around it
- a small dashboard showing live latency and traffic split per worker
- a load test comparing this against plain round-robin, reporting p95/p99 latency for both

*Out of scope:* multi-region routing, anything beyond HTTP, TLS and auth, and scaling the worker fleet itself. The workers are demo services, not real production apps.

= Nature of the Project

A backend systems project with a small web dashboard. The router is written in Node.js/TypeScript; the router and demo workers are containerized with Docker; the dashboard is a small page fed over a WebSocket. It is not a CRUD app. The actual engineering is the routing algorithm and the latency estimation, not a database front end.

= Software Process Model

The requirements are not fully settled: the real tuning (how many workers to probe, how fast the latency average should decay) cannot be picked correctly before there is a running version to test it against. That points at *incremental development* over waterfall @sommerville[§2.1.2]: build a working slice, measure it, adjust, repeat.

== Iterations

+ *Baseline:* plain round-robin router plus a skeleton dashboard, so something is running end to end.
+ *Sensing:* workers report latency and in-flight count; the router logs it but still routes round-robin. This checks the numbers make sense before anything depends on them.
+ *Routing:* the power-of-two-choices logic goes live; add the tool to fake a slow worker.
+ *Evaluation:* load test round-robin against the new router, tune the parameters from what the numbers show, finish the dashboard.

*Trade-off I am accepting:* less upfront documentation than waterfall, and the usual incremental risk of the code getting messier iteration over iteration if I do not clean it up. I am budgeting time for that at the start of iterations 3 and 4.

#bibliography("refs.bib", title: "References", style: "ieee")

]
