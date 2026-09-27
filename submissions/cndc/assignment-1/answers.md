# CNDC — Assignment 1 (Answers)

> **Status:** Scaffold. Each question lists the points that earn the marks. Write the prose yourself in the "Your answer" blocks, then I tighten it and move it into `assignment-1.typ`.
> **Build:** `submissions/_shared/handwriting/build.sh cndc/assignment-1 2312200.pdf` writes `2312200.pdf` (typed cover + handwritten-style answers from `handwritten.typ`, see `_shared/handwriting/README.md`). `assignment-1.typ` is the older typed skeleton; compiling it to the same name would overwrite the handwritten PDF.
> **Due:** 28 September 2026 · **To:** Dr. Maria Zuraiz · **Marks:** 3 · Section BS(CS)-6C
> **Brief:** `courses/cndc/assignments/assignment-1-layers-switching-performance.pdf`
> **Concept practice with model answers:** the `cndc/week-02/assignment-1-workshop` lesson (paraphrase, don't copy — the brief marks copied work zero).

---

**Name:** _______________  **Reg. no:** _______________

---

## Q1 — Offices in Islamabad, New York, Tokyo

### Q1.1 Why are protocols and algorithms critical for seamless global communication? (~1.5 marks)
Hit these points:
- **Protocols = agreed rules** — format and order of messages, and the actions on send/receipt. Without a shared protocol a message from one office is uninterpretable at another (different vendors/OS/countries).
- **Algorithms = the mechanisms that make delivery work** — routing (best path across the global core, reroute around failures), congestion/flow control (no link overwhelmed), error detection/correction (reliable over long noisy links).
- **Together → "seamless":** protocols give a common language; algorithms deliver it efficiently and reliably across continents, so users don't see the complexity.

Your answer:



### Q1.2 Two major issues with no layered architecture (~1.5 marks)
Pick any two, explain each with a consequence:
- **No modularity / interoperability** — a monolithic stack couples everything; a new medium/app/vendor forces rewriting the whole thing, and independent implementations can't interoperate (can't swap Wi-Fi for Ethernet without touching the apps).
- **No separation of concerns / no common reference** — one block must do addressing + routing + reliability + encoding together; impossible to standardise worldwide and impossible to debug (can't isolate a fault to a layer).

Your answer:



## Q2 — Video streaming: buffering + frame skips (which two metrics, and how linked?)
Hit these points:
- **The two metrics: throughput and (path) loss.**
  - Buffering → **throughput** below the video's encoded bitrate, so the playout buffer drains and stalls.
  - Frame skips → **packet loss** (packets dropped at a congested router's full buffer), so frames are missing.
- **How interconnected:** both come from **congestion at the bottleneck** — as arrival rate nears link rate, throughput falls *and* the queue overflows (loss). Same root cause; loss further cuts useful throughput.
- One honest line: delay/jitter also worsens buffering, but throughput + loss are the primary two.

Your answer:



## Q3 — Match the switching technology to each network
State each match + a one-line justification (the justification is where the marks are):
- **Network A (3 users, constant connection) → Circuit switching** — few users each needing a guaranteed, dedicated rate; always active, so no reserved capacity is wasted.
- **Network B (100 users, small random bursts) → Packet switching** — statistical multiplexing shares links on demand; supports far more users than reserving circuits, which would waste capacity during silences.
- **Network C (long-distance, variable signal) → Low-Power WAN** — LPWAN (LoRa/Sigfox/NB-IoT) is built for long range on low power and tolerates a weak, variable signal (trading away data rate).

Your answer:



## Q4 — Mars–Earth data transmission model

### Q4.1 OSI or TCP/IP, and why? (one paragraph)
Hit these points:
- **Choose TCP/IP** — it is the actually-implemented, deployed stack; OSI is mainly a reference model.
- **Justify with the delay caveat** (this lifts the answer) — Earth–Mars propagation is minutes each way and the link drops out, which breaks standard TCP's fast-ACK assumption, so the real design keeps TCP/IP's structure and adds **delay-tolerant networking** (DTN / store-and-forward).
- (Choosing OSI for its clean layering is acceptable if argued — but note it's a model, not a deployed stack.)

Your answer:



### Q4.2 Remove one layer — which, and the impact?
Hit these points:
- **Worst to remove = Transport** — you'd lose ports (process-to-process addressing), segmentation/reassembly, and reliability + flow/congestion control; over a minutes-long round trip that's catastrophic, so keep it.
- **Safest to cut = Session/Presentation** — TCP/IP already omits them; their jobs (dialog control, sync checkpoints, encryption, compression) move into the application. Impact manageable, though for Mars you'd want the app to re-implement checkpointing so a huge transfer can resume after a blackout.

Your answer:



---

## Submission checklist
- [ ] Every answer in my own words (not copied from the workshop or a classmate)
- [ ] Name + reg no filled in
- [ ] Q3 has a justification for each match, not just the label
- [ ] Q4.1 mentions the propagation-delay caveat
- [ ] Exported to the format Dr. Zuraiz wants (PDF/Word) before submitting
