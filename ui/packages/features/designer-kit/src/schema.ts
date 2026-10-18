/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/designer-kit/schema —— 结构校验的问题形状与读取器：问题只带问题码、JSON 路径、所在对象、严重程度与参数，
// 不带文案；读取器按类型读字段并把不符合的地方记成问题。

import type { JsonPath, JsonPrimitive, JsonValue } from '@xihan-ui/core/json'
import { findJsonViolation, isPlainObject } from '@xihan-ui/core/json'

/** 严重程度：error 表示模板不可用，warning 表示可用但很可能有误。 */
export type IssueSeverity = 'error' | 'warning'

/** 问题参数的取值。 */
export type IssueParamValue = JsonPrimitive | readonly JsonPrimitive[]

/** 问题落在的对象，如 { kind: 'node', id: 'approve' }。 */
export interface SchemaIssueTarget {
  /** 对象种类，如 node、edge、element、field。 */
  readonly kind: string
  /** 对象 id。 */
  readonly id: string
}

/** 一条结构问题。path 从文档根算起，只用对象键与数组下标；按对象定位看 target。 */
export interface SchemaIssue<C extends string = string> {
  /** 问题码；产品与扩展的问题码带前缀，如 node.unreachable。 */
  readonly code: C
  /** 问题落在文档里的位置，从文档根算起。 */
  readonly path: JsonPath
  /** 问题落在的对象，如某个节点；不落在具体对象上的问题不给。 */
  readonly target?: SchemaIssueTarget
  /** 缺省按 error 处理。 */
  readonly severity?: IssueSeverity
  /** 填进问题说明的参数，如 { max: 1, count: 2 }。 */
  readonly params?: Readonly<Record<string, IssueParamValue>>
}

/** 读取器与属性检查使用的通用问题码；产品自己的问题码带前缀，如 node.unreachable。 */
export type CommonIssueCode
  = | 'required'
    | 'invalid-type'
    | 'invalid-value'
    | 'out-of-range'
    | 'not-integer'
    | 'invalid-option'
    | 'invalid-color'
    | 'empty'
    | 'unknown-key'
    | 'duplicate-key'
    | 'duplicate-id'
    | 'duplicate-value'
    | 'unknown-control'

/** 问题的严重程度；没写时为 error。 */
export function issueSeverity(issue: SchemaIssue): IssueSeverity {
  return issue.severity ?? 'error'
}

/** 是否有 error 级问题。 */
export function hasErrors(issues: readonly SchemaIssue[]): boolean {
  return issues.some(issue => issueSeverity(issue) === 'error')
}

/**
 * 给一组问题定下严重程度：overrides 优先，其次问题自己写的，再次 table，最后为 error；
 * 定为 off 的问题去掉。返回新数组，每条问题都带上 severity。
 */
export function withSeverity<C extends string>(
  issues: readonly SchemaIssue<C>[],
  table: Readonly<Partial<Record<C, IssueSeverity>>>,
  overrides?: Readonly<Partial<Record<C, IssueSeverity | 'off'>>>,
): SchemaIssue<C>[] {
  const result: SchemaIssue<C>[] = []
  for (const issue of issues) {
    const severity = (overrides && own(overrides, issue.code)) ?? issue.severity ?? own(table, issue.code) ?? 'error'
    if (severity !== 'off')
      result.push({ ...issue, severity })
  }
  return result
}

function own<V>(record: Readonly<Partial<Record<string, V>>>, key: string): V | undefined {
  return Object.hasOwn(record, key) ? record[key] : undefined
}

/** report 的附加信息。 */
export interface IssueDetails {
  readonly params?: Readonly<Record<string, IssueParamValue>>
  readonly target?: SchemaIssueTarget
  readonly severity?: IssueSeverity
}

/** 收集问题。 */
export interface IssueSink<C extends string = string> {
  readonly issues: SchemaIssue<C>[]
  readonly report: (code: C, path: JsonPath, details?: IssueDetails) => void
}

/** 创建问题收集器；target 会写进每条没有自带 target 的问题。 */
export function createIssueSink<C extends string = string>(defaults: { readonly target?: SchemaIssueTarget } = {}): IssueSink<C> {
  const issues: SchemaIssue<C>[] = []
  return {
    issues,
    report(code, path, details = {}) {
      const target = details.target ?? defaults.target
      issues.push({
        code,
        path: [...path],
        ...(target ? { target } : {}),
        ...(details.severity ? { severity: details.severity } : {}),
        ...(details.params ? { params: details.params } : {}),
      })
    },
  }
}

/** 读取器只用到 report：问题码容得下通用问题码的收集器都可以传入。 */
export interface IssueReporter {
  readonly report: (code: CommonIssueCode, path: JsonPath, details?: IssueDetails) => void
}

/** readObject 的规则。 */
export interface ObjectRule {
  /** 必须有（值不为 undefined）的键，缺少时报 required。 */
  readonly required?: readonly string[]
  /** 允许出现的键；给了就把其余键报为 unknown-key。 */
  readonly allowed?: readonly string[]
}

/**
 * 读取普通对象：不是普通对象报 invalid-type 并返回 undefined；否则报出缺少的必填键与未登记的键，
 * 返回对象本身（不拷贝）。以下各 read 函数都把 undefined 视为缺省，返回 undefined 且不报问题，必填由这里的 required 管。
 */
export function readObject(sink: IssueReporter, value: unknown, path: JsonPath, rule: ObjectRule = {}): Readonly<Record<string, unknown>> | undefined {
  if (value === undefined)
    return undefined
  if (!isPlainObject(value)) {
    sink.report('invalid-type', path, { params: { expected: 'object' } })
    return undefined
  }
  if (rule.allowed) {
    for (const key of Object.keys(value)) {
      if (!rule.allowed.includes(key))
        sink.report('unknown-key', [...path, key])
    }
  }
  for (const key of rule.required ?? []) {
    if (!Object.hasOwn(value, key) || value[key] === undefined)
      sink.report('required', [...path, key])
  }
  return value
}

/** 读取数组：不是数组报 invalid-type。 */
export function readArray(sink: IssueReporter, value: unknown, path: JsonPath): readonly unknown[] | undefined {
  if (value === undefined)
    return undefined
  if (!Array.isArray(value)) {
    sink.report('invalid-type', path, { params: { expected: 'array' } })
    return undefined
  }
  return value
}

/** 读取字符串：不是字符串报 invalid-type；nonEmpty 时空串报 empty 并返回 undefined。 */
export function readString(sink: IssueReporter, value: unknown, path: JsonPath, rule: { readonly nonEmpty?: boolean } = {}): string | undefined {
  if (value === undefined)
    return undefined
  if (typeof value !== 'string') {
    sink.report('invalid-type', path, { params: { expected: 'string' } })
    return undefined
  }
  if (rule.nonEmpty && value === '') {
    sink.report('empty', path)
    return undefined
  }
  return value
}

/** readNumber 的规则：min / max 含端点，exclusiveMin 不含。 */
export interface NumberRule {
  readonly integer?: boolean
  readonly min?: number
  readonly max?: number
  readonly exclusiveMin?: number
}

/** 读取有限数字：不是有限数字报 invalid-type，不是整数报 not-integer，越界报 out-of-range（参数带上界限）。 */
export function readNumber(sink: IssueReporter, value: unknown, path: JsonPath, rule: NumberRule = {}): number | undefined {
  if (value === undefined)
    return undefined
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    sink.report('invalid-type', path, { params: { expected: 'number' } })
    return undefined
  }
  if (rule.integer && !Number.isInteger(value)) {
    sink.report('not-integer', path)
    return undefined
  }
  if ((rule.min !== undefined && value < rule.min)
    || (rule.max !== undefined && value > rule.max)
    || (rule.exclusiveMin !== undefined && value <= rule.exclusiveMin)) {
    const params: Record<string, number> = {}
    for (const key of ['min', 'max', 'exclusiveMin'] as const) {
      if (rule[key] !== undefined)
        params[key] = rule[key]
    }
    sink.report('out-of-range', path, { params })
    return undefined
  }
  return value
}

/** 读取布尔：不是布尔报 invalid-type。 */
export function readBoolean(sink: IssueReporter, value: unknown, path: JsonPath): boolean | undefined {
  if (value === undefined)
    return undefined
  if (typeof value !== 'boolean') {
    sink.report('invalid-type', path, { params: { expected: 'boolean' } })
    return undefined
  }
  return value
}

/** 读取限定取值：不在 choices 里报 invalid-option（参数带上 choices）。 */
export function readOneOf<T extends JsonPrimitive>(sink: IssueReporter, value: unknown, path: JsonPath, choices: readonly T[]): T | undefined {
  if (value === undefined)
    return undefined
  if (!choices.includes(value as T)) {
    sink.report('invalid-option', path, { params: { choices } })
    return undefined
  }
  return value as T
}

/** 读取任意 JSON 值：不是 JSON 报 invalid-value（参数 pointer 指出第一处非 JSON 的位置，相对这个值）。 */
export function readJson(sink: IssueReporter, value: unknown, path: JsonPath): JsonValue | undefined {
  if (value === undefined)
    return undefined
  const violation = findJsonViolation(value)
  if (violation !== undefined) {
    sink.report('invalid-value', path, { params: { pointer: violation } })
    return undefined
  }
  return value as JsonValue
}

/**
 * 检查数组项的键不重复：keyOf 返回 undefined 的项不参与；同一个键第二次及以后出现的项报 code
 * （缺省 duplicate-key，参数带上 key）。返回是否全部唯一。
 */
export function checkUniqueKeys<T>(
  sink: IssueReporter,
  items: readonly T[],
  path: JsonPath,
  keyOf: (item: T, index: number) => string | undefined,
  code: CommonIssueCode = 'duplicate-key',
): boolean {
  const seen = new Set<string>()
  let unique = true
  items.forEach((item, index) => {
    const key = keyOf(item, index)
    if (key === undefined)
      return
    if (seen.has(key)) {
      sink.report(code, [...path, index], { params: { key } })
      unique = false
    }
    seen.add(key)
  })
  return unique
}
