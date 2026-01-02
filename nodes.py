from dataclasses import dataclass
from typing import Any, List, Optional

@dataclass
class Program:
    statements: List[Any]

@dataclass
class NumberNode:
    value: Any
    line: int

@dataclass
class StringNode:
    value: str
    line: int

@dataclass
class BooleanNode:
    value: bool
    line: int

@dataclass
class NoneNode:
    line: int

@dataclass
class InputNode:
    line: int

@dataclass
class VarAccessNode:
    name: str
    line: int

@dataclass
class VarAssignNode:
    name: str
    value: Any
    line: int

@dataclass
class BinaryOpNode:
    left: Any
    op: str
    right: Any
    line: int
    expr_text: str

@dataclass
class UnaryOpNode:
    op: str
    node: Any
    line: int

@dataclass
class PrintNode:
    value: Any
    line: int

@dataclass
class IfNode:
    condition: Any
    body: List[Any]
    elif_blocks: List[Any]
    else_body: Optional[List[Any]]
    line: int

@dataclass
class WhileNode:
    condition: Any
    body: List[Any]
    line: int

@dataclass
class BreakNode:
    line: int

@dataclass
class ContinueNode:
    line: int

@dataclass
class ReturnNode:
    value: Optional[Any]
    line: int

@dataclass
class FunctionDefNode:
    name: str
    params: List[str]
    body: List[Any]
    line: int

@dataclass
class FunctionCallNode:
    name: str
    args: List[Any]
    line: int

@dataclass
class ForNode:
    iterable: any
    var_name: str
    body: list
    line: int

@dataclass
class ListNode:
    elements: list
    line: int

@dataclass
class TupleNode:
    elements: list
    line: int

@dataclass
class DictNode:
    pairs: list 
    line: int
