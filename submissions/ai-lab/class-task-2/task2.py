# Task 2: insert books into a BST and print preorder and postorder

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


def preorder(root):
    if root is not None:
        print(root.data, end=" ")
        preorder(root.left)
        preorder(root.right)


def postorder(root):
    if root is not None:
        postorder(root.left)
        postorder(root.right)
        print(root.data, end=" ")


books = [50, 30, 70, 20, 40, 60, 80]

root = None
for b in books:
    root = insert(root, b)

print("Books:", books)
print("Preorder traversal:")
preorder(root)
print()
print("Postorder traversal:")
postorder(root)
print()
