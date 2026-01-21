from fastapi import FastAPI  # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware # pyright: ignore[reportMissingImports]
from app.api import run, debug, input

app = FastAPI(title="AYR Runtime", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 👇 ROUTERS REGISTER KARO
app.include_router(run.router)
app.include_router(debug.router)
app.include_router(input.router)
