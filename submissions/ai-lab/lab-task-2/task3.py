# Task 3: BFS on a city map to list all reachable intersections

city = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D", "E"],
    "D": ["B", "C", "F"],
    "E": ["C", "F"],
    "F": ["D", "E"],
}


def bfs(graph, start):
    visited = [start]
    queue = [start]
    while len(queue) > 0:
        node = queue.pop(0)
        print(node, end=" ")
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.append(neighbour)
                queue.append(neighbour)
    print()


print("Starting intersection: A")
print("Reachable intersections in BFS order:")
bfs(city, "A")
