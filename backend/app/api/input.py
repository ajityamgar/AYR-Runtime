# api/input.py
from fastapi import APIRouter  # pyright: ignore[reportMissingImports]
from app.services.session import session_manager
from app.runtime.interpreter import InputRequest, ExpressionError
from app.models.input_request import InputRequestModel

router = APIRouter()


def infer_type(raw: str):
    raw = str(raw).strip()
    try:
        return int(raw)
    except:
        pass
    try:
        return float(raw)
    except:
        pass
    return raw


@router.post("/input")
def provide_input(req: InputRequestModel):
    interp = session_manager.get(req.session_id)

    raw = str(req.value).strip()

    # ✅ 1) MULTI INPUT SUPPORT (a, b = pucho)
    last_vars = getattr(interp, "last_input_vars", None)
    if last_vars:
        parts = raw.split()

        if len(parts) != len(last_vars):
            return {
                "success": False,
                "need_input": True,
                "session_id": req.session_id,
                "error": "Input count aur variables ka count match nahi karta.",
                "line": getattr(interp, "last_input_line", None),
                "output": interp.output,
                "env": interp.env,
                "warnings": []
            }

        for name, value in zip(last_vars, parts):
            interp.env[name] = infer_type(value)

        # ✅ clear multi input state
        interp.last_input_vars = None

        # ✅ IMPORTANT: move PC forward (so same line repeat na ho)
        interp.pc += 1

    # ✅ 2) SINGLE INPUT SUPPORT (x = pucho)
    else:
        var = getattr(interp, "last_input_var", None)
        if not var:
            return {
                "success": False,
                "error": "No pending input variable"
            }

        interp.env[var] = infer_type(raw)
        interp.last_input_var = None

        # ✅ IMPORTANT: move PC forward
        interp.pc += 1

    # ✅ 3) Continue execution normally
    try:
        while interp.pc < len(interp.program.statements):
            stmt = interp.program.statements[interp.pc]
            interp.execute(stmt)
            interp.state.save(interp.env)
            interp.pc += 1

        return {
            "success": True,
            "output": interp.output,
            "env": interp.env,
            "warnings": []
        }

    except InputRequest as inp:
        return {
            "success": False,
            "need_input": True,
            "session_id": req.session_id,

            # ✅ show which input is pending (single OR multi)
            "var": getattr(interp, "last_input_var", None),
            "vars": getattr(interp, "last_input_vars", None),

            "line": inp.line,
            "output": interp.output,
            "env": interp.env,
            "warnings": []
        }

    except ExpressionError as e:
        return {
            "success": False,
            "error": str(e),
            "line": e.line,
            "output": interp.output,
            "env": interp.env,
            "warnings": []
        }
