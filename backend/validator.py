import re

OPERATORS = {"+", "-", "*", "/", "%", "^"}

OPENING = "("
CLOSING = ")"

# Allowed variable names:
# a, b, x, y, total, price, value1, etc.
VARIABLE_PATTERN = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


def is_variable(token: str):
    """Return True when token is a valid variable name."""

    return bool(VARIABLE_PATTERN.fullmatch(token))


def validate_expression(expression: str):
    """
    Validate an arithmetic expression.

    Supports:
        Numbers
        Decimal numbers
        Variables
        + - * / % ^
        Parentheses

    Returns:
        (True, "") when valid
        (False, error_message) when invalid
    """

    if expression is None:
        return False, "Expression cannot be empty."

    expression = expression.strip()

    if not expression:
        return False, "Expression cannot be empty."

    if len(expression) > 500:
        return False, "Expression is too long. Maximum length is 500 characters."

    # Allowed characters:
    # letters, digits, underscore, operators, decimal point,
    # parentheses and spaces.
    allowed_pattern = r"^[A-Za-z0-9_+\-*/%^().\s]+$"

    if not re.fullmatch(allowed_pattern, expression):
        return False, "Expression contains unsupported characters."

    balance = 0

    for char in expression:

        if char == "(":
            balance += 1

        elif char == ")":
            balance -= 1

            if balance < 0:
                return False, (
                    "Closing parenthesis appears before "
                    "opening parenthesis."
                )

    if balance != 0:
        return False, "Parentheses are not balanced."

    return True, ""