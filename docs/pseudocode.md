# Pseudocode

## Evaluating Arithmetic Expressions

START

1. Read the arithmetic expression from the user.

2. Validate the expression.

3. IF the expression is empty
       Display "Expression cannot be empty."
       STOP
   END IF

4. Check the expression for unsupported characters.

5. Check whether parentheses are balanced.

6. Tokenize the expression into:
       - Numbers
       - Decimal numbers
       - Variables
       - Operators
       - Parentheses

7. Convert the infix expression to postfix notation
   using a stack.

8. Read the postfix expression from left to right.

9. IF the token is a number
       Push the number onto the evaluation stack.
   END IF

10. IF the token is a variable
        IF a value is provided for the variable
            Push the variable value onto the stack.
        ELSE
            Push the variable symbolically.
        END IF
    END IF

11. IF the token is an operator
        Pop the right operand.
        Pop the left operand.
        Apply the operator.
        Push the result onto the stack.
    END IF

12. Continue until all postfix tokens are processed.

13. IF the stack contains exactly one value
        Store it as the final result.
    ELSE
        Display "Invalid expression."
    END IF

14. Display:
        - Original expression
        - Tokens
        - Postfix expression
        - Stack evaluation steps
        - Final result
        - Time complexity
        - Space complexity

15. STOP