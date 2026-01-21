from fastapi import HTTPException   # pyright: ignore[reportMissingImports]

class SessionManager:
    def __init__(self):
        self.sessions = {}

    def store(self, sid, interp):
        self.sessions[sid] = interp

    def get(self, sid):
        if sid not in self.sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        return self.sessions[sid]

    def step(self, sid):
        interp = self.get(sid)
        interp.step()
        return {
            "env": interp.env,
            "trace": interp.trace_log,
            "output": interp.output,
            "pc": interp.pc,
            "finished": interp.pc >= len(interp.program.statements)
        }

    def back(self, sid):
        interp = self.get(sid)
        interp.env = interp.state.back()
        return interp.env

    def next(self, sid):
        interp = self.get(sid)
        interp.env = interp.state.next()
        return interp.env

    def env(self, sid):
        return self.get(sid).env

    def detail(self, sid):
        interp = self.get(sid)
        return {
            "env": interp.env,
            "output": interp.output,
            "trace": interp.trace_log,
            "pc": interp.pc
        }

session_manager = SessionManager()
