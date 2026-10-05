# Task 1: insert roll numbers into a BST and print inorder

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


def inorder(root):
    if root is not None:
        inorder(root.left)
        print(root.data, end=" ")
        inorder(root.right)


roll_numbers = [10, 5, 20, 3, 7, 30]

root = None
for r in roll_numbers:
    root = insert(root, r)

print("Roll numbers:", roll_numbers)
print("Inorder traversal:")
inorder(root)
print()
