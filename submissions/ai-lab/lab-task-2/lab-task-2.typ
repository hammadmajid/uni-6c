#import "../../_shared/zabdoc/cover.typ": cover

#cover(
  students: ((Name: "Hammad Majid", RegNo: "2312200"),),
  class: "BsCS-6C",
  course: "AI Lab",
  course-code: "CSCL 4101",
  instructor: "Mr. Muhammad Ishfaq",
  doc-type: "Lab Task",
  number: "02",
  date: "12 Oct 2026",
  marks: "10",
)

#set page(paper: "a4", margin: 18mm, header: none, footer: none, background: none)
#set text(font: "Liberation Serif", size: 12pt)

#let task(n) = {
  pagebreak(weak: true)
  [= Task #n]
  [== Code]
  raw(read("task" + str(n) + ".py"), block: true)
  [== Screenshot]
  image("task" + str(n) + ".png", width: 70%)
}

#task(1)
#task(2)
#task(3)
#task(4)
#task(5)
