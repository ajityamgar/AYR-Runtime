from pydantic import BaseModel # pyright: ignore[reportMissingImports]
from typing import Any, List, Optional


# ===============================
# NORMAL RUN RESPONSE
# ===============================
class RunResponse(BaseModel):
    success: bool
    output: List[Any] = []
    warnings: List[str] = []


class RunErrorResponse(BaseModel):
    success: bool = False
    error: str
    line: Optional[int] = None
    output: List[Any] = []
    warnings: List[str] = []


# ===============================
# DEBUG RESPONSE (UNCHANGED)
# ===============================
class DebugResponse(BaseModel):
    session_id: str
    env: dict
    pc: int
    finished: bool
