from app.runtime.lexer import *
from app.runtime.nodes import *


class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0
        self.current = tokens[0]

    def advance(self):
        self.pos += 1
        if self.pos < len(self.tokens):
            self.current = self.tokens[self.pos]

    def expect(self, ttype, value=None):
        tok = self.current
        if tok.type != ttype:
            raise Exception(f"Expected {ttype}, got {tok}")
        if value is not None and tok.value != value:
            raise Exception(f"Expected '{value}', got '{tok.value}'")
        self.advance()
        return tok

    def skip_newlines(self):
        while self.current.type == TOKEN_NEWLINE:
            self.advance()

    def expr_to_text(self, node):
        if isinstance(node, VarAccessNode):
            return node.name
        if isinstance(node, NumberNode):
            return str(node.value)
        if isinstance(node, StringNode):
            return f'"{node.value}"'
        if isinstance(node, BooleanNode):
            return "true" if node.value else "false"
        if isinstance(node, NoneNode):
            return "none"
        if isinstance(node, InputNode):
            return "pucho"
        if isinstance(node, BinaryOpNode):
            return node.expr_text
        if isinstance(node, IndexAccessNode):
            return node.expr_text

        if "MemberAccessNode" in globals() and isinstance(node, MemberAccessNode):
            return node.expr_text
        if "MethodCallNode" in globals() and isinstance(node, MethodCallNode):
            return node.expr_text

        return "expression"

    def parse(self):
        statements = []
        self.skip_newlines()

        while self.current.type != TOKEN_EOF:
            statements.append(self.statement())
            self.skip_newlines()

        return Program(statements)

    def statement(self):
        tok = self.current

        if tok.type == TOKEN_KEYWORD and tok.value == "class":
            return self.class_def()

        if tok.type == TOKEN_KEYWORD:
            if tok.value == "dikhao":
                self.advance()
                expr = self.expr()
                node = PrintNode(expr, tok.line)
                node.expr_text = f"dikhao {self.expr_to_text(expr)}"
                return node

            if tok.value == "agar":
                return self.if_stmt()

            if tok.value == "jabtak":
                return self.while_stmt()

            if tok.value == "har":
                return self.for_stmt()

            if tok.value == "kaam":
                return self.func_def()

            if tok.value == "wapas":
                self.advance()
                if self.current.type in (TOKEN_NEWLINE, TOKEN_DEDENT):
                    return ReturnNode(None, tok.line)
                return ReturnNode(self.expr(), tok.line)

            if tok.value == "band":
                self.advance()
                return BreakNode(tok.line)

            if tok.value == "chalu":
                self.advance()
                return ContinueNode(tok.line)

        if tok.type == TOKEN_IDENTIFIER:
            return self.assignment_or_call()

        raise Exception(f"Invalid statement at line {tok.line}")

    def class_def(self):
        """
        class Person:
            kaam __init__(self, name):
                ...
        """
        start = self.expect(TOKEN_KEYWORD, "class")
        name_tok = self.expect(TOKEN_IDENTIFIER)

        if not (self.current.type == TOKEN_OPERATOR and self.current.value == ":"):
            raise Exception(f"SyntaxError (Line {start.line}): Missing ':' after class name")
        self.advance()

        if self.current.type != TOKEN_NEWLINE:
            raise Exception(f"SyntaxError (Line {start.line}): Expected newline after class definition")
        self.expect(TOKEN_NEWLINE)

        self.expect(TOKEN_INDENT)
        self.skip_newlines()

        methods = []
        while self.current.type != TOKEN_DEDENT:
            if self.current.type == TOKEN_KEYWORD and self.current.value == "kaam":
                methods.append(self.method_def())
                self.skip_newlines()
                continue

            raise Exception(
                f"SyntaxError (Line {self.current.line}): Unknown token inside class block. "
                f"Only 'kaam' method definitions allowed."
            )

        self.expect(TOKEN_DEDENT)

        if len(methods) == 0:
            raise Exception(f"SyntaxError (Line {start.line}): Class block empty")

        return ClassDefNode(name_tok.value, methods, start.line)

    def method_def(self):
        """
        kaam show(self):
            dikhao ...
        """
        start = self.expect(TOKEN_KEYWORD, "kaam")
        name_tok = self.expect(TOKEN_IDENTIFIER)

        if not (self.current.type == TOKEN_OPERATOR and self.current.value == "("):
            raise Exception(f"SyntaxError (Line {start.line}): Missing '(' in method definition")
        self.advance()

        params = []
        if self.current.type == TOKEN_IDENTIFIER:
            params.append(self.current.value)
            self.advance()
            while self.current.type == TOKEN_OPERATOR and self.current.value == ",":
                self.advance()
                params.append(self.expect(TOKEN_IDENTIFIER).value)

        if not (self.current.type == TOKEN_OPERATOR and self.current.value == ")"):
            raise Exception(f"SyntaxError (Line {start.line}): Missing ')' in method definition")
        self.advance()

        if not (self.current.type == TOKEN_OPERATOR and self.current.value == ":"):
            raise Exception(f"SyntaxError (Line {start.line}): Missing ':' after method signature")
        self.advance()

        if self.current.type != TOKEN_NEWLINE:
            raise Exception(f"SyntaxError (Line {start.line}): Expected newline after method signature")
        self.expect(TOKEN_NEWLINE)

        body = self.block()

        if len(params) == 0:
            raise Exception(
                f"SyntaxError (Line {start.line}): Method must have first parameter (self/this/current/etc.)"
            )

        return MethodDefNode(name_tok.value, params, body, start.line)

    def assignment_or_call(self):
        first = self.expect(TOKEN_IDENTIFIER)

        if self.current.type == TOKEN_OPERATOR and self.current.value == ".":
            base = VarAccessNode(first.value, first.line)
            base.expr_text = first.value

            self.advance()
            mem_tok = self.expect(TOKEN_IDENTIFIER)

            if self.current.type == TOKEN_OPERATOR and self.current.value == "=":
                self.advance()
                val = self.expr()

                node = MemberAssignNode(
                    base,
                    mem_tok.value,
                    val,
                    first.line,
                    f"{first.value}.{mem_tok.value} = {self.expr_to_text(val)}"
                )
                return node

            if self.current.type == TOKEN_OPERATOR and self.current.value == "(":
                return self.method_call(base, mem_tok.value, first.line)

            raise Exception(f"Invalid member statement at line {first.line}")

        names = [first.value]
        while self.current.type == TOKEN_OPERATOR and self.current.value == ",":
            self.advance()
            names.append(self.expect(TOKEN_IDENTIFIER).value)

        if self.current.type == TOKEN_OPERATOR and self.current.value == "=":
            self.advance()
            value = self.expr()

            if len(names) > 1:
                if not isinstance(value, InputNode):
                    raise Exception(f"SyntaxError (Line {first.line}): Multi input assignment supports only 'pucho'")

                node = MultiAssignNode(names, first.line)
                node.expr_text = f"{', '.join(names)} = pucho"
                return node

            node = VarAssignNode(names[0], value, first.line)
            node.expr_text = f"{names[0]} = {self.expr_to_text(value)}"
            return node

        if self.current.type == TOKEN_OPERATOR and self.current.value == "[":
            base = VarAccessNode(first.value, first.line)
            base.expr_text = first.value

            self.advance()
            idx = self.expr()
            self.expect(TOKEN_OPERATOR, "]")

            self.expect(TOKEN_OPERATOR, "=")
            val = self.expr()

            return IndexAssignNode(
                base,
                idx,
                val,
                first.line,
                f"{first.value}[{idx.expr_text}] = {self.expr_to_text(val)}"
            )

        if self.current.type == TOKEN_OPERATOR and self.current.value == "(":
            node = self.func_call(first)
            node.expr_text = (
                f"{first.value}("
                f"{', '.join(self.expr_to_text(a) for a in node.args)})"
            )
            return node

        raise Exception(f"Invalid assignment or call at line {first.line}")

    def method_call(self, obj_node, method_name: str, line: int):
        self.expect(TOKEN_OPERATOR, "(")
        args = []

        if not (self.current.type == TOKEN_OPERATOR and self.current.value == ")"):
            args.append(self.expr())
            while self.current.type == TOKEN_OPERATOR and self.current.value == ",":
                self.advance()
                args.append(self.expr())

        self.expect(TOKEN_OPERATOR, ")")

        expr_text = (
            f"{self.expr_to_text(obj_node)}.{method_name}("
            + ", ".join(self.expr_to_text(a) for a in args)
            + ")"
        )
        return MethodCallNode(obj_node, method_name, args, line, expr_text)

    def if_stmt(self):
        start = self.expect(TOKEN_KEYWORD, "agar")
        condition = self.expr()
        self.skip_newlines()
        body = self.block()

        elif_blocks = []
        else_body = None

        while self.current.type == TOKEN_KEYWORD and self.current.value == "warna":
            self.advance()
            if self.current.type == TOKEN_KEYWORD and self.current.value == "agar":
                self.advance()
                cond = self.expr()
                self.skip_newlines()
                blk = self.block()
                elif_blocks.append((cond, blk))
            else:
                self.skip_newlines()
                else_body = self.block()
                break

        return IfNode(condition, body, elif_blocks, else_body, start.line)

    def while_stmt(self):
        start = self.expect(TOKEN_KEYWORD, "jabtak")
        cond = self.expr()
        self.skip_newlines()
        body = self.block()
        return WhileNode(cond, body, start.line)

    def for_stmt(self):
        start = self.expect(TOKEN_KEYWORD, "har")
        iterable = self.expr()
        self.expect(TOKEN_KEYWORD, "main")

        var_tok = self.expect(TOKEN_IDENTIFIER)
        index_name = None

        if self.current.type == TOKEN_OPERATOR and self.current.value == ",":
            self.advance()
            index_name = self.expect(TOKEN_IDENTIFIER).value

        self.skip_newlines()
        body = self.block()

        return ForNode(iterable, var_tok.value, body, start.line, index_name)

    def func_def(self):
        start = self.expect(TOKEN_KEYWORD, "kaam")
        name = self.expect(TOKEN_IDENTIFIER).value
        self.expect(TOKEN_OPERATOR, "(")

        params = []
        if self.current.type == TOKEN_IDENTIFIER:
            params.append(self.current.value)
            self.advance()
            while self.current.type == TOKEN_OPERATOR and self.current.value == ",":
                self.advance()
                params.append(self.expect(TOKEN_IDENTIFIER).value)

        self.expect(TOKEN_OPERATOR, ")")

        if self.current.type == TOKEN_OPERATOR and self.current.value == ":":
            self.advance()

        self.skip_newlines()
        body = self.block()
        return FunctionDefNode(name, params, body, start.line)


    def func_call(self, name_tok):
        self.expect(TOKEN_OPERATOR, "(")
        args = []

        if not (self.current.type == TOKEN_OPERATOR and self.current.value == ")"):
            args.append(self.expr())
            while self.current.type == TOKEN_OPERATOR and self.current.value == ",":
                self.advance()
                args.append(self.expr())

        self.expect(TOKEN_OPERATOR, ")")
        return FunctionCallNode(name_tok.value, args, name_tok.line)

    def block(self):
        self.expect(TOKEN_INDENT)
        self.skip_newlines()

        stmts = []
        while self.current.type != TOKEN_DEDENT:
            stmts.append(self.statement())
            self.skip_newlines()

        self.expect(TOKEN_DEDENT)
        return stmts

    def expr(self):
        return self.logical()

    def logical(self):
        node = self.comparison()
        while self.current.type == TOKEN_KEYWORD and self.current.value in ("aur", "ya"):
            tok = self.current
            self.advance()
            right = self.comparison()
            node = BinaryOpNode(node, tok.value, right, tok.line,
                                f"{node.expr_text} {tok.value} {right.expr_text}")
        return node

    def comparison(self):
        node = self.term()
        while self.current.type == TOKEN_OPERATOR and self.current.value in (">", "<", ">=", "<=", "==", "!="):
            tok = self.current
            self.advance()
            right = self.term()
            node = BinaryOpNode(node, tok.value, right, tok.line,
                                f"{node.expr_text} {tok.value} {right.expr_text}")
        return node

    def term(self):
        node = self.factor()
        while self.current.type == TOKEN_OPERATOR and self.current.value in ("+", "-"):
            tok = self.current
            self.advance()
            right = self.factor()
            node = BinaryOpNode(node, tok.value, right, tok.line,
                                f"{node.expr_text} {tok.value} {right.expr_text}")
        return node

    def factor(self):
        node = self.unary()
        while self.current.type == TOKEN_OPERATOR and self.current.value in ("*", "/", "%"):
            tok = self.current
            self.advance()
            right = self.unary()
            node = BinaryOpNode(node, tok.value, right, tok.line,
                                f"{node.expr_text} {tok.value} {right.expr_text}")
        return node

    def unary(self):
        if self.current.type == TOKEN_KEYWORD and self.current.value == "nahi":
            tok = self.current
            self.advance()
            node = UnaryOpNode("nahi", self.unary(), tok.line)

            inner = self.expr_to_text(node.node)
            node.expr_text = f"nahi {inner}"

            return node
        return self.primary()

    def primary(self):
        tok = self.current

        # ---------- NUMBER ----------
        if tok.type == TOKEN_NUMBER:
            self.advance()
            node = NumberNode(tok.value, tok.line)
            node.expr_text = str(tok.value)
            return node

        # ---------- STRING ----------
        if tok.type == TOKEN_STRING:
            self.advance()
            node = StringNode(tok.value, tok.line)
            node.expr_text = f'"{tok.value}"'
            return node

        # ---------- KEYWORDS ----------
        if tok.type == TOKEN_KEYWORD:
            if tok.value == "true":
                self.advance()
                node = BooleanNode(True, tok.line)
                node.expr_text = "true"
                return node
            if tok.value == "false":
                self.advance()
                node = BooleanNode(False, tok.line)
                node.expr_text = "false"
                return node
            if tok.value == "none":
                self.advance()
                node = NoneNode(tok.line)
                node.expr_text = "none"
                return node
            if tok.value == "pucho":
                self.advance()
                node = InputNode(tok.line)
                node.expr_text = "pucho"
                return node

        # ---------- VARIABLE / INDEX / CALL / MEMBER ACCESS / METHOD CALL ----------
        if tok.type == TOKEN_IDENTIFIER:
            self.advance()
            node = VarAccessNode(tok.value, tok.line)
            node.expr_text = tok.value

            while True:
                if self.current.type == TOKEN_OPERATOR and self.current.value == "[":
                    self.advance()
                    idx = self.expr()
                    self.expect(TOKEN_OPERATOR, "]")
                    node = IndexAccessNode(
                        node,
                        idx,
                        tok.line,
                        f"{node.expr_text}[{idx.expr_text}]"
                    )
                    continue

                if self.current.type == TOKEN_OPERATOR and self.current.value == ".":
                    self.advance()
                    mem_tok = self.expect(TOKEN_IDENTIFIER)

                    if self.current.type == TOKEN_OPERATOR and self.current.value == "(":
                        node = self.method_call(node, mem_tok.value, tok.line)
                        continue

                    node = MemberAccessNode(
                        node,
                        mem_tok.value,
                        tok.line,
                        f"{self.expr_to_text(node)}.{mem_tok.value}"
                    )
                    continue

                if self.current.type == TOKEN_OPERATOR and self.current.value == "(":
                    return self.func_call(tok)

                break

            return node

        # ---------- LIST LITERAL ----------
        if tok.type == TOKEN_OPERATOR and tok.value == "[":
            self.advance()
            elements = []

            if not (self.current.type == TOKEN_OPERATOR and self.current.value == "]"):
                elements.append(self.expr())
                while self.current.type == TOKEN_OPERATOR and self.current.value == ",":
                    self.advance()
                    elements.append(self.expr())

            self.expect(TOKEN_OPERATOR, "]")
            node = ListNode(elements, tok.line)
            node.expr_text = "list"
            return node

        raise Exception(f"Invalid expression at line {tok.line}")
