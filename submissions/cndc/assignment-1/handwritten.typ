// Handwritten-looking copy sheet for CNDC assignment 1. Copy it by hand; not submitted as is.
// Build: ./inkify.sh  (typst renders clean vector text, inkify.py warps it into pen ink on paper)

#let ink = rgb("#16266e")
#set page(paper: "a4", margin: (x: 22mm, y: 18mm), fill: white)
#set text(font: "Caveat", size: 23pt, fill: ink, hyphenate: false)
#set par(leading: 0.55em, spacing: 0.5em, justify: false)

// Deterministic jitter in [0, 1).
#let rnd(i) = calc.fract(calc.abs(calc.sin(i * 12.9898 + 78.233) * 43758.5453))

// Handwriting fonts and a size factor each, so they look about the same height.
#let hands = (
  ("Caveat", 1.0), ("Nanum Pen", 1.22), ("Covered By Your Grace", 0.92),
  ("Shadows Into", 0.88), ("Caveat", 1.0), ("Reenie Beanie", 1.18),
)

// A wobbly stroke from a to b.
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
  let dx = (b.at(0) - a.at(0)) / 1pt
  let dy = (b.at(1) - a.at(1)) / 1pt
  let len = calc.sqrt(dx * dx + dy * dy)
  let (ux, uy) = (dx / len, dy / len)
  let h = 8pt
  wl(b, (b.at(0) - h * (ux - uy * 0.6), b.at(1) - h * (uy + ux * 0.6)), seed: seed + 9)
  wl(b, (b.at(0) - h * (ux + uy * 0.6), b.at(1) - h * (uy - ux * 0.6)), seed: seed + 11)
}
#let at(x, y, body) = place(dx: x, dy: y, body)

// Inline hand-drawn arrows (the fonts have no arrow glyphs).
#let ar(s) = box(width: 26pt + rnd(s) * 6pt, height: 10pt, warrow((2pt, 6pt + rnd(s + 1) * 2pt), (22pt + rnd(s) * 6pt, 5pt), seed: s))
#let up(s) = box(width: 12pt, height: 16pt, baseline: 2pt, warrow((6pt, 16pt), (6.5pt, 1pt), seed: s))
#let dn(s) = box(width: 12pt, height: 16pt, baseline: 2pt, warrow((6pt, 1pt), (6.5pt, 16pt), seed: s))

#let j = counter("jitter")

// One written chunk from a plain string. Every word gets its own font pick,
// tilt, baseline, size and ink shade. `*word*` = pressed harder, `->` arrow,
// `^^` / `vv` up / down arrows.
#let l(indent: 0pt, src) = {
  j.step()
  context {
    let i = j.get().first()
    let main = calc.floor(rnd(i * 3.1) * 3)  // this chunk's dominant hand
    let base = 21pt + rnd(i + 2) * 5pt
    let em = false
    let words = ()
    for (k, w) in src.split(" ").enumerate() {
      let s = i * 101 + k * 7
      if w == "->" { words.push(ar(s)); continue }
      if w == "^^" { words.push(up(s)); continue }
      if w == "vv" { words.push(dn(s)); continue }
      let open = w.match(regex("^\W*\*")) != none
      let close = w.match(regex("\*\W*$")) != none
      let w2 = w.replace("*", "")
      if open { em = true }
      let pick = if rnd(s + 3) < 0.72 { main } else { calc.floor(rnd(s + 4) * hands.len()) }
      let (font, f) = hands.at(pick)
      let shade = ink.lighten(rnd(s + 5) * 18%).darken(rnd(s + 6) * 15%)
      words.push(box(move(dy: (rnd(s + 1) - 0.5) * 4pt,
        rotate((rnd(s + 2) - 0.5) * 5deg, reflow: false,
          text(font: font, size: base * f * (0.92 + rnd(s + 7) * 0.16), fill: shade,
            stroke: if em { 0.55pt + shade } else { 0.12pt + shade }, w2)))))
      if close { em = false }
    }
    let dx = indent + rnd(i) * 22pt
    block(above: 0.4em + rnd(i + 7) * 0.5em, below: 0.5em,
      move(dx: dx, rotate((rnd(i + 1) - 0.5) * 2deg,
        block(width: 100% - dx - 10pt,
          words.enumerate().map(((k, w)) => w + h(0.18em + rnd(i * 13 + k) * 0.3em)).join()))))
  }
}
#let q(n) = {
  j.step()
  context {
    let i = j.get().first()
    block(sticky: true, above: 0.9em + rnd(i) * 0.6em, below: 0.3em, move(dx: rnd(i + 3) * 8pt, rotate((rnd(i + 4) - 0.5) * 4deg, reflow: true, origin: left,
      box(inset: (bottom: 4pt), {
        text(font: hands.at(calc.floor(rnd(i + 5) * 3)).at(0), size: 36pt, stroke: 0.7pt + ink)[Q\##n:]
        place(bottom + left, dy: 2pt, box(width: 70pt, height: 4pt, wl((0pt, 2pt), (66pt, 3pt), seed: i, s: 1.6pt)))
      }))))
  }
}

#q(1)
#l(indent: 10pt, "*(i)* offices use diff devices, OS, vendors. *protocols* = agreed rules (msg format, order, what to do on send/receive) so a msg from ISB is understood in NY + Tokyo.")
#l(indent: 10pt, "*algorithms* = how data actually gets there -> routing picks best path (+ reroutes if a link fails), congestion ctrl, error detection.")
#l(indent: 30pt, "so: protocols = same language, algorithms = fast + reliable delivery -> seamless")

#l(indent: 10pt, "*(ii)* 1. *no modularity* -> change one thing (eg wifi -> fibre) = rewrite whole system. diff vendors can't interoperate.")
#l(indent: 10pt, "2. *hard to debug / standardise* -> everything in one big block, can't isolate a fault to one layer, no common worldwide standard.")

#q(2)
#l(indent: 10pt, "*throughput* + *packet (path) loss*")
#l(indent: 20pt, "- throughput < video bitrate -> buffer drains -> *buffering*")
#l(indent: 20pt, "- router queue full -> packets dropped -> *frames skip*")
#l(indent: 10pt, "linked: both come from *congestion* at the bottleneck link. more traffic -> queue fills -> loss ^^ -> resend -> throughput vv")

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
  at(222pt, y + 44pt)[#text(size: 28pt, stroke: 0.8pt + ink)[X] drop = skip]
})

#q(3)
#l(indent: 10pt, "*A -> circuit switching* -> only 3 users, always on, each gets a dedicated fixed rate, nothing wasted.")
#l(indent: 10pt, "*B -> packet switching* -> bursty users share the link on demand (*statistical multiplexing*), way more users than reserved circuits.")
#l(indent: 10pt, "*C -> Low-Power WAN* -> built for long range on low power, tolerates weak/variable signal (trades off data rate).")

#q(4)
#l(indent: 10pt, "*(i) TCP/IP.* it's the real implemented model (OSI is just a reference). fewer layers = less overhead on a slow, costly link.")
#l(indent: 10pt, "but Earth -> Mars delay = 4 to 24 min one way, normal TCP ACKs time out -> add *DTN* (store + forward) on top of TCP/IP.")

#l(indent: 10pt, "*(ii)* remove *session layer* (OSI). its job (dialog ctrl, checkpoints) moves into the app -> less overhead.")
#l(indent: 20pt, "impact: app must resume transfers itself after a blackout. never remove transport -> lose ports + reliability.")

#block(height: 175pt, width: 100%, breakable: false, {
  let names = ("application", "presentation", "session", "transport", "network", "data link", "physical")
  wbox(40pt, 6pt, 140pt, 166pt, seed: 70)
  for (k, n) in names.enumerate() {
    at(54pt + rnd(k) * 6pt, 9pt + k * 22pt)[#text(font: hands.at(calc.floor(rnd(k + 9) * 3)).at(0), size: 20pt, n)]
  }
  let y = 9pt + 2 * 22pt
  wl((50pt, y + 16pt), (140pt, y + 12pt), seed: 99, s: 2pt)
  warrow((250pt, y + 14pt), (160pt, y + 14pt), seed: 101)
  at(260pt, y)[remove]
})
