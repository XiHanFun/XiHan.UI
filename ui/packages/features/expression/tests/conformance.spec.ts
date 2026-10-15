import type { ExpressionIssue, ExprRecord, ExprValue } from '../src'
import { describe, expect, it } from 'vitest'
import { evaluate, ExprDate, ExprList, ExprNumber, parse } from '../src'
import cases from './fixtures/conformance.json'

/**
 * 跨实现一致性用例。每条给出源码、可选的作用域与当前时间，以及期望的值或问题。
 * 值的编码：`null`、`boolean:<值>`、`number:<规范文本>`、`string:<文本>`、`date:<规范文本>`，
 * 列表是编码后的数组，记录是编码后的对象。其它语言的实现读同一份文件逐条比对。
 */
interface ConformanceCase {
  readonly source: string
  readonly scope?: Record<string, unknown>
  readonly now?: string
  readonly value?: unknown
  readonly issue?: ExpressionIssue
}

function encode(value: ExprValue): unknown {
  if (value === null)
    return 'null'
  if (typeof value === 'boolean')
    return `boolean:${value}`
  if (typeof value === 'string')
    return `string:${value}`
  if (value instanceof ExprNumber)
    return `number:${value.toString()}`
  if (value instanceof ExprDate)
    return `date:${value.toString()}`
  if (value instanceof ExprList)
    return value.toArray().map(encode)
  return Object.fromEntries((value as ExprRecord).keys().map(key => [key, encode((value as ExprRecord).get(key))]))
}

function outcome(item: ConformanceCase): { value: unknown } | { issue: ExpressionIssue } {
  const parsed = parse(item.source)
  if (!parsed.ok)
    return { issue: parsed.issue }
  const now = item.now === undefined ? null : ExprDate.parse(item.now)
  const result = evaluate(parsed.ast, item.scope, { now })
  return result.ok ? { value: encode(result.value) } : { issue: result.issue }
}

describe('跨实现一致性用例', () => {
  it.each((cases as readonly ConformanceCase[]).map(item => [item.source, item] as const))('%s', (_source, item) => {
    const expected = item.issue === undefined ? { value: item.value } : { issue: item.issue }
    expect(outcome(item)).toEqual(expected)
  })
})
