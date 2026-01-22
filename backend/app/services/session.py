from fastapi import HTTPException  # pyright: ignore[reportMissingImports]


class SessionManager:
    def __init__(self):
        self.sessions = {}
        self.debug_seen = {}

    def store(self, sid, interp):
        self.sessions[sid] = interp

    def get(self, sid):
        if sid not in self.sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        return self.sessions[sid]

    def _seen_set(self, debug_key: str):
        if debug_key not in self.debug_seen:
            self.debug_seen[debug_key] = set()
        return self.debug_seen[debug_key]

    def has_seen(self, debug_key: str, signature: str) -> bool:
        return signature in self._seen_set(debug_key)

    def mark_seen(self, debug_key: str, signature: str):
        self._seen_set(debug_key).add(signature)

    def clear_seen(self, debug_key: str):
        if debug_key in self.debug_seen:
            del self.debug_seen[debug_key]

    def step(self, sid):
        interp = self.get(sid)

        try:
            cont = interp.step()
            return {
                "success": True,
                "done": (not cont),
                "pc": interp.pc,
                "env": interp.env,
                "output": interp.output,
                "warnings": getattr(interp, "warnings", []),
                "trace": interp.trace_log,
                "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0,
                "state_info": interp.state.info() if hasattr(interp, "state") else None,
            }
        except Exception as e:
            return {
                "success": False,
                "done": False,
                "pc": interp.pc,
                "error": str(e),
                "env": interp.env,
                "output": interp.output,
                "warnings": getattr(interp, "warnings", []),
                "trace": interp.trace_log,
                "memory_kb": interp.state.memory_kb() if hasattr(interp, "state") else 0,
                "state_info": interp.state.info() if hasattr(interp, "state") else None,
            }

    def back(self, sid):
        interp = self.get(sid)

        if not hasattr(interp, "state"):
            return {"success": False, "error": "No state manager"}

        if interp.state.index <= 0:
            return {"success": False, "error": "No previous state"}

        interp.state.index -= 1
        interp.env = interp.state.current()
        interp.pc = max(0, interp.pc - 1)

        return {
            "success": True,
            "pc": interp.pc,
            "env": interp.env,
            "output": interp.output,
            "warnings": getattr(interp, "warnings", []),
            "trace": interp.trace_log,
            "state_info": interp.state.info(),
        }

    def next(self, sid):
        interp = self.get(sid)

        if not hasattr(interp, "state"):
            return {"success": False, "error": "No state manager"}

        if interp.state.index >= len(interp.state.history) - 1:
            return {"success": False, "error": "No next state"}

        interp.state.index += 1
        interp.env = interp.state.current()
        interp.pc = interp.pc + 1

        return {
            "success": True,
            "pc": interp.pc,
            "env": interp.env,
            "output": interp.output,
            "warnings": getattr(interp, "warnings", []),
            "trace": interp.trace_log,
            "state_info": interp.state.info(),
        }

    def env(self, sid):
        return self.get(sid).env

    def detail(self, sid):
        interp = self.get(sid)

        state_info = None
        if hasattr(interp, "state"):
            try:
                state_info = interp.state.info()
            except Exception:
                state_info = None

        return {
            "env": interp.env,
            "output": interp.output,
            "trace": interp.trace_log,
            "pc": interp.pc,
            "state_info": state_info,
        }


session_manager = SessionManager()
