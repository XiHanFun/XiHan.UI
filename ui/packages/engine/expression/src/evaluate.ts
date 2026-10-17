/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按语法树求值：类型规则、三值逻辑、成员投影与求值预算。
import type { ExpressionNode, NodeRange } from './ast'
import type { Runtime } from './functions/entry'
import type { ExpressionIssue, ExpressionIssueCode } from './issues'
import type { ExprValue } from './value'
import { ExprDate } from './date'
import { add, divide, ExprNumber, multiply, negate, parseNumberText, remainder, subtract } from './decimal'
import { IF_ENTRY } from './functions/logic'
import { DEFAULT_FUNCTION_TABLE, FunctionTable, resolveFunction } from './functions/table'
import { createIssue, Fault } from './issues'
import { DEFAULT_LIMITS, readLimit } from './limits'
import { ExprList, ExprRecord, isForbiddenName, listItem, listOf, recordField, typeOf, valuesEqual } from './value'

/** 求值选项。 */
export interface EvaluateOptions {
  /** 函数表，缺省是全部内置函数。 */
  readonly functions?: FunctionTable
  /** 当前时间，`NOW()` / `TODAY()` 读它；缺省不提供。 */
  readonly now?: ExprDate | null
  /** 求值步数上限，缺省 100000。 */
  readonly maxSteps?: number
  /** 求值嵌套深度上限，缺省 100。 */
  readonly maxDepth?: number
  /** 字符串结果长度上限，缺省 100000。 */
  readonly maxStringLength?: number
}

/** 求值结果：成功时带值，失败时带一条问题。 */
export type EvaluateResult
  = | { readonly ok: true, readonly value: ExprValue }
    | { readonly ok: false, readonly issue: ExpressionIssue }

/** 求值的输入数据：普通对象或记录，顶层键就是表达式里可用的标识符。 */
export type EvaluateScope = Readonly<Record<string, unknown>> | ExprRecord

class Located {
  readonly issue: ExpressionIssue

  constructor(issue: ExpressionIssue) {
    this.issue = issue
  }
}

type Outcome = ExprValue | Located

const EMPTY_RANGE: NodeRange = /* @__PURE__ */ Object.freeze({ start: 0, end: 0 })
const ORDERED_TYPES: ReadonlySet<string> = new Set(['number', 'string', 'date'])

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function rangeOf(node: unknown): NodeRange {
  if (!isRecordLike(node))
    return EMPTY_RANGE
  const { start, end } = node
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || (start as number) < 0 || (end as number) < (start as number))
    return EMPTY_RANGE
  return { start: start as number, end: end as number }
}

function locate(fault: Fault, range: NodeRange, extra?: Record<string, string | number>): Located {
  const data = fault.data === undefined && extra === undefined ? undefined : { ...extra, ...fault.data }
  return new Located(createIssue(fault.code, range.start, range.end, data))
}

function issueAt(code: ExpressionIssueCode, range: NodeRange, data?: Record<string, string | number>): Located {
  return new Located(createIssue(code, range.start, range.end, data))
}

function mismatchAt(range: NodeRange, operator: string, value: ExprValue): Located {
  return issueAt('XH_EXPR_TYPE_MISMATCH', range, { operator, actual: typeOf(value) })
}

class Evaluator implements Runtime {
  readonly now: ExprDate | null
  readonly maxStringLength: number
  private readonly scope: ExprRecord
  private readonly table: FunctionTable
  private readonly maxSteps: number
  private readonly maxDepth: number
  private steps = 0
  private depth = 0

  constructor(scope: ExprRecord, table: FunctionTable, now: ExprDate | null, limits: { maxSteps: number, maxDepth: number, maxStringLength: number }) {
    this.scope = scope
    this.table = table
    this.now = now
    this.maxSteps = limits.maxSteps
    this.maxDepth = limits.maxDepth
    this.maxStringLength = limits.maxStringLength
  }

  charge(steps: number): Fault | undefined {
    this.steps += steps
    return this.steps > this.maxSteps ? new Fault('XH_EXPR_STEP_LIMIT', { max: this.maxSteps }) : undefined
  }

  enter(): Fault | undefined {
    if (this.depth >= this.maxDepth)
      return new Fault('XH_EXPR_DEPTH_LIMIT', { max: this.maxDepth })
    this.depth += 1
    return undefined
  }

  leave(): void {
    this.depth -= 1
  }

  run(node: unknown): Outcome {
    const range = rangeOf(node)
    const entered = this.enter()
    if (entered)
      return locate(entered, range)
    try {
      const charged = this.charge(1)
      if (charged)
        return locate(charged, range)
      const result = this.dispatch(node, range)
      return result instanceof Fault ? locate(result, range) : result
    }
    finally {
      this.leave()
    }
  }

  private dispatch(node: unknown, range: NodeRange): Outcome | Fault {
    if (!isRecordLike(node))
      return issueAt('XH_EXPR_INVALID_AST', range)
    switch (node.type) {
      case 'Literal':
        return node.value === null || typeof node.value === 'boolean' || typeof node.value === 'string'
          ? node.value
          : issueAt('XH_EXPR_INVALID_AST', range)
      case 'Number': {
        const parsed = typeof node.value === 'string' ? parseNumberText(node.value) : null
        return parsed ?? issueAt('XH_EXPR_INVALID_AST', range)
      }
      case 'Array':
        return this.array(node.elements, range)
      case 'Identifier':
        return this.identifier(node.name, range)
      case 'Member':
        return this.member(node.object, node.property, range)
      case 'Index':
        return this.index(node.object, node.index, range)
      case 'Unary':
        return this.unary(node.operator, node.argument, range)
      case 'Binary':
        return this.binary(node.operator, node.left, node.right, range)
      case 'Logical':
        return this.logical(node.operator, node.left, node.right, range)
      case 'Conditional':
        return this.conditional(node.test, node.consequent, node.alternate, range)
      case 'Call':
        return this.call(node.callee, node.arguments, range)
      default:
        return issueAt('XH_EXPR_INVALID_AST', range)
    }
  }

  private array(elements: unknown, range: NodeRange): Outcome {
    if (!Array.isArray(elements))
      return issueAt('XH_EXPR_INVALID_AST', range)
    const items: ExprValue[] = []
    for (const element of elements as unknown[]) {
      const value = this.run(element)
      if (value instanceof Located)
        return value
      items.push(value)
    }
    return listOf(items)
  }

  private identifier(name: unknown, range: NodeRange): Outcome | Fault {
    if (typeof name !== 'string' || name === '')
      return issueAt('XH_EXPR_INVALID_AST', range)
    if (isForbiddenName(name))
      return new Fault('XH_EXPR_FORBIDDEN_MEMBER', { name })
    return recordField(this.scope, name) ?? null
  }

  private member(objectNode: unknown, property: unknown, range: NodeRange): Outcome | Fault {
    if (typeof property !== 'string' || property === '')
      return issueAt('XH_EXPR_INVALID_AST', range)
    if (isForbiddenName(property))
      return new Fault('XH_EXPR_FORBIDDEN_MEMBER', { name: property })
    const target = this.run(objectNode)
    if (target instanceof Located)
      return target
    return this.readMember(target, property)
  }

  private readMember(target: ExprValue, property: string): ExprValue | Fault {
    if (target === null)
      return null
    if (target instanceof ExprRecord)
      return recordField(target, property) ?? null
    if (target instanceof ExprList)
      return this.project(target, property)
    return new Fault('XH_EXPR_TYPE_MISMATCH', { operator: '.', actual: typeOf(target) })
  }

  private project(list: ExprList, property: string): ExprValue | Fault {
    const entered = this.enter()
    if (entered)
      return entered
    try {
      const items: ExprValue[] = []
      for (let position = 0; position < list.length; position += 1) {
        const charged = this.charge(1)
        if (charged)
          return charged
        const item = listItem(list, position)
        if (item instanceof Fault)
          return item
        const value = this.readMember(item, property)
        if (value instanceof Fault)
          return value
        items.push(value)
      }
      return listOf(items)
    }
    finally {
      this.leave()
    }
  }

  private index(objectNode: unknown, indexNode: unknown, range: NodeRange): Outcome | Fault {
    const target = this.run(objectNode)
    if (target instanceof Located)
      return target
    const key = this.run(indexNode)
    if (key instanceof Located)
      return key
    if (typeof key === 'string' && isForbiddenName(key))
      return new Fault('XH_EXPR_FORBIDDEN_MEMBER', { name: key })
    if (target === null || key === null)
      return null
    if (target instanceof ExprList) {
      if (!(key instanceof ExprNumber))
        return mismatchAt(rangeOf(indexNode), '[]', key)
      if (!key.isInteger)
        return issueAt('XH_EXPR_INVALID_INDEX', rangeOf(indexNode))
      const position = key.toJs()
      return position < 0 || position >= target.length ? null : listItem(target, position)
    }
    if (target instanceof ExprRecord) {
      if (typeof key !== 'string')
        return mismatchAt(rangeOf(indexNode), '[]', key)
      return recordField(target, key) ?? null
    }
    return mismatchAt(range, '[]', target)
  }

  private unary(operator: unknown, argumentNode: unknown, range: NodeRange): Outcome | Fault {
    if (operator !== '-' && operator !== '!')
      return issueAt('XH_EXPR_INVALID_AST', range)
    const value = this.run(argumentNode)
    if (value instanceof Located || value === null)
      return value
    if (operator === '-')
      return value instanceof ExprNumber ? negate(value) : mismatchAt(rangeOf(argumentNode), operator, value)
    return typeof value === 'boolean' ? !value : mismatchAt(rangeOf(argumentNode), operator, value)
  }

  private binary(operator: unknown, leftNode: unknown, rightNode: unknown, range: NodeRange): Outcome | Fault {
    if (typeof operator !== 'string')
      return issueAt('XH_EXPR_INVALID_AST', range)
    switch (operator) {
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
        return this.arithmetic(operator, leftNode, rightNode)
      case '==':
      case '!=':
        return this.equality(operator, leftNode, rightNode)
      case '<':
      case '<=':
      case '>':
      case '>=':
        return this.relational(operator, leftNode, rightNode)
      default:
        return issueAt('XH_EXPR_INVALID_AST', range)
    }
  }

  private operands(leftNode: unknown, rightNode: unknown): [ExprValue, ExprValue] | Located {
    const left = this.run(leftNode)
    if (left instanceof Located)
      return left
    const right = this.run(rightNode)
    if (right instanceof Located)
      return right
    return [left, right]
  }

  private arithmetic(operator: '+' | '-' | '*' | '/' | '%', leftNode: unknown, rightNode: unknown): Outcome | Fault {
    const pair = this.operands(leftNode, rightNode)
    if (pair instanceof Located)
      return pair
    const [left, right] = pair
    const allowed = (value: ExprValue): boolean => value === null || value instanceof ExprNumber || (operator === '+' && typeof value === 'string')
    if (!allowed(left))
      return mismatchAt(rangeOf(leftNode), operator, left)
    if (!allowed(right))
      return mismatchAt(rangeOf(rightNode), operator, right)
    if (left === null || right === null)
      return null
    if (typeof left === 'string' || typeof right === 'string') {
      if (typeof left !== 'string' || typeof right !== 'string')
        return mismatchAt(rangeOf(rightNode), operator, right)
      return left.length + right.length > this.maxStringLength
        ? new Fault('XH_EXPR_STRING_TOO_LONG', { max: this.maxStringLength })
        : left + right
    }
    const a = left as ExprNumber
    const b = right as ExprNumber
    switch (operator) {
      case '+':
        return add(a, b)
      case '-':
        return subtract(a, b)
      case '*':
        return multiply(a, b)
      case '/':
        return divide(a, b)
      case '%':
        return remainder(a, b)
    }
  }

  private equality(operator: '==' | '!=', leftNode: unknown, rightNode: unknown): Outcome | Fault {
    const pair = this.operands(leftNode, rightNode)
    if (pair instanceof Located)
      return pair
    const equal = valuesEqual(pair[0], pair[1], this)
    if (equal instanceof Fault)
      return equal
    return operator === '==' ? equal : !equal
  }

  private relational(operator: '<' | '<=' | '>' | '>=', leftNode: unknown, rightNode: unknown): Outcome | Fault {
    const pair = this.operands(leftNode, rightNode)
    if (pair instanceof Located)
      return pair
    const [left, right] = pair
    if (!ORDERED_TYPES.has(typeOf(left)) && left !== null)
      return mismatchAt(rangeOf(leftNode), operator, left)
    if (!ORDERED_TYPES.has(typeOf(right)) && right !== null)
      return mismatchAt(rangeOf(rightNode), operator, right)
    if (left === null || right === null)
      return null
    if (typeOf(left) !== typeOf(right))
      return mismatchAt(rangeOf(rightNode), operator, right)
    let order: number
    if (left instanceof ExprNumber)
      order = left.compare(right as ExprNumber)
    else if (left instanceof ExprDate)
      order = left.compare(right as ExprDate)
    else
      order = (left as string) < (right as string) ? -1 : (left as string) > (right as string) ? 1 : 0
    switch (operator) {
      case '<':
        return order < 0
      case '<=':
        return order <= 0
      case '>':
        return order > 0
      case '>=':
        return order >= 0
    }
  }

  private condition(node: unknown, operator: string): boolean | null | Located {
    const value = this.run(node)
    if (value instanceof Located || value === null || typeof value === 'boolean')
      return value
    return mismatchAt(rangeOf(node), operator, value)
  }

  private logical(operator: unknown, leftNode: unknown, rightNode: unknown, range: NodeRange): Outcome {
    if (operator !== '&&' && operator !== '||')
      return issueAt('XH_EXPR_INVALID_AST', range)
    const left = this.condition(leftNode, operator)
    if (left instanceof Located)
      return left
    const decisive = operator === '||'
    if (left === decisive)
      return decisive
    const right = this.condition(rightNode, operator)
    if (right instanceof Located)
      return right
    if (left === !decisive)
      return right
    return right === decisive ? decisive : null
  }

  private conditional(testNode: unknown, consequentNode: unknown, alternateNode: unknown, range: NodeRange): Outcome {
    if (testNode === undefined || consequentNode === undefined || alternateNode === undefined)
      return issueAt('XH_EXPR_INVALID_AST', range)
    const test = this.condition(testNode, '?:')
    if (test instanceof Located)
      return test
    return this.run(test === true ? consequentNode : alternateNode)
  }

  private call(callee: unknown, argumentNodes: unknown, range: NodeRange): Outcome {
    if (typeof callee !== 'string' || callee === '' || !Array.isArray(argumentNodes))
      return issueAt('XH_EXPR_INVALID_AST', range)
    const nodes = argumentNodes as unknown[]
    const calleeRange = { start: range.start, end: Math.min(range.end, range.start + callee.length) }
    const entry = resolveFunction(this.table, callee)
    if (entry === undefined)
      return issueAt('XH_EXPR_UNKNOWN_FUNCTION', calleeRange, { name: callee })
    if (nodes.length < entry.minArgs || (entry.maxArgs !== null && nodes.length > entry.maxArgs)) {
      const data: Record<string, string | number> = { name: entry.name, min: entry.minArgs, actual: nodes.length }
      if (entry.maxArgs !== null)
        data.max = entry.maxArgs
      return issueAt('XH_EXPR_ARGUMENT_COUNT', range, data)
    }
    if (entry === IF_ENTRY) {
      const test = this.run(nodes[0])
      if (test instanceof Located)
        return test
      if (test !== null && typeof test !== 'boolean')
        return issueAt('XH_EXPR_TYPE_MISMATCH', rangeOf(nodes[0]), { function: entry.name, index: 0, actual: typeOf(test) })
      const branch = test === true ? nodes[1] : nodes[2]
      return branch === undefined ? null : this.run(branch)
    }
    const values: ExprValue[] = []
    for (const node of nodes) {
      const value = this.run(node)
      if (value instanceof Located)
        return value
      values.push(value)
    }
    const result = entry.invoke(values, this)
    if (!(result instanceof Fault))
      return result
    const index = result.data?.index
    const target = typeof index === 'number' && index >= 0 && index < nodes.length ? rangeOf(nodes[index]) : range
    return locate(result, target, { function: entry.name })
  }
}

function toScope(scope: EvaluateScope | undefined): ExprRecord {
  if (scope === undefined)
    return ExprRecord.from({})
  return scope instanceof ExprRecord ? scope : ExprRecord.from(scope)
}

/**
 * 对语法树求值。语法树可以来自 `parse`，也可以来自反序列化的 JSON：结构不合法时报 `XH_EXPR_INVALID_AST`。
 * 表达式或数据的问题一律以结果返回，从不抛异常；选项不合法时抛 `TypeError`。
 */
export function evaluate(ast: ExpressionNode, scope?: EvaluateScope, options: EvaluateOptions = {}): EvaluateResult {
  const table = options.functions ?? DEFAULT_FUNCTION_TABLE
  if (!(table instanceof FunctionTable))
    throw new TypeError('functions 必须由 createFunctionTable 创建')
  const now = options.now ?? null
  if (now !== null && !(now instanceof ExprDate))
    throw new TypeError('now 必须是 ExprDate')
  const evaluator = new Evaluator(toScope(scope), table, now, {
    maxSteps: readLimit(options.maxSteps, DEFAULT_LIMITS.maxSteps, 'maxSteps'),
    maxDepth: readLimit(options.maxDepth, DEFAULT_LIMITS.maxDepth, 'maxDepth'),
    maxStringLength: readLimit(options.maxStringLength, DEFAULT_LIMITS.maxStringLength, 'maxStringLength'),
  })
  const result = evaluator.run(ast)
  return result instanceof Located ? { ok: false, issue: result.issue } : { ok: true, value: result }
}
