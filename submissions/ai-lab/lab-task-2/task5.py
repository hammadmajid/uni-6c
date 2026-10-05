# Task 5: BFS to show the order in which users receive a post

friends = {
    "Hammad": ["Ahmed", "Fatima"],
    "Ahmed": ["Hammad", "Hassan"],
    "Fatima": ["Hammad", "Hassan", "Ayesha"],
    "Hassan": ["Ahmed", "Fatima", "Zain"],
    "Ayesha": ["Fatima"],
    "Zain": ["Hassan"],
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


print("Hammad created a post")
print("Order in which users receive it:")
bfs(friends, "Hammad")
