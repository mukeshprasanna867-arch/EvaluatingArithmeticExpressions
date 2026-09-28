# Complexity Analysis

## Evaluating Arithmetic Expressions

Let `n` represent the number of tokens in the input expression.

---

## 1. Validation Complexity

The expression is scanned to check:

- Empty input
- Unsupported characters
- Parentheses
- Expression length

Each character is examined at most a constant number of times.

Therefore:

```text
Time Complexity = O(n)