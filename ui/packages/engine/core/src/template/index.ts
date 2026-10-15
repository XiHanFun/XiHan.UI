/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/core/template —— `{{path}}` 文本模板：占位里只写数据路径（写法同 formatJsonPath），不写表达式。

import type { JsonPath, JsonValue } from '../json'
import { getJsonAt, isJsonPathText, parseJsonPath } from '../json'

/** 文本模板的问题码：占位没有闭合、占位为空、占位里的路径不合法（与 core/json 的 JsonPathError 同名同义）。 */
export type TemplateIssueCode = 'unclosed-placeholder' | 'empty-placeholder' | 'invalid-path'

/** 文本模板的一条问题：问题码加占位在模板里的区间（UTF-16 码元偏移，左闭右开）。 */
export interface TemplateIssue {
  readonly code: TemplateIssueCode
  readonly start: number
  readonly end: number
}

/** 模板片段：原样文本，或一个数据路径占位（`source` 是去掉两侧空白后的占位内容）。 */
export type TemplateSegment
  = | { readonly kind: 'text', readonly text: string }
    | { readonly kind: 'path', readonly path: JsonPath, readonly source: string }

/** 解析结果：有问题的占位按原样文本保留在片段里。 */
export interface ParsedTextTemplate {
  readonly segments: readonly TemplateSegment[]
  readonly issues: readonly TemplateIssue[]
}

/** 填充选项。 */
export interface FillTextTemplateOptions {
  /** 把读到的值转成文本；返回 `undefined` 表示这个值不能直接显示，占位得到空串并记入 `nonScalar`。缺省规则见 `fillTextTemplate`。 */
  readonly display?: (value: unknown, path: string) => string | undefined
}

/** 填充结果：`nonScalar` 按出现顺序列出读到对象、数组等不能直接显示的值的占位路径。 */
export interface FilledTextTemplate {
  readonly text: string
  readonly nonScalar: readonly string[]
}

/**
 * 解析含 `{{path}}` 占位的文本模板，占位两侧的空白忽略。路径的写法同 `formatJsonPath`：
 * 标识符以 `.` 相连，下标写成 `[0]`，不是标识符的键写成 `["a b"]`；`$page` 这类宿主变量按普通顶层键处理。
 * 未闭合、空占位与不合法的路径都报问题，问题一次全部给出，有问题的占位按原样文本保留。
 */
export function parseTextTemplate(source: string): ParsedTextTemplate {
  if (typeof source !== 'string')
    throw new TypeError('source 必须是字符串')
  const segments: TemplateSegment[] = []
  const issues: TemplateIssue[] = []
  const pushText = (text: string): void => {
    if (text === '')
      return
    const last = segments[segments.length - 1]
    if (last?.kind === 'text')
      segments[segments.length - 1] = { kind: 'text', text: last.text + text }
    else
      segments.push({ kind: 'text', text })
  }
  let cursor = 0
  while (cursor < source.length) {
    const open = source.indexOf('{{', cursor)
    if (open === -1) {
      pushText(source.slice(cursor))
      break
    }
    pushText(source.slice(cursor, open))
    const close = source.indexOf('}}', open + 2)
    if (close === -1) {
      issues.push(Object.freeze({ code: 'unclosed-placeholder', start: open, end: source.length }))
      pushText(source.slice(open))
      break
    }
    const end = close + 2
    const content = source.slice(open + 2, close).trim()
    if (content === '' || !isJsonPathText(content)) {
      issues.push(Object.freeze({ code: content === '' ? 'empty-placeholder' : 'invalid-path', start: open, end }))
      pushText(source.slice(open, end))
    }
    else {
      segments.push({ kind: 'path', path: Object.freeze(parseJsonPath(content)), source: content })
    }
    cursor = end
  }
  return Object.freeze({ segments: Object.freeze(segments.map(segment => Object.freeze(segment))), issues: Object.freeze(issues) })
}

function displayText(value: unknown): string | undefined {
  if (value === null || value === undefined)
    return ''
  switch (typeof value) {
    case 'string':
      return value
    case 'number':
      return Number.isFinite(value) ? String(value) : ''
    case 'boolean':
    case 'bigint':
      return String(value)
  }
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? '' : value.toISOString()
  return undefined
}

/**
 * 按数据替换模板里的占位，不合法的占位按原样保留。读值同 `getJsonAt`：只读自有属性，下标只读数组，读不到得到空串。
 * 缺省的显示规则：`null` 与 `undefined` 为空串，字符串原样，有限数字、布尔与 `bigint` 转字符串，非有限数字为空串，
 * `Date` 转 ISO 文本；对象与数组不能直接显示，得到空串并记入 `nonScalar`。
 */
export function fillTextTemplate(template: string | ParsedTextTemplate, data: unknown, options: FillTextTemplateOptions = {}): FilledTextTemplate {
  const parsed = typeof template === 'string' ? parseTextTemplate(template) : template
  const display = options.display ?? ((value: unknown) => displayText(value))
  const nonScalar: string[] = []
  let text = ''
  for (const segment of parsed.segments) {
    if (segment.kind === 'text') {
      text += segment.text
      continue
    }
    const shown = display(getJsonAt(data as JsonValue | undefined, segment.path), segment.source)
    if (shown === undefined)
      nonScalar.push(segment.source)
    else
      text += shown
  }
  return Object.freeze({ text, nonScalar: Object.freeze(nonScalar) })
}
