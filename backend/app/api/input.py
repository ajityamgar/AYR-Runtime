from fastapi import APIRouter  # pyright: ignore[reportMissingImports]
from app.services.session import session_manager
from app.runtime.interpreter import InputRequest, ExpressionError
from app.models.input_request import InputRequestModel

router = APIRouter()

@router.post("/input")
def provide_input(req: InputRequestModel):
    interp = session_manager.get(req.session_id)

    var = getattr(interp, "last_input_var", None)
    if not var:
        return {
            "success": False,
            "error": "No pending input variable"
        }
    try:
        casted = int(req.value)
    except:
        try:
            casted = float(req.value)
        except:
            casted = req.value

    interp.env[var] = casted
    interp.last_input_var = None

    interp.pc += 1

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
            "var": getattr(interp, "last_input_var", None),
            "line": inp.line,
            "output": interp.output,
            "warnings": []
        }

    except ExpressionError as e:
        return {
            "success": False,
            "error": str(e),
            "line": e.line,
            "output": interp.output,
            "warnings": []
        }
