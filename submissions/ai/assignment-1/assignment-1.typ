#import "../../_shared/zabdoc/cover.typ": cover, body-page-setup

#let course-code = "CSC 4101"
#let class = "BsCS-6C"

#cover(
  students: ((Name: "Hammad Majid", RegNo: "2312200"),),
  class: class,
  course: "Artificial Intelligence",
  course-code: course-code,
  instructor: "Awais Nawaz",
  doc-type: "Assignment",
  number: "1",
  date: "7 Oct 2026",
  marks: "3",
)

#let peas(p, e, a, s) = table(
  columns: (1.7fr, 4fr),
  inset: 5pt,
  stroke: 0.5pt + rgb("#666"),
  [*Performance measure*], p,
  [*Environment*], e,
  [*Actuators*], a,
  [*Sensors*], s,
)

#let env(..rows) = table(
  columns: (1.2fr, 1.5fr, 3fr),
  inset: 5pt,
  stroke: 0.5pt + rgb("#666"),
  table.header([*Property*], [*Class*], [*Reason*]),
  ..rows.pos().flatten(),
)

#body-page-setup(course-code, class)[

#show table: set par(justify: false)
#show table: set text(hyphenate: false)
#show table: set block(breakable: false)

= Case Study 1: Greenhouse Sprinkler

== PEAS

#peas(
  [Soil stays moist enough for the plants, plants stay healthy, little water is wasted, no overwatering.],
  [The greenhouse: soil, plants, air temperature and humidity, the water supply.],
  [Sprinkler valve (on for a fixed duration, or off).],
  [Soil-moisture sensor, reading dry or wet.],
)

== Environment classification

#env(
  ([Observability], [Partially observable], [It senses moisture at one point only. Weather, plant condition and time since the last watering also matter for the soil, and it sees none of them.]),
  ([Determinism], [Stochastic], [How fast the soil dries depends on heat, humidity and the plants, so the result of one watering is not exactly predictable.]),
  ([Episodes], [Sequential], [Watering now changes the soil, which changes the next reading and so the next action.]),
  ([Change], [Dynamic], [The soil keeps drying on its own while the system is idle.]),
  ([State space], [Discrete], [As the agent sees it: two percepts (dry, wet) and two actions (on, off).]),
  ([Knowledge], [Known], [The effect of the action is known in advance: sprinkling makes the soil wet.]),
  ([Agents], [Single agent], [Nothing else in the greenhouse is acting against or with it.]),
)

== Agent type: simple reflex agent

The whole behaviour is two condition-action rules on the current percept:

- if the sensor reads dry, turn the sprinkler on for the fixed duration
- if the sensor reads wet, keep the sprinkler off

The case says it has no memory of past readings, so there is no internal state, which rules out a model-based reflex agent. It does not reason about a goal or compare outcomes (it ignores the forecast and waters for the same duration every time), so it is not goal-based or utility-based, and its rules never change, so it does not learn. It works here only because the one thing its rule needs, the current moisture reading, is directly sensed.

= Case Study 2: Warehouse Restocking Robot

== PEAS

#peas(
  [Few stockouts, shelves restocked before they run empty, short restocking time, low travel and energy use, no collisions or damaged stock.],
  [The warehouse: shelves and their stock levels, aisles, the storage area, workers and other vehicles, the pattern of demand.],
  [Wheels and drive motors, robotic arm or gripper, lift to reach shelves.],
  [Cameras, barcode or RFID reader, shelf stock sensors or the inventory system feed, proximity sensors or lidar, position tracking.],
)

== Environment classification

#env(
  ([Observability], [Partially observable], [The warehouse is large, so at any moment it can sense only the shelves near it, not the stock level everywhere.]),
  ([Determinism], [Stochastic], [Demand is uncertain: it cannot predict exactly which items will be taken or when.]),
  ([Episodes], [Sequential], [Restocking one shelf first delays every other shelf, so each choice affects later stockouts.]),
  ([Change], [Dynamic], [Stock keeps being taken and people keep moving while the robot is deciding and travelling.]),
  ([State space], [Continuous], [Its position, speed and arm movement vary continuously, and so does time.]),
  ([Knowledge], [Unknown], [On day one it does not know which shelves empty fastest. It has to find that out from experience.]),
  ([Agents], [Single agent], [The robot is the only decision maker described. Workers are treated as part of the environment.]),
)

== Agent type: learning agent

Its strategy today is measurably better than on its first day, and that improvement comes from its own experience, not from being reprogrammed. No fixed set of rules, model or goal explains that; only a learning agent changes its own behaviour over time. The description matches the four parts of a learning agent:

#table(
  columns: (1.7fr, 4fr),
  inset: 5pt,
  stroke: 0.5pt + rgb("#666"),
  [*Performance element*], [Chooses which shelf to restock next and carries it out.],
  [*Critic*], [Measures how well it is doing against a fixed standard: the number of stockouts.],
  [*Learning element*], [Notices which shelves run out fastest and changes the priorities to restock those earlier.],
  [*Problem generator*], [Occasionally tries a new restocking schedule to see whether it reduces stockouts further.],
)

The environment is unknown at the start, which is exactly the situation where a learning agent is needed.

= Case Study 3: Chess Program

== PEAS

#peas(
  [Winning by checkmate. A draw is better than a loss.],
  [The chessboard, the pieces of both sides, the opponent.],
  [Making a move: moving a piece on the board, or displaying the chosen move.],
  [Reading the current board position, including the opponent's last move.],
)

== Environment classification

#env(
  ([Observability], [Fully observable], [The whole board is visible before every move and nothing is hidden from either side.]),
  ([Determinism], [Deterministic], [A move always produces exactly one new position. There are no dice or chance. The only uncertainty is which move the opponent will pick.]),
  ([Episodes], [Sequential], [Every move changes the position that all later moves are played from. One bad move can lose the game many moves later.]),
  ([Change], [Static], [The board does not change while the program is thinking. (With a chess clock it would be semi-dynamic.)]),
  ([State space], [Discrete], [A finite number of positions and a finite set of legal moves in each one.]),
  ([Knowledge], [Known], [The rules and all legal moves are fully known to the program in advance.]),
  ([Agents], [Multi-agent, competitive], [The opponent is another agent whose win is the program's loss.]),
)

== Agent type: goal-based agent

The program has an explicit goal state, checkmate, and it picks moves by looking ahead: it calculates several moves into the future and selects the move that leads towards that goal. Choosing an action by considering its future consequences against a goal is what defines a goal-based agent. A reflex agent could not do this, because it would map the current board straight to a move without any look-ahead. It is not a learning agent either, since nothing in the description says its play improves with experience.

I chose goal-based over utility-based because the case describes one desired outcome, the winning goal state, and not a preference between several acceptable outcomes. If the program scored every position with an evaluation number and maximised it, the same program would be better described as utility-based.

= Case Study 4: Baggage-Sorting Robotic Arm

== PEAS

#peas(
  [Share of bags pushed onto the correct chute, bags sorted per minute, no missed, jammed or damaged bags.],
  [The conveyor belt, the passing bags with their barcode tags, the chutes for each flight.],
  [The robotic arm that pushes a bag onto a chute.],
  [Barcode scanner. In practice also a sensor that detects a bag has arrived.],
)

== Environment classification

#env(
  ([Observability], [Fully observable], [The only thing the decision depends on is the barcode of the bag in front of it, and the scanner reads that completely.]),
  ([Determinism], [Deterministic], [The same flight number always maps to the same chute, and the push sends the bag there.]),
  ([Episodes], [Episodic], [Each bag is a separate one-shot decision. How one bag is sorted has no effect on the next bag.]),
  ([Change], [Dynamic], [The belt keeps moving, so the bag passes if the arm does not act in time.]),
  ([State space], [Discrete], [A finite set of flight numbers and a finite set of chutes.]),
  ([Knowledge], [Known], [The barcode-to-chute mapping is given in advance.]),
  ([Agents], [Single agent], [The arm works alone. Bags do not act.]),
)

== Agent type: simple reflex agent

The arm applies one condition-action rule to the current percept: if the barcode shows flight X, push the bag onto the chute for flight X. It acts only on the bag in front of it, does not track the bags it has already sorted (no internal state, so not model-based) and does not plan for bags that have not arrived (no goal reasoning or look-ahead, so not goal-based or utility-based). A simple reflex agent is enough, and fully rational here, because the environment is episodic and the current percept contains everything the correct action depends on.

]
