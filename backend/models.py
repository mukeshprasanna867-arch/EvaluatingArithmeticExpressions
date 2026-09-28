from pydantic import BaseModel, Field


class ExpressionRequest(BaseModel):
    expression: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Arithmetic expression to evaluate"
    )

    variables: dict[str, float] = Field(
        default_factory=dict,
        description="Optional variable values"
    )


class ExpressionResponse(BaseModel):
    success: bool

    expression: str

    variables: dict[str, float]

    tokens: list[str]

    postfix: list[str]

    # Can be:
    #   30
    #   30.5
    #   "((x + y) * 2)"
    result: int | float | str | None

    steps: list[dict]

    pseudocode: list[str]

    time_complexity: str

    space_complexity: str

    message: str