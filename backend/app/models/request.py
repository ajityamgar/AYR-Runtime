from pydantic import BaseModel

class RunRequest(BaseModel):
    code: str
