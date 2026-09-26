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
- Drafts are for adapting into your own words before submission — this repo helps you prepare the work, it does not write your submission for you.
