# Task 4: BFS on a company hierarchy, CEO down to staff

company = {
    "CEO": ["Manager 1", "Manager 2"],
    "Manager 1": ["Staff 1", "Staff 2"],
    "Manager 2": ["Staff 3", "Staff 4"],
    "Staff 1": [],
    "Staff 2": [],
    "Staff 3": [],
    "Staff 4": [],
}


def bfs(tree, start):
    queue = [start]
    while len(queue) > 0:
        employee = queue.pop(0)
        print(employee)
        for junior in tree[employee]:
            queue.append(junior)


print("Employee hierarchy level by level:")
bfs(company, "CEO")
