from pydantic import BaseModel  # pyright: ignore[reportMissingImports]

class InputRequestModel(BaseModel):
    session_id: str
    value: str