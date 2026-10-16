/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 静态检查语法树：结构、深度、禁止的成员名、未知标识符、未知函数与实参个数。
import type { ExpressionNode } from './ast'
import type { ExpressionIssue, ExpressionIssueCode } from './issues'
import type { ParseOptions } from './parser'
import { ExprNumber, parseNumberText } from './decimal'
import { DEFAULT_FUNCTION_TABLE, FunctionTable } from './functions/table'
import { createIssue } from './issues'
import { DEFAULT_LIMITS, readLimit } from './limits'
import { parse } from './parser'
import { isForbiddenName } from './value'

/** 静态检查选项。 */
export interface CheckOptions {
  /** 已知的顶层标识符；提供时，不在其中的标识符报 `XH_EXPR_UNKNOWN_IDENTIFIER`。 */
  readonly identifiers?: Iterable<string> | ((name: string) => boolean)
  /** 函数表，缺省是全部内置函数。 */
  readonly functions?: FunctionTable
  /** 语法树深度上限，缺省 100。 */
  readonly maxDepth?: number
}

/** 解析并检查：成功时带语法树，失败时带全部问题。 */
export type CompileResult
  = | { readonly ok: true, readonly ast: ExpressionNode }
    | { readonly ok: false, readonly issues: readonly ExpressionIssue[] }

const UNARY_OPERATORS: ReadonlySet<unknown> = new Set(['-', '!'])
const BINARY_OPERATORS: ReadonlySet<unknown> = new Set(['+', '-', '*', '/', '%', '==', '!=', '<', '<=', '>', '>='])
const LOGICAL_OPERATORS: ReadonlySet<unknown> = new Set(['&&', '||'])

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isRange(node: Record<string, unknown>): boolean {
  const { start, end } = node
  return Number.isSafeInteger(start) && Number.isSafeInteger(end) && (start as number) >= 0 && (end as number) >= (start as number)
}

function nameFilter(identifiers: CheckOptions['identifiers']): ((name: string) => boolean) | null {
  if (identifiers === undefined)
    return null
  if (typeof identifiers === 'function')
    return identifiers
  const known = new Set(identifiers)
  return name => known.has(name)
}

class Checker {
  readonly issues: ExpressionIssue[] = []
  private readonly isKnown: ((name: string) => boolean) | null
  private readonly table: FunctionTable
  private readonly maxDepth: number
  private tooDeep = false

  constructor(isKnown: ((name: string) => boolean) | null, table: FunctionTable, maxDepth: number) {
    this.isKnown = isKnown
    this.table = table
    this.maxDepth = maxDepth
  }

  private report(code: ExpressionIssueCode, start: number, end: number, data?: Record<string, string | number>): void {
    this.issues.push(createIssue(code, start, end, data))
  }

  visit(node: unknown, depth: number): void {
    if (!isRecordLike(node) || !isRange(node)) {
      this.report('XH_EXPR_INVALID_AST', 0, 0)
      return
    }
    const start = node.start as number
    const end = node.end as number
    if (depth > this.maxDepth) {
      if (!this.tooDeep)
        this.report('XH_EXPR_TOO_DEEP', start, end, { max: this.maxDepth })
      this.tooDeep = true
      return
    }
    const invalid = (): void => this.report('XH_EXPR_INVALID_AST', start, end)
    const children = (...nodes: unknown[]): void => {
      for (const child of nodes)
        this.visit(child, depth + 1)
    }
    switch (node.type) {
      case 'Literal':
        if (node.value !== null && typeof node.value !== 'boolean' && typeof node.value !== 'string')
          invalid()
        return
      case 'Number': {
        const parsed = typeof node.value === 'string' ? parseNumberText(node.value) : null
        if (parsed === null)
          invalid()
        else if (!(parsed instanceof ExprNumber))
          this.report('XH_EXPR_NUMBER_OVERFLOW', start, end)
        return
      }
      case 'Array':
        if (!Array.isArray(node.elements))
          return invalid()
        return children(...(node.elements as unknown[]))
      case 'Identifier':
        if (typeof node.name !== 'string' || node.name === '')
          return invalid()
        if (isForbiddenName(node.name))
          return this.report('XH_EXPR_FORBIDDEN_MEMBER', start, end, { name: node.name })
        if (this.isKnown !== null && !this.isKnown(node.name))
          this.report('XH_EXPR_UNKNOWN_IDENTIFIER', start, end, { name: node.name })
        return
      case 'Member':
        if (typeof node.property !== 'string' || node.property === '')
          return invalid()
        if (isForbiddenName(node.property))
          this.report('XH_EXPR_FORBIDDEN_MEMBER', start, end, { name: node.property })
        return children(node.object)
      case 'Index':
        if (isRecordLike(node.index) && node.index.type === 'Literal' && typeof node.index.value === 'string' && isForbiddenName(node.index.value))
          this.report('XH_EXPR_FORBIDDEN_MEMBER', start, end, { name: node.index.value })
        return children(node.object, node.index)
      case 'Unary':
        if (!UNARY_OPERATORS.has(node.operator))
          return invalid()
        return children(node.argument)
      case 'Binary':
        if (!BINARY_OPERATORS.has(node.operator))
          return invalid()
        return children(node.left, node.right)
      case 'Logical':
        if (!LOGICAL_OPERATORS.has(node.operator))
          return invalid()
        return children(node.left, node.right)
      case 'Conditional':
        return children(node.test, node.consequent, node.alternate)
      case 'Call':
        return this.call(node, start, end, depth)
      default:
        return invalid()
    }
  }

  private call(node: Record<string, unknown>, start: number, end: number, depth: number): void {
    const { callee, arguments: args } = node
    if (typeof callee !== 'string' || callee === '' || !Array.isArray(args)) {
      this.report('XH_EXPR_INVALID_AST', start, end)
      return
    }
    const signature = this.table.lookup(callee)
    if (signature === undefined) {
      this.report('XH_EXPR_UNKNOWN_FUNCTION', start, Math.min(end, start + callee.length), { name: callee })
    }
    else if (args.length < signature.minArgs || (signature.maxArgs !== null && args.length > signature.maxArgs)) {
      const data: Record<string, string | number> = { name: signature.name, min: signature.minArgs, actual: args.length }
      if (signature.maxArgs !== null)
        data.max = signature.maxArgs
      this.report('XH_EXPR_ARGUMENT_COUNT', start, end, data)
    }
    for (const argument of args as unknown[])
      this.visit(argument, depth + 1)
  }
}

function readTable(functions: FunctionTable | undefined): FunctionTable {
  const table = functions ?? DEFAULT_FUNCTION_TABLE
  if (!(table instanceof FunctionTable))
    throw new TypeError('functions 必须由 createFunctionTable 创建')
  return table
}

/**
 * 静态检查语法树：结构、深度、禁止的成员名、未知标识符、未知函数与实参个数。
 * 返回全部问题（按遍历顺序）；没有问题时返回空数组。选项不合法时抛 `TypeError`。
 */
export function check(ast: ExpressionNode, options: CheckOptions = {}): readonly ExpressionIssue[] {
  const maxDepth = readLimit(options.maxDepth, DEFAULT_LIMITS.maxDepth, 'maxDepth')
  const checker = new Checker(nameFilter(options.identifiers), readTable(options.functions), maxDepth)
  checker.visit(ast, 1)
  return Object.freeze(checker.issues)
}

/** 解析后立即静态检查。 */
export function compile(source: string, options: ParseOptions & CheckOptions = {}): CompileResult {
  const parsed = parse(source, options)
  if (!parsed.ok)
    return { ok: false, issues: Object.freeze([parsed.issue]) }
  const issues = check(parsed.ast, options)
  return issues.length === 0 ? { ok: true, ast: parsed.ast } : { ok: false, issues }
}
