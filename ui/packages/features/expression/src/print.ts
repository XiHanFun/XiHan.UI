/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 把语法树打印成规范源码。
import type { ExpressionNode } from './ast'
import { isNamePart, isNameStart } from './chars'

const KEYWORDS: ReadonlySet<string> = new Set(['true', 'false', 'null'])
const FUNCTION_NAME = /^[A-Z_]\w*$/i

const PRECEDENCE: Readonly<Record<string, number>> = {
  '||': 2,
  '&&': 3,
  '==': 4,
  '!=': 4,
  '<': 5,
  '<=': 5,
  '>': 5,
  '>=': 5,
  '+': 6,
  '-': 6,
  '*': 7,
  '/': 7,
  '%': 7,
}
const CONDITIONAL = 1
const UNARY = 8
const POSTFIX = 9
const PRIMARY = 10
const EQUALITY = 4
const RELATIONAL = 5

function matchesName(text: string): boolean {
  if (text === '')
    return false
  let first = true
  for (const char of text) {
    const code = char.codePointAt(0)!
    if (first ? !isNameStart(code) : !isNamePart(code))
      return false
    first = false
  }
  return true
}

/** 文本能否不加反引号写成标识符：符合标识符字符规则且不是关键字。 */
export function isPlainName(text: string): boolean {
  return matchesName(text) && !KEYWORDS.has(text)
}

function quoteName(name: string): string {
  return `\`${name.replace(/[\\`]/g, char => `\\${char}`)}\``
}

function escapeChar(char: string): string {
  switch (char) {
    case '\\': return '\\\\'
    case '\'': return '\\\''
    case '\n': return '\\n'
    case '\r': return '\\r'
    case '\t': return '\\t'
    default: return `\\u${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`
  }
}

function needsEscape(code: number): boolean {
  return code === 0x5C || code === 0x27 || code < 0x20 || code === 0x7F || code === 0x2028 || code === 0x2029
}

function quoteString(value: string): string {
  let out = '\''
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]!
    out += needsEscape(char.charCodeAt(0)) ? escapeChar(char) : char
  }
  return `${out}'`
}

function invalid(): never {
  throw new TypeError('print 只接受合法的语法树')
}

function precedenceOf(node: ExpressionNode): number {
  switch (node.type) {
    case 'Conditional':
      return CONDITIONAL
    case 'Logical':
    case 'Binary':
      return PRECEDENCE[node.operator] ?? invalid()
    case 'Unary':
      return UNARY
    case 'Member':
    case 'Index':
    case 'Call':
      return POSTFIX
    default:
      return PRIMARY
  }
}

function wrap(node: ExpressionNode, parenthesize: boolean): string {
  const text = printNode(node)
  return parenthesize ? `(${text})` : text
}

function printNode(node: ExpressionNode): string {
  switch (node.type) {
    case 'Literal':
      return node.value === null ? 'null' : typeof node.value === 'boolean' ? String(node.value) : quoteString(node.value)
    case 'Number':
      return node.value
    case 'Array':
      return `[${node.elements.map(printNode).join(', ')}]`
    case 'Identifier':
      return isPlainName(node.name) ? node.name : quoteName(node.name)
    case 'Member': {
      const object = wrap(node.object, precedenceOf(node.object) < POSTFIX || node.object.type === 'Number')
      return `${object}.${matchesName(node.property) ? node.property : quoteName(node.property)}`
    }
    case 'Index': {
      const object = wrap(node.object, precedenceOf(node.object) < POSTFIX || node.object.type === 'Number')
      return `${object}[${printNode(node.index)}]`
    }
    case 'Unary':
      return `${node.operator}${wrap(node.argument, precedenceOf(node.argument) < UNARY)}`
    case 'Binary':
    case 'Logical': {
      const own = precedenceOf(node)
      const left = precedenceOf(node.left)
      const right = precedenceOf(node.right)
      const leftParens = own === EQUALITY || own === RELATIONAL ? left <= own : left < own
      return `${wrap(node.left, leftParens)} ${node.operator} ${wrap(node.right, right <= own)}`
    }
    case 'Conditional':
      return `${wrap(node.test, precedenceOf(node.test) <= CONDITIONAL)} ? ${printNode(node.consequent)} : ${printNode(node.alternate)}`
    case 'Call':
      if (!FUNCTION_NAME.test(node.callee))
        invalid()
      return `${node.callee}(${node.arguments.map(printNode).join(', ')})`
    default:
      return invalid()
  }
}

/**
 * 把语法树打印成规范源码：单引号字符串、最少的括号、运算符两侧各一个空格、实参之间用 `, ` 分隔。
 * 打印结果再解析得到同一棵树（区间除外）。语法树不合法时抛 `TypeError`。
 */
export function print(ast: ExpressionNode): string {
  return printNode(ast)
}
