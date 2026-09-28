import unittest

from backend.validator import validate_expression


class TestExpressionValidator(unittest.TestCase):

    # =========================================================
    # VALID EXPRESSIONS
    # =========================================================

    def test_valid_addition(self):
        valid, message = validate_expression("10 + 5")

        self.assertTrue(valid)
        self.assertEqual(message, "")

    def test_valid_multiplication(self):
        valid, message = validate_expression("10 * 5")

        self.assertTrue(valid)
        self.assertEqual(message, "")

    def test_valid_decimal(self):
        valid, message = validate_expression(
            "10.5 + 2.5"
        )

        self.assertTrue(valid)
        self.assertEqual(message, "")

    def test_valid_parentheses(self):
        valid, message = validate_expression(
            "(10 + 5) * 2"
        )

        self.assertTrue(valid)
        self.assertEqual(message, "")

    def test_valid_nested_parentheses(self):
        valid, message = validate_expression(
            "((10 + 5) * 2)"
        )

        self.assertTrue(valid)
        self.assertEqual(message, "")

    def test_valid_variables(self):
        valid, message = validate_expression(
            "(x + y) * 2"
        )

        self.assertTrue(valid)
        self.assertEqual(message, "")

    def test_valid_variable_with_underscore(self):
        valid, message = validate_expression(
            "total_value + 10"
        )

        self.assertTrue(valid)
        self.assertEqual(message, "")

    def test_valid_all_operators(self):
        valid, message = validate_expression(
            "10 + 5 - 2 * 3 / 2 % 4 ^ 2"
        )

        self.assertTrue(valid)
        self.assertEqual(message, "")

    # =========================================================
    # EMPTY INPUT
    # =========================================================

    def test_empty_expression(self):
        valid, message = validate_expression("")

        self.assertFalse(valid)
        self.assertIn(
            "empty",
            message.lower()
        )

    def test_whitespace_expression(self):
        valid, message = validate_expression("   ")

        self.assertFalse(valid)
        self.assertIn(
            "empty",
            message.lower()
        )

    def test_none_expression(self):
        valid, message = validate_expression(None)

        self.assertFalse(valid)
        self.assertIn(
            "empty",
            message.lower()
        )

    # =========================================================
    # INVALID CHARACTERS
    # =========================================================

    def test_unsupported_character(self):
        valid, message = validate_expression(
            "10 + 5 @ 2"
        )

        self.assertFalse(valid)
        self.assertIn(
            "unsupported",
            message.lower()
        )

    def test_invalid_dollar_character(self):
        valid, message = validate_expression(
            "10 $ 5"
        )

        self.assertFalse(valid)
        self.assertIn(
            "unsupported",
            message.lower()
        )

    def test_invalid_hash_character(self):
        valid, message = validate_expression(
            "10 # 5"
        )

        self.assertFalse(valid)
        self.assertIn(
            "unsupported",
            message.lower()
        )

    # =========================================================
    # PARENTHESES
    # =========================================================

    def test_unbalanced_open_parenthesis(self):
        valid, message = validate_expression(
            "(10 + 5"
        )

        self.assertFalse(valid)
        self.assertIn(
            "parentheses",
            message.lower()
        )

    def test_unbalanced_close_parenthesis(self):
        valid, message = validate_expression(
            "10 + 5)"
        )

        self.assertFalse(valid)

    def test_parenthesis_order(self):
        valid, message = validate_expression(
            ")10 + 5("
        )

        self.assertFalse(valid)

    # =========================================================
    # LENGTH LIMIT
    # =========================================================

    def test_expression_at_limit(self):
        expression = "1" * 500

        valid, message = validate_expression(
            expression
        )

        self.assertTrue(valid)
        self.assertEqual(message, "")

    def test_expression_over_limit(self):
        expression = "1" * 501

        valid, message = validate_expression(
            expression
        )

        self.assertFalse(valid)
        self.assertIn(
            "500",
            message
        )

    # =========================================================
    # VARIABLE NAMES
    # =========================================================

    def test_variable_with_numbers(self):
        valid, message = validate_expression(
            "value1 + value2"
        )

        self.assertTrue(valid)
        self.assertEqual(message, "")

    def test_variable_with_underscore(self):
        valid, message = validate_expression(
            "_value + 10"
        )

        self.assertTrue(valid)
        self.assertEqual(message, "")

    # =========================================================
    # SPACES
    # =========================================================

    def test_expression_with_spaces(self):
        valid, message = validate_expression(
            "  10 + 5 * 2  "
        )

        self.assertTrue(valid)
        self.assertEqual(message, "")

    def test_expression_without_spaces(self):
        valid, message = validate_expression(
            "10+5*2"
        )

        self.assertTrue(valid)
        self.assertEqual(message, "")


if __name__ == "__main__":
    unittest.main(
        verbosity=2
    )