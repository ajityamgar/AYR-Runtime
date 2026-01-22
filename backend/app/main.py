from fastapi import FastAPI  # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware # pyright: ignore[reportMissingImports]
from app.api import run, debug, input


app = FastAPI(title="AYR Runtime", version="0.1.0")

@app.get("/")
def home():
    return {"success": True, "message": "AYR Runtime Backend is running ✅"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(run.router)
app.include_router(debug.router)
app.include_router(input.router)

