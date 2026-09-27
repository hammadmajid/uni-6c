# Handwritten assignments

Some instructors want assignments handwritten. For those, the owner wants a **solved copy sheet**: a PDF of the answers that already looks handwritten, which they copy onto paper by hand. This folder is the engine; each assignment keeps only its own `cover.typ` and `handwritten.typ`. Worked example: `submissions/cndc/assignment-1/`.

## Build

```
submissions/_shared/handwriting/build.sh <item dir> <regno>.pdf     # e.g. cndc/assignment-1 2312200.pdf
submissions/_shared/handwriting/prototypes.sh <item dir>            # look variants A to I -> <item>/prototypes.pdf
```

`build.sh` takes about a minute; `prototypes.sh` takes several, so run it in the background. They need `typst`, `pdftoppm`/`pdfunite` (poppler) and `uv`, which pulls numpy, scipy, pillow and scikit-image itself. Fonts are in `submissions/_shared/fonts/` (all OFL, from Google Fonts).

Pipeline: typst renders the cover (vector, Times New Roman if `~/Developer/uni/zabdocs` exists) and the answers (clean vector handwriting fonts, jittered). `inkify.py` rasterises the answers at 200 dpi and turns them into ballpoint ink: stroke wobble, line tilt, pressure, grain, skips, blobs. `pdfunite` puts the cover in front. The PDF is named by registration number like every submission.

## Content rules

- **Minimal writing.** The owner copies every word by hand. `Q#1:` as the heading, then short answers: fragments, abbreviations (`diff`, `msg`, `ctrl`, `eg`, `+`, `so:`), arrows for "leads to". Hit each mark point once; no padding, no restating the question.
- **The owner's voice**: lowercase, casual, like their chat messages. No polished prose.
- **Hierarchy over structure.** `(i)`, `(ii)`, `1.`, `-` bullets, indents. No rigid layout needed.
- **Diagrams only where they earn marks, and the most basic version possible**: boxes, arrows, a crossed-out line. Drawn with `wl`, `wbox`, `warrow`, `at` inside a `block(height: …, breakable: false)` so a diagram stays with its question.
- **Mistakes, the owner's way.** They notice a misspelling *while* writing, so they stop partway, scribble the half-word out hard until it's almost unreadable, and write the whole word next to it: `~uder~ understood`. Never a finished word with a neat line through it. About one per answer, on ordinary words.
- **A couple of misspellings left in**, uncorrected (`recieve`, `reliabilty`). Only on ordinary words, never on a key term the marker is looking for. Tell the owner which ones so they can fix them on paper if they want.
- **No bold, ever.** The owner never presses harder mid-sentence. No emphasis markup at all; headings are plain too.
- Make sure the answers are correct. Where the brief's wording is off (eg "path loss" meaning packet loss), answer the intended question and hedge in half a line.

## Look (owner-approved, prototype I; don't change without asking)

- Big writing, about 23pt. Messy and uneven, but readable.
- Lines run to the right edge of the page (3 mm margin), the way the owner writes.
- Pure white paper, no ruled lines, no margin line.
- Blue ballpoint, thin line (not marker).
- One main hand (Caveat). Light mixing: about 1 chunk in 5 in a second hand (Nanum Pen), about 1 word in 7 switches to another font. Heavier mixing looked fake.
- Every letter drawn slightly differently (`letters=1`), lines tilt and sag (`INK_SLOPE=1`), ballpoint skips (`INK_DEFECTS=1`).
- Ink blobs only where the pen lands or lifts (stroke ends found on the skeleton), sparse, each one different. Never in the middle of a stroke.
- Gets messier toward the end, automatically: jitter scales with position in the sheet, and later pages wobble more.
- Typed zabdoc cover page (`cover.typ`), not handwritten.

## `handwritten.typ` syntax

```
#import "../../_shared/handwriting/hand.typ": *
#show: sheet

#q(1)
#l(indent: 10pt, "(i) protocols = agreed rules -> so a msg from ISB is ~uder~ understood in NY")
#l(indent: 20pt, "- loss ^^ -> throughput vv")
```

- `#q(n)` heading (sticky, never stranded at a page bottom). `#l(indent: …, "…")` one chunk of writing, a plain string.
- Inside strings: `->` arrow, `^^` / `vv` up / down arrows, `~frag~` scribbled-out half-word. Words are split on spaces, so keep tokens space-separated. No `*` emphasis.
- Knobs for experiments: `--input letters=1`, `--input mess=2`; env `INK_PEN=blue|black|gel|pencil`, `INK_SLOPE=1`, `INK_DEFECTS=1`.

## Before committing

- Render the pages (`pdftoppm -r 60`) and a close-up (`-r 130` crop) and look at them: no overlapping lines, no heading or diagram alone on a page, scribbles land on the word, not under it.
- Tell the owner which misspellings are deliberate.
- Commit as you go.

## If asked whether it passes as real

Not on paper. A printout is flat (no pen grooves, nothing shows through on the back), printer ink is matte where ballpoint shines, and the edges show printer dots up close. It's a reference to copy from; say so plainly if the owner considers handing in the printout itself.
