import re
import copy
from dataclasses import dataclass
from app.runtime.nodes import *
from app.runtime.state_manager import StateManager


class InputRequest(Exception):
    def __init__(self, line):
        self.line = line

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

    def apply_binary_op(a, b, op, node):
        la = ExpressionError.type_name(a)
        lb = ExpressionError.type_name(b)

        if a is None or b is None:
            raise ExpressionError(
                node.line,
                "none ke saath operation allowed nahi hai.",
                node.expr_text
            )

        # -------- ARITHMETIC --------
        if op in ("+", "-", "*", "/", "%"):

            if isinstance(a, bool) or isinstance(b, bool):
                raise ExpressionError(
                    node.line,
                    "Boolean ke saath arithmetic operation allowed nahi hai.",
                    node.expr_text
                )

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
            if not isinstance(a, bool) or not isinstance(b, bool):
                raise ExpressionError(
                    node.line,
                    "Logical 'aur' sirf boolean par kaam karta hai.",
                    node.expr_text
                )
            return a and b

        if op == "ya":
            if not isinstance(a, bool) or not isinstance(b, bool):
                raise ExpressionError(
                    node.line,
                    "Logical 'ya' sirf boolean par kaam karta hai.",
                    node.expr_text
                )
            return a or b

        raise ExpressionError(
            node.line,
            "Unsupported operator.",
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
        self.program = None
        self.pc = 0

        self.state = StateManager()
        self.used_vars = set()
        self._in_function = False

        self.output = []
        self.trace_log = []
        self.warnings = []

        self.classes = {}
        self._objects_created = []

        self._trace_i = 0


    def _trace_snapshot(self, line=None):
        try:
            env_copy = copy.deepcopy(self.env)
        except Exception:
            env_copy = dict(self.env)

        self.trace_log.append({
            "i": self._trace_i,
            "line": line,
            "env": env_copy
        })
        self._trace_i += 1

    def load(self, program):
        self.program = program
        self.env = {}
        self.functions = {}
        self.pc = 0
        self.used_vars = set()

        self.output = []
        self.trace_log = []
        self.warnings = []

        self.classes = {}
        self._objects_created = []

        self._trace_i = 0

        self.state.reset()
        self.state.save(self.env)

        self._trace_snapshot(line=None)

    def run(self):
        self.pc = 0
        self.env = {}
        self.used_vars = set()

        self.state.reset()
        self.state.save(self.env)

        self.trace_log = []
        self._trace_i = 0
        self._trace_snapshot(line=None)

        while self.pc < len(self.program.statements):
            self.step()

        self._run_destructors()

        # warnings
        for v in self.env:
            if v not in self.used_vars:
                self.warnings.append(f"⚠️ Warning: variable '{v}' define hua hai par use nahi hua.")

    def step(self):
        if self.pc >= len(self.program.statements):
            return False

        stmt = self.program.statements[self.pc]

        self.execute(stmt)
        self.state.save(self.env)
        self.pc += 1
        return True

    def format_string(self, text: str, line: int):

        def resolve_expr(expr: str):
            expr = expr.strip()

            if "." not in expr:
                if expr not in self.env:
                    raise ExpressionError(
                        line,
                        f"Variable '{expr}' define nahi hai.",
                        expr
                    )
                return self.env[expr]

            parts = expr.split(".")
            if len(parts) != 2:
                raise ExpressionError(
                    line,
                    "String ke andar interpolation expression sahi format me nahi hai.",
                    expr
                )

            base_name, field = parts[0].strip(), parts[1].strip()

            if base_name not in self.env:
                raise ExpressionError(
                    line,
                    f"Variable '{base_name}' define nahi hai.",
                    expr
                )

            obj = self.env[base_name]
            if not isinstance(obj, AYRObject):
                raise ExpressionError(
                    line,
                    "Dot access - sirf object par hota hai",
                    expr
                )

            if field not in obj.fields:
                raise ExpressionError(
                    line,
                    f"Property '{field}' not found",
                    expr
                )

            return obj.fields[field]

        def replacer(match):
            inner = match.group(1)
            return str(resolve_expr(inner))

        return re.sub(r"\{([^{}]+)\}", replacer, text)

    def execute(self, node):
        if isinstance(node, ClassDefNode):
            methods_map = {}
            for m in node.methods:
                methods_map[m.name] = m
            self.classes[node.name] = AYRClass(node.name, methods_map)

            if hasattr(node, "line"):
                self._trace_snapshot(line=node.line)
            return

        # ---------- assignment ----------
        if isinstance(node, VarAssignNode):
            try:
                self.env[node.name] = self.eval(node.value)
            except InputRequest as inp:
                self.last_input_var = node.name
                raise InputRequest(inp.line)

        elif isinstance(node, MemberAssignNode):
            obj = self.eval(node.obj)
            if not isinstance(obj, AYRObject):
                raise ExpressionError(
                    node.line,
                    "Dot access - sirf object par hota hai",
                    node.expr_text
                )
            obj.fields[node.member] = self.eval(node.value)

        elif isinstance(node, MultiAssignNode):
            self.last_input_vars = node.names
            self.last_input_line = node.line
            raise InputRequest(node.line)

        # ---------- print ----------
        elif isinstance(node, PrintNode):
            value = self.eval(node.value)
            self.output.append(value)

        # ---------- if ----------
        elif isinstance(node, IfNode):
            if self.eval(node.condition):
                self.exec_block(node.body)
            else:
                for cond, body in node.elif_blocks:
                    if self.eval(cond):
                        self.exec_block(body)
                        if hasattr(node, "line"):
                            self._trace_snapshot(line=node.line)
                        return
                if node.else_body:
                    self.exec_block(node.else_body)

        # ---------- while ----------
        elif isinstance(node, WhileNode):
            while self.eval(node.condition):
                try:
                    self.exec_block(node.body)
                except BreakSignal:
                    break
                except ContinueSignal:
                    continue

        # ---------- for ----------
        elif isinstance(node, ForNode):
            iterable = self.eval(node.iterable)
            if not isinstance(iterable, (list, tuple, dict)):
                raise ExpressionError(
                    node.line,
                    "For-loop sirf list / tuple / dict par allowed hai.",
                    "har"
                )

            for idx, val in enumerate(iterable):
                self.env[node.var_name] = val
                if node.index_name:
                    self.env[node.index_name] = idx
                try:
                    self.exec_block(node.body)
                except ContinueSignal:
                    continue
                except BreakSignal:
                    break

        # ---------- control ----------
        elif isinstance(node, BreakNode):
            raise BreakSignal()

        elif isinstance(node, ContinueNode):
            raise ContinueSignal()

        # ---------- functions ----------
        elif isinstance(node, FunctionDefNode):
            self.functions[node.name] = node

        elif isinstance(node, FunctionCallNode):
            self.eval(node)

        elif isinstance(node, MethodCallNode):
            self.call_method(node)

        elif isinstance(node, IndexAssignNode):
            collection = self.eval(node.collection)
            index = self.eval(node.index)
            value = self.eval(node.value)

            # ---------- LIST ----------
            if isinstance(collection, list):
                if not isinstance(index, int):
                    raise ExpressionError(
                        node.line,
                        "List index number hona chahiye.",
                        node.expr_text
                    )
                if index < 0 or index >= len(collection):
                    raise ExpressionError(
                        node.line,
                        "List index limit ke bahar hai.",
                        node.expr_text
                    )
                collection[index] = value

                if hasattr(node, "line"):
                    self._trace_snapshot(line=node.line)
                return

            if isinstance(collection, dict):
                collection[index] = value

                if hasattr(node, "line"):
                    self._trace_snapshot(line=node.line)
                return

            raise ExpressionError(
                node.line,
                "Index assignment sirf list ya dictionary par allowed hai.",
                node.expr_text
            )

        elif isinstance(node, ReturnNode):
            if not self._in_function:
                raise ExpressionError(
                    node.line,
                    "wapas function ke bahar allowed nahi hai.",
                    "wapas"
                )
            raise ReturnSignal(self.eval(node.value) if node.value else None)
        if hasattr(node, "line"):
            self._trace_snapshot(line=node.line)

    # ---------- execute block ----------
    def exec_block(self, stmts):
        for s in stmts:
            self.execute(s)


    def eval(self, node):

        # ---------- LITERALS ----------
        if isinstance(node, NumberNode):
            return node.value

        if isinstance(node, StringNode):
            return self.format_string(node.value, node.line)

        if isinstance(node, BooleanNode):
            return node.value

        if isinstance(node, NoneNode):
            return None

        if isinstance(node, InputNode):
            raise InputRequest(node.line)

        # ---------- VARIABLE ----------
        if isinstance(node, VarAccessNode):
            self.used_vars.add(node.name)
            if node.name not in self.env:
                raise ExpressionError(
                    node.line,
                    f"Variable '{node.name}' define nahi hai.",
                    node.name
                )
            return self.env[node.name]

        # ✅ MEMBER ACCESS (dikhao p.name)
        if isinstance(node, MemberAccessNode):
            obj = self.eval(node.obj)
            if not isinstance(obj, AYRObject):
                raise ExpressionError(
                    node.line,
                    "Dot access - sirf object par hota hai",
                    node.expr_text
                )
            if node.member not in obj.fields:
                raise ExpressionError(
                    node.line,
                    f"Property '{node.member}' nahi mila",
                    node.expr_text
                )
            return obj.fields[node.member]

        # ---------- LIST ----------
        if isinstance(node, ListNode):
            return [self.eval(e) for e in node.elements]

        # ---------- TUPLE ----------
        if isinstance(node, TupleNode):
            return tuple(self.eval(e) for e in node.elements)

        # ---------- DICTIONARY ----------
        if isinstance(node, DictNode):
            d = {}
            for k, v in node.pairs:
                key = self.eval(k)
                if not isinstance(key, (str, int)):
                    raise ExpressionError(
                        node.line,
                        "Dictionary key sirf string ya number ho sakti hai.",
                        "dictionary key"
                    )
                d[key] = self.eval(v)
            return d

        # ---------- INDEX ACCESS ----------
        if isinstance(node, IndexAccessNode):
            collection = self.eval(node.collection)
            index = self.eval(node.index)

            if isinstance(collection, list):
                if not isinstance(index, int):
                    raise ExpressionError(
                        node.line,
                        "List index number hona chahiye.",
                        node.expr_text
                    )
                if index < 0 or index >= len(collection):
                    raise ExpressionError(
                        node.line,
                        "List index limit ke bahar hai.",
                        node.expr_text
                    )
                return collection[index]

            if isinstance(collection, dict):
                if index not in collection:
                    raise ExpressionError(
                        node.line,
                        "Dictionary me ye key maujood nahi hai.",
                        node.expr_text
                    )
                return collection[index]

            raise ExpressionError(
                node.line,
                "Indexing sirf list ya dictionary par hoti hai.",
                node.expr_text
            )

        # ---------- UNARY ----------
        if isinstance(node, UnaryOpNode):
            val = self.eval(node.node)
            if not isinstance(val, bool):
                raise ExpressionError(
                    node.line,
                    "Unary operator sirf boolean par kaam karta hai.",
                    "nahi"
                )
            return not val

        # ---------- BINARY ----------
        if isinstance(node, BinaryOpNode):
            return ExpressionError.apply_binary_op(
                self.eval(node.left),
                self.eval(node.right),
                node.op,
                node
            )
        if isinstance(node, FunctionCallNode):
            # constructor call
            if node.name in self.classes:
                return self.instantiate(node)
            # normal function
            return self.call(node)

        if isinstance(node, MethodCallNode):
            return self.call_method(node)
        return None

    def call(self, call):
        if call.name not in self.functions:
            raise ExpressionError(
                call.line,
                f"Function '{call.name}' define nahi hai.",
                call.name
            )

        fn = self.functions[call.name]

        if len(call.args) != len(fn.params):
            raise ExpressionError(
                call.line,
                "Function arguments ka count galat hai.",
                call.name
            )

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
            return r.value

        self.env = old_env
        self._in_function = old_flag
        return None

    def instantiate(self, ctor_call: FunctionCallNode):
        cls = self.classes.get(ctor_call.name)

        if not isinstance(cls, AYRClass):
            raise ExpressionError(
                ctor_call.line,
                "Calling non-class identifier like constructor is not allowed.",
                ctor_call.name
            )

        obj = AYRObject(class_ref=cls, fields={})
        self._objects_created.append(obj)

        # auto __init__
        if "__init__" in cls.methods:
            init_method = cls.methods["__init__"]

            if len(init_method.params) < 1:
                raise ExpressionError(
                    ctor_call.line,
                    "__init__ must have at least one parameter (self/this/current/etc.)",
                    "__init__"
                )

            expected_args = len(init_method.params) - 1
            if len(ctor_call.args) != expected_args:
                raise ExpressionError(
                    ctor_call.line,
                    "Constructor arguments ka count galat hai.",
                    f"{cls.name}(...)"
                )

            # call method with obj injected
            self._execute_method(obj, init_method, ctor_call.args, ctor_call.line)

        else:
            # no __init__ is fine
            if len(ctor_call.args) != 0:
                raise ExpressionError(
                    ctor_call.line,
                    "Class has no __init__, so constructor args not allowed.",
                    f"{cls.name}(...)"
                )

        return obj

    def call_method(self, call: MethodCallNode):
        obj = self.eval(call.obj)
        if not isinstance(obj, AYRObject):
            raise ExpressionError(
                call.line,
                "Dot access sirf object par hota hai",
                call.expr_text
            )

        cls = obj.class_ref
        if call.method not in cls.methods:
            raise ExpressionError(
                call.line,
                f"Method '{call.method}' not found",
                call.expr_text
            )

        method_node = cls.methods[call.method]

        if len(method_node.params) < 1:
            raise ExpressionError(
                call.line,
                "Method must have first parameter (self/this/current/etc.)",
                call.expr_text
            )

        expected_user_args = len(method_node.params) - 1
        if len(call.args) != expected_user_args:
            raise ExpressionError(
                call.line,
                "Method arguments ka count galat hai.",
                call.expr_text
            )

        return self._execute_method(obj, method_node, call.args, call.line)

    def _execute_method(self, obj: AYRObject, method_node: MethodDefNode, user_args, call_line: int):
        local_env = self.env.copy()

        # first param name can be self/this/current/check/etc.
        self_param = method_node.params[0]
        local_env[self_param] = obj

        for p, a in zip(method_node.params[1:], user_args):
            local_env[p] = self.eval(a)

        old_env = self.env
        old_flag = self._in_function

        self.env = local_env
        self._in_function = True

        try:
            for s in method_node.body:
                self.execute(s)
        except ReturnSignal as r:
            if method_node.name in ("__init__", "__del__"):
                self.warnings.append(
                    f"⚠️ Warning (Line {call_line}): '{method_node.name}' should not return a value."
                )
            self.env = old_env
            self._in_function = old_flag
            return r.value

        self.env = old_env
        self._in_function = old_flag
        return None

    def _run_destructors(self):
        for obj in reversed(self._objects_created):
            cls = obj.class_ref
            if "__del__" not in cls.methods:
                continue

            d = cls.methods["__del__"]

            if len(d.params) != 1:
                raise ExpressionError(
                    d.line,
                    "__del__ must not take extra params",
                    "__del__"
                )

            self._execute_method(obj, d, [], d.line)
