const API_BASE = "http://127.0.0.1:8000";


const expressionInput =
    document.getElementById("expressionInput");

const evaluateButton =
    document.getElementById("evaluateButton");

const buttonText =
    document.getElementById("buttonText");

const variablesCard =
    document.getElementById("variablesCard");

const variablesContainer =
    document.getElementById("variablesContainer");

const errorBox =
    document.getElementById("errorBox");

const errorMessage =
    document.getElementById("errorMessage");

const resultSection =
    document.getElementById("resultSection");

const resultValue =
    document.getElementById("resultValue");

const resultExpression =
    document.getElementById("resultExpression");

const resultVariables =
    document.getElementById("resultVariables");

const resultVariablesList =
    document.getElementById("resultVariablesList");

const timeComplexity =
    document.getElementById("timeComplexity");

const spaceComplexity =
    document.getElementById("spaceComplexity");

const tokensContainer =
    document.getElementById("tokensContainer");

const infixOutput =
    document.getElementById("infixOutput");

const postfixOutput =
    document.getElementById("postfixOutput");

const stepsTableBody =
    document.getElementById("stepsTableBody");

const pseudocodeContainer =
    document.getElementById("pseudocodeContainer");

const apiStatus =
    document.getElementById("apiStatus");


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

        if (!variables.includes(token)) {
            variables.push(token);
        }

    });

    return variables;
}


/* =========================================================
   SHOW DETECTED VARIABLES
========================================================= */

function renderVariableInputs(variables) {

    variablesContainer.innerHTML = "";


    if (variables.length === 0) {

        variablesCard.classList.add(
            "hidden"
        );

        return;
    }


    variablesCard.classList.remove(
        "hidden"
    );


    variables.forEach(variable => {

        const item =
            document.createElement("div");

        item.className =
            "variable-symbol";


        item.innerHTML =
            `
                <span class="variable-name">
                    ${variable}
                </span>

                <span class="variable-optional">
                    Value optional
                </span>
            `;


        variablesContainer.appendChild(
            item
        );

    });

}


/* =========================================================
   GET OPTIONAL VARIABLES
========================================================= */

function getVariableValues() {

    return {};
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

                hideError();

                expressionInput.focus();

            }
        );

    });


/* =========================================================
   EVALUATE
========================================================= */

evaluateButton.addEventListener(
    "click",
    evaluateExpression
);


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


    setLoading(true);


    try {

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

                        variables: {}
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to evaluate expression."
            );

        }


        displayResult(data);


    } catch (error) {

        showError(
            error.message ||
            "Could not connect to backend."
        );


    } finally {

        setLoading(false);

    }

}


/* =========================================================
   DISPLAY RESULT
========================================================= */

function displayResult(data) {

    resultSection.classList.remove(
        "hidden"
    );


    resultValue.textContent =
        formatValue(data.result);


    resultExpression.textContent =
        data.expression;


    timeComplexity.textContent =
        data.time_complexity;


    spaceComplexity.textContent =
        data.space_complexity;


    displayVariables(
        data.variables || {}
    );


    displayTokens(
        data.tokens || []
    );


    displayInfix(
        data.expression
    );


    displayPostfix(
        data.postfix || []
    );


    displaySteps(
        data.steps || []
    );


    displayPseudocode(
        data.pseudocode || []
    );


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   VARIABLES RESULT
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


        item.innerHTML =
            `
                <strong>${name}</strong>
                <span>${formatValue(
                    variables[name]
                )}</span>
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
   STACK STEPS
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


        apiStatus.innerHTML =
            `
                <span class="status-dot online"></span>
                API Online
            `;

        apiStatus.classList.add(
            "online-status"
        );


    } catch {

        apiStatus.innerHTML =
            `
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