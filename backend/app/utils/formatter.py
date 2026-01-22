def format_expression_error(err):
    return {
        "title": "❌ Expression Error",
        "line": err.line,
        "message": err.message,
        "expression": err.expression
    }


def format_runtime_error(msg: str):
    return {
        "title": "❌ Runtime Error",
        "message": msg
    }
