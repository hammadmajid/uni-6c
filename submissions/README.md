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
- **Every item has a `zabkit.toml`**: kind (`handwritten`, `typed` or `cover`), course slug, type, number, date, total marks, profile (handwritten only), main file, and members (reg. nos., the owner first, in cover order). The PDF is named by the members' reg. nos. joined with hyphens. Courses and the roster come from `~/.config/zabkit/courses.csv` and `students.csv`.
- **Build** an item with `zabkit sheet build <course>/<item>` (from `submissions/`); it writes the PDF into the item folder. `zabkit serve` opens the web UI over the same folder. `zabkit compile <file.typ> [out.pdf]` is plain Typst with zabkit's fonts and packages, for one-offs.
- **Handwritten assignments**: the owner wants a solved copy sheet that looks handwritten, to copy onto paper by hand. Answers go in `handwritten.typ`, which starts with `#import "@zabkit/hand:1.0.0": *` and `#show: sheet`; the cover comes from `zabkit.toml`. Follow the owner's voice and content rules in `~/.config/zabkit/profiles/hammad/voice.md`. Syntax and engine: the zabkit repo's README.
- **Typed items** import `@zabkit/cover:1.0.0`. New items use `#item-cover()` and `#show: item-body`, which fill the cover from `zabkit.toml`. The older items call `#cover(...)` and `#body-page-setup(...)` with explicit arguments instead, because their covers say things `zabkit.toml` cannot (short dates like "28 Sep 2026", "Mr."/"Ms." before the instructor, "CNDC Lab", lab numbers like "#02", fractional marks).
- `ai-lab/project-proposal` builds two PDFs from one source with its `build.sh`: `zabkit sheet build` gives the group version, `zabkit compile proposal.typ 2312200.pdf` the individual one.
