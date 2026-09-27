# CNDC Lab — Lab Task 01: Packet Tracer topologies (build guide)

> **Status:** Not started — this is a build guide, not the deliverable. The `.pkt` files are hands-on GUI work in Packet Tracer; I can't produce them. Work through the table below in order, save one `.pkt` per topology (or one file with 9 tabs if your Packet Tracer version supports multiple network tabs), then export screenshots/the file for submission.
> **Due:** 28 September 2026, 10 marks.
> **Brief:** `courses/cndc-lab/assignments/lab-task-01-packet-tracer-topologies.pdf`
> **Submitted to:** Adeel Ahmed

## What "provide connectivity" means for grading
For every topology: assign IPs, then prove reachability with either the click-to-test **Simple PDU** tool (P key, click source then destination — green tick = success) or an actual `ping` from a PC's Desktop → Command Prompt. Take one screenshot per topology showing a successful ping/PDU. That screenshot *is* the evidence of "connectivity" — build fast, don't over-decorate.

## Consistent addressing scheme (reuse this everywhere)
One `/24` subnet per topology so you never have to think about masks mid-build: **`192.168.<N>.0/24`**, gateway/router or switch management (if you bother) at `.1`, end devices `.2`, `.3`, `.4`… N = the row number below.

## Devices and how to add extra ports
- End device: **PC-PT** (default 1 NIC — enough for everything except full/partial mesh nodes if you use PCs there).
- Shared-medium link: **Hub-PT** (a hub floods every port — this *is* what makes a bus topology behave like a bus in Packet Tracer; there's no literal coax cable device).
- Switched link: **Switch-2960**.
- Routed link / mesh node: **Router-1941** (2 onboard GigabitEthernet ports; if a node needs a 3rd link, power it off, open Physical tab, drag in an HWIC-2T or NM-1FE module, power back on).
- Cabling: use the **Automatic** connection type (lightning-bolt icon) unless a link refuses to come up — then pick the explicit type (crossover between two same-tier devices, straight-through between different tiers).

## The 9 topologies

| # | Topology | Devices | Layout | Connectivity check |
|---|----------|---------|--------|---------------------|
| 1 | Point-to-point | 2× PC | PC1 — PC2, one direct link | Ping PC2 from PC1. |
| 2 | Linear bus | 1× Hub, 4× PC | All 4 PCs into the one hub | Ping across any two PCs — all share one collision domain. |
| 3 | Distributed bus | 3× Hub, 6× PC | Hub1–Hub2–Hub3 chained in a line, 2 PCs per hub | Ping from a PC on Hub1 to a PC on Hub3 (crosses two hub segments). |
| 4 | Extended star | 1× root Switch, 3× leaf Switch, 6× PC | Root switch to each leaf switch (tree, one level), 2 PCs per leaf | Ping between PCs on two *different* leaf switches — traffic must go up through the root. |
| 5 | Distributed star | 3× Switch, 6× PC | Switches interconnected with each other (triangle) instead of one root, 2 PCs per switch | Ping between PCs on different switches. |
| 6 | Ring | 4× Switch, 4× PC | Switch1–2–3–4–1, closing the loop; 1 PC per switch | 2960s run PVST by default, so one link goes into blocking automatically — that's correct, not a bug. Ping still succeeds because a spanning path remains. |
| 7 | Full mesh | 3× Router, 3× Switch, 3× PC | Every router directly linked to both other routers (triangle, uses both onboard Gig ports — no extra modules needed); each router also has a switch+PC LAN | Enable a routing protocol (RIP or OSPF, one `router rip`/`router ospf 1` + `network` statements per router) so LAN-to-LAN pings succeed. |
| 8 | Partial mesh | 4× Router, 4× Switch, 4× PC | Not every pair linked — e.g. R1–R2, R2–R3, R3–R4, R1–R3 (R2 and R4 have no direct link); each router also has a switch+PC LAN | Same dynamic routing setup. Ping from R4's PC to R2's PC — it must route through R3, proving multi-hop reachability with a link missing. This is the one where routing actually earns its marks (mesh #7 is all direct links, so routing there is almost trivial by comparison). |
| 9 | Hybrid | reuse pieces above | Simplest honest hybrid: two routers point-to-point (topology 1) at the core, each router roots its own extended star (topology 4) of switches+PCs at the edge | Ping between a PC on one router's star and a PC on the other's — crosses both a star hop and the core P2P link. Any combination of ≥2 topologies from the list above satisfies the brief; this is just the fastest to build from what you already made. |

## Order to build in
Do them in the table's order — 7 and 8 share the routing-protocol setup, so do 7 first and copy the `router ospf`/`router rip` config pattern into 8 rather than re-deriving it. Do 9 last since it reuses 1 and 4.

## Router routing config (for #7, #8, #9's core link), one-liner pattern
On each router, after interface IPs are set:
```
router ospf 1
network 192.168.7.0 0.0.0.255 area 0
network 192.168.7.4 0.0.0.255 area 0
```
(one `network` line per directly-connected subnet on that router; adjust the subnet numbers to whatever you actually assigned). Repeat per router in the mesh; OSPF handles the rest.
