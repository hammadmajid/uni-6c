// zabdoc cover sheet — shared SZABIST cover-page template for submissions/.
//
// Copied from /home/bine/Developer/uni/zabdocs/tmpl.typ (the zabdoc.com Typst
// port), stripped to just the reusable `cover()` function. See that repo for
// the full commentary on why the metrics below are what they are.
//
// Usage from a submission file:
//   #import "../../_shared/zabdoc/cover.typ": cover
//   #cover(students: (...), class: "...", course: "...", course-code: "...",
//          instructor: "...", doc-type: "...", number: "...", date: "...",
//          marks: "...")
//
// Compile with the real Times New Roman metrics (matches the SZABIST portal
// look exactly): typst compile --font-path /home/bine/Developer/uni/zabdocs <file>.typ
// Without --font-path, Typst falls back to Liberation Serif (metric-compatible,
// close but not pixel-identical) — fine for a draft, use the real font for the
// copy you actually submit.

// ---------------------------------------------------------------- constants

#let px = 0.75pt                       // CSS px
#let page-w = 594.96pt                 // Chrome's A4
#let page-h = 841.92pt
#let page-margin = 26 * px             // 7mm, pixel-snapped
#let box-w = 210mm                     // .cover-page
#let box-h = 297mm
#let shrink = (page-w - 2 * page-margin) / box-w
#let vh = (page-h - 2 * page-margin) / shrink / 100   // CSS 1vh in the print viewport

// hhea metrics of times.ttf; Chrome builds line boxes from these.
#let asc = 1825 / 2048
#let desc = 443 / 2048

#let c-border = rgb("#222")
#let c-box-bg = rgb("#f7f7f7")
#let c-underline = rgb("#444")
#let c-info-rule = rgb("#ccc")
#let c-head-rule = rgb("#333")
#let c-row-rule = rgb("#ddd")

// ------------------------------------------------------------------ helpers

#let faux-bold(size) = size / 32

#let css(size, body, lh: 1.6, bold: false, al: left, tracking: 0pt, width: 100%) = {
  let content = (asc + desc) * size
  let leading = lh * size - content
  block(width: width, inset: (y: leading / 2), align(al, par(
    leading: leading,
    text(
      size: size,
      top-edge: asc * size,
      bottom-edge: -desc * size,
      overhang: false,
      tracking: tracking,
      stroke: if bold { faux-bold(size) + black } else { none },
      body,
    ),
  )))
}

#let bordered(border: px, color: black, fill: none, pad-x: 0pt, pad-y: 0pt, body) = block(
  width: 100%,
  inset: border / 2,
  block(
    width: 100%,
    stroke: border + color,
    fill: fill,
    inset: (x: pad-x + border / 2, y: pad-y + border / 2),
    body,
  ),
)

#let rule(thickness, color, width: 100%) = rect(width: width, height: thickness, fill: color, stroke: none)

// ------------------------------------------------------------------- pieces

#let header = grid(
  columns: (1fr, 3fr),
  align: center + horizon,
  image("szabist-logo.png", height: 60pt),
  {
    css(14pt, bold: true, al: center)[Shaheed Zulfiqar Ali Bhutto Institute of Science and Technology]
    v(6pt)
    bordered(border: 2 * px, color: c-border, fill: c-box-bg, pad-x: 10pt, pad-y: 4pt,
      css(12pt, bold: true, al: center, tracking: 1pt)[#upper("Computer Science Department")#h(1pt)])
  },
)

#let marks-line(label, value) = {
  let size = 15pt
  let lh = 1.6 * size
  let baseline = (lh - (asc + desc) * size) / 2 + asc * size
  let w = 60pt + 2 * 0.5 * size
  let filled = value != none
  block(width: 100%, height: if filled { lh + 3pt + 1.5pt } else { lh }, {
    place(top + right, dx: -w, css(size, al: right)[#label#h(0.25em)])
    if filled {
      place(top + right, block(width: w, {
        css(size, al: center)[#value]
        v(3pt)
        rule(1.5pt, c-underline)
      }))
    } else {
      place(top + right, dy: baseline - 1.5pt, rule(1.5pt, c-underline, width: w))
    }
  })
}

#let info-row(label, value) = {
  grid(
    columns: (60mm + 10pt, 1fr),
    block(width: 100%, inset: (right: 10pt), css(20pt, bold: true, al: right)[#label]),
    {
      css(20pt, al: center)[#value]
      v(2pt)
      rule(px, c-info-rule)
    },
  )
  v(10pt)
}

#let info-table(rows) = {
  align(center, block(width: 70%, for (label, value) in rows { info-row(label, value) }))
  v(60pt)
}

#let student-table-simple(students) = align(center, block(width: 85%, {
  let size = 16pt
  v(1 * vh)
  grid(columns: (1fr, 1fr), css(size, bold: true, al: center)[Student Name], css(size, bold: true, al: center)[Reg. Number])
  v(4pt)
  rule(2 * px, c-head-rule)
  v(6pt)
  for s in students {
    v(3pt)
    grid(columns: (1fr, 1fr), css(size, al: center)[#s.Name], css(size, al: center)[#s.RegNo])
    v(3pt)
    rule(px, c-row-rule)
  }
  v(2 * vh)
}))

#let student-table-grid(students) = align(center, block(width: 85%, {
  let size = 14pt
  let mid = calc.quo(students.len() + 1, 2)
  let rule-w = px
  v(0.5 * vh)
  grid(
    columns: (1fr, 1fr, 1fr, 1fr),
    column-gutter: 10pt,
    ..("Student Name", "Reg. Number", "Student Name", "Reg. Number").map(h => css(size, bold: true, al: center)[#h]),
  )
  v(4pt)
  rule(2 * px, c-head-rule)
  v(6pt)
  let cell(t) = if t == none { none } else { css(size, al: center)[#t] }
  let cells = ()
  for i in range(mid) {
    let left = students.at(i)
    let right = students.at(i + mid, default: none)
    cells.push(cell(left.Name))
    cells.push(cell(left.RegNo))
    cells.push(cell(if right == none { none } else { right.Name }))
    cells.push(cell(if right == none { none } else { right.RegNo }))
  }
  grid(
    columns: (1fr, 1fr, 1fr, 1fr),
    column-gutter: 10pt,
    row-gutter: 6pt + rule-w / 2,
    inset: (top: 2pt, bottom: 2pt + rule-w / 2),
    stroke: (bottom: rule-w + c-row-rule),
    ..cells,
  )
  v(1 * vh)
}))

#let footer(course-code, class) = grid(
  columns: (auto, 1fr, auto, 1fr, auto),
  align: horizon,
  css(14pt, width: auto)[#course-code], none,
  css(14pt, width: auto)[#class], none,
  css(14pt, width: auto)[SZABIST-ISB],
)

// ---------------------------------------------------------------- body pages
//
// The cover's border/header/footer live inside its own single scaled block,
// so they don't repeat automatically. `body-page-setup` gives the pages
// *after* the cover the same border-and-footer look, repeated on every page
// via Typst's page header/footer/background, which is how repetition works
// for page content (unlike the cover, these are normal, unscaled A4 pages).
#let border-inset = 10mm

#let body-header = block(width: 100%, {
  grid(
    columns: (auto, 1fr),
    align: horizon,
    column-gutter: 8pt,
    image("szabist-logo.png", height: 26pt),
    {
      css(9pt, bold: true, al: left)[Shaheed Zulfiqar Ali Bhutto Institute of Science and Technology]
      v(2pt)
      bordered(border: px, color: c-border, fill: c-box-bg, pad-x: 4pt, pad-y: 1pt,
        css(8pt, bold: true, al: left, tracking: 0.5pt)[#upper("Computer Science Department")#h(1pt)])
    },
  )
  v(4pt)
  rule(px, c-head-rule)
})

#let body-footer(course-code, class) = block(width: 100%, {
  rule(px, c-head-rule)
  v(3pt)
  footer(course-code, class)
})

// Takes the body as a parameter (not a bare `set`-and-return) so the styling
// is guaranteed to apply to it: a `set page`/`set text` left dangling at the
// end of a function body only styles what follows *inside that same call* —
// it does not leak out to content the caller writes after the call returns.
#let body-page-setup(course-code, class, body) = {
  set page(
    paper: "a4",
    fill: white,
    numbering: "1",
    margin: (top: 1.3in, bottom: 1in, x: 1in),
    header-ascent: 20%,
    footer-descent: 0%,
    header: body-header,
    footer: body-footer(course-code, class),
    background: pad(border-inset, rect(width: 100%, height: 100%, stroke: px + c-border)),
  )
  // Liberation Serif, not Times New Roman: metrically compatible and reads
  // the same, but it ships a real bold face so *strong* text and bold
  // headings actually render bold instead of silently staying regular.
  set text(font: "Liberation Serif", size: 12pt)
  set par(justify: true, leading: 0.65em, first-line-indent: 0pt)
  set heading(numbering: none)
  show heading.where(level: 1): set text(size: 14pt, weight: "bold")
  show heading.where(level: 2): set text(size: 12pt, weight: "bold")
  show heading: it => block(above: 1.4em, below: 0.6em, it)
  body
}

// ------------------------------------------------------------------- page

#let cover(
  students: (),
  class: "",
  course: "",
  course-code: "",
  instructor: "",
  doc-type: "",
  number: "",
  date: "",
  marks: "",
) = {
  let students = students.map(s => (Name: s.at("Name", default: ""), RegNo: s.at("RegNo", default: "")))
  let multi = students.len() >= 2
  let first = students.at(0, default: (Name: "", RegNo: ""))

  set document(title: first.RegNo)
  set page(width: page-w, height: page-h, margin: page-margin, fill: white)
  set text(font: "Times New Roman", fill: black, hyphenate: false)
  set par(spacing: 0pt, justify: false, linebreaks: "simple")
  set block(spacing: 0pt)
  set smartquote(enabled: false)

  let content = {
    v(if multi { 3 * vh } else { 16pt })
    marks-line("Total Marks:", marks)
    v(6pt)
    marks-line("Obtained Marks:", none)
    v(6pt)
    v(if multi { 6 * vh } else { 88pt })
    css(30pt, bold: true, al: center)[#upper(course)]
    v(6pt)
    css(25pt, bold: true, al: center)[#doc-type \##number]
    v(4pt)
    css(22pt, al: center)[Submission date: #date]
    v(if multi { 6 * vh } else { 88pt })
    if multi {
      info-table((("Submitted to:", instructor), ("Class/Section:", class)))
      if students.len() >= 4 { student-table-grid(students) } else { student-table-simple(students) }
    } else {
      info-table((
        ("Submitted to:", instructor),
        ("Student Name:", first.Name),
        ("Reg. Number:", first.RegNo),
        ("Class/Section:", class),
      ))
    }
  }

  let inner-w = box-w - 2 * (5mm + px)
  let inner-h = box-h - 2 * (5mm + px)
  let head = { header; v(18pt) }
  let foot = footer(course-code, class)

  let body = block(width: 100%, inset: 5mm + px, context {
    let avail = inner-h - measure(width: inner-w, head).height - measure(width: inner-w, foot).height
    head
    if measure(width: inner-w, content).height < avail {
      block(width: 100%, height: avail, content)
    } else {
      content
    }
    foot
  })

  scale(x: shrink * 100%, y: shrink * 100%, origin: top + left, reflow: true, context {
    let h = calc.max(box-h, measure(width: box-w, body).height)
    block(width: box-w, height: h, breakable: false, {
      place(top + left, block(width: box-w, height: box-h, inset: px / 2,
        block(width: 100%, height: 100%, stroke: px + black)))
      body
    })
  })
}
