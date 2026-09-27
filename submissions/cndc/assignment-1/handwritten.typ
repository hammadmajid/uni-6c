// Handwritten-looking copy sheet for CNDC assignment 1. Copy by hand, not submitted as is.
// typst compile --font-path ../../_shared/fonts handwritten.typ handwritten.pdf

#let ink = rgb("#1d2b6b")
#set page(paper: "a4", margin: (x: 18mm, y: 16mm), fill: rgb("#fdfcf7"))
#set text(font: "Caveat", size: 23pt, fill: ink, weight: 500, hyphenate: false)
#set par(leading: 0.45em, spacing: 0.5em)

// Deterministic jitter in [0, 1).
#let rnd(i) = calc.fract(calc.abs(calc.sin(i * 12.9898 + 78.233) * 43758.5453))

// A wobbly stroke from a to b (points as (x, y) lengths).
#let wl(a, b, seed: 0, s: 1.3pt) = {
  let mx = (a.at(0) + b.at(0)) / 2 + (rnd(seed) - 0.5) * 5pt
  let my = (a.at(1) + b.at(1)) / 2 + (rnd(seed + 1) - 0.5) * 5pt
  place(curve(stroke: (paint: ink, thickness: s, cap: "round"),
    curve.move(a), curve.quad((mx, my), b)))
}
#let wbox(x, y, w, h, seed: 0) = {
  wl((x, y), (x + w, y + 1pt), seed: seed)
  wl((x + w, y - 1pt), (x + w + 1pt, y + h), seed: seed + 3)
  wl((x + w + 2pt, y + h), (x - 1pt, y + h - 1pt), seed: seed + 5)
  wl((x, y + h + 1pt), (x + 1pt, y - 2pt), seed: seed + 7)
}
#let warrow(a, b, seed: 0) = {
  wl(a, b, seed: seed)
  let dx = b.at(0) - a.at(0)
  let dy = b.at(1) - a.at(1)
  let len = calc.sqrt(dx / 1pt * dx / 1pt + dy / 1pt * dy / 1pt)
  let ux = dx / 1pt / len
  let uy = dy / 1pt / len
  let h = 8pt
  wl(b, (b.at(0) - h * (ux - uy * 0.6), b.at(1) - h * (uy + ux * 0.6)), seed: seed + 9)
  wl(b, (b.at(0) - h * (ux + uy * 0.6), b.at(1) - h * (uy - ux * 0.6)), seed: seed + 11)
}
#let at(x, y, body) = place(dx: x, dy: y, body)

// Inline hand-drawn arrows (the font has no arrow glyphs).
#let ar = box(width: 28pt, height: 10pt, warrow((2pt, 6pt), (24pt, 5pt), seed: 4))
#let up = box(width: 12pt, height: 16pt, baseline: 2pt, warrow((6pt, 16pt), (6.5pt, 1pt), seed: 8))
#let dn = box(width: 12pt, height: 16pt, baseline: 2pt, warrow((6pt, 1pt), (6.5pt, 16pt), seed: 2))

#let j = counter("jitter")
// One written chunk: nudged sideways, tilted, size wobbles a little.
#let l(indent: 0pt, body) = {
  j.step()
  context {
    let i = j.get().first()
    let dx = indent + rnd(i) * 22pt
    block(above: 0.4em + rnd(i + 7) * 0.45em, below: 0.5em,
      move(dx: dx, rotate((rnd(i + 1) - 0.5) * 2.2deg,
        block(width: 100% - dx - 10pt,
          text(size: 21pt + rnd(i + 2) * 5pt, body)))))
  }
}
#let q(n) = {
  j.step()
  context {
    let i = j.get().first()
    v(0.5em + rnd(i) * 0.6em)
    move(dx: rnd(i + 3) * 8pt, rotate((rnd(i + 4) - 0.5) * 4deg, reflow: true, origin: left,
      box(inset: (bottom: 4pt), {
        text(size: 34pt, weight: 700)[Q\##n:]
        place(bottom + left, dy: 2pt, box(width: 70pt, height: 4pt, wl((0pt, 2pt), (66pt, 3pt), seed: i)))
      })))
  }
}

#q(1)
#l(indent: 10pt)[*(i)* offices use diff devices, OS, vendors. *protocols* = agreed rules (msg format, order, what to do on send/receive) so a msg from ISB is understood in NY + Tokyo.]
#l(indent: 10pt)[*algorithms* = how data actually gets there #ar routing picks best path (+ reroutes if a link fails), congestion ctrl, error detection.]
#l(indent: 30pt)[so: protocols = same language, algorithms = fast + reliable delivery #ar seamless]

#l(indent: 10pt)[*(ii)* 1. *no modularity* #ar change one thing (eg wifi #ar fibre) = rewrite whole system. diff vendors can't interoperate.]
#l(indent: 10pt)[2. *hard to debug / standardise* #ar everything in one big block, can't isolate a fault to one layer, no common worldwide standard.]

#q(2)
#l(indent: 10pt)[*throughput* + *packet (path) loss*]
#l(indent: 20pt)[- throughput < video bitrate #ar buffer drains #ar *buffering*]
#l(indent: 20pt)[- router queue full #ar packets dropped #ar *frames skip*]
#l(indent: 10pt)[linked: both come from *congestion* at the bottleneck link. more traffic #ar queue fills #ar loss #up #ar resend #ar throughput #dn]

#block(height: 105pt, width: 100%, breakable: false, {
  let y = 30pt
  at(10pt, y + 2pt)[server]
  warrow((72pt, y + 18pt), (140pt, y + 16pt), seed: 21)
  wbox(150pt, y, 110pt, 36pt, seed: 30)
  for k in range(6) { wl((168pt + k * 15pt, y + 5pt), (169pt + k * 15pt, y + 31pt), seed: 40 + k) }
  at(160pt, y - 30pt)[router queue (full)]
  warrow((270pt, y + 17pt), (340pt, y + 19pt), seed: 50)
  at(350pt, y + 2pt)[user]
  warrow((205pt, y + 40pt), (215pt, y + 62pt), seed: 60)
  at(222pt, y + 44pt)[#text(size: 28pt, weight: 700)[X] drop = skip]
})

#q(3)
#l(indent: 10pt)[*A #ar circuit switching* #ar only 3 users, always on, each gets a dedicated fixed rate, nothing wasted.]
#l(indent: 10pt)[*B #ar packet switching* #ar bursty users share the link on demand (*statistical multiplexing*), way more users than reserved circuits.]
#l(indent: 10pt)[*C #ar Low-Power WAN* #ar built for long range on low power, tolerates weak/variable signal (trades off data rate).]

#q(4)
#l(indent: 10pt)[*(i) TCP/IP.* it's the real implemented model (OSI is just a reference). fewer layers = less overhead on a slow, costly link.]
#l(indent: 10pt)[but Earth #ar Mars delay = 4 to 24 min one way, normal TCP ACKs time out #ar add *DTN* (store + forward) on top of TCP/IP.]

#l(indent: 10pt)[*(ii)* remove *session layer* (OSI). its job (dialog ctrl, checkpoints) moves into the app #ar less overhead.]
#l(indent: 20pt)[impact: app must resume transfers itself after a blackout. never remove transport #ar lose ports + reliability.]

#block(height: 175pt, width: 100%, breakable: false, {
  let names = ("application", "presentation", "session", "transport", "network", "data link", "physical")
  wbox(40pt, 6pt, 140pt, 162pt, seed: 70)
  for (k, n) in names.enumerate() {
    at(54pt, 4pt + k * 22pt)[#text(size: 20pt, n)]
  }
  let y = 4pt + 2 * 22pt
  wl((50pt, y + 16pt), (140pt, y + 12pt), seed: 99, s: 2pt)
  warrow((250pt, y + 14pt), (160pt, y + 14pt), seed: 101)
  at(260pt, y)[remove]
})
