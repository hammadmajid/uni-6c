// Handwritten-style copy sheet for CNDC assignment 1 (brief: courses/cndc/assignments/assignment-1-layers-switching-performance.pdf).
// Build: ../../_shared/handwriting/build.sh cndc/assignment-1 2312200.pdf
#import "../../_shared/handwriting/hand.typ": *
#show: sheet

#q(1)
#l(indent: 10pt, "(i) offices use diff devices, OS, vendors. protocols = agreed rules (msg format, order, what to do on send/recieve) so a msg from ISB is ~uder~ understood in NY + Tokyo.")
#l(indent: 10pt, "algorithms = how data actually gets there -> routing picks best path (+ reroutes if a link fails), congestion ctrl, error detection.")
#l(indent: 30pt, "so: protocols = same language, algorithms = fast + reliable delivery -> seamless")

#l(indent: 10pt, "(ii) 1. no modularity -> change one thing (eg wifi -> fibre) = rewrite whole system. diff vendors can't ~interp~ interoperate.")
#l(indent: 10pt, "2. hard to debug / standardise -> everything in one big block, can't isolate a fault to one layer, no common worldwide standard.")

#q(2)
#l(indent: 10pt, "throughput + packet (path) loss")
#l(indent: 20pt, "- throughput < video bitrate -> buffer drains -> buffering")
#l(indent: 20pt, "- router queue full -> packets ~dopp~ dropped -> frames skip")
#l(indent: 10pt, "linked: both come from congestion at the bottleneck link. more traffic -> queue fills -> loss ^^ -> resend -> throughput vv")

#block(height: 100pt, width: 100%, breakable: false, {
  let y = 30pt
  at(10pt, y + 2pt)[server]
  warrow((72pt, y + 18pt), (140pt, y + 16pt), seed: 21)
  wbox(150pt, y, 110pt, 36pt, seed: 30)
  for k in range(6) { wl((168pt + k * 15pt, y + 5pt), (169pt + k * 15pt, y + 31pt), seed: 40 + k) }
  at(160pt, y - 30pt)[router queue (full)]
  warrow((270pt, y + 17pt), (340pt, y + 19pt), seed: 50)
  at(350pt, y + 2pt)[user]
  warrow((205pt, y + 40pt), (215pt, y + 62pt), seed: 60)
  at(222pt, y + 44pt)[#text(size: 28pt)[X] drop = skip]
})

#q(3)
#l(indent: 10pt, "A -> circuit switching -> only 3 users, always on, each gets a dedicated fixed rate, nothing wasted.")
#l(indent: 10pt, "B -> packet switching -> bursty users share the link on demand (statistical ~multpl~ multiplexing), way more users than reserved circuits.")
#l(indent: 10pt, "C -> Low-Power WAN -> built for long range on low power, tolerates weak/variable ~sing~ signal (trades off data rate).")

#q(4)
#l(indent: 10pt, "(i) TCP/IP. it's the real implemented model (OSI is just a reference). fewer layers = less overhead on a slow, costly link.")
#l(indent: 10pt, "but Earth -> Mars delay = 4 to 24 min one way, normal TCP ACKs time out -> add DTN (store + forward) on top of TCP/IP.")

#l(indent: 10pt, "(ii) remove session layer (OSI). its job (dialog ctrl, checkpoints) moves into the app -> less overhead.")
#l(indent: 20pt, "impact: app must resume transfers itself after a ~blak~ blackout. never remove transport -> lose ports + reliabilty.")

#block(height: 138pt, width: 100%, breakable: false, {
  let names = ("application", "presentation", "session", "transport", "network", "data link", "physical")
  wbox(40pt, 4pt, 130pt, 128pt, seed: 70)
  for (k, n) in names.enumerate() {
    at(54pt + rnd(k) * 6pt, 6pt + k * 17pt)[#text(font: "Caveat", size: 18pt, n)]
  }
  let y = 6pt + 2 * 17pt
  wl((50pt, y + 16pt), (140pt, y + 12pt), seed: 99, s: 1.2pt)
  warrow((250pt, y + 14pt), (160pt, y + 14pt), seed: 101)
  at(260pt, y)[remove]
})
