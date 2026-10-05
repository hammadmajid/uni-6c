# Task 1: roll numbers in a BST, printed with inorder, preorder and postorder

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


roll_numbers = [45, 20, 60, 10, 30, 50, 70]

root = None
for r in roll_numbers:
    root = insert(root, r)

print("Roll numbers:", roll_numbers)
print("Inorder traversal:")
inorder(root)
print()
print("Preorder traversal:")
preorder(root)
print()
print("Postorder traversal:")
postorder(root)
print()
