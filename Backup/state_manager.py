import sys
import copy


class StateManager:
    def __init__(self):
        self.history = []   # list of environment snapshots
        self.index = -1     # current pointer

    # ---------------- CORE ----------------

    def reset(self):
        self.history = []
        self.index = -1

    def save(self, env):
        
        snapshot = copy.deepcopy(env)

        # agar beech se naya path bana
        if self.index < len(self.history) - 1:
            self.history = self.history[: self.index + 1]

        self.history.append(snapshot)
        self.index += 1

    # ---------------- TIME TRAVEL ----------------

    def back(self):
    
        if self.index > 0:
            self.index -= 1
        return copy.deepcopy(self.history[self.index])

    def next(self):
       
        if self.index < len(self.history) - 1:
            self.index += 1
        return copy.deepcopy(self.history[self.index])

    # ---------------- INSPECTION ----------------

    def current(self):
        
        if self.index >= 0:
            return copy.deepcopy(self.history[self.index])
        return {}

    def last(self):
        
        if self.history:
            return copy.deepcopy(self.history[-1])
        return {}

    def timeline(self):
        
        return [copy.deepcopy(s) for s in self.history]

    # ---------------- DEBUG INFO ----------------

    def memory_kb(self):
        
        total = 0
        for s in self.history:
            total += sys.getsizeof(s)
        return round(total / 1024, 2)

    def info(self):
        
        return {
            "total_states": len(self.history),
            "current_index": self.index,
            "has_past": self.index > 0,
            "has_future": self.index < len(self.history) - 1,
        }
