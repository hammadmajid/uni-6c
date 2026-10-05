# Task 5: BFS to show how a post spreads on social media

friends = {
    "Ali": ["Sara", "Bilal"],
    "Sara": ["Ali", "Hina", "Usman"],
    "Bilal": ["Ali", "Usman", "Zara"],
    "Hina": ["Sara", "Omar"],
    "Usman": ["Sara", "Bilal"],
    "Zara": ["Bilal", "Omar"],
    "Omar": ["Hina", "Zara"],
}


def bfs(graph, start):
    visited = [start]
    queue = [start]
    while len(queue) > 0:
        user = queue.pop(0)
        if user != start:
            print(user, "received the post")
        for friend in graph[user]:
            if friend not in visited:
                visited.append(friend)
                queue.append(friend)


print("Ali created a post")
print("Order in which users receive it:")
bfs(friends, "Ali")
