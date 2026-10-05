# Task 4: BFS on a company hierarchy

company = {
    "CEO": ["Manager 1", "Manager 2"],
    "Manager 1": ["Team Lead 1", "Team Lead 2"],
    "Manager 2": ["Team Lead 3", "Team Lead 4"],
    "Team Lead 1": [],
    "Team Lead 2": [],
    "Team Lead 3": [],
    "Team Lead 4": [],
}


def bfs(tree, start):
    queue = [start]
    while len(queue) > 0:
        employee = queue.pop(0)
        print(employee)
        for junior in tree[employee]:
            queue.append(junior)


print("Employees level by level:")
bfs(company, "CEO")
