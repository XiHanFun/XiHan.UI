/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/** 节点在源码里的区间（UTF-16 码元偏移，左闭右开）。 */
export interface NodeRange {
  readonly start: number
  readonly end: number
}

/** `null`、布尔与字符串字面量。 */
export interface LiteralNode extends NodeRange {
  readonly type: 'Literal'
  readonly value: null | boolean | string
}

/** 数字字面量，`value` 是规范十进制文本。 */
export interface NumberNode extends NodeRange {
  readonly type: 'Number'
  readonly value: string
}

/** 数组字面量 `[a, b]`。 */
export interface ArrayNode extends NodeRange {
  readonly type: 'Array'
  readonly elements: readonly ExpressionNode[]
}

/** 标识符：字段或宿主变量的名字。 */
export interface IdentifierNode extends NodeRange {
  readonly type: 'Identifier'
  readonly name: string
}

/** 点号成员访问 `a.b`。 */
export interface MemberNode extends NodeRange {
  readonly type: 'Member'
  readonly object: ExpressionNode
  readonly property: string
}

/** 方括号访问 `a[i]`、`a['b']`。 */
export interface IndexNode extends NodeRange {
  readonly type: 'Index'
  readonly object: ExpressionNode
  readonly index: ExpressionNode
}

/** 一元运算符。 */
export type UnaryOperator = '-' | '!'

/** 一元运算 `-a`、`!a`。 */
export interface UnaryNode extends NodeRange {
  readonly type: 'Unary'
  readonly operator: UnaryOperator
  readonly argument: ExpressionNode
}

/** 算术与比较运算符。 */
export type BinaryOperator = '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '<=' | '>' | '>='

/** 算术与比较运算。 */
export interface BinaryNode extends NodeRange {
  readonly type: 'Binary'
  readonly operator: BinaryOperator
  readonly left: ExpressionNode
  readonly right: ExpressionNode
}

/** 逻辑运算符。 */
export type LogicalOperator = '&&' | '||'

/** 短路逻辑运算。 */
export interface LogicalNode extends NodeRange {
  readonly type: 'Logical'
  readonly operator: LogicalOperator
  readonly left: ExpressionNode
  readonly right: ExpressionNode
}

/** 条件运算 `test ? consequent : alternate`。 */
export interface ConditionalNode extends NodeRange {
  readonly type: 'Conditional'
  readonly test: ExpressionNode
  readonly consequent: ExpressionNode
  readonly alternate: ExpressionNode
}

/** 函数调用；`callee` 保留源码里的写法，函数名查找不区分 ASCII 大小写。 */
export interface CallNode extends NodeRange {
  readonly type: 'Call'
  readonly callee: string
  readonly arguments: readonly ExpressionNode[]
}

/** 语法树节点。全部是可 JSON 序列化的普通对象。 */
export type ExpressionNode
  = | LiteralNode
    | NumberNode
    | ArrayNode
    | IdentifierNode
    | MemberNode
    | IndexNode
    | UnaryNode
    | BinaryNode
    | LogicalNode
    | ConditionalNode
    | CallNode
