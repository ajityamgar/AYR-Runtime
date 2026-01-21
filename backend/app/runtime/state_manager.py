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
        Save a deep-copied snapshot of current env.
        This supports time-travel debugging.

        Important:
        - If user moved back in timeline and then executes new step,
          future states should be discarded (new path).
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
        Move one step back in timeline and return snapshot.
        """

        # If no history exists
        if not self.history:
            return {}

        if self.index > 0:
            self.index -= 1

        return copy.deepcopy(self.history[self.index])

    def next(self):
        """
        Move one step forward in timeline and return snapshot.
        """

        # If no history exists
        if not self.history:
            return {}

        if self.index < len(self.history) - 1:
            self.index += 1

        return copy.deepcopy(self.history[self.index])

    # ---------------- INSPECTION ----------------

    def current(self):
        """
        Return current snapshot env.
        """

        if self.index >= 0 and self.history:
            return copy.deepcopy(self.history[self.index])
        return {}

    def last(self):
        """
        Return last snapshot env (final state).
        """

        if self.history:
            return copy.deepcopy(self.history[-1])
        return {}

    def timeline(self):
        """
        Return full timeline snapshots.
        """

        return [copy.deepcopy(s) for s in self.history]

    # ---------------- DEBUG INFO ----------------

    def memory_kb(self):
        """
        Approx memory usage of stored snapshots.
        """

        total = 0
        for s in self.history:
            total += sys.getsizeof(s)
        return round(total / 1024, 2)

    def info(self):
        """
        Returns summary about state history.
        """

        return {
            "total_states": len(self.history),
            "current_index": self.index,
            "has_past": self.index > 0,
            "has_future": self.index < len(self.history) - 1,
        }
