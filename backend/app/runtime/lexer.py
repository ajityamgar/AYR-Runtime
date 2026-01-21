from dataclasses import dataclass

TOKEN_KEYWORD    = "KEYWORD"
TOKEN_IDENTIFIER = "IDENTIFIER"
TOKEN_NUMBER     = "NUMBER"
TOKEN_STRING     = "STRING"
TOKEN_OPERATOR   = "OPERATOR"
TOKEN_NEWLINE    = "NEWLINE"
TOKEN_INDENT     = "INDENT"
TOKEN_DEDENT     = "DEDENT"
TOKEN_EOF        = "EOF"

KEYWORDS = {
    "dikhao", "pucho",
    "agar", "warna", "jabtak",
    "kaam", "wapas",
    "ya", "aur", "nahi",
    "true", "false",
    "band", "chalu",
    "none", "har",
    "main", "class"
}

OPERATORS = {
    "+", "-", "*", "/", "%",
    "=", "==", "!=", "<", ">", "<=", ">=",
    "&&", "||", "!", "++", "--",
    "(", ")", ",", "[", "]", "{", "}", ":",
    "."
}

@dataclass
class Token:
    type: str
    value: any
    position: int
    line: int


class Lexer:
    def __init__(self, text):
        self.text = text
        self.pos = 0
        self.line = 1
        self.current_char = text[0] if text else None
        self.indent_stack = [0]

    def advance(self):
        self.pos += 1
        self.current_char = self.text[self.pos] if self.pos < len(self.text) else None

    def peek(self):
        nxt = self.pos + 1
        return self.text[nxt] if nxt < len(self.text) else None

    def make_operator(self):
        op = self.current_char
        if self.peek() and (op + self.peek()) in OPERATORS:
            self.advance()
            op += self.current_char
        self.advance()
        return Token(TOKEN_OPERATOR, op, self.pos, self.line)

    def tokenize(self):
        tokens = []
        at_line_start = True

        while self.current_char:
            if at_line_start:
                # ✅ count spaces but do not consume immediately
                tmp_pos = self.pos
                spaces = 0

                while tmp_pos < len(self.text) and self.text[tmp_pos] == " ":
                    spaces += 1
                    tmp_pos += 1

                # ✅ if the line is blank (only spaces + newline), DO NOT emit INDENT/DEDENT
                if tmp_pos < len(self.text) and self.text[tmp_pos] == "\n":
                    # consume spaces normally, NEWLINE will be handled below
                    while self.current_char == " ":
                        self.advance()
                    at_line_start = False
                else:
                    # consume spaces for real indentation
                    while self.current_char == " ":
                        self.advance()

                    indent = spaces // 4
                    prev = self.indent_stack[-1]

                    if indent > prev:
                        self.indent_stack.append(indent)
                        tokens.append(Token(TOKEN_INDENT, None, self.pos, self.line))

                    elif indent < prev:
                        while indent < self.indent_stack[-1]:
                            self.indent_stack.pop()
                            tokens.append(Token(TOKEN_DEDENT, None, self.pos, self.line))

                    at_line_start = False

            if self.current_char == "\n":
                tokens.append(Token(TOKEN_NEWLINE, "\n", self.pos, self.line))
                self.advance()
                self.line += 1
                at_line_start = True
                continue

            if self.current_char == "#":
                while self.current_char and self.current_char != "\n":
                    self.advance()
                continue

            if self.current_char.isspace():
                self.advance()
                continue

            if self.current_char.isdigit():
                num = ""
                while self.current_char and (self.current_char.isdigit() or self.current_char == "."):
                    num += self.current_char
                    self.advance()
                tokens.append(Token(
                    TOKEN_NUMBER,
                    float(num) if "." in num else int(num),
                    self.pos,
                    self.line
                ))
                continue

            if self.current_char.isalpha() or self.current_char == "_":
                name = ""
                while self.current_char and (self.current_char.isalnum() or self.current_char == "_"):
                    name += self.current_char
                    self.advance()
                t = TOKEN_KEYWORD if name in KEYWORDS else TOKEN_IDENTIFIER
                tokens.append(Token(t, name, self.pos, self.line))
                continue

            if self.current_char == '"':
                self.advance()
                val = ""
                while self.current_char and self.current_char != '"':
                    val += self.current_char
                    self.advance()
                self.advance()
                tokens.append(Token(TOKEN_STRING, val, self.pos, self.line))
                continue

            if self.current_char in "+-*/%=!<>&|(),[]{}:.":
                tokens.append(self.make_operator())
                continue

            raise Exception(f"Invalid character '{self.current_char}' at line {self.line}")

        while len(self.indent_stack) > 1:
            self.indent_stack.pop()
            tokens.append(Token(TOKEN_DEDENT, None, self.pos, self.line))

        tokens.append(Token(TOKEN_EOF, None, self.pos, self.line))
        return tokens
