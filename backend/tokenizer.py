import re


TOKEN_PATTERN = re.compile(
    r"""
    \d+(?:\.\d+)?
    |
    [A-Za-z_][A-Za-z0-9_]*
    |
    [+\-*/%^()]
    """,
    re.VERBOSE,
)


def tokenize(expression: str):
    """
    Convert an arithmetic expression into tokens.

    Supported:
        Numbers
        Decimal numbers
        Variables
        + - * / % ^
        Parentheses

    Examples:

        10 + 5
        -> ["10", "+", "5"]

        (x + y) * 2
        -> ["(", "x", "+", "y", ")", "*", "2"]

        10 20
        -> ["10", "20"]

    Whitespace is ignored as a separator,
    but it is NOT removed before tokenization.
    """

    if expression is None:
        raise ValueError(
            "Expression cannot be empty."
        )

    expression = expression.strip()

    if not expression:
        raise ValueError(
            "Expression cannot be empty."
        )

    tokens = []

    position = 0

    while position < len(expression):

        # -----------------------------------------------------
        # Ignore whitespace
        # -----------------------------------------------------

        if expression[position].isspace():
            position += 1
            continue

        remaining = expression[position:]

        match = TOKEN_PATTERN.match(
            remaining
        )

        if not match:
            raise ValueError(
                f"Invalid token near: "
                f"'{remaining[:10]}'"
            )

        token = match.group(0)

        tokens.append(token)

        position += len(token)

    if not tokens:
        raise ValueError(
            "Expression cannot be empty."
        )

    return tokens