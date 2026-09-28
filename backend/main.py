from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import ExpressionRequest, ExpressionResponse
from .validator import validate_expression
from .tokenizer import tokenize
from .converter import infix_to_postfix
from .evaluator import evaluate_postfix


app = FastAPI(
    title="Evaluating Arithmetic Expressions API",
    description=(
        "Stack-based arithmetic expression evaluator "
        "using infix-to-postfix conversion."
    ),
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


PSEUDOCODE = [
    "START",
    "Read the arithmetic expression",
    "Validate the expression",
    "Tokenize the expression",
    "Identify numbers and variables",
    "Optionally read values for variables",
    "Convert infix expression to postfix using a stack",
    "Scan postfix expression from left to right",
    "If token is a number, push it onto the stack",
    "If token is a variable, use its value if provided; otherwise keep it symbolically",
    "If token is an operator, pop two operands",
    "Apply the operator to the operands",
    "Push the result onto the stack",
    "After all tokens are processed, the stack contains the final result",
    "Display the result",
    "STOP",
]


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "Evaluating Arithmetic Expressions API",
    }


@app.get("/api/info")
def info():
    return {
        "project": "Evaluating Arithmetic Expressions",
        "algorithm": "Infix to Postfix + Stack Evaluation",
        "data_structure": "Stack",
        "operators": ["+", "-", "*", "/", "%", "^"],
        "time_complexity": "O(n)",
        "space_complexity": "O(n)",
        "mobile_supported": True,
        "supports_variables": True,
        "variable_values_optional": True,
    }


@app.post(
    "/api/evaluate",
    response_model=ExpressionResponse,
)
def evaluate_expression(
    request: ExpressionRequest,
):
    expression = request.expression.strip()

    valid, error_message = validate_expression(
        expression
    )

    if not valid:
        raise HTTPException(
            status_code=400,
            detail=error_message,
        )

    try:
        tokens = tokenize(expression)

        postfix = infix_to_postfix(tokens)

        result, steps = evaluate_postfix(
            postfix,
            request.variables,
        )

        return ExpressionResponse(
            success=True,
            expression=expression,
            variables=request.variables,
            tokens=tokens,
            postfix=postfix,
            result=result,
            steps=steps,
            pseudocode=PSEUDOCODE,
            time_complexity="O(n)",
            space_complexity="O(n)",
            message="Expression evaluated successfully.",
        )

    except ZeroDivisionError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {error}",
        )