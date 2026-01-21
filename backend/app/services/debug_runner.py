import uuid

from app.runtime.lexer import Lexer
from app.runtime.parser import Parser
from app.runtime.interpreter import Interpreter, ExpressionError, InputRequest
from app.services.session import session_manager


def _signature(line, message, expression):
    return f"{line}|{message}|{expression}"


def start_debug_session(code: str, debug_key: str):
    tokens = Lexer(code).tokenize()
    program = Parser(tokens).parse()

    interp = Interpreter()
    interp.load(program)

    sid = str(uuid.uuid4())
    session_manager.store(sid, interp)

    return {
        "success": True,
        "session_id": sid,
        "debug_key": debug_key,
        "pc": getattr(interp, "pc", 0),
        "env": getattr(interp, "env", {}),
        "output": getattr(interp, "output", []),
        "trace": getattr(interp, "trace_log", []),

        # ✅ NEW: add state_info inside detail
        "detail": {
            "state_info": interp.state.info() if hasattr(interp, "state") else None
        },

        "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0,
    }


def run_until_next_new_error(session_id: str, debug_key: str, max_steps: int = 10000):
    interp = session_manager.get(session_id)

    steps = 0

    while steps < max_steps:
        steps += 1

        try:
            cont = interp.step()

            if not cont:
                return {
                    "success": True,
                    "done": True,
                    "needs_input": False,
                    "session_id": session_id,
                    "debug_key": debug_key,
                    "pc": getattr(interp, "pc", 0),
                    "env": getattr(interp, "env", {}),
                    "output": getattr(interp, "output", []),
                    "trace": getattr(interp, "trace_log", []),
                    "error": None,
                    "line": None,
                    "expression": None,

                    # ✅ NEW
                    "detail": {
                        "state_info": interp.state.info() if hasattr(interp, "state") else None
                    },

                    "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0,
                }

        except InputRequest as inp:
            msg = "Program is waiting for input"
            expr = getattr(interp, "last_input_var", None)
            sig = _signature(inp.line, msg, expr)

            session_manager.mark_seen(debug_key, sig)

            return {
                "success": False,
                "done": False,
                "needs_input": True,
                "session_id": session_id,
                "debug_key": debug_key,
                "pc": getattr(interp, "pc", 0),
                "env": getattr(interp, "env", {}),
                "output": getattr(interp, "output", []),
                "trace": getattr(interp, "trace_log", []),
                "error": msg,
                "line": inp.line,
                "expression": expr,

                # ✅ NEW
                "detail": {
                    "state_info": interp.state.info() if hasattr(interp, "state") else None
                },

                "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0,
            }

        except ExpressionError as e:
            line = getattr(e, "line", None)
            msg = str(e)
            expr = getattr(e, "expr_text", None)

            sig = _signature(line, msg, expr)

            if session_manager.has_seen(debug_key, sig):
                # skip old error and continue
                try:
                    interp.pc += 1
                except Exception:
                    pass
                continue

            session_manager.mark_seen(debug_key, sig)

            return {
                "success": False,
                "done": False,
                "needs_input": False,
                "session_id": session_id,
                "debug_key": debug_key,
                "pc": getattr(interp, "pc", 0),
                "env": getattr(interp, "env", {}),
                "output": getattr(interp, "output", []),
                "trace": getattr(interp, "trace_log", []),
                "error": msg,
                "line": line,
                "expression": expr,

                # ✅ NEW
                "detail": {
                    "state_info": interp.state.info() if hasattr(interp, "state") else None
                },

                "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0,
            }

        except Exception as e:
            msg = str(e)
            sig = _signature(None, msg, None)

            if session_manager.has_seen(debug_key, sig):
                try:
                    interp.pc += 1
                except Exception:
                    pass
                continue

            session_manager.mark_seen(debug_key, sig)

            return {
                "success": False,
                "done": False,
                "needs_input": False,
                "session_id": session_id,
                "debug_key": debug_key,
                "pc": getattr(interp, "pc", 0),
                "env": getattr(interp, "env", {}),
                "output": getattr(interp, "output", []),
                "trace": getattr(interp, "trace_log", []),
                "error": msg,
                "line": None,
                "expression": None,

                # ✅ NEW
                "detail": {
                    "state_info": interp.state.info() if hasattr(interp, "state") else None
                },

                "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0,
            }

    return {
        "success": False,
        "done": False,
        "needs_input": False,
        "session_id": session_id,
        "debug_key": debug_key,
        "pc": getattr(interp, "pc", 0),
        "env": getattr(interp, "env", {}),
        "output": getattr(interp, "output", []),
        "trace": getattr(interp, "trace_log", []),
        "error": "Max debug steps exceeded",
        "line": None,
        "expression": None,

        # ✅ NEW
        "detail": {
            "state_info": interp.state.info() if hasattr(interp, "state") else None
        },

        "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0,
    }
