#import "../../_shared/zabdoc/cover.typ": cover, body-page-setup

#let course-code = "CSC 3205"
#let class = "BsCS-6C"

// Placeholder for an answer not written yet. Delete once every answer is in.
#let todo = text(fill: red)[_Answer goes here._]

#cover(
  students: ((Name: "Hammad Majid", RegNo: "2312200"),),
  class: class,
  course: "Data Communication and Computer Networks",
  course-code: course-code,
  instructor: "Dr. Maria Zuraiz",
  doc-type: "Assignment",
  number: "1",
  date: "28 Sep 2026",
  marks: "3",
)

#body-page-setup(course-code, class)[

= Q1: Offices in Islamabad, New York and Tokyo

*1. Why are protocols and algorithms critical for seamless global communication among these offices?*

#todo

*2. With no layered architecture, what two major issues would the network face connecting devices worldwide?*

#todo

= Q2: Buffering delays and skipped frames

*Which two performance metrics (delay, path loss, throughput) are most responsible, and how are they interconnected?*

#todo

= Q3: Matching technologies to networks

#table(
  columns: (auto, auto, 1fr),
  inset: 6pt,
  table.header([*Network*], [*Technology*], [*Justification*]),
  [A: 3 users, constant connection], [#todo], [#todo],
  [B: 100 users, small random bursts], [#todo], [#todo],
  [C: long distance, variable signal], [#todo], [#todo],
)

= Q4: Mars–Earth Data Transmission Project

*1. Which layered model (OSI or TCP/IP) would you choose? Justify in one paragraph.*

#todo

*2. If you removed one layer, which would it be and how would it affect communication?*

#todo

]
