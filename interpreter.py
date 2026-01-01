from nodes import *
from state_manager import StateManager


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


def type_name(v):
    if v is None: return "none"
    if isinstance(v, bool): return "bool"
    if isinstance(v, int): return "int"
    if isinstance(v, float): return "float"
    if isinstance(v, str): return "string"
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

def apply_binary_op(a, b, op, node):
    la = type_name(a)
    lb = type_name(b)

    # -------- ARITHMETIC --------
    if op in ("+", "-", "*", "/", "%"):
        if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
            raise ExpressionError(
                node.line,
                "Galat arithmetic: alag-alag datatype par calculation nahi ho sakte.",
                node.expr_text
            )
        return eval(f"a {op} b")

    # -------- COMPARISON --------
    if op in (">", "<", ">=", "<=", "==", "!="):
        if type(a) != type(b):
            raise ExpressionError(
                node.line,
                f"Galat comparison: {la} aur {lb} ka comparison allowed nahi hai.",
                node.expr_text
            )
        return eval(f"a {op} b")

    # -------- LOGICAL --------
    if op == "aur":
        return bool(a) and bool(b)
    if op == "ya":
        return bool(a) or bool(b)

    # -------- FALLBACK --------
    raise ExpressionError(
        node.line,
        "Galat operator: ye operator supported nahi hai.",
        node.expr_text
    )


class BreakSignal(Exception): pass
class ContinueSignal(Exception): pass

class ReturnSignal(Exception):
    def __init__(self, value):
        self.value = value


class Interpreter:
    def __init__(self):
        self.env = {}
        self.functions = {}
        self.state = StateManager()
        self.program = None
        self.pc = 0

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
            self.env[node.name] = self.eval(node.value)

        elif isinstance(node, PrintNode):
            print(self.eval(node.value))

        elif isinstance(node, IfNode):
            if self.eval(node.condition):
                self.exec_block(node.body)
            else:
                for c, b in node.elif_blocks:
                    if self.eval(c):
                        self.exec_block(b)
                        return
                if node.else_body:
                    self.exec_block(node.else_body)

        elif isinstance(node, WhileNode):
            while self.eval(node.condition):
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
            raise ReturnSignal(self.eval(node.value) if node.value else None)

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

        if isinstance(node, UnaryOpNode):
            return not self.eval(node.node)

        if isinstance(node, BinaryOpNode):
            return apply_binary_op(
                self.eval(node.left),
                self.eval(node.right),
                node.op,
                node
            )

        return None

    def call(self, call):
        fn = self.functions[call.name]
        local = self.env.copy()
        for p, a in zip(fn.params, call.args):
            local[p] = self.eval(a)
        old = self.env
        self.env = local
        try:
            for s in fn.body:
                self.execute(s)
        except ReturnSignal as r:
            self.env = old
            return r.value
        self.env = old
