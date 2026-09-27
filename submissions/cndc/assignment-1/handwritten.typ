// Handwritten-looking copy sheet for CNDC assignment 1. Copy it by hand; not submitted as is.
// Build: ./inkify.sh  (typst renders clean vector text, inkify.py warps it into pen ink on paper)

#let ink = rgb("#16266e")
#set page(paper: "a4", margin: (left: 14mm, right: 3mm, y: 9mm), fill: white)
#set text(font: "Caveat", size: 23pt, fill: ink, hyphenate: false)
#set par(leading: 0.55em, spacing: 0.5em, justify: false)

// Deterministic jitter in [0, 1).
#let rnd(i) = calc.fract(calc.abs(calc.sin(i * 12.9898 + 78.233) * 43758.5453))

// Handwriting fonts and a size factor each, so they look about the same height.
// Handwriting fonts and a size factor each, so they look about the same height.
// Caveat carries most of the sheet; the others only slip in now and then.
#let hands = (("Caveat", 1.0), ("Nanum Pen", 1.08), ("Covered By Your Grace", 0.92), ("Shadows Into", 0.9))

// A wobbly stroke from a to b.
#let wl(a, b, seed: 0, s: 0.9pt) = {
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

// One written chunk from a plain string. Every word gets its own tilt, baseline,
// size and ink shade, and all of it grows as the sheet goes on: neat at the top,
// sloppier by the last answer. `->` arrow, `^^` / `vv` up / down arrows,
// `~wro~` = a word abandoned half-way and scribbled out, followed by the right one.
#let l(indent: 0pt, src) = {
  j.step()
  context {
    let i = j.get().first()
    let m = 0.5 + 1.8 * i / j.final().first()   // messiness: ~0.5 at the start, ~2.3 at the end
    let main = if rnd(i * 3.1) < 0.2 { 1 } else { 0 }  // an occasional chunk in another hand
    let base = 23pt + rnd(i + 2) * 2pt + m * 0.6pt
    let words = ()
    for (k, w) in src.split(" ").enumerate() {
      let s = i * 101 + k * 7
      if w == "->" { words.push(ar(s)); continue }
      if w == "^^" { words.push(up(s)); continue }
      if w == "vv" { words.push(dn(s)); continue }
      let struck = w.starts-with("~")
      let w2 = w.replace("~", "")
      let pick = if rnd(s + 3) < 1 - 0.07 * m { main } else { calc.floor(rnd(s + 4) * hands.len()) }
      let (font, f) = hands.at(pick)
      let shade = ink.lighten(rnd(s + 5) * 8%)
      let t = text(font: font, size: base * f * (1 + (rnd(s + 7) - 0.5) * 0.05 * m), fill: shade, w2)
      let body = if struck {
        // Abandoned half-word, scribbled out hard: a dense zigzag over it, twice.
        let wd = measure(t).width
        let zig(seed, off) = {
          let n = calc.max(4, calc.floor(wd / 2.6pt))
          let pts = range(n + 1).map(q => (
            -0.5pt + (wd + 3pt) * q / n + (rnd(seed + q) - 0.5) * 3.5pt,
            if calc.rem(q, 2) == 0 { off - 1pt + rnd(seed + q * 3) * 3pt } else { off + 0.34em + rnd(seed + q * 5) * 3pt }))
          curve(stroke: (paint: ink, thickness: 1.25pt, cap: "round", join: "round"),
            curve.move(pts.first()), ..pts.slice(1).map(pt => curve.line(pt)))
        }
        box({
          t
          place(top + left, dy: 0.08em, zig(s + 30, 0pt))
          place(top + left, dy: 0.08em, zig(s + 60, 2pt))
          place(top + left, dy: 0.2em, box(width: wd, height: 0pt, {
            wl((-0.5pt, 3pt), (wd + 3pt, 1pt), seed: s + 20, s: 1.4pt)
            wl((0pt, 7pt), (wd + 2pt, 5pt), seed: s + 23, s: 1.3pt)
          }))
        })
      } else { t }
      words.push(box(move(dy: (rnd(s + 1) - 0.5) * 1.4pt * m,
        rotate((rnd(s + 2) - 0.5) * 1.4deg * m, reflow: false, body))))
    }
    let dx = indent + rnd(i) * 6pt * m
    block(above: 0.35em + rnd(i + 7) * 0.25em * m, below: 0.45em,
      move(dx: dx, rotate((rnd(i + 1) - 0.5) * 0.8deg * m,
        block(width: 100% - dx,
          words.enumerate().map(((k, w)) => w + h(0.16em + rnd(i * 13 + k) * 0.18em * m)).join()))))
  }
}
#let q(n) = {
  j.step()
  context {
    let i = j.get().first()
    block(sticky: true, above: 0.9em + rnd(i) * 0.6em, below: 0.3em, move(dx: rnd(i + 3) * 8pt, rotate((rnd(i + 4) - 0.5) * 2deg, reflow: true, origin: left,
      box(inset: (bottom: 4pt), {
        text(font: "Caveat", size: 34pt)[Q\##n:]
        place(bottom + left, dy: 2pt, box(width: 70pt, height: 4pt, wl((0pt, 2pt), (66pt, 3pt), seed: i, s: 1pt)))
      }))))
  }
}

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
