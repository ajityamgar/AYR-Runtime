from fastapi import APIRouter, Query  # pyright: ignore[reportMissingImports]
from app.models.request import DebugRequest
from app.services.session import session_manager
from app.services.debug_runner import start_debug_session, run_until_next_new_error

router = APIRouter()

# ✅ NEW: DEBUG START
@router.post("/debug")
def debug(req: DebugRequest):
    return start_debug_session(req.code, req.debug_key)

# ✅ NEW: DEBUG "NEXT ERROR ONLY"
@router.post("/debug/rerunDebug")
def next_error(
    session_id: str = Query(...),
    debug_key: str = Query(...)
):
    return run_until_next_new_error(session_id, debug_key)

# ✅ OLD ROUTES (kept)
@router.get("/env")
def env(session_id: str):
    return session_manager.env(session_id)

@router.post("/step")
def step(session_id: str):
    return session_manager.step(session_id)

@router.post("/back")
def back(session_id: str):
    return session_manager.back(session_id)

@router.post("/next")
def next_(session_id: str):
    return session_manager.next(session_id)

@router.get("/detail")
def detail(session_id: str):
    return session_manager.detail(session_id)
