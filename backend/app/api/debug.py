from fastapi import APIRouter  # pyright: ignore[reportMissingImports]
from app.services.session import session_manager

router = APIRouter()

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
 