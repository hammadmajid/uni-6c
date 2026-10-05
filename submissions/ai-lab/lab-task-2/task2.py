# Task 2: book IDs in a BST, displayed with BFS (level order)

class Node:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None


def insert(root, data):
    if root is None:
        return Node(data)
    if data < root.data:
        root.left = insert(root.left, data)
    else:
        root.right = insert(root.right, data)
    return root


def bfs(root):
    queue = [root]
    while len(queue) > 0:
        node = queue.pop(0)
        print(node.data, end=" ")
        if node.left is not None:
            queue.append(node.left)
        if node.right is not None:
            queue.append(node.right)
    print()


book_ids = [500, 300, 700, 200, 400, 600, 800]

root = None
for b in book_ids:
    root = insert(root, b)

print("Book IDs:", book_ids)
print("BFS traversal:")
bfs(root)
