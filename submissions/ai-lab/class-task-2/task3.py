# Task 3: BFS on a city road network

city = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F", "G"],
    "F": ["C", "E"],
    "G": ["E"],
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
print("BFS traversal of intersections:")
bfs(city, "A")
