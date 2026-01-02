from nodes import *
from state_manager import StateManager


# ================= EXPRESSION ERROR =================

class ExpressionError(Exception):
    def __init__(self, line, message, expression):
        self.line = line
        self.message = message
        self.expression = expression
        super().__init__(self.__str__())

    def __str__(self):
        return (
            f"❌ Expression Error (Line {self.line}):\n"
            f"   {self.message}\n"
            f"   Expression: {self.expression}"
        )


# ================= HELPERS =================

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
    except ValueError:
        pass
    try:
        return float(raw)
    except ValueError:
        pass
    return raw


# ================= BINARY OPERATIONS =================

def apply_binary_op(a, b, op, node):
    la = type_name(a)
    lb = type_name(b)

    # ---------- NONE ----------
    if a is None or b is None:
        raise ExpressionError(
            node.line,
            "Galat operation: none ke saath koi operation allowed nahi hai.",
            node.expr_text
        )

    # ---------- BOOLEAN ARITHMETIC ----------
    if op in ("+", "-", "*", "/", "%"):
        if isinstance(a, bool) or isinstance(b, bool):
            raise ExpressionError(
                node.line,
                "Galat arithmetic: bool ke saath koi calculation nahi kar sakte.",
                node.expr_text
            )

    # ---------- ARITHMETIC ----------
    if op in ("+", "-", "*", "/", "%"):
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
            raise ExpressionError(
                node.line,
                f"Galat arithmetic: {la} aur {lb} ke beech ganit allowed nahi hai.",
                node.expr_text
            )

        if op == "/" and b == 0:
            raise ExpressionError(
                node.line,
                "Galat arithmetic: zero se division nahi ho sakta.",
                node.expr_text
            )

        if op == "%" and b == 0:
            raise ExpressionError(
                node.line,
                "Galat arithmetic: zero ke saath modulo nahi hota.",
                node.expr_text
            )

        return eval(f"a {op} b")

    # ---------- COMPARISON ----------
    if op in (">", "<", ">=", "<=", "==", "!="):
        if type(a) != type(b):
            raise ExpressionError(
                node.line,
                f"Galat comparison: {la} aur {lb} ka comparison allowed nahi hai.",
                node.expr_text
            )

        if isinstance(a, (list, tuple, dict)):
            raise ExpressionError(
                node.line,
                "Galat comparison: list, tuple ya dictionary ka comparison allowed nahi hai.",
                node.expr_text
            )

        return eval(f"a {op} b")

    # ---------- LOGICAL ----------
    if op in ("aur", "ya"):
        if not isinstance(a, bool) or not isinstance(b, bool):
            raise ExpressionError(
                node.line,
                "Galat logical operation: 'aur' aur 'ya' sirf boolean par kaam karte hain.",
                node.expr_text
            )
        return (a and b) if op == "aur" else (a or b)

    # ---------- FALLBACK ----------
    raise ExpressionError(
        node.line,
        "Galat operator: ye operator supported nahi hai.",
        node.expr_text
    )


# ================= CONTROL SIGNALS =================

class BreakSignal(Exception): pass
class ContinueSignal(Exception): pass

class ReturnSignal(Exception):
    def __init__(self, value):
        self.value = value


# ================= INTERPRETER =================

class Interpreter:
    def __init__(self):
        self.env = {}
        self.functions = {}
        self.state = StateManager()
        self.program = None
        self.pc = 0
        self._in_function = False

    def load(self, program):
        self.program = program
        self.env = {}
        self.functions = {}
        self.pc = 0
        self.state.reset()
        self.state.save(self.env)

    def run(self):
        while self.pc < len(self.program.statements):
            self.step()

    def step(self):
        stmt = self.program.statements[self.pc]
        self.execute(stmt)
        self.state.save(self.env)
        self.pc += 1

    def execute(self, node):
        if isinstance(node, VarAssignNode):
            if node.name in self.functions:
                raise ExpressionError(
                    node.line,
                    f"Galat assignment: function naam '{node.name}' ko variable nahi bana sakte.",
                    node.name
                )
            self.env[node.name] = self.eval(node.value)

        elif isinstance(node, PrintNode):
            print(self.eval(node.value))

        elif isinstance(node, IfNode):
            cond = self.eval(node.condition)
            if not isinstance(cond, bool):
                raise ExpressionError(
                    node.line,
                    "Galat condition: 'agar' ki condition boolean honi chahiye.",
                    node.condition.expr_text
                )
            if cond:
                self.exec_block(node.body)
            else:
                for c, b in node.elif_blocks:
                    if self.eval(c):
                        self.exec_block(b)
                        return
                if node.else_body:
                    self.exec_block(node.else_body)

        elif isinstance(node, WhileNode):
            while True:
                cond = self.eval(node.condition)
                if not isinstance(cond, bool):
                    raise ExpressionError(
                        node.line,
                        "Galat condition: 'jabtak' ki condition boolean honi chahiye.",
                        node.condition.expr_text
                    )
                if not cond:
                    break
                try:
                    self.exec_block(node.body)
                except BreakSignal:
                    break
                except ContinueSignal:
                    continue

        elif isinstance(node, BreakNode):
            raise BreakSignal()

        elif isinstance(node, ContinueNode):
            raise ContinueSignal()

        elif isinstance(node, FunctionDefNode):
            self.functions[node.name] = node

        elif isinstance(node, FunctionCallNode):
            self.call(node)

        elif isinstance(node, ReturnNode):
            if not self._in_function:
                raise ExpressionError(
                    node.line,
                    "Galat return: 'wapas' function ke bahar allowed nahi hai.",
                    "wapas"
                )
            raise ReturnSignal(self.eval(node.value) if node.value else None)

        elif isinstance(node, ForNode):
            iterable = self.eval(node.iterable)
            if not isinstance(iterable, (list, tuple, dict)):
                raise ExpressionError(
                    node.line,
                    "Galat for-loop: 'har' sirf list, tuple ya dictionary par use hota hai.",
                    f"har {node.iterable} main {node.var_name}"
                )

            for v in iterable:
                self.env[node.var_name] = v
                try:
                    self.exec_block(node.body)
                except ContinueSignal:
                    continue
                except BreakSignal:
                    break

    def exec_block(self, stmts):
        for s in stmts:
            self.execute(s)

    def eval(self, node):
        if isinstance(node, NumberNode): return node.value
        if isinstance(node, StringNode): return node.value
        if isinstance(node, BooleanNode): return node.value
        if isinstance(node, NoneNode): return None
        if isinstance(node, InputNode): return infer_input_type(input(">> "))

        if isinstance(node, VarAccessNode):
            if node.name not in self.env:
                raise ExpressionError(
                    node.line,
                    f"Galat variable: '{node.name}' define nahi hai.",
                    node.name
                )
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
                    raise ExpressionError(
                        node.line,
                        "Galat dictionary key: key string ya number honi chahiye.",
                        "dictionary key"
                    )
                d[key] = self.eval(v)
            return d

        if isinstance(node, UnaryOpNode):
            val = self.eval(node.node)
            if not isinstance(val, bool):
                raise ExpressionError(
                    node.line,
                    "Galat unary operation: 'nahi' ya '!' sirf boolean par kaam karta hai.",
                    f"{node.op} ..."
                )
            return not val

        if isinstance(node, BinaryOpNode):
            return apply_binary_op(
                self.eval(node.left),
                self.eval(node.right),
                node.op,
                node
            )

        return None

    def call(self, call):
        if call.name not in self.functions:
            raise ExpressionError(
                call.line,
                f"Galat function: '{call.name}' define nahi hai.",
                call.name
            )

        fn = self.functions[call.name]

        if len(call.args) != len(fn.params):
            raise ExpressionError(
                call.line,
                f"Galat function call: '{call.name}' ko {len(fn.params)} arguments chahiye.",
                call.name
            )

        local = self.env.copy()
        for p, a in zip(fn.params, call.args):
            local[p] = self.eval(a)

        old_env = self.env
        old_flag = self._in_function
        self.env = local
        self._in_function = True

        try:
            for s in fn.body:
                self.execute(s)
        except ReturnSignal as r:
            self.env = old_env
            self._in_function = old_flag
            return r.value

        self.env = old_env
        self._in_function = old_flag
