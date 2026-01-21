from fastapi.responses import JSONResponse
from app.runtime.interpreter import ExpressionError


def handle_exception(e: Exception):
    """
    Generic error handler for API
    """
    return JSONResponse(
        status_code=400,
        content={
            "type": "RuntimeError",
            "message": str(e)
        }
    )


def handle_expression_error(e: ExpressionError):
    """
    Hindi ExpressionError handler
    """
    return JSONResponse(
        status_code=400,
        content={
            "type": "ExpressionError",
            "line": e.line,
            "message": e.message,
            "expression": e.expression
        }
    )
