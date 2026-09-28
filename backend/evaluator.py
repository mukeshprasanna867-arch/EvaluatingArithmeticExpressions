from .stack import Stack

OPERATORS = {
    "+",
    "-",
    "*",
    "/",
    "%",
    "^",
}


def format_number(value):
    if isinstance(value, float) and value.is_integer():
        return int(value)

    return value


def apply_operator(operator, left, right):
    if operator == "+":
        return left + right

    if operator == "-":
        return left - right

    if operator == "*":
        return left * right

    if operator == "/":
        if right == 0:
            raise ZeroDivisionError(
                "Division by zero is not allowed."
            )

        return left / right

    if operator == "%":
        if right == 0:
            raise ZeroDivisionError(
                "Modulo by zero is not allowed."
            )

        return left % right

    if operator == "^":
        return left ** right

    raise ValueError(
        f"Unsupported operator: {operator}"
    )


def is_number(token):
    try:
        float(token)
        return True
    except (ValueError, TypeError):
        return False


def evaluate_postfix(
    postfix_tokens,
    variables=None
):
    """
    Evaluate postfix expression.

    Variables are optional.

    If variable values are supplied:
        (x + y) * 2
        x=10, y=5
        -> 30

    If variable values are not supplied:
        (x + y) * 2
        -> symbolic result
           ((x + y) * 2)
    """

    if variables is None:
        variables = {}

    stack = Stack()
    steps = []

    for index, token in enumerate(
        postfix_tokens,
        start=1
    ):

        # -------------------------
        # OPERATOR
        # -------------------------
        if token in OPERATORS:

            if stack.size() < 2:
                raise ValueError(
                    f"Insufficient operands for "
                    f"operator '{token}'."
                )

            right = stack.pop()
            left = stack.pop()

            # Both operands are numeric
            if (
                isinstance(left, (int, float))
                and isinstance(right, (int, float))
            ):

                result = apply_operator(
                    token,
                    left,
                    right
                )

                operation = (
                    f"{format_number(left)} "
                    f"{token} "
                    f"{format_number(right)} "
                    f"= "
                    f"{format_number(result)}"
                )

            else:

                # Symbolic expression
                result = (
                    f"({left} {token} {right})"
                )

                operation = (
                    f"Build "
                    f"({left} {token} {right})"
                )

            stack.push(result)

            steps.append({
                "step": index,
                "token": token,
                "operation": operation,
                "stack": [
                    format_number(x)
                    for x in stack.to_list()
                ],
            })

            continue


        # -------------------------
        # VARIABLE WITH VALUE
        # -------------------------
        if token in variables:

            value = variables[token]

            stack.push(value)

            steps.append({
                "step": index,
                "token": token,
                "operation": (
                    f"Push {token} = "
                    f"{format_number(value)}"
                ),
                "stack": [
                    format_number(x)
                    for x in stack.to_list()
                ],
            })

            continue


        # -------------------------
        # NUMBER
        # -------------------------
        if is_number(token):

            value = float(token)

            value = format_number(value)

            stack.push(value)

            steps.append({
                "step": index,
                "token": token,
                "operation": (
                    f"Push {token}"
                ),
                "stack": [
                    format_number(x)
                    for x in stack.to_list()
                ],
            })

            continue


        # -------------------------
        # VARIABLE WITHOUT VALUE
        # -------------------------
        stack.push(token)

        steps.append({
            "step": index,
            "token": token,
            "operation": (
                f"Push variable {token}"
            ),
            "stack": [
                format_number(x)
                for x in stack.to_list()
            ],
        })


    if stack.size() != 1:
        raise ValueError(
            "Invalid expression."
        )


    final_result = stack.pop()

    return (
        format_number(final_result),
        steps
    )