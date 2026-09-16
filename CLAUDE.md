# 6C: SZABIST semester 6 learning lab

Interactive Next.js app that teaches every course the owner takes this semester, one week at a time, in sync with the university calendar. Built with the `geist-learning-lab` skill (see `.agents/skills/geist-learning-lab/SKILL.md`): every lesson must make the learner attempt something before explaining it.

## Layout

- `<course>/` at the repo root (e.g. `cndc/`): raw materials the owner drops in. Course outline PDF, lecture slides, assignments, past papers. Read these before building a week.
- `content/courses/<slug>/course.json`: course metadata and the full 15-week roadmap. Weeks with an empty `lessons` array are not built yet.
- `content/courses/<slug>/week-NN/<lesson>.mdx`: lesson content. Prose plus the components registered in `lib/mdx-components.tsx`.
- `components/learning/`: generic learning components (QuickCheck, Predict, OrderCheck, WorkedExample, Deeper, Callout, Term, Timeline, HintLadder, lab controls).
- `components/<course>/`: course-specific explorables (for CNDC: DelayLab, QueueingLab, SwitchingLab, EncapsulationExplorer, ThroughputLab, SharedMediumLab).
- `lib/semester.ts`: calendar. Week 1 started 2026-09-14. Midterm is week 8.
- `lib/learning/progress-store.ts`: zustand store persisted in localStorage. Activities keyed `course/module/lesson/id`, lesson completion, spaced-review queue.

## Weekly workflow

1. Check the course directory for new slides, assignments, or past papers since last time.
2. Build lessons for current week + 2 (`currentWeek()` in `lib/semester.ts`). Add the week's lessons to `course.json` and write the MDX.
3. If slides show the instructor's emphasis differs from the outline, follow the slides. Note the discrepancy in the lesson's exam callout.
4. Run `pnpm build`. It compiles every MDX file, so it catches content errors.

## Lesson rules

- Open with a `Predict` (prediction gap) before any explanation.
- One `QuickCheck` every 300 to 600 words. Every wrong MCQ option gets specific `feedback`.
- Numericals use `type="numeric"` with the unit in the question. State the unit-conversion trap in the explanation.
- Depth goes behind `Deeper` (why, edge, formal, exam, history, beyond). Exam model answers go in `Deeper kind="exam"` or an exam `Callout`.
- Checkpoint lessons (`kind: "checkpoint"`) hold only questions and `Predict` long-answer prompts with model answers.
- Give every interactive element a unique `id` within its lesson; ids become progress and review keys.
- No `{`, `}` or `<` characters in MDX prose. Use words or unicode (≤, ×, ⁸).
- Tables need remark-gfm, already wired in the lesson page.
- The lesson page passes `blockJS: false` to next-mdx-remote. Without it, v6 silently strips every `prop={...}` expression and components render with undefined props.

## Learner

Backend/systems engineer, 7 years of code, hosts VPSes, ships with Docker. Skip "what is a server". Anchor new ideas to systems intuition (queues, latency, failure). Exam-first depth with optional deeper tracks.

## Commands

```
pnpm dev        # http://localhost:3000
pnpm build      # also validates all MDX
pnpm typecheck
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
