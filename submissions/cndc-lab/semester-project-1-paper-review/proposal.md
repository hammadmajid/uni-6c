# CNDC Lab — Semester Project 1: Research Paper Review (Proposal)

> **Status:** Typeset as `proposal.pdf` from `proposal.typ` (zabdoc cover, same as SE assignment 1). This .md is the source draft. Reword it in your own words, then edit `proposal.typ` to match. Recompile: `typst compile --root /home/bine/Developer/uni/6c --font-path /home/bine/Developer/uni/zabdocs --no-pdf-tags submissions/cndc-lab/semester-project-1-paper-review/proposal.typ`
> **Next steps:** (1) put the problem statement in your own words; (2) fill in name / reg no / group; (3) read the full paper PDF; (4) later, expand into the full review (methodology, findings, critique).
> **Due:** 28 September 2026 · **To:** Mr. Adeel Ahmed · **Marks:** 30
> **Brief:** `courses/cndc-lab/assignments/semester-project-01-proposal-paper-review.pdf`
> **Paper (free full text):** https://www.usenix.org/system/files/nsdi24-wydrowski.pdf

---

**Group members:** Hammad Majid (2312200), Haris Qaiser Lodhi (2312458), Syed Muhammad Ahsan (2312421)

---

## 1. Title of the Paper

Load is not what you should balance: Introducing Prequal

## 2. Authors and Publication Details

Bartek Wydrowski (Google Research), Robert Kleinberg (Google Research & Cornell), Stephen M. Rumble (Google / YouTube), and Aaron Archer (Google Research). Published in the *21st USENIX Symposium on Networked Systems Design and Implementation (NSDI '24)*, April 2024, pp. 1285–1299.

## 3. Introduction & Problem Statement

Large networked services spread incoming client requests across a fleet of servers using a **load balancer**, and the standard practice is to balance by **server load** — typically CPU utilisation or queue length — on the assumption that keeping every server equally loaded gives the best performance. This paper argues that load is the *wrong* signal to equalise: minimising the spread of CPU utilisation does not minimise the latency users actually experience, and can even worsen the **tail latency** (the slow p99 requests) that dominates the quality of a networked service.

The authors introduce **Prequal** ("Probing to Reduce Queuing and Latency"), a load balancer that, instead of equalising load, selects servers by **estimated real-time latency and the number of requests-in-flight**. It cheaply probes a few candidate servers and routes each request to the best one, in the spirit of the "power of *d* choices." Deployed on **YouTube's** production infrastructure for over two years, Prequal sharply reduced tail latency and error rates while using fewer resources than the previous CPU-balancing scheme.

This research matters to Computer Networks and Data Communication because **load balancing is a core traffic-distribution function** of data centres and content-delivery networks — it decides how application traffic is routed to servers and directly determines the **delay, throughput and reliability** that end users see. Tail latency is a central quality-of-service metric for networked applications, and this work shows how rethinking the routing signal — from static load to live latency and queuing — measurably improves performance at internet scale, challenging a long-standing default in how networked systems are built.

## 4. Reference (APA 7th edition)

Wydrowski, B., Kleinberg, R., Rumble, S. M., & Archer, A. (2024). Load is not what you should balance: Introducing Prequal. In *21st USENIX Symposium on Networked Systems Design and Implementation (NSDI '24)* (pp. 1285–1299). USENIX Association. https://www.usenix.org/conference/nsdi24/presentation/wydrowski
