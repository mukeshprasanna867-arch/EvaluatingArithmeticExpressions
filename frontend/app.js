const API_BASE = "http://127.0.0.1:8000";

const expressionInput = document.getElementById("expressionInput");
const evaluateButton = document.getElementById("evaluateButton");
const buttonText = document.getElementById("buttonText");

const variablesCard = document.getElementById("variablesCard");
const variablesContainer = document.getElementById("variablesContainer");

const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");

const resultSection = document.getElementById("resultSection");
const resultValue = document.getElementById("resultValue");
const resultExpression = document.getElementById("resultExpression");

const resultVariables = document.getElementById("resultVariables");
const resultVariablesList = document.getElementById("resultVariablesList");

const timeComplexity = document.getElementById("timeComplexity");
const spaceComplexity = document.getElementById("spaceComplexity");

const tokensContainer = document.getElementById("tokensContainer");
const infixOutput = document.getElementById("infixOutput");
const postfixOutput = document.getElementById("postfixOutput");
const stepsTableBody = document.getElementById("stepsTableBody");

const pseudocodeContainer = document.getElementById("pseudocodeContainer");
const apiStatus = document.getElementById("apiStatus");


/* =========================================================
   DETECT VARIABLES
========================================================= */

function detectVariables(expression) {

    const matches =
        expression.match(
            /[A-Za-z_][A-Za-z0-9_]*/g
        ) || [];

    const variables = [];

    matches.forEach(token => {

        if (
            !variables.includes(token) &&
            !isReservedWord(token)
        ) {
            variables.push(token);
        }

    });

    return variables;
}


function isReservedWord(token) {

    return [
        "true",
        "false",
        "null"
    ].includes(token.toLowerCase());

}


/* =========================================================
   RENDER OPTIONAL VARIABLE INPUTS
========================================================= */

function renderVariableInputs(variables) {

    variablesContainer.innerHTML = "";

    if (variables.length === 0) {

        variablesCard.classList.add("hidden");

        return;
    }

    variablesCard.classList.remove("hidden");

    variables.forEach(variable => {

        const item =
            document.createElement("div");

        item.className = "variable-symbol";

        item.innerHTML = `
            <div class="variable-name">
                ${escapeHTML(variable)}
            </div>

            <div class="variable-input-wrapper">
                <input
                    type="number"
                    step="any"
                    class="variable-input"
                    data-variable="${escapeHTML(variable)}"
                    placeholder="Optional"
                    aria-label="Value for ${escapeHTML(variable)}"
                >
            </div>
        `;

        variablesContainer.appendChild(item);

    });

}


/* =========================================================
   GET ONLY ENTERED VARIABLE VALUES
========================================================= */

function getVariableValues() {

    const values = {};

    const inputs =
        variablesContainer.querySelectorAll(
            ".variable-input"
        );

    inputs.forEach(input => {

        const name =
            input.dataset.variable;

        const rawValue =
            input.value.trim();

        /*
         * Empty values are intentionally ignored.
         * This makes variable values optional.
         */
        if (rawValue === "") {
            return;
        }

        const numericValue =
            Number(rawValue);

        if (!Number.isNaN(numericValue)) {
            values[name] = numericValue;
        }

    });

    return values;
}


/* =========================================================
   CHECK WHETHER ALL VARIABLES HAVE VALUES
========================================================= */

function allVariablesHaveValues(variables, values) {

    return variables.every(
        variable =>
            Object.prototype.hasOwnProperty.call(
                values,
                variable
            )
    );

}


/* =========================================================
   EXPRESSION INPUT
========================================================= */

expressionInput.addEventListener(
    "input",
    () => {

        const expression =
            expressionInput.value;

        const variables =
            detectVariables(expression);

        renderVariableInputs(
            variables
        );

        hideError();

    }
);


/* =========================================================
   EXAMPLE BUTTONS
========================================================= */

document
    .querySelectorAll(".example-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const expression =
                    button.dataset.expression;

                expressionInput.value =
                    expression;

                const variables =
                    detectVariables(
                        expression
                    );

                renderVariableInputs(
                    variables
                );

                /*
                 * If the HTML example contains
                 * default variable values,
                 * put them into the optional inputs.
                 */
                if (button.dataset.variables) {

                    try {

                        const defaults =
                            JSON.parse(
                                button.dataset.variables
                            );

                        Object.keys(defaults)
                            .forEach(variable => {

                                const input =
                                    variablesContainer.querySelector(
                                        `[data-variable="${CSS.escape(variable)}"]`
                                    );

                                if (input) {
                                    input.value =
                                        defaults[variable];
                                }

                            });

                    } catch (error) {

                        console.warn(
                            "Could not load example variables:",
                            error
                        );

                    }

                }

                hideError();

                expressionInput.focus();

            }
        );

    });


/* =========================================================
   EVALUATE BUTTON
========================================================= */

evaluateButton.addEventListener(
    "click",
    evaluateExpression
);


/* =========================================================
   ENTER KEY
========================================================= */

expressionInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            evaluateExpression();
        }

    }
);


/* =========================================================
   MAIN EVALUATION
========================================================= */

async function evaluateExpression() {

    hideError();

    const expression =
        expressionInput.value.trim();

    if (!expression) {

        showError(
            "Please enter an arithmetic expression."
        );

        return;
    }

    const variables =
        detectVariables(expression);

    const variableValues =
        getVariableValues();

    setLoading(true);

    try {

        /*
         * =====================================================
         * CASE 1:
         * No variables.
         *
         * Send directly to backend.
         * =====================================================
         */

        if (variables.length === 0) {

            await evaluateWithBackend(
                expression,
                variableValues
            );

            return;
        }


        /*
         * =====================================================
         * CASE 2:
         * Variables exist AND all values were entered.
         *
         * Send to backend for complete numeric evaluation.
         * =====================================================
         */

        if (
            allVariablesHaveValues(
                variables,
                variableValues
            )
        ) {

            await evaluateWithBackend(
                expression,
                variableValues
            );

            return;
        }


        /*
         * =====================================================
         * CASE 3:
         * Variables exist BUT one or more values are empty.
         *
         * Variable values are optional.
         *
         * We still calculate:
         *   - Tokens
         *   - Infix
         *   - Postfix
         *
         * The final numeric result is shown as
         * requiring variable values.
         * =====================================================
         */

        const tokens =
            tokenize(expression);

        const postfix =
            infixToPostfix(tokens);

        displaySymbolicResult(
            expression,
            tokens,
            postfix,
            variables,
            variableValues
        );

    } catch (error) {

        showError(
            error.message ||
            "Could not process the expression."
        );

    } finally {

        setLoading(false);

    }

}


/* =========================================================
   BACKEND EVALUATION
========================================================= */

async function evaluateWithBackend(
    expression,
    variables
) {

    const response =
        await fetch(
            `${API_BASE}/api/evaluate`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    expression: expression,
                    variables: variables
                })
            }
        );

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Unable to evaluate expression."
        );

    }

    displayResult(data);
}


/* =========================================================
   DISPLAY BACKEND RESULT
========================================================= */

function displayResult(data) {

    resultSection.classList.remove(
        "hidden"
    );

    resultValue.textContent =
        formatValue(data.result);

    resultExpression.textContent =
        data.expression || expressionInput.value;

    timeComplexity.textContent =
        data.time_complexity || "O(n)";

    spaceComplexity.textContent =
        data.space_complexity || "O(n)";

    displayVariables(
        data.variables || {}
    );

    displayTokens(
        data.tokens || []
    );

    displayInfix(
        data.expression ||
        expressionInput.value
    );

    displayPostfix(
        data.postfix || []
    );

    displaySteps(
        data.steps || []
    );

    displayPseudocode(
        data.pseudocode || createDefaultPseudocode()
    );

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   DISPLAY SYMBOLIC RESULT
   Used when variables are optional but not supplied.
========================================================= */

function displaySymbolicResult(
    expression,
    tokens,
    postfix,
    variables,
    suppliedValues
) {

    resultSection.classList.remove(
        "hidden"
    );

    /*
     * Instead of showing a fake numeric answer,
     * clearly explain that values are optional
     * for conversion but required for numeric evaluation.
     */
    const missingVariables =
        variables.filter(
            variable =>
                !Object.prototype.hasOwnProperty.call(
                    suppliedValues,
                    variable
                )
        );

    resultValue.textContent =
        "Values required";

    resultExpression.textContent =
        expression;

    timeComplexity.textContent =
        "O(n)";

    spaceComplexity.textContent =
        "O(n)";

    displayVariables(
        suppliedValues
    );

    displayTokens(
        tokens
    );

    displayInfix(
        expression
    );

    displayPostfix(
        postfix
    );

    /*
     * Show a useful symbolic stack trace.
     */
    displaySymbolicSteps(
        postfix
    );

    displayPseudocode(
        createDefaultPseudocode()
    );

    /*
     * Show a small informational message
     * without treating it as an error.
     */
    const message =
        `Postfix conversion completed. ` +
        `Enter values for ${missingVariables.join(", ")} ` +
        `if you want the final numeric result.`;

    resultValue.title = message;

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   RESULT VARIABLES
========================================================= */

function displayVariables(variables) {

    resultVariablesList.innerHTML = "";

    const names =
        Object.keys(variables);

    if (names.length === 0) {

        resultVariables.classList.add(
            "hidden"
        );

        return;
    }

    resultVariables.classList.remove(
        "hidden"
    );

    names.forEach(name => {

        const item =
            document.createElement("div");

        item.className =
            "result-variable-item";

        item.innerHTML = `
            <strong>
                ${escapeHTML(name)}
            </strong>

            <span>
                ${formatValue(
                    variables[name]
                )}
            </span>
        `;

        resultVariablesList.appendChild(
            item
        );

    });

}


/* =========================================================
   TOKENS
========================================================= */

function displayTokens(tokens) {

    tokensContainer.innerHTML = "";

    tokens.forEach(token => {

        const span =
            document.createElement("span");

        span.className =
            "token";

        if (
            ["+", "-", "*", "/", "%", "^"]
                .includes(token)
        ) {

            span.classList.add(
                "token-operator"
            );

        } else if (
            token === "(" ||
            token === ")"
        ) {

            span.classList.add(
                "token-parenthesis"
            );

        } else if (
            /^[A-Za-z_]/.test(token)
        ) {

            span.classList.add(
                "token-variable"
            );

        } else {

            span.classList.add(
                "token-number"
            );

        }

        span.textContent =
            token;

        tokensContainer.appendChild(
            span
        );

    });

}


/* =========================================================
   INFIX
========================================================= */

function displayInfix(expression) {

    infixOutput.textContent =
        expression || "-";

}


/* =========================================================
   POSTFIX
========================================================= */

function displayPostfix(postfix) {

    postfixOutput.textContent =
        postfix.length
            ? postfix.join(" ")
            : "-";

}


/* =========================================================
   BACKEND STACK STEPS
========================================================= */

function displaySteps(steps) {

    stepsTableBody.innerHTML = "";

    steps.forEach(step => {

        const row =
            document.createElement("tr");

        const stepCell =
            document.createElement("td");

        stepCell.textContent =
            step.step;

        const tokenCell =
            document.createElement("td");

        tokenCell.textContent =
            step.token;

        const operationCell =
            document.createElement("td");

        operationCell.textContent =
            step.operation;

        const stackCell =
            document.createElement("td");

        const stack =
            Array.isArray(step.stack)
                ? step.stack
                : [];

        stackCell.textContent =
            `[${stack.join(", ")}]`;

        row.appendChild(stepCell);
        row.appendChild(tokenCell);
        row.appendChild(operationCell);
        row.appendChild(stackCell);

        stepsTableBody.appendChild(
            row
        );

    });

}


/* =========================================================
   SYMBOLIC STACK STEPS
========================================================= */

function displaySymbolicSteps(postfix) {

    stepsTableBody.innerHTML = "";

    const stack = [];

    postfix.forEach(
        (token, index) => {

            let operation = "";
            let stackDisplay = "";

            if (isOperand(token)) {

                stack.push(token);

                operation =
                    `Push ${token}`;

            } else if (
                isOperator(token)
            ) {

                if (stack.length >= 2) {

                    const right =
                        stack.pop();

                    const left =
                        stack.pop();

                    const symbolic =
                        `${left} ${token} ${right}`;

                    stack.push(
                        `(${symbolic})`
                    );

                    operation =
                        `${symbolic}`;

                } else {

                    operation =
                        `Process operator ${token}`;

                }

            }

            stackDisplay =
                `[${stack.join(", ")}]`;

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${escapeHTML(token)}</td>
                <td>${escapeHTML(operation)}</td>
                <td>${escapeHTML(stackDisplay)}</td>
            `;

            stepsTableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   TOKENIZER
========================================================= */

function tokenize(expression) {

    const tokens = [];

    let i = 0;

    while (i < expression.length) {

        const char =
            expression[i];

        /*
         * Ignore spaces
         */
        if (/\s/.test(char)) {

            i++;

            continue;
        }


        /*
         * Number
         *
         * Supports:
         * 10
         * 10.5
         * .5
         * 10.5
         */
        if (
            /[0-9.]/.test(char)
        ) {

            let number = "";

            while (
                i < expression.length &&
                /[0-9.]/.test(
                    expression[i]
                )
            ) {

                number +=
                    expression[i];

                i++;

            }

            if (
                number === "." ||
                (number.match(/\./g) || []).length > 1
            ) {

                throw new Error(
                    `Invalid number: ${number}`
                );

            }

            tokens.push(number);

            continue;
        }


        /*
         * Variable
         */
        if (
            /[A-Za-z_]/.test(char)
        ) {

            let variable = "";

            while (
                i < expression.length &&
                /[A-Za-z0-9_]/.test(
                    expression[i]
                )
            ) {

                variable +=
                    expression[i];

                i++;

            }

            tokens.push(variable);

            continue;
        }


        /*
         * Operators and parentheses
         */
        if (
            "+-*/%^()".includes(char)
        ) {

            tokens.push(char);

            i++;

            continue;
        }


        throw new Error(
            `Invalid character: ${char}`
        );

    }

    return tokens;

}


/* =========================================================
   INFIX TO POSTFIX
========================================================= */

function infixToPostfix(tokens) {

    const output = [];
    const operators = [];

    const precedence = {
        "+": 1,
        "-": 1,
        "*": 2,
        "/": 2,
        "%": 2,
        "^": 3
    };

    const rightAssociative = {
        "^": true
    };

    tokens.forEach(token => {

        /*
         * Operand
         */
        if (isOperand(token)) {

            output.push(token);

            return;
        }


        /*
         * Left parenthesis
         */
        if (token === "(") {

            operators.push(token);

            return;
        }


        /*
         * Right parenthesis
         */
        if (token === ")") {

            while (
                operators.length &&
                operators[
                    operators.length - 1
                ] !== "("
            ) {

                output.push(
                    operators.pop()
                );

            }

            if (
                !operators.length
            ) {

                throw new Error(
                    "Mismatched parentheses."
                );

            }

            operators.pop();

            return;
        }


        /*
         * Operator
         */
        if (isOperator(token)) {

            while (
                operators.length &&
                operators[
                    operators.length - 1
                ] !== "(" &&
                (
                    precedence[
                        operators[
                            operators.length - 1
                        ]
                    ] > precedence[token]
                    ||
                    (
                        precedence[
                            operators[
                                operators.length - 1
                            ]
                        ] === precedence[token]
                        &&
                        !rightAssociative[token]
                    )
                )
            ) {

                output.push(
                    operators.pop()
                );

            }

            operators.push(token);

            return;
        }


        throw new Error(
            `Unknown token: ${token}`
        );

    });


    /*
     * Empty remaining operators
     */
    while (operators.length) {

        const operator =
            operators.pop();

        if (
            operator === "(" ||
            operator === ")"
        ) {

            throw new Error(
                "Mismatched parentheses."
            );

        }

        output.push(
            operator
        );

    }

    return output;

}


/* =========================================================
   OPERAND CHECK
========================================================= */

function isOperand(token) {

    return (
        /^-?\d+(\.\d+)?$/.test(token) ||
        /^[A-Za-z_][A-Za-z0-9_]*$/.test(token)
    );

}


/* =========================================================
   OPERATOR CHECK
========================================================= */

function isOperator(token) {

    return [
        "+",
        "-",
        "*",
        "/",
        "%",
        "^"
    ].includes(token);

}


/* =========================================================
   PSEUDOCODE
========================================================= */

function displayPseudocode(lines) {

    pseudocodeContainer.innerHTML = "";

    lines.forEach(
        (line, index) => {

            const row =
                document.createElement("div");

            row.className =
                "pseudo-line";

            const number =
                document.createElement("span");

            number.className =
                "pseudo-number";

            number.textContent =
                index + 1;

            const text =
                document.createElement("span");

            text.className =
                "pseudo-text";

            text.textContent =
                line;

            row.appendChild(number);
            row.appendChild(text);

            pseudocodeContainer.appendChild(
                row
            );

        }
    );

}


function createDefaultPseudocode() {

    return [
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
        "STOP"
    ];

}


/* =========================================================
   FORMAT VALUE
========================================================= */

function formatValue(value) {

    if (
        typeof value === "number" &&
        Number.isInteger(value)
    ) {

        return String(value);

    }

    return String(value);

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    errorMessage.textContent =
        message;

    errorBox.classList.remove(
        "hidden"
    );

    resultSection.classList.add(
        "hidden"
    );

}


function hideError() {

    errorBox.classList.add(
        "hidden"
    );

}


/* =========================================================
   LOADING
========================================================= */

function setLoading(isLoading) {

    evaluateButton.disabled =
        isLoading;

    buttonText.textContent =
        isLoading
            ? "Evaluating..."
            : "Evaluate";

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   API STATUS
========================================================= */

async function checkAPI() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/health`
            );

        if (!response.ok) {
            throw new Error();
        }

        apiStatus.innerHTML = `
            <span class="status-dot online"></span>
            API Online
        `;

        apiStatus.classList.add(
            "online-status"
        );

    } catch {

        apiStatus.innerHTML = `
            <span class="status-dot offline"></span>
            API Offline
        `;

        apiStatus.classList.remove(
            "online-status"
        );

    }

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkAPI();

        renderVariableInputs([]);

    }
);