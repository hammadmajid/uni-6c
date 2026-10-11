#import "../../_shared/zabdoc/cover.typ": cover, body-page-setup

#let course-code = "CSCL 4101"
#let class = "BsCS-6C"
#let box-inset = 2mm

#cover(
  students: (
    (Name: "Hammad Majid", RegNo: "2312200"),
    (Name: "Haris Qaiser Lodhi", RegNo: "2312458"),
    (Name: "Syed Muhammad Ahsan", RegNo: "2312421"),
    (Name: "Taha Mustafa", RegNo: "2312412"),
  ),
  class: class,
  course: "AI Lab",
  course-code: course-code,
  instructor: "Mr. Muhammad Ishfaq",
  doc-type: "Project Proposal",
  number: "01",
  date: "12 Oct 2026",
  marks: "",
  single-column: true,
  box-inset: box-inset,
)

#body-page-setup(course-code, class, body-pad: 6mm, box-inset: box-inset)[
  #set text(size: 11.5pt)
  #show heading: it => block(above: 0.9em, below: 0.35em, it)

  = Smarter Load Balancing with an AI Agent (Prequal in Simulation)

  *Paper.* Wydrowski, B., Kleinberg, R., Rumble, S. M., & Archer, A. (2024).
  _Load is not what you should balance: Introducing Prequal._ USENIX NSDI '24,
  pp. 1285–1299. Same paper as our CNDC Lab problem statement.

  == Problem

  A big website like YouTube runs the same service on many servers. A load
  balancer decides which server gets each request. The common rule is to
  send it to the server with the lowest CPU usage. The paper shows this rule
  is a poor choice: CPU usage is an average over the last several seconds,
  so it tells you what a server _was_ doing, not what it is doing now.
  When traffic is uneven, some servers end up with long queues and the
  slowest requests (the top 1%) get much slower. The problem is to pick,
  for every request, the server that will answer fastest, using
  information that is cheap to collect and up to date.

  == How the paper solves it

  Prequal stops looking at CPU and looks at two fresh signals instead: how
  many requests a server is handling right now (*requests in flight*, RIF)
  and how long its recent requests took. For every incoming request the
  client sends about three quick "how busy are you?" probes to random
  servers and keeps the answers in a small *probe pool* (at most 16). Old
  answers are thrown away after one second, and the pool is regularly
  cleaned of its oldest and its worst entry so it never fills up with busy
  servers. To choose a server it uses a simple two-step rule: servers with
  unusually high RIF are marked "hot" and avoided; among the rest, the one
  with the lowest recent latency wins. If every server is hot, it picks the
  one with the lowest RIF. If the pool is empty, it picks at random.

  == What we will build

  We will build this load balancer as an *intelligent agent* in the sense
  used in the AI course (sensors, actuators, environment, performance
  measure). Its environment is a set of simulated servers with
  requests of varying size and a background load that goes up and down
  over time, as in the paper's test setup. Its sensors are the probe
  replies, its actuators are "send request" and "send probe", and its
  performance measure is the latency of the slowest 1% of requests. The
  probe pool is the agent's memory of the world, and the hot/cold rule is
  a heuristic that ranks the choices, much like greedy best-first search
  ranks the frontier. The four agents below run on the same simulator,
  with traffic rising from light to very heavy and the same random seeds,
  and every request's latency is logged.

  == What we expect to find

  Prequal should make the slowest 1% of requests much faster than the
  lowest-CPU rule while the typical request stays about the same, which is
  what the paper reports, and the full hot/cold rule to beat a RIF-only rule.

  == The four agents we will compare

  #table(
    columns: (auto, auto, 1fr),
    inset: (x: 6pt, y: 3pt),
    stroke: 0.5pt + gray,
    align: left,
    table.header([*Agent*], [*Signal*], [*How it picks a server*]),
    [Round-robin], [none], [Next server in a fixed cycle],
    [Lowest-CPU], [CPU usage], [Server with the lowest average CPU (the paper's baseline)],
    [Power of two], [RIF], [Probe two random servers, take the less busy one],
    [Prequal], [RIF and latency], [Probe pool plus the hot/cold rule],
  )

  == Conclusion

  The paper's message is that a load balancer should act on what servers
  are doing now, not on an average of what they did. We will test it by
  building the Prequal client as an agent in a Python simulation and
  comparing it with three simpler agents under the same traffic. A match
  with the paper's result would show that an agent sensing its environment
  and ranking its choices with a heuristic can solve a real YouTube-scale problem.
]
