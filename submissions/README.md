# submissions/

Your **own work that gets handed in** — assignment answers, project proposals, paper reviews, drafts and finals. This is authored deliverable work, kept separate from:

- `courses/<slug>/` — raw materials the instructor gives you (lecture PDFs, briefs).
- `content/courses/<slug>/` — the interactive lessons that teach the material.

Nothing here is read by the Next.js app; it never affects `pnpm build`.

## Layout

```
submissions/<course-slug>/<item>/
```

One folder per submittable item, so a piece of work and everything around it (draft, notes, figures, final) live together as it evolves. Use the course slugs from the main `CLAUDE.md` (`cndc`, `cndc-lab`, `ai`, `web-tech`, `se`, …).

Example:

```
submissions/
  cndc-lab/
    semester-project-1-paper-review/
      proposal.md
```

## Conventions

- Each item's main file starts with a short **status / next steps** block so you can pick it back up later.
- Reference the original brief by its path under `courses/<slug>/…` rather than copying it.
- **Every item has a `zabkit.toml`**: kind (`handwritten`, `typed` or `cover`), course slug, type, number, date, date format, total marks, profile (handwritten only), main file, and members (reg. nos., the owner first, in cover order). The PDF is named by the members' reg. nos. joined with hyphens. Courses and the roster come from `~/.config/zabkit/courses.csv` and `students.csv`. The toml fully describes the cover; never hand-write a `#cover(...)` call. These keys need zabkit 2.1 or later:
  - `number = "02"` prints "#02"; leave `number` out for a cover without one. `total-marks = 7.5` works; leave it out for a blank.
  - `date-format = "short"` prints "28 Sep 2026", as every cover so far does; the default is "28 September 2026".
  - `[cover]` overrides what the CSVs say: `instructor = "Ms. Saira Shaheen"`, `course = "CNDC Lab"`, `course-code`, `class`, and `[cover.names]` by reg. no. (`2312458 = "Haris Qaiser Lodhi"`).
  - `[[variants]]` builds more PDFs from one source, each with its own `members` (and optional `inputs` for `sys.inputs`).
- **Build** an item with `zabkit sheet build <course>/<item>` (from `submissions/`); it writes the PDFs into the item folder. `--out <dir>` writes them elsewhere, which is how to check a rebuild against the committed PDF. `zabkit serve` opens the web UI over the same folder. `zabkit compile <file.typ> [out.pdf]` is plain Typst with zabkit's fonts and packages, for one-offs.
- **Handwritten assignments**: the owner wants a solved copy sheet that looks handwritten, to copy onto paper by hand. Answers go in `handwritten.typ`, which starts with `#import "@zabkit/hand:1.0.0": *` and `#show: sheet`; the cover comes from `zabkit.toml`. Follow the owner's voice and content rules in `~/.config/zabkit/profiles/hammad/voice.md`. Syntax and engine: the zabkit repo's README.
- **Typed items** import `@zabkit/cover:1.0.0` and use `#item-cover()` and `#show: item-body`, which fill the cover and the running header from `zabkit.toml`. Layout arguments pass through: `#item-cover(box-inset: 2mm, single-column: true)`, `#show: item-body.with(box-inset: 2mm, body-pad: 6mm)`. `item-data()` is the cover's data.
- **Cover-only items** (`kind = "cover"`, no main file) are for work written in class: `db/assignment-2`, `tbw/assignment-1`.
- `ai-lab/project-proposal` builds two PDFs from one source: the group version (`members`) and an individual one (its `[[variants]]` entry). `proposal.typ` words itself by the number of students on the cover; `build.sh` is just `zabkit sheet build .`.
