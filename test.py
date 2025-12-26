# test_lexer.py

from lexer import Lexer

code = """
x = 5
dikhao x

agar x >= 5
    "debug mode"
warna
    "chhota"
"""

lexer = Lexer(code)
tokens = lexer.tokenize()

for token in tokens:
    print(token)
