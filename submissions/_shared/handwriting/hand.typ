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

#let j = counter("jitter")      // one step per heading or chunk: how far into the sheet we are
#let cand = counter("cramped")  // long words seen so far that could get cramped letters
#let written = counter("written") // characters written so far, to size how many rare touches a sheet gets
#let scrib = counter("scribble") // scribble-outs so far, so the style never repeats back to back

// A wobbly stroke from a to b. Diagram lines (`diag: true`) get messier further into the
// sheet, and now and then the pen goes over a line twice, never on quite the same path.
#let wl(a, b, seed: 0, s: 0.9pt, diag: true) = context {
  let f = j.final().first()
  let p = if diag and f > 0 { j.get().first() / f } else { 0 }
  let amp = if diag { 5.4pt * (1 + 0.1 * p) } else { 5pt }
  let mx = (a.at(0) + b.at(0)) / 2 + (rnd(seed) - 0.5) * amp
  let my = (a.at(1) + b.at(1)) / 2 + (rnd(seed + 1) - 0.5) * amp
  place(curve(stroke: (paint: ink, thickness: s, cap: "round"),
    curve.move(a), curve.quad((mx, my), b)))
  if diag and rnd(seed * 1.7 + 5) < 0.1 + 0.08 * p {
    let (o, o2) = ((rnd(seed + 8) - 0.5) * 3pt, (rnd(seed + 9) - 0.5) * 3pt)
    place(curve(stroke: (paint: ink, thickness: s * 0.85, cap: "round"),
      curve.move((a.at(0) + o, a.at(1) + o2)),
      curve.quad((mx + o2, my - o), (b.at(0) - o2 * 0.6, b.at(1) + o * 0.6))))
  }
}
// Corners never meet exactly: each edge overshoots or stops a little short.
#let wbox(x, y, w, h, seed: 0) = {
  let e(k) = (rnd(seed + k * 1.3) - 0.35) * 6pt
  wl((x - e(1), y), (x + w + e(2), y + 1pt), seed: seed)
  wl((x + w, y - 1pt - e(3)), (x + w + 1pt, y + h + e(4)), seed: seed + 3)
  wl((x + w + 2pt + e(5), y + h), (x - 1pt - e(6), y + h - 1pt), seed: seed + 5)
  wl((x, y + h + 1pt + e(7)), (x + 1pt, y - 2pt - e(8)), seed: seed + 7)
}
#let warrow(a, b, seed: 0, diag: true) = {
  wl(a, b, seed: seed, diag: diag)
  let dx = (b.at(0) - a.at(0)) / 1pt
  let dy = (b.at(1) - a.at(1)) / 1pt
  let len = calc.sqrt(dx * dx + dy * dy)
  let (ux, uy) = (dx / len, dy / len)
  let h = 8pt
  wl(b, (b.at(0) - h * (ux - uy * 0.6), b.at(1) - h * (uy + ux * 0.6)), seed: seed + 9, diag: diag)
  wl(b, (b.at(0) - h * (ux + uy * 0.6), b.at(1) - h * (uy - ux * 0.6)), seed: seed + 11, diag: diag)
}
#let at(x, y, body) = place(dx: x, dy: y, body)

// Inline hand-drawn arrows (the fonts have no arrow glyphs).
#let ar(s) = box(width: 26pt + rnd(s) * 6pt, height: 10pt, warrow((2pt, 6pt + rnd(s + 1) * 2pt), (22pt + rnd(s) * 6pt, 5pt), seed: s, diag: false))
#let up(s) = box(width: 12pt, height: 16pt, baseline: 2pt, warrow((6pt, 16pt), (6.5pt, 1pt), seed: s, diag: false))
#let dn(s) = box(width: 12pt, height: 16pt, baseline: 2pt, warrow((6pt, 1pt), (6.5pt, 16pt), seed: s, diag: false))

// Scribble-out styles: 0 tight zigzag, 1 coil, 2 fast back-and-forth, 3 hasty strike lines
// (letters still show through). The n-th scribble's style, never the same twice in a row.
#let scribble-style(n) = {
  let st = calc.floor(rnd(7.7) * 4)
  for k in range(n) { st = calc.rem(st + 1 + calc.floor(rnd(k * 3.3 + 1) * 3), 4) }
  st
}
// The scribble itself, over a word or phrase `wd` wide. Density, overshoot, angle and
// number of passes all change every time.
#let scribble(wd, s, style) = {
  let stroke = (paint: ink, thickness: 1.05pt + rnd(s + 1) * 0.4pt, cap: "round", join: "round")
  let over = rnd(s + 2) * 5pt
  let poly(pts) = place(curve(stroke: stroke, curve.move(pts.first()), ..pts.slice(1).map(pt => curve.line(pt))))
  let body = if style == 0 {
    for pz in range(1 + calc.floor(rnd(s + 3) * 2.99)) {
      let n = calc.max(4, calc.floor(wd / (2.1pt + rnd(s + pz) * 1.5pt)))
      poly(range(n + 1).map(q => (
        -over / 2 + (wd + over) * q / n + (rnd(s + pz * 50 + q) - 0.5) * 3.5pt,
        pz * 2pt + if calc.rem(q, 2) == 0 { -1pt + rnd(s + q * 3 + pz) * 3pt } else { 0.34em + rnd(s + q * 5 + pz) * 3pt })))
    }
  } else if style == 1 {
    let r = 0.19em + rnd(s + 4) * 0.08em
    let turns = calc.max(3, calc.floor(wd / (3.5pt + rnd(s + 5) * 2.5pt)))
    let n = turns * 8
    poly(range(n + 1).map(q => {
      let th = q / n * turns * 2 * calc.pi
      (-over / 2 + (wd + over) * q / n + r * calc.cos(th) * 0.8 + (rnd(s + q) - 0.5) * 1.2pt,
       0.22em + r * calc.sin(th) + (rnd(s + q + 99) - 0.5) * 1.6pt)
    }))
  } else if style == 2 {
    let n = 5 + calc.floor(rnd(s + 6) * 5)
    poly(range(n + 1).map(q => (
      if calc.rem(q, 2) == 0 { -over / 2 + rnd(s + q) * 4pt } else { wd + over / 2 - rnd(s + q) * 4pt },
      0.02em + 0.42em * q / n + (rnd(s + q * 7) - 0.5) * 2.5pt)))
  } else {
    for z in range(1 + calc.floor(rnd(s + 7) * 1.99)) {
      let y0 = 0.16em + z * 0.13em + rnd(s + z) * 3pt
      poly(((-over / 2, y0 + (rnd(s + z + 3) - 0.5) * 4pt), (wd + over / 2, y0 + (rnd(s + z + 5) - 0.5) * 6pt)))
    }
  }
  rotate((rnd(s + 9) - 0.5) * 7deg, reflow: false, box(width: wd, height: 0pt, body))
}

// One written chunk from a plain string. Every word gets its own tilt, baseline,
// size and ink shade, and all of it grows as the sheet goes on: neat at the top,
// sloppier by the last answer. Inside the string:
//   `->` arrow, `^^` / `vv` up / down arrows
//   `~wro~`            a word abandoned half-way and scribbled out, followed by the right one
//   `~~a wrong start~~` a whole false-start phrase scribbled out (about once per sheet)
//   `^word`            a forgotten word added with a caret, written small above the line
// Rare touches happen on their own: a long word with a few letters crammed together
// (about one per two pages), and now and then a letter gone over twice.
#let l(indent: 0pt, src) = {
  j.step()
  let toks = src.split(" ")
  // Long ordinary words (8+ letters, all lowercase, not scribbled) can get cramped letters.
  let is-cand(w) = {
    let bare = w.replace(regex("[^A-Za-z]"), "")
    (not w.starts-with("~") and not w.starts-with("^") and not w.contains("/") and not w.contains("-")
      and bare.len() >= 8 and lower(bare) == bare)   // plain lowercase words only, never names like ExamDate
  }
  let ncand = toks.filter(is-cand).len()
  let nscrib = toks.filter(w => w.starts-with("~") and not w.starts-with("~~") or w.ends-with("~~")).len()
  context {
    let i = j.get().first()
    let m = (0.5 + 1.8 * i / j.final().first()) * mess-scale   // messiness: ~0.5 at the start, ~2.3 at the end
    let main = if rnd(i * 3.1) < 0.2 { 1 } else { 0 }  // an occasional chunk in another hand
    let base = 23pt + rnd(i + 2) * 2pt + m * 0.6pt
    // Which long words in the sheet get cramped: evenly spread with jitter, about one per two pages.
    let total = cand.final().first()
    let want = calc.max(1, int(calc.round(written.final().first() / 1100)))   // ~2 pages of writing
    let picks = range(want).map(k => calc.floor((k + 0.15 + rnd(k + 41) * 0.7) * total / want))
    let c0 = cand.get().first()
    let s0 = scrib.get().first()

    let draw(w2, s, font, size, shade, cram: none) = if letters {
      // A font repeats the exact same "e" every time; a hand never does.
      let cs = w2.clusters()
      let out = ()
      for (ci, c) in cs.enumerate() {
        let r = s * 13 + ci * 5
        let in-cram = cram != none and ci >= cram.at(0) and ci < cram.at(0) + cram.at(1)
        let g = box(move(dy: (rnd(r) - 0.5) * 2.4pt,
          rotate((rnd(r + 1) - 0.5) * 9deg, reflow: false,
            scale(x: if in-cram { 78% + rnd(r + 2) * 10% } else { 88% + rnd(r + 2) * 22% }, y: 90% + rnd(r + 3) * 18%, reflow: true, origin: bottom,
              text(font: font, size: size, fill: shade.lighten(rnd(r + 4) * 10%), c)))))
        // Now and then a letter gets gone over a second time to fix it.
        if rnd(r * 1.37 + 11) < 0.0009 {
          g = box({ g; place(top + left, dx: 0.6pt + rnd(r + 6) * 0.6pt, dy: -0.5pt, text(font: font, size: size, fill: ink.darken(15%), c)) })
        }
        out.push(g)
        if ci < cs.len() - 1 {
          let tight = cram != none and ci >= cram.at(0) and ci + 1 < cram.at(0) + cram.at(1)
          out.push(h(if tight { -2.4pt - rnd(r + 7) * 1.2pt } else { -0.4pt }))
        }
      }
      out.join()
    } else { text(font: font, size: size, fill: shade, w2) }

    let words = ()
    let ci = 0      // long-word candidates seen in this chunk
    let sc = 0      // scribbles in this chunk
    let k = 0
    while k < toks.len() {
      let w = toks.at(k)
      let s = i * 101 + k * 7
      let pick = if rnd(s + 3) < 1 - 0.07 * m { main } else { calc.floor(rnd(s + 4) * hands.len()) }
      let (font, f) = hands.at(pick)
      let shade = ink.lighten(rnd(s + 5) * 8%)
      let size = base * f * (1 + (rnd(s + 7) - 0.5) * 0.05 * m)
      let body = if w == "->" { ar(s) } else if w == "^^" { up(s) } else if w == "vv" { dn(s) }
      else if w.starts-with("~~") {
        // A false start: gather the phrase up to the closing ~~ and scribble it all out.
        let phrase = (w,)
        while not phrase.last().ends-with("~~") and k + 1 < toks.len() { k += 1; phrase.push(toks.at(k)) }
        let t = draw(phrase.join(" ").replace("~", ""), s, font, size, shade)
        let wd = measure(t).width
        sc += 1
        box({ t; place(top + left, dy: 0.08em, scribble(wd, s + 30, scribble-style(s0 + sc - 1))) })
      } else if w.starts-with("~") {
        let t = draw(w.replace("~", ""), s, font, size, shade)
        let wd = measure(t).width
        sc += 1
        box({ t; place(top + left, dy: 0.08em, scribble(wd, s + 30, scribble-style(s0 + sc - 1))) })
      } else if w.starts-with("^") {
        // Forgotten word: a caret on the line, the word squeezed in small above it.
        let raw = draw(w.slice(1), s, font, size * 0.6, shade)
        let cw = box(width: measure(raw).width, raw)   // explicit width, or it wraps inside the caret box
        let half = measure(raw).width / 2
        box(width: 10pt, height: 0.7em, {
          wl((1pt, 0.82em), (5pt, 0.42em), seed: s + 1, diag: false)
          wl((5pt, 0.42em), (9.5pt, 0.84em), seed: s + 2, diag: false)
          place(dx: 5pt - half + (rnd(s + 3) - 0.5) * 6pt, dy: -0.42em, rotate((rnd(s + 4) - 0.5) * 6deg, cw))
        })
      } else {
        let cram = none
        if is-cand(w) {
          if picks.contains(c0 + ci) {
            // A few letters in the middle run into each other: hard, but not impossible, to read.
            let n = w.clusters().len()
            let len = 2 + calc.floor(rnd(s + 8) * 1.99)
            cram = (1 + calc.floor(rnd(s + 9) * (n - len - 2)), len)
          }
          ci += 1
        }
        // tagged so `typst query --field value <cramped>` lists which words got it
        if cram != none { [#metadata(w)<cramped>] }
        draw(w, s, font, size, shade, cram: cram)
      }
      words.push(box(move(dy: (rnd(s + 1) - 0.5) * 1.4pt * m,
        rotate((rnd(s + 2) - 0.5) * 1.4deg * m, reflow: false, body))))
      k += 1
    }
    let dx = indent + rnd(i) * 6pt * m
    block(above: 0.35em + rnd(i + 7) * 0.25em * m, below: 0.45em,
      move(dx: dx, rotate((rnd(i + 1) - 0.5) * 0.8deg * m,
        block(width: 100% - dx,
          words.enumerate().map(((k, w)) => w + h(0.16em + rnd(i * 13 + k) * 0.18em * m)).join()))))
  }
  cand.update(n => n + ncand)
  written.update(n => n + src.len())
  scrib.update(n => n + nscrib)
}
#let q(n) = {
  j.step()
  context {
    let i = j.get().first()
    block(sticky: true, above: 0.9em + rnd(i) * 0.6em, below: 0.3em, move(dx: rnd(i + 3) * 8pt, rotate((rnd(i + 4) - 0.5) * 2deg, reflow: true, origin: left,
      box(inset: (bottom: 4pt), {
        text(font: "Caveat", size: 34pt)[Q\##n:]
        place(bottom + left, dy: 2pt, box(width: 70pt, height: 4pt, wl((0pt, 2pt), (66pt, 3pt), seed: i, s: 1pt, diag: false)))
      }))))
  }
}
