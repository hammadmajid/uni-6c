#import "../../_shared/zabdoc/cover.typ": cover

#cover(
  students: ((Name: "Hammad Majid", RegNo: "2312200"),),
  class: "BsCS-6C",
  course: "CNDC Lab",
  course-code: "CSCL 3205",
  instructor: "Mr. Adeel Ahmed",
  doc-type: "Lab Task",
  number: "01",
  date: "28 Sep 2026",
  marks: "10",
)

#set page(paper: "a4", margin: 18mm, header: none, footer: none, background: none)
#set text(font: "Liberation Serif", size: 12pt)

#let shot(title, file) = {
  pagebreak(weak: true)
  text(size: 14pt, weight: "bold", title)
  v(8pt)
  image(file, width: 100%)
}

#shot("1. Point-to-point topology 10.200.1.0/24", "01-point-to-point.png")
#shot("2a. Linear bus topology 10.200.2.0/24", "02-linear-bus.png")
#shot("2b. Distributed bus topology 10.200.2.0/24", "03-distributed-bus.png")
#shot("3a. Extended star topology 10.200.4.0/24", "04-extended-star.png")
#shot("3b. Distributed star topology 10.200.5.0/24", "05-distributed-star.png")
#shot([4. Ring topology 10.200.6.0/24 \ 5a. Fully connected mesh topology 10.200.6.0/24], "06-07-ring-and-full-mesh.png")
#shot("5b. Partially connected mesh topology 10.200.7.0/24", "08-partial-mesh.png")
#shot("6. Hybrid topology 10.200.4.0/24", "09-hybrid.png")
