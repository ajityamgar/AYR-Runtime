def format_expression_error(err):
    """
    Format ExpressionError in Hindi (UI / API friendly)
    """
    return {
        "title": "❌ Expression Error",
        "line": err.line,
        "message": err.message,
        "expression": err.expression
    }


def format_runtime_error(msg: str):
    """
    Generic runtime error formatter
    """
    return {
        "title": "❌ Runtime Error",
        "message": msg
    }
