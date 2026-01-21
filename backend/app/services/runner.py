import uuid
from app.runtime.lexer import Lexer
from app.runtime.parser import Parser
from app.runtime.interpreter import Interpreter, ExpressionError, InputRequest
from app.services.session import session_manager


def _make_problem(kind: str, title: str, message: str, line=None, expression=None):
    return {
        "kind": kind,             # "error" | "warning" | "bug"
        "title": title,           # UI title line
        "message": message,       # main message
        "line": line,             # number or None
        "expression": expression  # expression string or None
    }


def run_code(code: str):
    """
    NORMAL RUN MODE:
    - Executes till end
    - Collects ALL errors/warnings/bugs
    - Returns summary + problems list for frontend Problems tab
    """
    problems = []
    errors = []
    warnings = []
    bugs = []

    try:
        tokens = Lexer(code).tokenize()
        program = Parser(tokens).parse()

        interp = Interpreter()
        interp.load(program)

        # store session (can help later for debug)
        sid = str(uuid.uuid4())
        session_manager.store(sid, interp)

        # ✅ run all statements
        while True:
            try:
                cont = interp.step()
                if not cont:
                    break

            except InputRequest as inp:
                # input required => stop normal run and return
                p = _make_problem(
                    kind="error",
                    title=f"Input Required (Line {inp.line}):",
                    message="Program ko input chahiye.",
                    line=inp.line,
                    expression=getattr(interp, "last_input_var", None),
                )
                problems.append(p)
                errors.append(p)

                return {
                    "success": False,
                    "session_id": sid,
                    "needs_input": True,
                    "var": getattr(interp, "last_input_var", None),
                    "line": inp.line,
                    "output": interp.output,

                    "problems": problems,
                    "errors": errors,
                    "warnings": warnings,
                    "bugs": bugs,

                    "summary": {
                        "total_errors": len(errors),
                        "total_warnings": len(warnings),
                        "total_bugs": len(bugs),
                        "total_problems": len(problems),
                    },

                    "env": interp.env,
                    "trace": interp.trace_log,
                    "detail": { "state_info": interp.state.info() if hasattr(interp, "state") else None},
                    "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0
                }

            except ExpressionError as e:
                # ✅ ExpressionError => show like screenshot
                line = getattr(e, "line", None)
                expr = getattr(e, "expr_text", None)

                title = f"Expression Error (Line {line}):" if line else "Expression Error:"
                msg = str(e)

                p = _make_problem(
                    kind="error",
                    title=title,
                    message=msg,
                    line=line,
                    expression=expr
                )

                problems.append(p)
                errors.append(p)

                # ✅ continue execution (Normal Run rule)
                interp.pc += 1
                if interp.program and interp.pc >= len(interp.program.statements):
                    break

            except Exception as e:
                # any unknown runtime error
                p = _make_problem(
                    kind="error",
                    title="Runtime Error:",
                    message=str(e),
                    line=None,
                    expression=None
                )
                problems.append(p)
                errors.append(p)

                # ✅ continue
                interp.pc += 1
                if not interp.program or interp.pc >= len(interp.program.statements):
                    break

        # ✅ interpreter warnings merge (if any)
        if hasattr(interp, "warnings"):
            for w in interp.warnings:
                p = _make_problem(
                    kind="warning",
                    title="Warning:",
                    message=str(w),
                    line=None,
                    expression=None
                )
                problems.append(p)
                warnings.append(p)

        return {
            "success": (len(errors) == 0),

            "session_id": sid,
            "output": interp.output,

            # ✅ main UI array
            "problems": problems,

            # optional separated arrays
            "errors": errors,
            "warnings": warnings,
            "bugs": bugs,

            "summary": {
                "total_errors": len(errors),
                "total_warnings": len(warnings),
                "total_bugs": len(bugs),
                "total_problems": len(problems),
            },

            "env": interp.env,
            "trace": interp.trace_log,
            "detail": { "state_info": interp.state.info() if hasattr(interp, "state") else None },
            "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0
        }

    except Exception as e:
        p = _make_problem(
            kind="error",
            title="Compiler/Parse Error:",
            message=str(e),
            line=None,
            expression=None
        )

        return {
            "success": False,
            "session_id": None,
            "output": [],

            "problems": [p],
            "errors": [p],
            "warnings": [],
            "bugs": [],

            "summary": {
                "total_errors": 1,
                "total_warnings": 0,
                "total_bugs": 0,
                "total_problems": 1
            },

            "env": {},
            "trace": [],
            "detail": { "state_info": interp.state.info() if hasattr(interp, "state") else None },
            "memory_kb": 0
        }
