/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 词法与语法分析：源码到语法树，带长度与深度上限。
import type { BinaryOperator, ExpressionNode, IdentifierNode } from './ast'
import type { ExpressionIssue, ExpressionIssueCode } from './issues'
import { isDigit, isNamePart, isNameStart, isWhitespace } from './chars'
import { ExprNumber, parseNumberText } from './decimal'
import { createIssue } from './issues'
import { DEFAULT_LIMITS, readLimit } from './limits'

/** 解析选项。 */
export interface ParseOptions {
  /** 源码长度上限，缺省 10000。 */
  readonly maxLength?: number
  /** 语法树深度上限，缺省 100。 */
  readonly maxDepth?: number
}

/** 解析结果：成功时带语法树，失败时带第一条问题。 */
export type ParseResult
  = | { readonly ok: true, readonly ast: ExpressionNode }
    | { readonly ok: false, readonly issue: ExpressionIssue }

type TokenKind = 'number' | 'string' | 'name' | 'quoted' | 'punct' | 'end'

interface Token {
  readonly kind: TokenKind
  readonly value: string
  readonly start: number
  readonly end: number
}

const KEYWORDS: Readonly<Record<string, null | boolean>> = { true: true, false: false, null: null }
const FUNCTION_NAME = /^[A-Z_]\w*$/i
const DOUBLE_PUNCTUATORS = ['==', '!=', '<=', '>=', '&&', '||'] as const
const SINGLE_PUNCTUATORS = '()[],.?:+-*/%!<>'
const SIMPLE_ESCAPES: Readonly<Record<string, string>> = { '\\': '\\', '\'': '\'', '"': '"', 'n': '\n', 'r': '\r', 't': '\t' }
const HEX4 = /^[0-9a-f]{4}$/i
const EQUALITY_OPERATORS: ReadonlySet<string> = new Set(['==', '!='])
const RELATIONAL_OPERATORS: ReadonlySet<string> = new Set(['<', '<=', '>', '>='])

class ParseFailure {
  readonly issue: ExpressionIssue

  constructor(issue: ExpressionIssue) {
    this.issue = issue
  }
}

function fail(code: ExpressionIssueCode, start: number, end: number, data?: Record<string, string | number>): never {
  throw new ParseFailure(createIssue(code, start, end, data))
}

class Lexer {
  private readonly source: string
  private index = 0
  readonly tokens: Token[] = []

  constructor(source: string) {
    this.source = source
  }

  private codeAt(index: number): number {
    return index < this.source.length ? this.source.codePointAt(index)! : -1
  }

  run(): Token[] {
    for (;;) {
      while (isWhitespace(this.codeAt(this.index)))
        this.index += 1
      if (this.index >= this.source.length) {
        this.tokens.push({ kind: 'end', value: '', start: this.index, end: this.index })
        return this.tokens
      }
      this.tokens.push(this.readToken())
    }
  }

  private readToken(): Token {
    const start = this.index
    const code = this.codeAt(start)
    const char = this.source[start]!
    if (isDigit(code))
      return this.readNumber()
    if (char === '\'' || char === '"')
      return this.readString(char)
    if (char === '`')
      return this.readQuotedName()
    if (isNameStart(code))
      return this.readName()
    const pair = this.source.slice(start, start + 2)
    if ((DOUBLE_PUNCTUATORS as readonly string[]).includes(pair)) {
      this.index += 2
      return { kind: 'punct', value: pair, start, end: this.index }
    }
    if (SINGLE_PUNCTUATORS.includes(char)) {
      this.index += 1
      return { kind: 'punct', value: char, start, end: this.index }
    }
    const width = code > 0xFFFF ? 2 : 1
    return fail('XH_EXPR_UNEXPECTED_CHARACTER', start, start + width, { char: this.source.slice(start, start + width) })
  }

  private skipDigits(): void {
    while (isDigit(this.codeAt(this.index)))
      this.index += 1
  }

  private readNumber(): Token {
    const start = this.index
    this.skipDigits()
    if (this.source[this.index] === '.' && isDigit(this.codeAt(this.index + 1))) {
      this.index += 1
      this.skipDigits()
    }
    const marker = this.source[this.index]
    if (marker === 'e' || marker === 'E') {
      let cursor = this.index + 1
      const sign = this.source[cursor]
      if (sign === '+' || sign === '-')
        cursor += 1
      if (!isDigit(this.codeAt(cursor)))
        fail('XH_EXPR_INVALID_NUMBER', start, cursor)
      this.index = cursor
      this.skipDigits()
    }
    if (isNamePart(this.codeAt(this.index))) {
      let end = this.index
      while (isNamePart(this.codeAt(end)))
        end += this.codeAt(end) > 0xFFFF ? 2 : 1
      fail('XH_EXPR_INVALID_NUMBER', start, end)
    }
    return { kind: 'number', value: this.source.slice(start, this.index), start, end: this.index }
  }

  private readEscape(context: 'string' | 'name'): string {
    const start = this.index
    const marker = this.source[start + 1]
    if (marker === undefined)
      fail('XH_EXPR_UNTERMINATED_STRING', start, this.source.length)
    if (context === 'name') {
      if (marker === '`' || marker === '\\') {
        this.index += 2
        return marker
      }
      fail('XH_EXPR_INVALID_ESCAPE', start, start + 2)
    }
    if (marker === 'u') {
      const hex = this.source.slice(start + 2, start + 6)
      if (!HEX4.test(hex))
        fail('XH_EXPR_INVALID_ESCAPE', start, Math.min(start + 6, this.source.length))
      this.index += 6
      return String.fromCharCode(Number.parseInt(hex, 16))
    }
    const simple = SIMPLE_ESCAPES[marker]
    if (simple === undefined)
      fail('XH_EXPR_INVALID_ESCAPE', start, start + 2)
    this.index += 2
    return simple
  }

  private readString(quote: string): Token {
    const start = this.index
    this.index += 1
    let value = ''
    for (;;) {
      const char = this.source[this.index]
      if (char === undefined)
        fail('XH_EXPR_UNTERMINATED_STRING', start, this.source.length)
      if (char === quote) {
        this.index += 1
        return { kind: 'string', value, start, end: this.index }
      }
      if (char === '\\') {
        value += this.readEscape('string')
        continue
      }
      value += char
      this.index += 1
    }
  }

  private readQuotedName(): Token {
    const start = this.index
    this.index += 1
    let value = ''
    for (;;) {
      const char = this.source[this.index]
      if (char === undefined)
        fail('XH_EXPR_UNTERMINATED_STRING', start, this.source.length)
      if (char === '`') {
        this.index += 1
        if (value === '')
          fail('XH_EXPR_INVALID_IDENTIFIER', start, this.index)
        return { kind: 'quoted', value, start, end: this.index }
      }
      if (char === '\\') {
        value += this.readEscape('name')
        continue
      }
      value += char
      this.index += 1
    }
  }

  private readName(): Token {
    const start = this.index
    while (isNamePart(this.codeAt(this.index)))
      this.index += this.codeAt(this.index) > 0xFFFF ? 2 : 1
    return { kind: 'name', value: this.source.slice(start, this.index), start, end: this.index }
  }
}

class Parser {
  private readonly tokens: readonly Token[]
  private readonly maxDepth: number
  private readonly depths = new Map<ExpressionNode, number>()
  private position = 0
  private nesting = 0

  constructor(tokens: readonly Token[], maxDepth: number) {
    this.tokens = tokens
    this.maxDepth = maxDepth
  }

  private peek(): Token {
    return this.tokens[this.position]!
  }

  private advance(): Token {
    const token = this.tokens[this.position]!
    if (token.kind !== 'end')
      this.position += 1
    return token
  }

  private isPunct(value: string): boolean {
    const token = this.peek()
    return token.kind === 'punct' && token.value === value
  }

  private unexpected(token: Token): never {
    if (token.kind === 'end')
      fail('XH_EXPR_UNEXPECTED_END', token.start, token.end)
    const data: Record<string, string> = { kind: token.kind }
    if (token.kind === 'punct' || token.kind === 'name')
      data.token = token.value
    return fail('XH_EXPR_UNEXPECTED_TOKEN', token.start, token.end, data)
  }

  private expect(value: string): Token {
    const token = this.advance()
    if (token.kind !== 'punct' || token.value !== value)
      this.unexpected(token)
    return token
  }

  private make<T extends ExpressionNode>(node: T, children: readonly ExpressionNode[]): T {
    let depth = 1
    for (const child of children)
      depth = Math.max(depth, this.depths.get(child)! + 1)
    if (depth > this.maxDepth)
      fail('XH_EXPR_TOO_DEEP', node.start, node.end)
    this.depths.set(node, depth)
    return Object.freeze(node)
  }

  private nest<T>(read: () => T): T {
    if (this.nesting >= this.maxDepth) {
      const token = this.peek()
      fail('XH_EXPR_TOO_DEEP', token.start, token.end)
    }
    this.nesting += 1
    try {
      return read()
    }
    finally {
      this.nesting -= 1
    }
  }

  parseRoot(): ExpressionNode {
    const ast = this.nest(() => this.parseConditional())
    const rest = this.peek()
    if (rest.kind !== 'end')
      this.unexpected(rest)
    return ast
  }

  private parseConditional(): ExpressionNode {
    const test = this.parseOr()
    if (!this.isPunct('?'))
      return test
    this.advance()
    const consequent = this.nest(() => this.parseConditional())
    this.expect(':')
    const alternate = this.nest(() => this.parseConditional())
    return this.make({ type: 'Conditional', test, consequent, alternate, start: test.start, end: alternate.end }, [test, consequent, alternate])
  }

  private parseOr(): ExpressionNode {
    let left = this.parseAnd()
    while (this.isPunct('||')) {
      this.advance()
      const right = this.parseAnd()
      left = this.make({ type: 'Logical', operator: '||', left, right, start: left.start, end: right.end }, [left, right])
    }
    return left
  }

  private parseAnd(): ExpressionNode {
    let left = this.parseEquality()
    while (this.isPunct('&&')) {
      this.advance()
      const right = this.parseEquality()
      left = this.make({ type: 'Logical', operator: '&&', left, right, start: left.start, end: right.end }, [left, right])
    }
    return left
  }

  private parseComparison(operators: ReadonlySet<string>, operand: () => ExpressionNode): ExpressionNode {
    const left = operand()
    const token = this.peek()
    if (token.kind !== 'punct' || !operators.has(token.value))
      return left
    this.advance()
    const right = operand()
    const node = this.make({ type: 'Binary', operator: token.value as BinaryOperator, left, right, start: left.start, end: right.end }, [left, right])
    const after = this.peek()
    if (after.kind === 'punct' && operators.has(after.value))
      fail('XH_EXPR_CHAINED_COMPARISON', after.start, after.end)
    return node
  }

  private parseEquality(): ExpressionNode {
    return this.parseComparison(EQUALITY_OPERATORS, () => this.parseRelational())
  }

  private parseRelational(): ExpressionNode {
    return this.parseComparison(RELATIONAL_OPERATORS, () => this.parseAdditive())
  }

  private parseAdditive(): ExpressionNode {
    let left = this.parseMultiplicative()
    while (this.isPunct('+') || this.isPunct('-')) {
      const operator = this.advance().value as BinaryOperator
      const right = this.parseMultiplicative()
      left = this.make({ type: 'Binary', operator, left, right, start: left.start, end: right.end }, [left, right])
    }
    return left
  }

  private parseMultiplicative(): ExpressionNode {
    let left = this.parseUnary()
    while (this.isPunct('*') || this.isPunct('/') || this.isPunct('%')) {
      const operator = this.advance().value as BinaryOperator
      const right = this.parseUnary()
      left = this.make({ type: 'Binary', operator, left, right, start: left.start, end: right.end }, [left, right])
    }
    return left
  }

  private parseUnary(): ExpressionNode {
    if (this.isPunct('-') || this.isPunct('!')) {
      const token = this.advance()
      const argument = this.nest(() => this.parseUnary())
      return this.make({ type: 'Unary', operator: token.value as '-' | '!', argument, start: token.start, end: argument.end }, [argument])
    }
    return this.parsePostfix()
  }

  private parsePostfix(): ExpressionNode {
    let node = this.parsePrimary()
    for (;;) {
      if (this.isPunct('.')) {
        this.advance()
        const name = this.advance()
        if (name.kind !== 'name' && name.kind !== 'quoted')
          this.unexpected(name)
        node = this.make({ type: 'Member', object: node, property: name.value, start: node.start, end: name.end }, [node])
      }
      else if (this.isPunct('[')) {
        this.advance()
        const index = this.nest(() => this.parseConditional())
        const close = this.expect(']')
        node = this.make({ type: 'Index', object: node, index, start: node.start, end: close.end }, [node, index])
      }
      else if (this.isPunct('(')) {
        const token = this.peek()
        fail('XH_EXPR_INVALID_CALLEE', node.start, token.end)
      }
      else {
        return node
      }
    }
  }

  private parseList(close: string): { items: ExpressionNode[], end: number } {
    const items: ExpressionNode[] = []
    if (!this.isPunct(close)) {
      for (;;) {
        items.push(this.nest(() => this.parseConditional()))
        if (!this.isPunct(','))
          break
        this.advance()
      }
    }
    const end = this.expect(close).end
    return { items, end }
  }

  private parsePrimary(): ExpressionNode {
    const token = this.advance()
    switch (token.kind) {
      case 'number': {
        const parsed = parseNumberText(token.value)
        if (!(parsed instanceof ExprNumber))
          fail('XH_EXPR_NUMBER_OVERFLOW', token.start, token.end)
        return this.make({ type: 'Number', value: parsed.toString(), start: token.start, end: token.end }, [])
      }
      case 'string':
        return this.make({ type: 'Literal', value: token.value, start: token.start, end: token.end }, [])
      case 'quoted':
        return this.make<IdentifierNode>({ type: 'Identifier', name: token.value, start: token.start, end: token.end }, [])
      case 'name': {
        if (Object.hasOwn(KEYWORDS, token.value))
          return this.make({ type: 'Literal', value: KEYWORDS[token.value] as null | boolean, start: token.start, end: token.end }, [])
        if (this.isPunct('('))
          return this.parseCall(token)
        return this.make<IdentifierNode>({ type: 'Identifier', name: token.value, start: token.start, end: token.end }, [])
      }
      case 'punct':
        if (token.value === '(') {
          const inner = this.nest(() => this.parseConditional())
          this.expect(')')
          return inner
        }
        if (token.value === '[') {
          const { items, end } = this.parseList(']')
          return this.make({ type: 'Array', elements: Object.freeze(items), start: token.start, end }, items)
        }
        return this.unexpected(token)
      default:
        return this.unexpected(token)
    }
  }

  private parseCall(name: Token): ExpressionNode {
    if (!FUNCTION_NAME.test(name.value))
      fail('XH_EXPR_INVALID_CALLEE', name.start, name.end)
    this.advance()
    const { items, end } = this.parseList(')')
    return this.make({ type: 'Call', callee: name.value, arguments: Object.freeze(items), start: name.start, end }, items)
  }
}

/** 把源码解析成语法树。从不抛异常；选项不是正整数时抛 `TypeError`。 */
export function parse(source: string, options: ParseOptions = {}): ParseResult {
  const maxLength = readLimit(options.maxLength, DEFAULT_LIMITS.maxLength, 'maxLength')
  const maxDepth = readLimit(options.maxDepth, DEFAULT_LIMITS.maxDepth, 'maxDepth')
  if (source.length > maxLength)
    return { ok: false, issue: createIssue('XH_EXPR_TOO_LONG', 0, source.length, { max: maxLength }) }
  try {
    const tokens = new Lexer(source).run()
    if (tokens.length === 1)
      return { ok: false, issue: createIssue('XH_EXPR_EMPTY', 0, source.length) }
    const ast = new Parser(tokens, maxDepth).parseRoot()
    return { ok: true, ast }
  }
  catch (error) {
    if (error instanceof ParseFailure)
      return { ok: false, issue: error.issue }
    throw error
  }
}
