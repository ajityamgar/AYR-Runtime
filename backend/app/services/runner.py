import uuid
from app.runtime.lexer import Lexer
from app.runtime.parser import Parser
from app.runtime.interpreter import Interpreter, ExpressionError, InputRequest
from app.services.session import session_manager


def run_code(code: str):
    try:
        tokens = Lexer(code).tokenize()
        program = Parser(tokens).parse()

        interp = Interpreter()
        interp.load(program)

        try:
            while interp.pc < len(program.statements):
                interp.step()

            # ✅ Phase-1 destructor call at end (runner uses step loop)
            if hasattr(interp, "_run_destructors"):
                interp._run_destructors()

            return {
                "success": True,
                "output": interp.output if hasattr(interp, "output") else [],
                "warnings": interp.warnings if hasattr(interp, "warnings") else [],
                "env": interp.env if hasattr(interp, "env") else {},
                "trace": interp.trace_log if hasattr(interp, "trace_log") else [],
                "detail": interp.state.info() if hasattr(interp, "state") else {},
                "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0
            }

        except InputRequest as inp:
            session_id = str(uuid.uuid4())
            session_manager.store(session_id, interp)

            return {
                "success": False,
                "need_input": True,
                "session_id": session_id,
                "var": getattr(interp, "last_input_var", None),
                "line": inp.line,
                "message": "Program is waiting for input",
                "output": interp.output if hasattr(interp, "output") else [],
                "warnings": interp.warnings if hasattr(interp, "warnings") else [],
                "env": interp.env if hasattr(interp, "env") else {},
                "trace": interp.trace_log if hasattr(interp, "trace_log") else [],
                "detail": interp.state.info() if hasattr(interp, "state") else {},
                "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0
            }

        except ExpressionError as e:
            return {
                "success": False,
                "error": str(e),
                "line": e.line,
                "output": interp.output if hasattr(interp, "output") else [],
                "warnings": interp.warnings if hasattr(interp, "warnings") else [],
                "env": interp.env if hasattr(interp, "env") else {},
                "trace": interp.trace_log if hasattr(interp, "trace_log") else [],
                "detail": interp.state.info() if hasattr(interp, "state") else {},
                "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0
            }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "line": None,
            "output": [],
            "warnings": [],
            "env": {},
            "trace": [],
            "detail": {},
            "memory_kb": 0
        }
