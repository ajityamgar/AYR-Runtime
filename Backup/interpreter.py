from nodes import * 
from state_manager import StateManager


# ==================================================
# EXPRESSION ERROR
# ==================================================

class ExpressionError(Exception):
    def __init__(self, line, message, expression, env=None):
        self.line = line
        self.message = message
        self.expression = expression
        self.env = env
        super().__init__(self.__str__())

    def __str__(self):
        return (
            f"❌ Expression Error (Line {self.line}):\n"
            f"   {self.message}\n"
            f"   Expression: {self.expression}"
        )


# ==================================================
# HELPERS
# ==================================================

def type_name(v):
    if v is None: return "none"
    if isinstance(v, bool): return "bool"
    if isinstance(v, int): return "int"
    if isinstance(v, float): return "float"
    if isinstance(v, str): return "string"
    if isinstance(v, list): return "list"
    if isinstance(v, tuple): return "tuple"
    if isinstance(v, dict): return "dict"
    return "unknown"


def infer_input_type(raw):
    raw = raw.strip()
    try:
        return int(raw)
    except:
        pass
    try:
        return float(raw)
    except:
        pass
    return raw


# ==================================================
# BINARY OPERATIONS
# ==================================================

def apply_binary_op(a, b, op, node, env):
    la = type_name(a)
    lb = type_name(b)

    if a is None or b is None:
        raise ExpressionError(
            node.line,
            "none ke saath operation allowed nahi hai.",
            node.expr_text
        )

    if op in ("+", "-", "*", "/", "%"):
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
            raise ExpressionError(
                node.line,
                f"Galat arithmetic: {la} aur {lb} par ganit nahi ho sakta.",
                node.expr_text
            )
        if op == "/" and b == 0:
            raise ExpressionError(
                node.line,
                "Zero se division allowed nahi hai.",
                node.expr_text
            )
        return eval(f"a {op} b")

    if op in (">", "<", ">=", "<=", "==", "!="):
        if type(a) != type(b):
            raise ExpressionError(
                node.line,
                f"Galat comparison: {la} aur {lb} ka comparison allowed nahi hai.",
                node.expr_text
            )
        return eval(f"a {op} b")

    if op == "aur":
        if not isinstance(a, bool) or not isinstance(b, bool):
            raise ExpressionError(node.line, "Logical 'aur' sirf boolean par kaam karta hai.", node.expr_text)
        return a and b

    if op == "ya":
        if not isinstance(a, bool) or not isinstance(b, bool):
            raise ExpressionError(node.line, "Logical 'ya' sirf boolean par kaam karta hai.", node.expr_text)
        return a or b

    raise ExpressionError(
        node.line,
        "Unsupported operator.",
        node.expr_text,
        env=env
    )

# ==================================================
# CONTROL FLOW SIGNALS
# ==================================================

class BreakSignal(Exception): pass
class ContinueSignal(Exception): pass

class ReturnSignal(Exception):
    def __init__(self, value):
        self.value = value


# ==================================================
# INTERPRETER
# ==================================================

class Interpreter:
    def __init__(self):
        self.env = {}
        self.functions = {}
        self.program = None
        self.pc = 0

        self.state = StateManager()
        self.used_vars = set()
        self._in_function = False

        # ===== DEBUG ADDITIONS =====
        self.paused = False
        self.last_error = None
        self.trace_log = []
        self.call_stack = []
        self.loop_depth = 0
        self.current_file = "unknown"

    # ---------- load program ----------
    def load(self, program):
        self.program = program
        self.env = {}
        self.functions = {}
        self.pc = 0
        self.used_vars = set()

        self.paused = False
        self.last_error = None
        self.trace_log = []
        self.call_stack = []
        self.loop_depth = 0

        self.state.reset()
        self.state.save(self.env)

    # ==================================================
    # TRACE HELPER
    # ==================================================

    def _log(self, node, status):
        indent = "   " * (len(self.call_stack) + self.loop_depth)
        code = getattr(node, "expr_text", str(type(node).__name__))
        if len(code) > 60:
            code = code[:60] + "..."
        self.trace_log.append(
            f"{indent}{self.current_file}/ line {node.line} | {code:<30} {status}"
        )

    # ---------- run ----------
    def run(self):
        self.pc = 0
        self.env = {}
        self.used_vars = set()

        self.paused = False
        self.last_error = None
        self.trace_log = []

        self.state.reset()
        self.state.save(self.env)

        while self.pc < len(self.program.statements):
            if self.paused:
                break
            self.step()

        if not self.paused:
            for v in self.env:
                if v not in self.used_vars:
                    print(f"⚠️ Warning: variable '{v}' define hua hai par use nahi hua.")

    # ---------- step ----------
    def step(self):
        stmt = self.program.statements[self.pc]
        try:
            self.execute(stmt)
            self._log(stmt, "✔")
            self.state.save(self.env)
            self.pc += 1
        except ExpressionError as e:
            self._log(stmt, "❌")
            self.paused = True
            self.last_error = e
            print(e)
            print(f"\n⏸️ Execution paused at {self.current_file}/ line {stmt.line}")

    # ==================================================
    # STATEMENT EXECUTION
    # ==================================================

    def execute(self, node):

        if isinstance(node, VarAssignNode):
            self.env[node.name] = self.eval(node.value)

        elif isinstance(node, MultiAssignNode):
            raw = input(">> ").split()
            if len(raw) != len(node.names):
                raise ExpressionError(node.line, "Input count match nahi karta.", "pucho")
            for n, v in zip(node.names, raw):
                self.env[n] = infer_input_type(v)

        elif isinstance(node, PrintNode):
            print(self.eval(node.value))

        elif isinstance(node, IfNode):
            if self.eval(node.condition):
                self.exec_block(node.body)
            else:
                for cond, body in node.elif_blocks:
                    if self.eval(cond):
                        self.exec_block(body)
                        return
                if node.else_body:
                    self.exec_block(node.else_body)

        elif isinstance(node, WhileNode):
            MAX_ITER = 10000
            iteration = 0

            while not self.paused and self.eval(node.condition):
                iteration += 1

                if iteration > MAX_ITER:
                    self.paused = True
                    raise ExpressionError(
                        node.line,
                        "Possible infinite loop detected.",
                        "jabtak condition",
                        env=self.env.copy()
                    )

                self.loop_depth += 1
                self.trace_log.append(
                    "   " * len(self.call_stack) +
                    f"↳ loop iteration {iteration} (line {node.line})"
                )

                try:
                    self.exec_block(node.body)
                except BreakSignal:
                    break
                except ContinueSignal:
                    continue
                finally:
                    self.loop_depth -= 1

        elif isinstance(node, ForNode):
            iterable = self.eval(node.iterable)
            if not isinstance(iterable, (list, tuple, dict)):
                raise ExpressionError(node.line, "For-loop sirf list / tuple / dict par allowed hai.", "har")

            for idx, val in enumerate(iterable):
                self.loop_depth += 1
                self.trace_log.append("   " * len(self.call_stack) + f"↳ loop iteration {idx+1}")
                self.env[node.var_name] = val
                if node.index_name:
                    self.env[node.index_name] = idx
                try:
                    self.exec_block(node.body)
                except ContinueSignal:
                    continue
                except BreakSignal:
                    break
                finally:
                    self.loop_depth -= 1

        elif isinstance(node, BreakNode):
            raise BreakSignal()

        elif isinstance(node, ContinueNode):
            raise ContinueSignal()

        elif isinstance(node, FunctionDefNode):
            self.functions[node.name] = node

        elif isinstance(node, FunctionCallNode):
            self.call(node)

        elif isinstance(node, IndexAssignNode):
            collection = self.eval(node.collection)
            index = self.eval(node.index)
            value = self.eval(node.value)

            if isinstance(collection, list):
                if not isinstance(index, int):
                    raise ExpressionError(node.line, "List index number hona chahiye.", node.expr_text)
                if index < 0 or index >= len(collection):
                    raise ExpressionError(node.line, "List index limit ke bahar hai.", node.expr_text)
                collection[index] = value
                return

            if isinstance(collection, dict):
                collection[index] = value
                return

            raise ExpressionError(node.line, "Index assignment sirf list ya dictionary par allowed hai.", node.expr_text)

        elif isinstance(node, ReturnNode):
            if not self._in_function:
                raise ExpressionError(node.line, "wapas function ke bahar allowed nahi hai.", "wapas")
            raise ReturnSignal(self.eval(node.value) if node.value else None)

    # ---------- execute block ----------
    def exec_block(self, stmts):
        for s in stmts:
            if self.paused:
                return
            try:
                self.execute(s)
                self._log(s, "✔")
                self.state.save(self.env)
            except ExpressionError as e:
                self._log(s, "❌")
                self.paused = True
                self.last_error = e
                print(e)
                print(f"\n⏸️ Execution paused at {self.current_file}/ line {s.line}")
                return
    # ==================================================
    # EXPRESSION EVALUATION
    # ==================================================

    def eval(self, node):

        if isinstance(node, NumberNode): return node.value
        if isinstance(node, StringNode): return node.value
        if isinstance(node, BooleanNode): return node.value
        if isinstance(node, NoneNode): return None
        if isinstance(node, InputNode): return infer_input_type(input(">> "))
        if isinstance(node, FunctionCallNode):return self.call(node)

        if isinstance(node, VarAccessNode):
            self.used_vars.add(node.name)
            if node.name not in self.env:
                raise ExpressionError(node.line, f"Variable '{node.name}' define nahi hai.", node.name)
            return self.env[node.name]

        if isinstance(node, ListNode):
            return [self.eval(e) for e in node.elements]

        if isinstance(node, TupleNode):
            return tuple(self.eval(e) for e in node.elements)

        if isinstance(node, DictNode):
            d = {}
            for k, v in node.pairs:
                key = self.eval(k)
                if not isinstance(key, (str, int)):
                    raise ExpressionError(node.line, "Dictionary key sirf string ya number ho sakti hai.", "dict key")
                d[key] = self.eval(v)
            return d

        if isinstance(node, IndexAccessNode):
            collection = self.eval(node.collection)
            index = self.eval(node.index)

            if isinstance(collection, list):
                if not isinstance(index, int):
                    raise ExpressionError(node.line, "List index number hona chahiye.", node.expr_text)
                if index < 0 or index >= len(collection):
                    raise ExpressionError(node.line, "List index limit ke bahar hai.", node.expr_text)
                return collection[index]

            if isinstance(collection, dict):
                if index not in collection:
                    raise ExpressionError(node.line, "Dictionary me ye key maujood nahi hai.", node.expr_text)
                return collection[index]

            raise ExpressionError(node.line, "Indexing sirf list ya dictionary par hoti hai.", node.expr_text)

        if isinstance(node, UnaryOpNode):
            val = self.eval(node.node)
            if not isinstance(val, bool):
                raise ExpressionError(node.line, "Unary operator sirf boolean par kaam karta hai.", "nahi")
            return not val

        if isinstance(node, BinaryOpNode):
            return apply_binary_op(
            self.eval(node.left),
            self.eval(node.right),
            node.op,
            node,
            env=self.env.copy()
        )

        return None

    # ==================================================
    # FUNCTION CALL
    # ==================================================

    def call(self, call):
        if call.name not in self.functions:
            raise ExpressionError(call.line, f"Function '{call.name}' define nahi hai.", call.name)

        fn = self.functions[call.name]

        self.call_stack.append({ "name": call.name, "line": fn.line })
        frame = self.call_stack[-1]
        self.trace_log.append(
            "   " * (len(self.call_stack)-1) +
            f"↳ {frame['name']}()/ line {frame['line']}"
        )

        self.trace_log.append(
            "   " * (len(self.call_stack)-1) +
            f"↰ {frame['name']}() return"
        )
        self.call_stack.pop()

        local_env = self.env.copy()
        for p, a in zip(fn.params, call.args):
            local_env[p] = self.eval(a)

        old_env = self.env
        old_flag = self._in_function

        self.env = local_env
        self._in_function = True

        try:
            for s in fn.body:
                self.execute(s)
        except ReturnSignal as r:
            self.env = old_env
            self._in_function = old_flag
            self.trace_log.append("   " * (len(self.call_stack)-1) + f"↰ {call.name}() return")
            self.call_stack.pop()
            return r.value

        self.env = old_env
        self._in_function = old_flag
        self.trace_log.append("   " * (len(self.call_stack)-1) + f"↰ {call.name}() return")
        self.call_stack.pop()

    # ==================================================
    # DEBUG COMMAND SUPPORT
    # ==================================================

    def debug(self):
        print("🧭 DEBUG TRACE")
        for line in self.trace_log:
            print(line)
