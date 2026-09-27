// Handwriting library for copy sheets. See README.md next to this file for the rules.
// Import from an item's handwritten.typ:
//   #import "../../_shared/handwriting/hand.typ": *
//   #show: sheet

#let ink = rgb("#16266e")

// Page setup for a copy sheet: `#show: sheet`. Big writing, lines run to the right edge.
#let sheet(body) = {
  set page(paper: "a4", margin: (left: 14mm, right: 3mm, y: 9mm), fill: white)
  set text(font: "Caveat", size: 23pt, fill: ink, hyphenate: false)
  set par(leading: 0.55em, spacing: 0.5em, justify: false)
  body
}

// Knobs for trying variants: typst compile --input letters=1 --input mess=1.5 ...
#let letters = sys.inputs.at("letters", default: "0") == "1"  // every glyph drawn a bit differently
#let mess-scale = float(sys.inputs.at("mess", default: "1"))

// Deterministic jitter in [0, 1).
#let rnd(i) = calc.fract(calc.abs(calc.sin(i * 12.9898 + 78.233) * 43758.5453))

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
    let m = (0.5 + 1.8 * i / j.final().first()) * mess-scale   // messiness: ~0.5 at the start, ~2.3 at the end
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
      let size = base * f * (1 + (rnd(s + 7) - 0.5) * 0.05 * m)
      let t = if letters {
        // A font repeats the exact same "e" every time; a hand never does.
        w2.clusters().enumerate().map(((ci, c)) => {
          let r = s * 13 + ci * 5
          box(move(dy: (rnd(r) - 0.5) * 2.4pt,
            rotate((rnd(r + 1) - 0.5) * 9deg, reflow: false,
              scale(x: 88% + rnd(r + 2) * 22%, y: 90% + rnd(r + 3) * 18%, reflow: true, origin: bottom,
                text(font: font, size: size, fill: shade.lighten(rnd(r + 4) * 10%), c)))))
        }).join(h(-0.4pt))
      } else { text(font: font, size: size, fill: shade, w2) }
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
