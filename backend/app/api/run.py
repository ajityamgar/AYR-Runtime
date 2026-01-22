from fastapi import APIRouter  # pyright: ignore[reportMissingImports]
from app.models.request import RunRequest
from app.models.response import RunResponse, RunErrorResponse
from app.services.runner import run_code

router = APIRouter()

@router.post("/run")
def run(req: RunRequest):
    return run_code(req.code)

def run_internal(req: RunRequest):
    return run_code(req.code)
