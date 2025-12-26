from dataclasses import dataclass

#-----------------------------------------TOKENS TYPES-----------------------------------------
TOKEN_KEYWORD = "KEYWORD"
TOKEN_IDENTIFIER = "IDENTIFIER"
TOKEN_NUMBER = "NUMBER"
TOKEN_STRING = "STRING"
TOKEN_NEWLINE = "NEWLINE"
TOKEN_OPERATOR = "OPERATOR"
TOKEN_TAB = "TAB"
TOKEN_EOF = "EOF"

#----------------------------------------- KEYWORDS -----------------------------------------
KEYWORDS = {
    "dikhao", #print
    "pucho", #input

    "agar", #if
    "warna", #else
    "jabtak", #while

    "kaam", #function
    "wapas", #return

    "ya", #or
    "aur", #and
    "nahi", #not

    "sach", #true
    "jhoot", #false

    "band", #stop
    "chalu", # continue
    "chodo", #skip

    "dekho", #debug
    "peeche", #backward
    "aage", #forword

}

OPERATORS = {
    "+", "-", "*", "/", "%",
    "=", 
    "==", "!=", "<", ">", "<=", ">=",
    "&&", "||", "!"
}

#----------------------------------------- TOKEN CLASS -----------------------------------------
@dataclass
class Token:
    type: str
    value: any
    position: int

    def __repr__(self):
        return f"{self.type}({self.value})"


#----------------------------------------- LEXER -----------------------------------------
class Lexer:
    def __init__(self, text):
        self.text = text
        self.pos = 0
        self.current_char = self.text[self.pos] if self.text else None

#----------------------------------------- HELPER METHODS -----------------------------------------
    def advance(self):
        self.pos += 1
        if self.pos >= len(self.text):
            self.current_char = None
        else:
            self.current_char = self.text[self.pos]

    def peek(self):
        nxt = self.pos + 1
        if nxt >= len(self.text):
            return None
        return self.text[nxt]

    def skip_spaces(self):
            while self.current_char == " ":
                self.advance()

    def skip_comments(self):
        while self.current_char and self.current_char != "\n":
            self.advance()


#----------------------------------------- TOKEN BUILDER -----------------------------------------
    def make_number(self):
        num = ""
        dot_count = 0
        
        while self.current_char and (self.current_char.isdigit() or self.current_char == "."):
            if self.current_char == ".":
                dot_count += 1
                if dot_count > 1:
                    break
            num += self.current_char
            self.advance()

        return Token(TOKEN_NUMBER, float(num) if "." in num else int(num), self.pos)


    def make_identifier(self):
        name = ""
        while self.current_char and (self.current_char.isalnum() or self.current_char == "_"):
            name += self.current_char
            self.advance()
        
        if name in KEYWORDS:
            return Token(TOKEN_KEYWORD, name, self.pos)
        return Token(TOKEN_IDENTIFIER, name, self.pos)

    def make_string(self):
        self.advance() # skip opening quote
        value = ""
        while self.current_char and self.current_char != '"':
            value += self.current_char
            self.advance()

        if self.current_char != '"':
            raise Exception("String literal not closed")

        self.advance() #skip closing quote
        return Token(TOKEN_STRING, value, self.pos)

    def make_operator(self):
        op = self.current_char
        if self.peek() and op + self.peek() in OPERATORS:
            self.advance()
            op += self.current_char
        self.advance()
        return Token(TOKEN_OPERATOR, op, self.pos)

    #----------------------------------------- Main Lexer -----------------------------------------
    def tokenize(self):
        tokens = []
        while self.current_char is not None:

            if self.current_char == " ":
                self.skip_spaces()
                continue

            if self.current_char == "\t":
                tokens.append(Token(TOKEN_TAB, "\\t", self.pos))
                self.advance()
                continue

            if self.current_char == "\n":
                tokens.append(Token(TOKEN_NEWLINE, "\n", self.pos))
                self.advance()
                continue

            if self.current_char.isdigit():
                tokens.append(self.make_number())
                continue

            if self.current_char.isalpha() or self.current_char == "_":
                tokens.append(self.make_identifier())
                continue

            if self.current_char == '"':
                tokens.append(self.make_string())
                continue

            if self.current_char == "#":
                self.skip_comments()
                continue

            if self.current_char in "+-*/%=!<>&|":
                tokens.append(self.make_operator())
                continue

            raise Exception(f"Invalid character '{self.current_char}' at position {self.pos}")
        tokens.append(Token(TOKEN_EOF, None, self.pos))
        return tokens
