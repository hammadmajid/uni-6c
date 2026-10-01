// Handwritten-style copy sheet for DB assignment 1 (brief: courses/db/assignments/assignment-1-dbms-basics-schema-architecture.docx).
// R.No. 2312200 -> A = 00, E = 0 (DOCTOR), new BookID 500, last digit 0 (Roll Number).
// Build: ../../_shared/handwriting/build.sh db/assignment-1 2312200.pdf
#import "../../_shared/handwriting/hand.typ": *
#show: sheet

// Hand-drawn table: column widths, rows of cells, top-left at (x, y).
#let wtable(x, y, widths, rows, seed: 0, rh: 24pt) = {
  let total = widths.sum()
  for r in range(rows.len() + 1) {
    wl((x, y + r * rh + rnd(seed + r) * 2pt), (x + total, y + r * rh + rnd(seed + r + 7) * 2pt), seed: seed + r * 3)
  }
  let cx = x
  for c in range(widths.len() + 1) {
    wl((cx + rnd(seed + c + 20) * 2pt, y), (cx + rnd(seed + c + 30) * 2pt, y + rows.len() * rh), seed: seed + 40 + c * 3)
    if c < widths.len() { cx += widths.at(c) }
  }
  for (r, row) in rows.enumerate() {
    let cx = x
    for (c, cell) in row.enumerate() {
      at(cx + 6pt + rnd(seed + r * 5 + c) * 3pt, y + r * rh + 2pt, text(size: 18pt, cell))
      cx += widths.at(c)
    }
  }
}
#let tx(x, y, s, size: 18pt) = at(x, y, text(size: size, s))

#q(1)
#l(indent: 10pt, "a) R.No = 2312200 -> A = 00 = 0")
#l(indent: 30pt, "E = 0 mod 4 = 0 -> DOCTOR")
#l(indent: 10pt, "b) entities: DOCTOR, PATIENT, APPOINTMENT")
#l(indent: 30pt, "DOCTOR is compulsory bc my E = 0 and E = 0 maps to DOCTOR in the table")
#l(indent: 10pt, "c) DOCTOR (DoctorID PK, name, ~speci~ specialization, phone)")
#l(indent: 30pt, "PATIENT (PatientID PK, name, age, phone)")
#l(indent: 30pt, "APPOINTMENT (ApptID PK, date, time, reason)")
#l(indent: 10pt, "d) DOCTOR has APPOINTMENT -> 1:N. one doctor has many appointments, each appointment is with one doctor")

#block(height: 72pt, width: 100%, breakable: false, {
  let y = 24pt
  wbox(20pt, y, 100pt, 34pt, seed: 3)
  tx(30pt, y + 2pt, "DOCTOR")
  wl((122pt, y + 17pt), (190pt, y + 17pt), seed: 8)
  tx(150pt, y - 12pt, "1", size: 16pt)
  // diamond
  wl((190pt, y + 17pt), (225pt, y - 2pt), seed: 11)
  wl((225pt, y - 2pt), (260pt, y + 17pt), seed: 13)
  wl((260pt, y + 17pt), (225pt, y + 36pt), seed: 15)
  wl((225pt, y + 36pt), (190pt, y + 17pt), seed: 17)
  tx(212pt, y + 2pt, "has")
  wl((260pt, y + 17pt), (330pt, y + 18pt), seed: 19)
  tx(290pt, y - 12pt, "N", size: 16pt)
  wbox(332pt, y, 150pt, 34pt, seed: 23)
  tx(342pt, y + 2pt, "APPOINTMENT")
})

#l(indent: 10pt, "e) one shared copy -> ~~less paper to~~ no duplicate patient data in seperate files that go out of sync (inconsistency)")
#l(indent: 30pt, "doctor + reception can use it at the same time, access ctrl keeps records private")
#l(indent: 30pt, "fast search (all appts of a doctor today), backup + recovery, paper gets lost / ~dam~ damaged")

#q(2)
#l(indent: 10pt, "a) schema = BOOK (BookID, Title, Available) -> the structure, rarely changes")
#l(indent: 30pt, "state = the 3 rows stored right now (501, 502, 503) -> the data at this moment")
#block(height: 172pt, width: 100%, breakable: false, {
  tx(10pt, 0pt, "b) new BookID = 500 + 00 = 500", size: 22pt)
  wtable(30pt, 42pt, (90pt, 190pt, 110pt), (
    ("BookID", "Title", "Available"),
    ("501", "Data Structures", "Yes"),
    ("502", "Discrete Math", "Yes"),
    ("503", "Operating Systems", "No"),
    ("500", "Database Systems", "Yes"),
  ), seed: 61, rh: 25pt)
  tx(440pt, 144pt, "<- new")
})

#l(indent: 10pt, "c) only the state changed. insert adds a row, the columns + their types stay the same so schema is ^completely untouched")
#l(indent: 30pt, "(insert / update / delete change state, schema = intension, state = extension)")
#l(indent: 10pt, "d) schema has to change -> add a Publisher column (ALTER TABLE BOOK ADD Publisher) = schema evolution")
#l(indent: 30pt, "existing rows stay but get NULL (or a ~defu~ default) in Publisher untill somone fills it in. so the state changes too")
#l(indent: 10pt, "e)")

#block(height: 210pt, width: 100%, breakable: false, {
  // schema
  wbox(10pt, 10pt, 150pt, 66pt, seed: 81)
  tx(20pt, 12pt, "Schema")
  tx(20pt, 40pt, "BOOK(BookID, Title,", size: 15pt)
  tx(20pt, 56pt, "Available)", size: 15pt)
  warrow((165pt, 44pt), (198pt, 44pt), seed: 84)
  tx(164pt, 14pt, "load", size: 13pt)
  // state 1
  wbox(204pt, 10pt, 150pt, 108pt, seed: 87)
  tx(214pt, 12pt, "State 1")
  tx(214pt, 40pt, "501 Data Str.. Yes", size: 15pt)
  tx(214pt, 58pt, "502 Discrete.. Yes", size: 15pt)
  tx(214pt, 76pt, "503 OS .. No", size: 15pt)
  warrow((360pt, 64pt), (392pt, 64pt), seed: 90)
  tx(358pt, 22pt, "ins", size: 13pt)
  tx(358pt, 36pt, "500", size: 13pt)
  // state 2
  wbox(398pt, 10pt, 145pt, 128pt, seed: 93)
  tx(406pt, 12pt, "State 2")
  tx(406pt, 40pt, "501 Data Str.. Yes", size: 15pt)
  tx(406pt, 58pt, "502 Discrete.. Yes", size: 15pt)
  tx(406pt, 76pt, "503 OS .. No", size: 15pt)
  tx(406pt, 94pt, "500 Database.. Yes", size: 15pt)
  tx(40pt, 150pt, "schema stays the same, only the state moves 1 -> 2", size: 18pt)
})

#q(3)
#l(indent: 10pt, "last digit = 0 -> mostly searched by Roll Number")
#l(indent: 10pt, "a) access path: B+ tree index on RollNo (non unique, a student has many attempts)")
#l(indent: 30pt, "- lookup = few block reads vs scanning all 300,000 rows")
#l(indent: 30pt, "- handles exact match + ranges (a whole section's roll nos) + stays sorted as new attempts come in")
#l(indent: 30pt, "poor choice eg no index / heap file -> full scan on evrey lookup -> app hangs on result day. index on ExamDate -> useless for roll no ~sear~ searches. fully sorted file -> every new attempt = costly re-sort")
#l(indent: 10pt, "b) logical = what is stored + how it relates -> table ATTEMPT(RollNo, CourseCode, ExamDate, Marks, Status)")
#l(indent: 30pt, "physical = how it sits on disk -> file org, blocks, the B+ tree on RollNo. users never see this")
#l(indent: 10pt, "c) three tier")

#block(height: 230pt, width: 100%, breakable: false, {
  // clients
  wbox(30pt, 12pt, 150pt, 40pt, seed: 101)
  tx(42pt, 16pt, "student mobile app")
  wbox(300pt, 12pt, 160pt, 40pt, seed: 104)
  tx(310pt, 16pt, "faculty desktop portal")
  tx(470pt, 18pt, "client", size: 16pt)
  warrow((110pt, 56pt), (210pt, 96pt), seed: 107)
  warrow((380pt, 56pt), (290pt, 96pt), seed: 110)
  // app
  wbox(150pt, 100pt, 200pt, 40pt, seed: 113)
  tx(160pt, 104pt, "app server (rules, auth)")
  tx(370pt, 106pt, "application", size: 16pt)
  warrow((250pt, 144pt), (251pt, 176pt), seed: 116)
  // db
  wbox(170pt, 180pt, 160pt, 40pt, seed: 119)
  tx(182pt, 184pt, "DBMS + database")
  tx(350pt, 186pt, "database", size: 16pt)
})

#l(indent: 10pt, "why: 1. two diff clients share the same logic in one place, phones never talk to the DB directly -> DB creds not on devices, safer")
#l(indent: 30pt, "2. scales: add more app servers on exam day, change logic without updating every app")
#l(indent: 10pt, "d)")

#block(height: 150pt, width: 100%, breakable: false, {
  let y = 16pt
  wbox(10pt, y, 90pt, 36pt, seed: 131)
  tx(20pt, y + 2pt, "student")
  warrow((104pt, y + 18pt), (128pt, y + 18pt), seed: 134)
  wbox(132pt, y, 100pt, 36pt, seed: 137)
  tx(140pt, y + 2pt, "interface")
  warrow((236pt, y + 18pt), (260pt, y + 18pt), seed: 140)
  wbox(264pt, y, 116pt, 36pt, seed: 143)
  tx(272pt, y + 2pt, "application")
  warrow((384pt, y + 18pt), (408pt, y + 18pt), seed: 146)
  wbox(412pt, y, 80pt, 36pt, seed: 149)
  tx(422pt, y + 2pt, "DBMS")
  warrow((452pt, y + 40pt), (453pt, y + 70pt), seed: 152)
  wbox(400pt, y + 74pt, 110pt, 36pt, seed: 155)
  tx(410pt, y + 76pt, "database")
  warrow((396pt, y + 92pt), (60pt, y + 92pt), seed: 158)
  tx(160pt, y + 64pt, "result (back the same way)", size: 16pt)
  warrow((55pt, y + 88pt), (55pt, y + 42pt), seed: 161)
})
