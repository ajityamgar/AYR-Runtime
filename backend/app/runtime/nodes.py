from dataclasses import dataclass
from typing import Any, List, Optional


# ============================================================
# PROGRAM
# ============================================================

@dataclass
class Program:
    statements: List[Any]


# ============================================================
# LITERALS
# ============================================================

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


# ============================================================
# VARIABLES
# ============================================================

@dataclass
class VarAccessNode:
    name: str
    line: int


@dataclass
class VarAssignNode:
    name: str
    value: Any
    line: int


# ============================================================
# EXPRESSIONS
# ============================================================

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


# ============================================================
# STATEMENTS
# ============================================================

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


# ============================================================
# FUNCTIONS
# ============================================================

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


# ============================================================
# COLLECTIONS
# ============================================================

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


@dataclass
class IndexAccessNode:
    collection: Any
    index: Any
    line: int
    expr_text: str


@dataclass
class IndexAssignNode:
    collection: any
    index: any
    value: any
    line: int
    expr_text: str


# ============================================================
# LOOPS
# ============================================================

@dataclass
class ForNode:
    iterable: any
    var_name: str
    body: list
    line: int
    index_name: Optional[str] = None

@dataclass
class MultiAssignNode:
    names: List[str]
    line: int

@dataclass
class ClassDefNode:
    name: str
    methods: List[Any]   # list[MethodDefNode]
    line: int


@dataclass
class MethodDefNode:
    name: str
    params: List[str]
    body: List[Any]
    line: int


@dataclass
class MemberAccessNode:
    obj: Any
    member: str
    line: int
    expr_text: str


@dataclass
class MemberAssignNode:
    obj: Any
    member: str
    value: Any
    line: int
    expr_text: str


@dataclass
class MethodCallNode:
    obj: Any
    method: str
    args: List[Any]
    line: int
    expr_text: str


@dataclass
class AYRClass:
    name: str
    methods: dict


@dataclass
class AYRObject:
    class_ref: AYRClass
    fields: dict

