# CNDC Lab — Lab Task 01: Packet Tracer topologies (build guide)

> **Status:** Build guide, not the deliverable. The `.pkt` and screenshots are your hands-on work.
> **Due:** Mon 28 September 2026 (lab, 14:00), 10 marks. **Brief:** `courses/cndc-lab/assignments/lab-task-01-packet-tracer-topologies.pdf`. **Submitted to:** Adeel Ahmed.
> **Budget:** ~60–90 min for all nine. Everything is Layer 2: no routers, no routing protocol.

## Ground rules (apply to every topology)

- **Devices:** `PC-PT` for end hosts, `Hub-PT` (6 ports) where the medium must be *shared* (bus), `2960-24TT` switch everywhere else.
- **Cables:** Automatic (lightning bolt). It picks crossover for hub–hub / switch–switch / PC–PC and straight-through for PC–hub / PC–switch.
- **Addressing:** topology N uses `192.168.N.0/24`, mask `255.255.255.0`, hosts `.1, .2, .3…` in the order you place them. No gateway needed (single subnet). Set IP in PC → Desktop → IP Configuration.
- **Proof of connectivity:** from one PC, Desktop → Command Prompt → `ping` the *farthest* PC. Screenshot the topology with the command prompt window beside it. The first reply may time out (ARP); that's normal, the rest must succeed.
- **Loops (ring, meshes, hybrid):** switches run spanning tree. Links show amber for ~30 s, then one or more go permanently amber (blocking). That is correct: it's how a physical loop is kept loop-free logically. Click **Fast Forward Time** (bottom bar) a few times instead of waiting. Never build a loop out of hubs: hubs don't run STP and it becomes a broadcast storm.
- **Layout:** one `.pkt` with all nine laid out left-to-right, each labelled with the Note tool (N key) — e.g. "3a Extended star — 192.168.4.0/24". Or nine files; either is fine.

## The nine builds

| # | Topology | Build | Ping (proves the defining property) |
|---|----------|-------|---------------|
| 1 | Point-to-point | PC1 — PC2, one cable, nothing in between. | PC1 → `192.168.1.2` |
| 2 | Linear bus | Hub1—Hub2—Hub3—Hub4 in a straight line (the "backbone cable"), one PC on each hub (the "taps"). | PC1 → `192.168.2.4` (end to end of the bus) |
| 3 | Distributed bus | Backbone Hub1—Hub2—Hub3, one PC each. Branch off the middle: Hub2—Hub4, and give Hub4 two PCs. The branch is what makes it "distributed" (a bus with branches). | PC on Hub1 → a PC on Hub4 |
| 4 | Extended star | Central Switch0. Three Switches (S1–S3), each cabled to Switch0 only. Two PCs per S1–S3. | PC on S1 → PC on S3 (goes up through the centre and back down) |
| 5 | Distributed star | Three stars (Switch + 3 PCs each), chained S1—S2—S3. No single central device. | PC on S1 → PC on S3 |
| 6 | Ring | S1—S2—S3—S4—S1 (close the loop), one PC per switch. | PC1 → PC3 (opposite side). Point to the blocked (amber) port in your screenshot. |
| 7 | Full mesh | 4 switches, **every pair linked**: 4×3/2 = **6** switch–switch cables. One PC per switch. | PC1 → PC4 |
| 8 | Partial mesh | Same 4 switches + PCs, but only **5** links: the ring S1-S2-S3-S4-S1 plus one diagonal S1—S3. S2—S4 is deliberately missing. | PC2 → PC4 (no direct link, still reachable) |
| 9 | Hybrid | Ring of three switches S1—S2—S3—S1. S1 has 3 PCs (star). S2 connects to Hub1—Hub2 with a PC each (bus). S3 has one PC. Star + ring + bus in one network. | PC on the bus → a PC on S1's star |

IP example for #4 (Extended star, `192.168.4.0/24`): PCs on S1 = `.1, .2`, on S2 = `.3, .4`, on S3 = `.5, .6`. Same pattern everywhere else.

## Why these shapes (a viva may ask)

- **Point-to-point:** a dedicated link between exactly two nodes.
- **Bus:** every node shares one medium, so every frame reaches everyone. Hubs reproduce that in Packet Tracer (one collision domain). Use Simulation mode on #2 to show a ping from PC1 also being delivered to PC2 and PC3. That's the difference from a star built on a switch.
- **Extended vs distributed star:** extended has a hierarchy (star of stars, one root). Distributed has several stars linked peer-to-peer with no root.
- **Ring:** every node has exactly two neighbours. The loop gives redundancy, and STP turns it into a logical line.
- **Mesh:** full mesh needs n(n−1)/2 links (6 for 4 nodes, 45 for 10: why nobody fully meshes big networks). Partial mesh keeps redundancy on the important paths only.
- **Hybrid:** any combination of two or more of the above. Most real networks are hybrid.

## If a ping fails

1. Red dot on a link → wrong cable type; delete it and use Automatic.
2. Amber everywhere on a loop → spanning tree still converging; Fast Forward Time.
3. "Request timed out" on every reply → typo in the IP or the mask on one PC (all must be in the same `192.168.N.x`).
4. Hub loop built by accident → delete one hub–hub link.
