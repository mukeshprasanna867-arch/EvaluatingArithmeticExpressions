from .stack import Stack


PRECEDENCE = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "%": 2,
    "^": 3,
}


RIGHT_ASSOCIATIVE = {"^"}


def is_operator(token):
    return token in PRECEDENCE


def is_number(token):
    try:
        float(token)
        return True
    except (ValueError, TypeError):
        return False


def is_variable(token):
    if not token:
        return False

    if not (token[0].isalpha() or token[0] == "_"):
        return False

    return all(
        char.isalnum() or char == "_"
        for char in token
    )


def is_operand(token):
    return (
        is_number(token)
        or is_variable(token)
    )


def infix_to_postfix(tokens):
    """
    Convert an infix expression to postfix notation.

    Supported:
        Numbers
        Decimals
        Variables
        + - * / % ^
        Parentheses

    Example:
        10 + 5 * 2
        ->
        10 5 2 * +
    """

    if not tokens:
        raise ValueError(
            "Expression cannot be empty."
        )

    output = []
    operators = Stack()

    # True  = expecting number/variable/(
    # False = expecting operator/)
    expecting_operand = True

    for token in tokens:

        # =====================================================
        # NUMBER OR VARIABLE
        # =====================================================

        if is_operand(token):

            # Example:
            # 10 20
            # x y
            # 10 x
            if not expecting_operand:
                raise ValueError(
                    f"Missing operator before '{token}'."
                )

            output.append(token)

            expecting_operand = False

        # =====================================================
        # OPENING PARENTHESIS
        # =====================================================

        elif token == "(":

            # Example:
            # 10(20 + 5)
            if not expecting_operand:
                raise ValueError(
                    "Missing operator before '('."
                )

            operators.push(token)

            expecting_operand = True

        # =====================================================
        # CLOSING PARENTHESIS
        # =====================================================

        elif token == ")":

            # Example:
            # (10 + )
            if expecting_operand:
                raise ValueError(
                    "Missing operand before ')'."
                )

            while (
                not operators.is_empty()
                and operators.peek() != "("
            ):
                output.append(
                    operators.pop()
                )

            if operators.is_empty():
                raise ValueError(
                    "Mismatched parentheses."
                )

            # Remove '('
            operators.pop()

            expecting_operand = False

        # =====================================================
        # OPERATOR
        # =====================================================

        elif is_operator(token):

            # Example:
            # + 10
            # 10 + * 5
            # 10 * / 5
            if expecting_operand:
                raise ValueError(
                    f"Operator '{token}' "
                    "cannot appear here."
                )

            while (
                not operators.is_empty()
                and operators.peek() != "("
                and (
                    PRECEDENCE[
                        operators.peek()
                    ] > PRECEDENCE[token]
                    or (
                        PRECEDENCE[
                            operators.peek()
                        ]
                        == PRECEDENCE[token]
                        and token
                        not in RIGHT_ASSOCIATIVE
                    )
                )
            ):
                output.append(
                    operators.pop()
                )

            operators.push(token)

            expecting_operand = True

        # =====================================================
        # UNKNOWN TOKEN
        # =====================================================

        else:
            raise ValueError(
                f"Unknown token: {token}"
            )

    # =========================================================
    # EXPRESSION CANNOT END WITH OPERATOR
    # =========================================================

    if expecting_operand:
        raise ValueError(
            "Expression cannot end with an operator."
        )

    # =========================================================
    # EMPTY / UNBALANCED PARENTHESES
    # =========================================================

    while not operators.is_empty():

        if operators.peek() == "(":
            raise ValueError(
                "Mismatched parentheses."
            )

        output.append(
            operators.pop()
        )

    return output