# AI — Assignment 1 (PEAS, environments, agent types)

> **Status:** Typed answer ready in `2312200.pdf`. Not yet confirmed whether the instructor wants it typed or handwritten.
> **Due:** 7 Oct 2026.
> **Submitted to:** Awais Nawaz · **Marks:** 3 · Individual, section BsCS-6C.
> **Brief:** `courses/ai/assignments/assignment-1-peas-environments-agent-types.pdf`

## Judgement calls worth knowing before you hand it in

- **Chess is classified sequential**, which is the AIMA answer. Lecture 03's "Episodic" slide lists "chess (optimal solution)" as an example, so the instructor may say episodic. The case text ("calculates several moves ahead") supports sequential.
- **Sprinkler: partially observable and sequential.** A simple reflex agent is usually paired with "fully observable" on the lecture 02 slide. The answer argues the sensor misses weather and time since watering, and that watering changes the next reading. Baggage arm is the contrasting case: fully observable, episodic.
- **Chess is goal-based, not utility-based**, because the case says "the winning goal state". The answer says in one line when it would be utility-based.
- Environment tables add a seventh row, single vs multi-agent, which is in AIMA but not on the lecture 03 list of six.

## To recompile after edits
```
typst compile --root /home/bine/Developer/uni/6c --font-path /home/bine/Developer/uni/zabdocs --no-pdf-tags submissions/ai/assignment-1/assignment-1.typ submissions/ai/assignment-1/2312200.pdf
```
