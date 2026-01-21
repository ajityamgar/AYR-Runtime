from pydantic import BaseModel


class RunRequest(BaseModel):
    code: str


class DebugRequest(BaseModel):
    code: str
    debug_key: str
