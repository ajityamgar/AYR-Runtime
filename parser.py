from lexer import *
from nodes import *


class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0
        self.current = tokens[0]

    # ---------- helpers ----------
    def advance(self):
        self.pos += 1
        if self.pos < len(self.tokens):
            self.current = self.tokens[self.pos]

    def expect(self, t, v=None):
        tok = self.current
        if tok.type != t:
            raise Exception(f"Expected {t}, got {tok}")
        if v is not None and tok.value != v:
            raise Exception(f"Expected '{v}', got '{tok.value}'")
        self.advance()
        return tok

    def skip_nl(self):
        while self.current.type == TOKEN_NEWLINE:
            self.advance()

    # ---------- expression text helper ----------
    def expr_to_text(self, node):
        if isinstance(node, VarAccessNode):
            return node.name
        if isinstance(node, NumberNode):
            return str(node.value)
        if isinstance(node, StringNode):
            return f'"{node.value}"'
        if isinstance(node, BooleanNode):
            return "sach" if node.value else "jhoot"
        if isinstance(node, NoneNode):
            return "none"
        if isinstance(node, BinaryOpNode):
            return node.expr_text
        return "expression"

    # ---------- entry ----------
    def parse(self):
        stmts = []
        self.skip_nl()
        while self.current.type != TOKEN_EOF:
            stmts.append(self.statement())
            self.skip_nl()
        return Program(stmts)

    # ================= STATEMENTS =================

    def statement(self):
        if self.current.type == TOKEN_KEYWORD:
            kw = self.current.value
            line = self.current.line

            if kw == "dikhao":
                self.advance()
                return PrintNode(self.expr(), line)

            if kw == "agar":
                return self.if_stmt()

            if kw == "jabtak":
                return self.while_stmt()

            if kw == "band":
                self.advance()
                return BreakNode(line)

            if kw == "chalu":
                self.advance()
                return ContinueNode(line)

            if kw == "kaam":
                return self.func_def()

            if kw == "har":
                return self.for_stmt()

            if kw == "wapas":
                self.advance()
                if self.current.type in (TOKEN_NEWLINE, TOKEN_DEDENT):
                    return ReturnNode(None, line)
                return ReturnNode(self.expr(), line)

        if self.current.type == TOKEN_IDENTIFIER:
            name_tok = self.current
            self.advance()

            if self.current.type == TOKEN_OPERATOR and self.current.value == "=":
                self.advance()
                return VarAssignNode(name_tok.value, self.expr(), name_tok.line)

            if self.current.type == TOKEN_OPERATOR and self.current.value == "(":
                return self.func_call(name_tok)

        raise Exception(f"Invalid statement at line {self.current.line}")

    # ---------- IF / ELIF / ELSE ----------
    def if_stmt(self):
        start = self.expect(TOKEN_KEYWORD, "agar")
        cond = self.expr()
        self.skip_nl()
        body = self.block()

        elif_blocks = []
        else_body = None

        while self.current.type == TOKEN_KEYWORD and self.current.value == "warna":
            self.advance()
            if self.current.type == TOKEN_KEYWORD and self.current.value == "agar":
                self.advance()
                econd = self.expr()
                self.skip_nl()
                ebody = self.block()
                elif_blocks.append((econd, ebody))
            else:
                self.skip_nl()
                else_body = self.block()
                break

        return IfNode(cond, body, elif_blocks, else_body, start.line)


    # ---------- FOR ----------
    def for_stmt(self):
        start = self.expect(TOKEN_KEYWORD, "har")

        iterable = self.expr()

        self.expect(TOKEN_KEYWORD, "main")

        var_tok = self.expect(TOKEN_IDENTIFIER)

        self.skip_nl()
        body = self.block()

        return ForNode(
            iterable=iterable,
            var_name=var_tok.value,
            body=body,
            line=start.line
        )


    # ---------- WHILE ----------
    def while_stmt(self):
        start = self.expect(TOKEN_KEYWORD, "jabtak")
        cond = self.expr()
        self.skip_nl()
        body = self.block()
        return WhileNode(cond, body, start.line)

    # ---------- FUNCTION DEF ----------
    def func_def(self):
        start = self.expect(TOKEN_KEYWORD, "kaam")
        name_tok = self.expect(TOKEN_IDENTIFIER)

        self.expect(TOKEN_OPERATOR, "(")
        params = []

        if self.current.type == TOKEN_IDENTIFIER:
            params.append(self.current.value)
            self.advance()
            while self.current.type == TOKEN_OPERATOR and self.current.value == ",":
                self.advance()
                params.append(self.expect(TOKEN_IDENTIFIER).value)

        self.expect(TOKEN_OPERATOR, ")")
        self.skip_nl()
        body = self.block()
        return FunctionDefNode(name_tok.value, params, body, start.line)

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

    # ---------- BLOCK ----------
    def block(self):
        self.expect(TOKEN_INDENT)
        self.skip_nl()
        stmts = []
        while self.current.type != TOKEN_DEDENT:
            stmts.append(self.statement())
            self.skip_nl()
        self.expect(TOKEN_DEDENT)
        return stmts

    # ================= EXPRESSIONS =================

    def expr(self):
        return self.logical()

    def logical(self):
        node = self.comparison()
        while self.current.type == TOKEN_KEYWORD and self.current.value in ("aur", "ya"):
            tok = self.current
            self.advance()
            right = self.comparison()
            text = f"{self.expr_to_text(node)} {tok.value} {self.expr_to_text(right)}"
            node = BinaryOpNode(node, tok.value, right, tok.line, text)
        return node

    def comparison(self):
        node = self.term()
        while self.current.type == TOKEN_OPERATOR and self.current.value in (
            ">", "<", ">=", "<=", "==", "!="
        ):
            tok = self.current
            self.advance()
            right = self.term()
            text = f"{self.expr_to_text(node)} {tok.value} {self.expr_to_text(right)}"
            node = BinaryOpNode(node, tok.value, right, tok.line, text)
        return node

    def term(self):
        node = self.factor()
        while self.current.type == TOKEN_OPERATOR and self.current.value in ("+", "-"):
            tok = self.current
            self.advance()
            right = self.factor()
            text = f"{self.expr_to_text(node)} {tok.value} {self.expr_to_text(right)}"
            node = BinaryOpNode(node, tok.value, right, tok.line, text)
        return node

    def factor(self):
        node = self.unary()
        while self.current.type == TOKEN_OPERATOR and self.current.value in ("*", "/", "%"):
            tok = self.current
            self.advance()
            right = self.unary()
            text = f"{self.expr_to_text(node)} {tok.value} {self.expr_to_text(right)}"
            node = BinaryOpNode(node, tok.value, right, tok.line, text)
        return node

    def unary(self):
        if self.current.type == TOKEN_KEYWORD and self.current.value == "nahi":
            tok = self.current
            self.advance()
            return UnaryOpNode("nahi", self.unary(), tok.line)
        if self.current.type == TOKEN_OPERATOR and self.current.value == "!":
            tok = self.current
            self.advance()
            return UnaryOpNode("!", self.unary(), tok.line)
        return self.primary()

    def primary(self):
        tok = self.current

        # ---------- LITERALS ----------
        if tok.type == TOKEN_NUMBER:
            self.advance()
            return NumberNode(tok.value, tok.line)

        if tok.type == TOKEN_STRING:
            self.advance()
            return StringNode(tok.value, tok.line)

        if tok.type == TOKEN_KEYWORD:
            if tok.value == "sach":
                self.advance()
                return BooleanNode(True, tok.line)
            if tok.value == "jhoot":
                self.advance()
                return BooleanNode(False, tok.line)
            if tok.value == "none":
                self.advance()
                return NoneNode(tok.line)
            if tok.value == "pucho":
                self.advance()
                return InputNode(tok.line)
        

        # ---------- LIST ----------
        if tok.type == TOKEN_OPERATOR and tok.value == "[":
            start = tok
            self.advance()
            elements = []

            if not (self.current.type == TOKEN_OPERATOR and self.current.value == "]"):
                elements.append(self.expr())
                while self.current.type == TOKEN_OPERATOR and self.current.value == ",":
                    self.advance()
                    elements.append(self.expr())

            self.expect(TOKEN_OPERATOR, "]")
            return ListNode(elements, start.line)

        # ---------- TUPLE ----------
        if tok.type == TOKEN_OPERATOR and tok.value == "(":
            start = tok
            self.advance()
            elements = []

            if not (self.current.type == TOKEN_OPERATOR and self.current.value == ")"):
                elements.append(self.expr())
                while self.current.type == TOKEN_OPERATOR and self.current.value == ",":
                    self.advance()
                    elements.append(self.expr())

            self.expect(TOKEN_OPERATOR, ")")
            return TupleNode(elements, start.line)

        # ---------- DICTIONARY ----------
        if tok.type == TOKEN_OPERATOR and tok.value == "{":
            start = tok
            self.advance()
            pairs = []

            if not (self.current.type == TOKEN_OPERATOR and self.current.value == "}"):
                key = self.expr()
                self.expect(TOKEN_OPERATOR, ":")
                value = self.expr()
                pairs.append((key, value))

                while self.current.type == TOKEN_OPERATOR and self.current.value == ",":
                    self.advance()
                    key = self.expr()
                    self.expect(TOKEN_OPERATOR, ":")
                    value = self.expr()
                    pairs.append((key, value))

            self.expect(TOKEN_OPERATOR, "}")
            return DictNode(pairs, start.line)

        # ---------- VARIABLE / FUNCTION CALL ----------
        if tok.type == TOKEN_IDENTIFIER:
            name_tok = tok
            self.advance()
            if self.current.type == TOKEN_OPERATOR and self.current.value == "(":
                return self.func_call(name_tok)
            return VarAccessNode(name_tok.value, name_tok.line)

        raise Exception(f"Invalid expression at line {tok.line}")
