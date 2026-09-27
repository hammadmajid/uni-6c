#import "../../_shared/zabdoc/cover.typ": cover, body-page-setup

#let course-code = "CSCL 3205"
#let class = "BsCS-6C"

#cover(
  students: (
    (Name: "Hammad Majid", RegNo: "2312200"),
    (Name: "Haris Qaiser Lodhi", RegNo: "2312458"),
    (Name: "Syed Muhammad Ahsan", RegNo: "2312421"),
  ),
  class: class,
  course: "CNDC Lab",
  course-code: course-code,
  instructor: "Mr. Adeel Ahmed",
  doc-type: "Paper Review Proposal",
  number: "",
  date: "28 Sep 2026",
  marks: "30",
)

#body-page-setup(course-code, class)[

= 1. Title of the Paper

_Load is not what you should balance: Introducing Prequal_

= 2. Authors and Publication Details

#table(
  columns: (auto, 1fr),
  stroke: 0.5pt + luma(180),
  inset: 6pt,
  [*Authors*], [Bartek Wydrowski (Google Research), Robert Kleinberg (Google Research and Cornell University), Stephen M. Rumble (Google / YouTube), Aaron Archer (Google Research)],
  [*Venue*], [21st USENIX Symposium on Networked Systems Design and Implementation (NSDI ’24), USENIX Association, pp. 1285 to 1299],
  [*Year*], [2024 (April)],
)

= 3. Introduction and Problem Statement

== The problem

A large web service runs many copies of the same server, and a *load balancer* decides which copy gets each request. Most load balancers try to keep every server equally busy, usually by *CPU utilisation* or queue length. The paper shows that this does not give users the lowest latency. A server can have low CPU use and still answer slowly, so balancing CPU can leave some requests stuck behind slow servers. These slow requests make up the *tail latency* (the p99 and above), and for a large service the tail is what users notice.

The authors built *Prequal* (Probing to Reduce Queuing and Latency). For each request, Prequal asks a few randomly chosen servers how many *requests they have in flight* and what their *recent latency* is, then sends the request to the best of them. This is the "power of _d_ choices" idea: checking a few random servers works almost as well as checking all of them, at a fraction of the cost. Google has run Prequal on YouTube for over two years. Compared with the CPU-based balancer it replaced, it cut tail latency and error rates and needed fewer servers @prequal.

== Why it matters in CNDC

A load balancer decides where traffic goes inside a data centre or content-delivery network, so it directly affects the *delay, throughput and reliability* that users get. The course measures networks by these same numbers. This paper shows that choosing servers by measured latency and queue size, instead of by CPU load, lowers delay at YouTube's scale, and it gives evidence against a design choice that most systems still use by default.

= 4. Reference (APA 7th Edition)

#set par(hanging-indent: 1.27cm, justify: false)
Wydrowski, B., Kleinberg, R., Rumble, S. M., & Archer, A. (2024). Load is not what you should balance: Introducing Prequal. In _21st USENIX Symposium on Networked Systems Design and Implementation (NSDI ’24)_ (pp. 1285–1299). USENIX Association. https://www.usenix.org/conference/nsdi24/presentation/wydrowski

#show bibliography: none
#bibliography("refs.bib", style: "apa")

]
