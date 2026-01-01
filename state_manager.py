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
        """
        Current environment ka deep copy snapshot save karta hai.
        Agar back karke naya execution hota hai,
        to future states truncate ho jaate hain.
        """
        snapshot = copy.deepcopy(env)

        # agar beech se naya path bana
        if self.index < len(self.history) - 1:
            self.history = self.history[: self.index + 1]

        self.history.append(snapshot)
        self.index += 1

    # ---------------- TIME TRAVEL ----------------

    def back(self):
        """
        Ek step peeche jao.
        """
        if self.index > 0:
            self.index -= 1
        return copy.deepcopy(self.history[self.index])

    def next(self):
        """
        Ek step aage jao.
        """
        if self.index < len(self.history) - 1:
            self.index += 1
        return copy.deepcopy(self.history[self.index])

    # ---------------- INSPECTION ----------------

    def current(self):
        """
        Current environment snapshot.
        """
        if self.index >= 0:
            return copy.deepcopy(self.history[self.index])
        return {}

    def last(self):
        """
        Last saved state.
        """
        if self.history:
            return copy.deepcopy(self.history[-1])
        return {}

    def timeline(self):
        """
        Saare states (timeline) return karta hai.
        """
        return [copy.deepcopy(s) for s in self.history]

    # ---------------- DEBUG INFO ----------------

    def memory_kb(self):
        """
        Approximate memory usage (KB) of all snapshots.
        """
        total = 0
        for s in self.history:
            total += sys.getsizeof(s)
        return round(total / 1024, 2)

    def info(self):
        """
        detail command ke liye summary info.
        """
        return {
            "total_states": len(self.history),
            "current_index": self.index,
            "has_past": self.index > 0,
            "has_future": self.index < len(self.history) - 1,
        }
