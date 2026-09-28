import unittest

from backend.tokenizer import tokenize
from backend.converter import infix_to_postfix
from backend.evaluator import evaluate_postfix


class TestArithmeticEngine(unittest.TestCase):

    # =========================================================
    # BASIC ARITHMETIC
    # =========================================================

    def test_basic_addition(self):
        tokens = tokenize("10 + 5")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 15)

    def test_basic_subtraction(self):
        tokens = tokenize("20 - 8")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 12)

    def test_basic_multiplication(self):
        tokens = tokenize("6 * 7")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 42)

    def test_basic_division(self):
        tokens = tokenize("20 / 4")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 5)

    def test_modulo(self):
        tokens = tokenize("20 % 6")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 2)

    def test_power(self):
        tokens = tokenize("2 ^ 3")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 8)

    # =========================================================
    # OPERATOR PRECEDENCE
    # =========================================================

    def test_multiplication_before_addition(self):
        tokens = tokenize("10 + 5 * 2")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 20)

    def test_division_before_addition(self):
        tokens = tokenize("100 / 5 + 6")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 26)

    def test_multiple_operators(self):
        tokens = tokenize("10 + 5 * 2 - 8 / 4")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 18)

    def test_power_precedence(self):
        tokens = tokenize("2 + 3 ^ 2")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 11)

    def test_operator_precedence_with_modulo(self):
        tokens = tokenize("10 + 20 % 6")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 12)

    # =========================================================
    # PARENTHESES
    # =========================================================

    def test_simple_parentheses(self):
        tokens = tokenize("(10 + 5) * 3")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 45)

    def test_nested_parentheses(self):
        tokens = tokenize("((10 + 5) * 2)")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 30)

    def test_complex_parentheses(self):
        tokens = tokenize("(10 + 5) * 3 - (8 / 2)")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 41)

    def test_multiple_parentheses(self):
        tokens = tokenize("(10 + 5) * (6 - 2)")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 60)

    # =========================================================
    # DECIMAL EXPRESSIONS
    # =========================================================

    def test_decimal_addition(self):
        tokens = tokenize("10.5 + 2.5")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 13)

    def test_decimal_multiplication(self):
        tokens = tokenize("2.5 * 4")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 10)

    def test_decimal_expression(self):
        tokens = tokenize("(2.5 + 1.5) * 3")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 12)

    def test_decimal_division(self):
        tokens = tokenize("7.5 / 2.5")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(postfix)

        self.assertEqual(result, 3)

    # =========================================================
    # VARIABLE EXPRESSIONS
    # =========================================================

    def test_single_variable(self):
        tokens = tokenize("x + 5")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(
            postfix,
            {"x": 10}
        )

        self.assertEqual(result, 15)

    def test_multiple_variables(self):
        tokens = tokenize("x + y")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(
            postfix,
            {
                "x": 10,
                "y": 5
            }
        )

        self.assertEqual(result, 15)

    def test_variable_with_parentheses(self):
        tokens = tokenize("(x + y) * 2")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(
            postfix,
            {
                "x": 10,
                "y": 5
            }
        )

        self.assertEqual(result, 30)

    def test_symbolic_expression(self):
        tokens = tokenize("(x + y) * 2")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(
            postfix,
            {}
        )

        self.assertEqual(
            result,
            "((x + y) * 2)"
        )

    def test_variable_precedence(self):
        tokens = tokenize("a + b * c")
        postfix = infix_to_postfix(tokens)

        self.assertEqual(
            postfix,
            [
                "a",
                "b",
                "c",
                "*",
                "+"
            ]
        )

    def test_variable_power(self):
        tokens = tokenize("x ^ 2")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(
            postfix,
            {"x": 3}
        )

        self.assertEqual(result, 9)

    # =========================================================
    # POSTFIX CONVERSION
    # =========================================================

    def test_postfix_basic(self):
        tokens = tokenize("10 + 5")
        postfix = infix_to_postfix(tokens)

        self.assertEqual(
            postfix,
            [
                "10",
                "5",
                "+"
            ]
        )

    def test_postfix_precedence(self):
        tokens = tokenize("10 + 5 * 2")
        postfix = infix_to_postfix(tokens)

        self.assertEqual(
            postfix,
            [
                "10",
                "5",
                "2",
                "*",
                "+"
            ]
        )

    def test_postfix_parentheses(self):
        tokens = tokenize("(10 + 5) * 2")
        postfix = infix_to_postfix(tokens)

        self.assertEqual(
            postfix,
            [
                "10",
                "5",
                "+",
                "2",
                "*"
            ]
        )

    def test_postfix_variables(self):
        tokens = tokenize("(x + y) * 2")
        postfix = infix_to_postfix(tokens)

        self.assertEqual(
            postfix,
            [
                "x",
                "y",
                "+",
                "2",
                "*"
            ]
        )

    # =========================================================
    # FAULT / INVALID CASES
    # =========================================================

    def test_division_by_zero(self):
        tokens = tokenize("10 / 0")
        postfix = infix_to_postfix(tokens)

        with self.assertRaises(ZeroDivisionError):
            evaluate_postfix(postfix)

    def test_modulo_by_zero(self):
        tokens = tokenize("10 % 0")
        postfix = infix_to_postfix(tokens)

        with self.assertRaises(ZeroDivisionError):
            evaluate_postfix(postfix)

    def test_unbalanced_parentheses(self):
        tokens = tokenize("(10 + 5")

        with self.assertRaises(ValueError):
            infix_to_postfix(tokens)

    def test_extra_closing_parenthesis(self):
        tokens = tokenize("10 + 5)")

        with self.assertRaises(ValueError):
            infix_to_postfix(tokens)

    def test_invalid_operator_expression(self):
        tokens = tokenize("10 + * 5")

        with self.assertRaises(ValueError):
            infix_to_postfix(tokens)

    def test_missing_operand(self):
        tokens = tokenize("10 +")

        with self.assertRaises(ValueError):
            infix_to_postfix(tokens)

    def test_extra_operand(self):
        tokens = tokenize("10 20")

        with self.assertRaises(ValueError):
            infix_to_postfix(tokens)

    def test_two_variables_without_operator(self):
        tokens = tokenize("x y")

        with self.assertRaises(ValueError):
            infix_to_postfix(tokens)

    def test_two_numbers_without_operator(self):
        tokens = tokenize("25 30")

        with self.assertRaises(ValueError):
            infix_to_postfix(tokens)

    def test_operator_at_start(self):
        tokens = tokenize("* 10")

        with self.assertRaises(ValueError):
            infix_to_postfix(tokens)

    def test_multiple_operators(self):
        tokens = tokenize("10 + * 5")

        with self.assertRaises(ValueError):
            infix_to_postfix(tokens)

    # =========================================================
    # SYMBOLIC EXPRESSIONS WITHOUT VALUES
    # =========================================================

    def test_unknown_variable_value_not_required(self):
        tokens = tokenize("x + y")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(
            postfix,
            {}
        )

        self.assertEqual(
            result,
            "(x + y)"
        )

    def test_symbolic_multiplication(self):
        tokens = tokenize("x * y")
        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(
            postfix,
            {}
        )

        self.assertEqual(
            result,
            "(x * y)"
        )

    def test_symbolic_complex_expression(self):
        tokens = tokenize(
            "(x + y) * 2 - z"
        )

        postfix = infix_to_postfix(tokens)

        result, _ = evaluate_postfix(
            postfix,
            {}
        )

        self.assertEqual(
            result,
            "(((x + y) * 2) - z)"
        )


if __name__ == "__main__":
    unittest.main(
        verbosity=2
    )