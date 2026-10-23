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
- **Handwritten assignments**: the owner wants a solved copy sheet that looks handwritten, to copy onto paper by hand. Build, syntax and engine: `_shared/zabkit/README.md` (a git submodule, the `zabkit` repo); the owner's voice and content rules: `_shared/zabkit/profiles/hammad/voice.md`. Build from `submissions/` with `_shared/zabkit/bin/zabkit hand <course>/<item> <regno>.pdf` (needs Docker).
- **Cover pages** come from `_shared/zabkit/cover/cover.typ`. Compile typed items with `_shared/zabkit/bin/zabkit typst compile --root .. --no-pdf-tags …`, which brings Times New Roman.
