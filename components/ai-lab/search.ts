/**
 * Graph search engine behind PySearchLab and SearchGraphFigure.
 *
 * Each strategy turns (graph, start, goal) into a list of snapshots, one per frontier operation, so the lab can
 * scrub through them. Weeks 5 and 6 add greedy best-first and A* by adding an entry to STRATEGIES; the graphs
 * already carry edge costs and straight-line heuristics (Romania is the AIMA map with its h values).
 */

export interface SearchGraph {
  id: string;
  label: string;
  /** SVG canvas height (width is always 640). */
  height: number;
  nodes: Record<string, { x: number; y: number; name?: string; h?: number; label?: "left" | "above" }>;
  /** Undirected edges [a, b, cost]. */
  edges: [string, string, number][];
  start: string;
  goal: string;
  showCosts?: boolean;
  /** Hidden from the lab's preset picker (used by checkpoint figures). */
  hidden?: boolean;
}

export interface SearchStep {
  /** Node taken off the frontier at this step, if any. */
  current: string | null;
  /** One-line description of what happened, in the words you would write in a trace. */
  note: string;
  /** Frontier contents, next-out first. */
  frontier: string[];
  /** Expanded nodes, in expansion order. */
  explored: string[];
  parent: Record<string, string | null>;
  /** Set on the final step when the goal was reached. */
  path?: string[];
  failed?: boolean;
}

export interface Strategy {
  id: string;
  label: string;
  /** How the frontier is described in the UI. */
  frontierName: string;
  run: (g: SearchGraph, start: string, goal: string, opts: { earlyGoalTest: boolean }) => SearchStep[];
}

export function neighbours(g: SearchGraph, n: string): string[] {
  const out: string[] = [];
  for (const [a, b] of g.edges) {
    if (a === n) out.push(b);
    else if (b === n) out.push(a);
  }
  return out.sort();
}

export function pathTo(parent: Record<string, string | null>, node: string): string[] {
  const path: string[] = [];
  let cur: string | null = node;
  while (cur !== null && cur !== undefined) {
    path.push(cur);
    cur = parent[cur] ?? null;
  }
  return path.reverse();
}

export function pathCost(g: SearchGraph, path: string[]): number {
  let c = 0;
  for (let i = 1; i < path.length; i++) {
    const e = g.edges.find(([a, b]) => (a === path[i - 1] && b === path[i]) || (b === path[i - 1] && a === path[i]));
    c += e ? e[2] : 0;
  }
  return c;
}

/** BFS as in the lesson's Python: FIFO queue, parent dict doubles as the reached set, alphabetical tie-break. */
function bfs(g: SearchGraph, start: string, goal: string, { earlyGoalTest }: { earlyGoalTest: boolean }): SearchStep[] {
  const frontier = [start];
  const parent: Record<string, string | null> = { [start]: null };
  const explored: string[] = [];
  const steps: SearchStep[] = [{ current: null, note: `start: frontier = [${start}]`, frontier: [...frontier], explored: [], parent: { ...parent } }];
  if (earlyGoalTest && start === goal) {
    steps.push({ current: start, note: `${start} is the goal`, frontier: [], explored: [], parent: { ...parent }, path: [start] });
    return steps;
  }
  while (frontier.length) {
    const node = frontier.shift() as string;
    explored.push(node);
    if (!earlyGoalTest && node === goal) {
      steps.push({ current: node, note: `dequeue ${node}: goal test passes, stop`, frontier: [...frontier], explored: [...explored], parent: { ...parent }, path: pathTo(parent, node) });
      return steps;
    }
    const added: string[] = [];
    const skipped: string[] = [];
    for (const nbr of neighbours(g, node)) {
      if (nbr in parent) {
        skipped.push(nbr);
        continue;
      }
      parent[nbr] = node;
      frontier.push(nbr);
      added.push(nbr);
      if (earlyGoalTest && nbr === goal) {
        steps.push({
          current: node,
          note: `dequeue ${node}: generate ${added.join(", ")}; ${nbr} is the goal, stop on generation`,
          frontier: [...frontier],
          explored: [...explored],
          parent: { ...parent },
          path: pathTo(parent, nbr),
        });
        return steps;
      }
    }
    steps.push({
      current: node,
      note: `dequeue ${node}: enqueue ${added.length ? added.join(", ") : "nothing new"}${skipped.length ? ` (already reached: ${skipped.join(", ")})` : ""}`,
      frontier: [...frontier],
      explored: [...explored],
      parent: { ...parent },
    });
  }
  steps.push({ current: null, note: "frontier empty: no path", frontier: [], explored: [...explored], parent: { ...parent }, failed: true });
  return steps;
}

/**
 * DFS as in the lesson's Python: list as a stack, push neighbours in reverse alphabetical order so the
 * alphabetically first is popped first, skip nodes already explored when popped. Same order as recursive DFS.
 */
function dfs(g: SearchGraph, start: string, goal: string): SearchStep[] {
  const stack = [start];
  const parent: Record<string, string | null> = { [start]: null };
  const explored: string[] = [];
  const view = () => [...stack].reverse();
  const steps: SearchStep[] = [{ current: null, note: `start: stack = [${start}]`, frontier: view(), explored: [], parent: { ...parent } }];
  while (stack.length) {
    const node = stack.pop() as string;
    if (explored.includes(node)) {
      steps.push({ current: null, note: `pop ${node}: already explored, skip`, frontier: view(), explored: [...explored], parent: { ...parent } });
      continue;
    }
    explored.push(node);
    if (node === goal) {
      steps.push({ current: node, note: `pop ${node}: goal test passes, stop`, frontier: view(), explored: [...explored], parent: { ...parent }, path: pathTo(parent, node) });
      return steps;
    }
    const pushed: string[] = [];
    for (const nbr of [...neighbours(g, node)].reverse()) {
      if (explored.includes(nbr)) continue;
      parent[nbr] = node;
      stack.push(nbr);
      pushed.push(nbr);
    }
    steps.push({
      current: node,
      note: `pop ${node}: push ${pushed.length ? pushed.join(", ") : "nothing (dead end)"}${pushed.length > 1 ? ` (so ${pushed[pushed.length - 1]} is on top)` : ""}`,
      frontier: view(),
      explored: [...explored],
      parent: { ...parent },
    });
  }
  steps.push({ current: null, note: "stack empty: no path", frontier: [], explored: [...explored], parent: { ...parent }, failed: true });
  return steps;
}

export const STRATEGIES: Record<string, Strategy> = {
  bfs: { id: "bfs", label: "BFS", frontierName: "queue (FIFO)", run: bfs },
  dfs: { id: "dfs", label: "DFS", frontierName: "stack (LIFO)", run: (g, s, t) => dfs(g, s, t) },
};

export const GRAPHS: Record<string, SearchGraph> = {
  lab: {
    id: "lab",
    label: "Lab graph",
    height: 290,
    nodes: {
      A: { x: 60, y: 140 },
      B: { x: 200, y: 70 },
      C: { x: 200, y: 215 },
      D: { x: 350, y: 30 },
      E: { x: 350, y: 115 },
      G: { x: 350, y: 195 },
      F: { x: 350, y: 265 },
      H: { x: 520, y: 115 },
    },
    edges: [
      ["A", "B", 1],
      ["A", "C", 1],
      ["B", "D", 1],
      ["B", "E", 1],
      ["C", "F", 1],
      ["C", "G", 1],
      ["D", "H", 1],
      ["E", "H", 1],
      ["G", "H", 1],
    ],
    start: "A",
    goal: "G",
  },
  tree: {
    id: "tree",
    label: "Binary tree",
    height: 240,
    nodes: {
      A: { x: 320, y: 30 },
      B: { x: 170, y: 115 },
      C: { x: 470, y: 115 },
      D: { x: 90, y: 205 },
      E: { x: 250, y: 205 },
      F: { x: 390, y: 205 },
      G: { x: 550, y: 205 },
    },
    edges: [
      ["A", "B", 1],
      ["A", "C", 1],
      ["B", "D", 1],
      ["B", "E", 1],
      ["C", "F", 1],
      ["C", "G", 1],
    ],
    start: "A",
    goal: "F",
  },
  romania: {
    id: "romania",
    label: "Romania (AIMA)",
    height: 385,
    showCosts: true,
    nodes: {
      A: { x: 50, y: 125, name: "Arad", h: 366 },
      Z: { x: 80, y: 62, name: "Zerind", h: 374 },
      O: { x: 125, y: 20, name: "Oradea", h: 380 },
      T: { x: 55, y: 225, name: "Timisoara", h: 329 },
      L: { x: 170, y: 262, name: "Lugoj", h: 244 },
      M: { x: 175, y: 312, name: "Mehadia", h: 241 },
      D: { x: 165, y: 360, name: "Drobeta", h: 242 },
      S: { x: 225, y: 150, name: "Sibiu", h: 253, label: "above" },
      R: { x: 265, y: 215, name: "Rimnicu Vilcea", h: 193, label: "left" },
      F: { x: 370, y: 158, name: "Fagaras", h: 176 },
      P: { x: 385, y: 270, name: "Pitesti", h: 100 },
      C: { x: 320, y: 355, name: "Craiova", h: 160 },
      B: { x: 530, y: 300, name: "Bucharest", h: 0 },
      G: { x: 490, y: 360, name: "Giurgiu", h: 77 },
    },
    edges: [
      ["A", "Z", 75],
      ["A", "S", 140],
      ["A", "T", 118],
      ["Z", "O", 71],
      ["O", "S", 151],
      ["T", "L", 111],
      ["L", "M", 70],
      ["M", "D", 75],
      ["D", "C", 120],
      ["C", "R", 146],
      ["C", "P", 138],
      ["S", "F", 99],
      ["S", "R", 80],
      ["R", "P", 97],
      ["F", "B", 211],
      ["P", "B", 101],
      ["B", "G", 90],
    ],
    start: "A",
    goal: "B",
  },
  quiz: {
    id: "quiz",
    label: "Checkpoint graph",
    height: 240,
    hidden: true,
    nodes: {
      S: { x: 60, y: 120 },
      A: { x: 210, y: 50 },
      B: { x: 210, y: 190 },
      C: { x: 360, y: 20 },
      D: { x: 360, y: 120 },
      E: { x: 360, y: 215 },
      G: { x: 540, y: 120 },
    },
    edges: [
      ["S", "A", 1],
      ["S", "B", 1],
      ["A", "C", 1],
      ["A", "D", 1],
      ["B", "D", 1],
      ["B", "E", 1],
      ["D", "G", 1],
      ["E", "G", 1],
    ],
    start: "S",
    goal: "G",
  },
};
