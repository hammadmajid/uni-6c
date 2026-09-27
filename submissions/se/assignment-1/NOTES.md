# SE — Assignment 1 (Project Proposal)

> **Status:** Done. `assignment-1.pdf` is ready to submit as-is.
> **Due:** tonight, 27 Sep 2026.
> **Submitted to:** Awais Mehmood · **Marks:** 3.5 · Individual, section BsCS-6C.
> **Brief:** `courses/se/assignments/assignment-01-requirements-engineering-project.pdf`

Cover page uses the zabdoc convention (`submissions/_shared/zabdoc/cover.typ`, ported from `/home/bine/Developer/uni/zabdocs/tmpl.typ`) with your real reg no. (2312200) and course code (CSC 4301) — pulled from the cover you'd already generated there.

## To recompile after edits
```
typst compile --root /home/bine/Developer/uni/6c --font-path /home/bine/Developer/uni/zabdocs submissions/se/assignment-1/assignment-1.typ
```
Drop `--font-path` and it still compiles, just with Liberation Serif standing in for Times New Roman (close, not pixel-identical).

## Why this project
LatencyRoute: routes requests by live latency and in-flight count instead of round-robin. Same idea as the Prequal paper you're reviewing for CNDC lab, scaled down to something buildable solo. Non-CRUD — the graded part is the routing algorithm, not a database front end. Skim the write-up once so you can defend it if asked.
