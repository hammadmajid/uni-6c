# SE — Assignment 1 (Project Proposal)

> **Status:** Done, pending you confirming the black-bar fix actually holds (see below). `2312200.pdf` is otherwise ready to submit.
> **Due:** tonight, 27 Sep 2026.
> **Submitted to:** Awais Mahmood · **Marks:** 3.5 · Individual, section BsCS-5D.
> **Brief:** `courses/se/assignments/assignment-01-requirements-engineering-project.pdf`

Cover page uses the zabdoc convention (`submissions/_shared/zabdoc/cover.typ`, ported from `/home/bine/Developer/uni/zabdocs/tmpl.typ`) with your real reg no. (2312200) and course code (CSC 3109) — see `submissions/_shared/course-directory.md` for the canonical course-code/instructor/section table.

## The black bar above the header (content pages)
GNOME Papers, Chrome's PDF viewer and Adobe Acrobat all showed a solid black bar above the repeating header on every page after the cover. I could not reproduce it with poppler (`pdftoppm`, `pdftocairo`) or Ghostscript, and byte-level inspection of the PDF found no black-filled shape, no colorspace mismatch, and correct stroke/fill operators throughout — so the file is spec-valid PDF as far as I can check.

The one real structural difference I found between the cover (always fine) and the content pages (broken in those 3 apps): Typst wraps repeating header/footer/background content in tagged-PDF `/Artifact` marked-content blocks for accessibility; the cover's border isn't a page marginal, so it never gets this wrapping. I recompiled with `--no-pdf-tags`, which removes that wrapping entirely (verified byte-for-byte — same paint operators, just no `/Artifact BMC...EMC` around them) and does not change how it looks in poppler/Ghostscript.

**This is a tested hypothesis, not a confirmed fix** — I have no way to open GNOME Papers/Chrome/Acrobat myself in this environment. Please check the current `2312200.pdf` in whichever app showed the bar before. If it's gone, great. If it's still there, tell me and I'll stop guessing at the PDF export and instead rebuild the border without Typst's page-marginal machinery at all (e.g. dropping the enclosing box border on content pages, keeping just the header/footer rules).

## To recompile after edits
```
typst compile --root /home/bine/Developer/uni/6c --font-path /home/bine/Developer/uni/zabdocs --no-pdf-tags submissions/se/assignment-1/assignment-1.typ submissions/se/assignment-1/2312200.pdf
```
`--no-pdf-tags` matters — don't drop it, it's the black-bar mitigation above. Drop `--font-path` and it still compiles, just with Liberation Serif standing in for Times New Roman (close, not pixel-identical).

## Why this project
LatencyRoute: routes requests by live latency and in-flight count instead of round-robin. Same idea as the Prequal paper you're reviewing for CNDC lab, scaled down to something buildable solo. Non-CRUD — the graded part is the routing algorithm, not a database front end. Skim the write-up once so you can defend it if asked.
