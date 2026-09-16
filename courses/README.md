# Raw course materials

One directory per course, named with the same slug the app uses under `content/courses/`.

```
courses/<slug>/
  course-outline.pdf        the official outline, if available
  lectures/                 lecture-NN-topic.pdf, NN = the instructor's lecture number (ranges like 06-07 are fine)
  labs/                     lab-NN-topic.pdf
  assignments/              assignment-N-topic.pdf (or .md, .docx)
  quizzes/                  quiz-N-topic.pdf, or quiz-N-notes.md with the announced date and scope
  announcements/            NN-short-title.txt, verbatim copies of what the instructor posted
  references/               books, extra decks, anything that is not in lecture order
```

Filenames are lower-case kebab-case. Keep the instructor's numbering so quizzes and announcements that say "lectures 6 to 10" can be mapped back.

Binary files (PDF, Office docs, images, zips, Packet Tracer `.pkt`, Wireshark captures) are stored with Git LFS; see `.gitattributes`. `git lfs install` once per machine before cloning, or run `git lfs pull` after.

These files are inputs only. The app never serves them; it reads `content/courses/`.
