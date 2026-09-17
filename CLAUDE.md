# 6C: SZABIST semester 6 learning lab

Interactive Next.js app that teaches every course the owner takes this semester, one week at a time, in sync with the university calendar. Built with the `geist-learning-lab` skill (see `.agents/skills/geist-learning-lab/SKILL.md`): every lesson must make the learner attempt something before explaining it.

## Layout

- `courses/<slug>/`: raw materials the owner drops in, one directory per course, same slug as `content/courses/<slug>/`. Subfolders: `lectures/`, `labs/`, `assignments/`, `quizzes/`, `announcements/`, `references/`, plus `course-outline.pdf` at the top. Filenames are kebab-case and keep the instructor's numbering (`lecture-06-07-network-classification.pdf`). Read these before building a week. See `courses/README.md`.
- `content/courses/<slug>/course.json`: course metadata and the full 15-week roadmap. Weeks with an empty `lessons` array are not built yet.
- `content/courses/<slug>/week-NN/<lesson>.mdx`: lesson content. Prose plus the components registered in `lib/mdx-components.tsx`.
- `components/learning/`: generic learning components (QuickCheck, Predict, OrderCheck, WorkedExample, Deeper, Callout, Term, Timeline, HintLadder, lab controls).
- `components/cndc-lab/`: `capture.ts` builds a byte-accurate synthetic capture of the Lab 01 fetch (real checksums, dissection tree, filter fields) and `filter.ts` is a subset of Wireshark's display-filter language. `WiresharkWindow` renders the five panes over that capture (props: `replay`, `annotate`, `panes`, `initialSelected`, `expand`); `FilterLab` and `LayerSortLab` persist to the store; `SnifferPlacement` and `TimeFormats` are figures. Reuse the window for later Wireshark labs by adding packets to `capture.ts` or passing `packets`.
- `components/<course>/`: course-specific explorables and figures. CNDC labs: DelayLab, QueueingLab, SwitchingLab, EncapsulationExplorer, ThroughputLab, SharedMediumLab, StatMuxStrip, AccessTechDiagram. CNDC static SVG figures: InternetMap, ProtocolExchange, MediaChart, LayerStacks, HopDiagram, MultiplexingDiagram, CaravanDiagram, IntensityCurve, BottleneckPipes, TracerouteMap. Every figure uses `Figure` and the `P` palette from `components/learning/Figure.tsx` (viewBox width 640, mono labels 9 to 12 px, blue = highlighted path, amber = shared or waiting, green = dedicated or ok, red = loss). Register new ones in `lib/mdx-components.tsx`. Screenshot every new figure in the browser before committing; label overlaps do not show up in the build.
- `lib/semester.ts`: calendar. Week 1 started 2026-09-14. Midterm is week 8.
- `lib/learning/progress-store.ts`: zustand store persisted in localStorage. Activities keyed `course/module/lesson/id`, lesson completion, spaced-review queue.

## Weekly workflow

1. Check `courses/<slug>/` for new slides, assignments, quizzes, or announcements since last time (`git log --stat -- courses/`).
2. Build lessons for current week + 2 (`currentWeek()` in `lib/semester.ts`). Add the week's lessons to `course.json` and write the MDX.
3. If slides show the instructor's emphasis differs from the outline, follow the slides for exam scope. Note the discrepancy in the lesson's exam callout.
4. Run `pnpm build`. It compiles every MDX file, so it catches content errors.

## Lesson rules

- Open with a `Predict` (prediction gap) before any explanation.
- One `QuickCheck` every 300 to 600 words. Every wrong MCQ option gets specific `feedback`.
- Numericals use `type="numeric"` with the unit in the question. State the unit-conversion trap in the explanation.
- Depth goes behind `Deeper` (why, edge, formal, exam, history, beyond). Exam model answers go in `Deeper kind="exam"` or an exam `Callout`.
- Checkpoint lessons (`kind: "checkpoint"`) hold only questions and `Predict` long-answer prompts with model answers.
- Give every interactive element a unique `id` within its lesson; ids become progress and review keys.
- Every interactive component must restore its answered state from the store on load (see the `ready` + `seeded` pattern in `QuickCheck.tsx`): pass the submitted answer to `recordAttempt(key, correct, answer)` and seed local state from `activities[key]` once `hydrated && sync !== "checking"`. The hydrator merges the server snapshot before flipping `sync`, so components that wait for it see cross-device progress. Never keep answered state in component-local `useState` alone.
- `.lesson-prose` styles live in `@layer components` (`app/globals.css`), so Tailwind utilities on a component's own tables and lists override them. A component that draws a `table`, `ul` or `ol` inside a lesson still needs `list-none pl-0`, `mt-0` on `li`, and `normal-case tracking-normal` on `th`, or the prose defaults show through.
- No `{`, `}` or `<` characters in MDX prose. Use words or unicode (≤, ×, ⁸).
- Tables need remark-gfm, already wired in the lesson page.
- The lesson page passes `blockJS: false` to next-mdx-remote. Without it, v6 silently strips every `prop={...}` expression and components render with undefined props.

## Learner and semester (canonical, no device-local memory)

- BS Computer Science, 6th semester, SZABIST Islamabad, Fall 2026. Coding since 2019, frontend and backend. Systems-engineer mindset: designs backends with databases, caches, queues; hosts VPSes; deploys with Docker; not a networking person by training.
- Skip "what is a server". Anchor new ideas to systems intuition (queues, latency, failure). Exam-first depth with optional deeper tracks. Budget 3 to 5 hours per week per course.
- Visual learner. Prefer a diagram, animation, explorable or worked table over prose. Every concept that can be drawn gets drawn (SVG components under `components/<course>/`), and prose is the caption for the picture, not the other way round. If a lesson section is more than two paragraphs without a visual or an interaction, split it or cut it.
- Wants pointers beyond the course. End each content lesson (not checkpoints) with a `Further` block (`components/learning/Further.tsx`, optional, not part of the course): two to four hand-picked links to official documentation, RFCs, a YouTube video or a blog post, each with one line on why it is worth the time. Prefer sources that are visual (animated explainers, Wireshark walkthroughs) over textbook chapters. The component already labels it optional and not examinable. Verify every URL resolves (curl, or the YouTube oEmbed endpoint for video ids) before committing; never invent a video id.
- Week 1 started Monday 2026-09-14. Week N starts 14 Sept + 7(N−1) days. Midterm week 8 (from 2026-11-02). Week 15 starts 2026-12-21.
- Agreed workflow: build two weeks ahead, adapt weekly from slides, assignments and quizzes dropped into `courses/<slug>/`.
- Past papers may never arrive. Do not wait for them; infer exam style from the instructor's slides and the outline's assessment scheme.

## Courses this semester

| Slug | Course | Status |
|------|--------|--------|
| `cndc` | CSC 3205 Data Communication and Computer Networks (instructor slides call it DCCN) | Outline in hand. Weeks 1 to 2 built. Lectures 01 to 10 uploaded (lecture 05 missing). |
| `cndc-lab` | CNDC Lab, a separate course with its own grade. Wireshark and Cisco Packet Tracer. Lab manuals follow the Kurose Wireshark labs, in SZABIST's "Stage J (journey) / Stage a1 (apply) / Stage v (verify) / Stage a2 (assess)" format with worked solutions at the end. Each lab is one module (`lab-NN`, `week` = the week it was held), three lessons: the concept with a simulator, the procedure, a checkpoint with the manual's questions and the home assignment. | No outline yet. Lab 01 built (week 1, go-ahead given 2026-09-17). Build the next lab when its manual is dropped in. |
| `web-tech` | Web Technologies I (instructor: Zubair Ahmed). Java stack: JDK 26, Servlets on Tomcat 11, PostgreSQL, JDBC, IntelliJ, DBeaver. Slides so far: TCP/IP and ports, HTTP request/response, URLs, Tomcat directory layout, WAR and webapp structure, servlet GET/POST. A separate 160-page Java basics deck (classes, abstract classes, interfaces, singletons, JDBC) is a reference, not lecture order. | No outline yet. Do not build until the owner says so. |

The owner will share the class schedule and remaining outlines. Build only courses that have an outline or an explicit go-ahead.

## Instructor material: read with a grain of salt

SZABIST slides do not always teach the correct or standard thing. Example: the Web Tech URL slide labels the first path segment of a URL "App name", which is only Tomcat's context-path convention, not a property of URLs. Treat lecture slides as evidence of **what will be examined and how the instructor phrases it**, not as ground truth. When a slide conflicts with the textbook or an RFC:

- Teach the correct version in the lesson body, anchored to Kurose and Ross or the relevant standard.
- Add an exam `Callout` that gives the instructor's phrasing verbatim, so the learner can reproduce it on a quiz, and says in one line why it is imprecise.
- Never silently adopt the slide's wording as fact in a QuickCheck answer key. If the "expected" exam answer is the imprecise one, the question must say "according to the lecture slides".

## Assessments

- Each course: 4 quizzes and 4 assignments, 2 of each before the midterm (week 8) and 2 after. No fixed dates; the instructor announces them. Owner expects CNDC quiz 1 around week 3 and quiz 2 around weeks 5 to 6.
- The owner drops quiz and assignment briefs into `courses/<slug>/quizzes/` and `courses/<slug>/assignments/` and says when a date is announced. When a quiz is announced, add a short revision lesson (`kind: "checkpoint"`) covering exactly the lectures the quiz spans, before the quiz date.
- Assignments get their own lesson only if the assignment teaches something the outline does not; otherwise just link the brief from the week's checkpoint.
- The machine this runs on is ephemeral. Everything that matters lives in this repo; progress lives in Postgres when `DATABASE_URL` is set.
- PDFs and other binaries under `courses/` are Git LFS objects (`.gitattributes`). A fresh clone needs `git lfs install` (once per machine) so the files are real PDFs, not pointers.

## Progress storage and deployment

- Progress (lesson completion, quiz attempts, review queue) is held in a zustand store persisted to localStorage, and mirrored to Postgres when `DATABASE_URL` is set. See `lib/learning/sync.ts`, `app/api/progress/route.ts`, `components/learning/ProgressHydrator.tsx`.
- On load the client pulls the server snapshot, merges per key with the local copy (latest evidence wins), pushes the result, then debounce-pushes every change. Two machines used at different times never lose each other's work.
- Single table `progress(id, data jsonb, updated_at)`, one row. Created automatically on first request.
- `PROGRESS_SECRET` (optional) gates the API. The owner enters it once via the sync status widget in the header; it is kept in localStorage and sent as `x-progress-secret`.
- Copy `.env.example` to `.env` locally. On Vercel set the same variables in project settings. All pages are static; only `/api/progress` runs on the server.

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
