/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 表达式输入框的纯函数：光标处取词、收集与插入补全、拼函数签名、把问题切成高亮分段并算出行列。

import type { ExpressionCompletion, ExpressionCompletionSource, ExpressionInputIssue } from '@xihan-ui/core'
import type { FunctionSignature, FunctionTable } from '@xihan-ui/expression'
import type { ExpressionInputIssueView, ExpressionInputItem, ExpressionInputSegment, ExpressionInputTranslations, ExpressionInputWord } from './expression-input.types'
import { scanTokens } from '@xihan-ui/expression'

/** 名字字符：ASCII 字母、数字、`_`、`$`。 */
function isWordChar(char: string | undefined): boolean {
  return char !== undefined && /^[\w$]$/.test(char)
}

/** 光标是否落在字符串、数字或写坏的数字里：这些地方不弹补全。 */
function inLiteral(source: string, caret: number): boolean {
  for (const token of scanTokens(source)) {
    if (token.start >= caret)
      break
    if (token.kind === 'string') {
      const closed = token.end - token.start >= 2 && source[token.end - 1] === source[token.start] && source[token.end - 2] !== '\\'
      if (caret < token.end || !closed)
        return true
    }
    else if ((token.kind === 'number' || token.kind === 'unknown') && caret <= token.end && /^\d/.test(source.slice(token.start, token.end))) {
      return true
    }
  }
  return false
}

/**
 * 光标前正在输入的名字：从光标往回取名字字符，首字符不是数字。
 * 前面紧挨着 `.` 时 member 为点之前那串由名字与点组成的路径（如 `$row`）。
 * 光标落在字符串或数字里、或光标前那串以数字开头时返回 null。
 */
export function expressionWordAt(source: string, caret: number): ExpressionInputWord | null {
  if (inLiteral(source, caret))
    return null
  let start = caret
  while (start > 0 && isWordChar(source[start - 1]))
    start -= 1
  const word = source.slice(start, caret)
  if (/^\d/.test(word))
    return null
  let member: string | null = null
  if (source[start - 1] === '.') {
    let begin = start - 1
    while (begin > 0 && (isWordChar(source[begin - 1]) || source[begin - 1] === '.'))
      begin -= 1
    const path = source.slice(begin, start - 1)
    member = path === '' || /^\d/.test(path) ? null : path
  }
  return { word, start, member }
}

/** 拼函数签名：可选参数套方括号，可重复的最后一个参数后接省略号，如 `IF(条件, 真值[, 假值])`、`SUM(值…)`。 */
export function expressionSignature(signature: FunctionSignature, t: Pick<ExpressionInputTranslations, 'param' | 'paramOrdinal'>): string {
  const { name, minArgs, maxArgs, params } = signature
  const count = maxArgs ?? Math.max(minArgs, 1)
  const names = Array.from({ length: count }, (_, index) => params[index] === undefined ? t.paramOrdinal(index + 1) : t.param(params[index]!))
  if (maxArgs === null && names.length > 0)
    names[names.length - 1] = `${names[names.length - 1]}…`
  let text = names.slice(0, Math.min(minArgs, names.length)).join(', ')
  const optional = maxArgs === null ? names.slice(minArgs) : names.slice(minArgs, maxArgs)
  for (const param of optional)
    text += text === '' ? `[${param}]` : `[, ${param}]`
  return `${name}(${text})`
}

function hostItem(completion: ExpressionCompletion): ExpressionInputItem {
  const insert = completion.insert ?? (completion.kind === 'function' ? `${completion.label}()` : completion.label)
  const caretOffset = completion.insert === undefined && completion.kind === 'function' ? completion.label.length + 1 : insert.length
  return {
    key: `${completion.kind}:${completion.label}`,
    kind: completion.kind,
    label: completion.label,
    detail: completion.detail ?? null,
    description: completion.description ?? null,
    insert,
    caretOffset,
  }
}

function startsWithWord(label: string, word: string): boolean {
  return label.toLowerCase().startsWith(word.toLowerCase())
}

/** 补全收集的输入。 */
export interface ExpressionCompletionInput {
  source: string
  caret: number
  word: ExpressionInputWord
  completions: ExpressionCompletionSource | undefined
  functions: FunctionTable
  translations: Pick<ExpressionInputTranslations, 'param' | 'paramOrdinal' | 'functionDescription'>
}

/**
 * 收集补全条目：宿主条目在前，函数表在后。
 * - 静态列表与函数表按词前缀过滤，不区分大小写；函数形式的宿主来源由宿主自己过滤；
 * - member 不为 null 时只列宿主来源，不列函数；
 * - 同一个 key 只留第一条。
 */
export function collectExpressionCompletions(input: ExpressionCompletionInput): ExpressionInputItem[] {
  const { source, caret, word, completions, functions, translations } = input
  const host = typeof completions === 'function'
    ? completions({ source, caret, word: word.word, member: word.member })
    : (completions ?? []).filter(completion => word.member === null && startsWithWord(completion.label, word.word))
  const items = host.map(hostItem)
  if (word.member === null) {
    for (const name of functions.names) {
      if (!startsWithWord(name, word.word))
        continue
      const signature = functions.lookup(name)!
      items.push({
        key: `fn:${name}`,
        kind: 'function',
        label: name,
        detail: expressionSignature(signature, translations),
        description: translations.functionDescription(name) ?? null,
        insert: `${name}()`,
        caretOffset: name.length + 1,
      })
    }
  }
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.key))
      return false
    seen.add(item.key)
    return true
  })
}

/**
 * 接受一条补全：替换光标处的词，光标落在条目指定的位置。
 * 函数条目后面已经跟着 `(` 时只换名字，光标落进那个括号。
 */
export function applyExpressionCompletion(source: string, word: ExpressionInputWord, caret: number, item: ExpressionInputItem): { value: string, caret: number } {
  const after = source.slice(caret)
  if (item.kind === 'function' && item.insert === `${item.label}()` && after.startsWith('(')) {
    const value = source.slice(0, word.start) + item.label + after
    return { value, caret: word.start + item.label.length + 1 }
  }
  const value = source.slice(0, word.start) + item.insert + after
  return { value, caret: word.start + item.caretOffset }
}

/** 下标所在的行与列，都从 1 起；列按 UTF-16 下标计。 */
export function expressionLineColumn(source: string, offset: number): { line: number, column: number } {
  const before = source.slice(0, Math.max(0, Math.min(offset, source.length)))
  const lineStart = before.lastIndexOf('\n') + 1
  let line = 1
  for (const char of before) {
    if (char === '\n')
      line += 1
  }
  return { line, column: before.length - lineStart + 1 }
}

/** 按问题的位置排好、带上位置与说明。 */
export function viewExpressionIssues(
  source: string,
  issues: readonly ExpressionInputIssue[],
  multiline: boolean,
  t: Pick<ExpressionInputTranslations, 'position' | 'issueRow' | 'issue'>,
): ExpressionInputIssueView[] {
  return [...issues]
    .map((issue, order) => ({ issue, order }))
    .sort((a, b) => a.issue.start - b.issue.start || a.order - b.order)
    .map(({ issue }, index) => {
      const { line, column } = expressionLineColumn(source, issue.start)
      const message = issue.message ?? (issue.code === undefined ? '' : t.issue(issue.code, issue.data ?? {}))
      const position = t.position(multiline ? line : null, column)
      return { index, issue, line: multiline ? line : null, column, message, text: t.issueRow(position, message) }
    })
}

/**
 * 把源码切成高亮分段：问题区间单独成段，其余原文连成一段。
 * - 区间夹到源码范围内；与前一段问题重叠的部分算在前一段里。
 * - 空区间（如「表达式没写完」落在末尾）向前占一个字符；源码为空时不出问题段。
 */
export function expressionSegments(source: string, issues: readonly ExpressionInputIssueView[]): ExpressionInputSegment[] {
  const ranges: { start: number, end: number, view: ExpressionInputIssueView }[] = []
  for (const view of issues) {
    let start = Math.max(0, Math.min(view.issue.start, source.length))
    let end = Math.max(start, Math.min(view.issue.end, source.length))
    if (start === end) {
      if (source.length === 0)
        continue
      if (end < source.length)
        end += 1
      else
        start -= 1
    }
    ranges.push({ start, end, view })
  }
  ranges.sort((a, b) => a.start - b.start || b.end - a.end)
  const segments: ExpressionInputSegment[] = []
  let cursor = 0
  for (const range of ranges) {
    const start = Math.max(range.start, cursor)
    if (start >= range.end)
      continue
    if (start > cursor)
      segments.push({ text: source.slice(cursor, start), start: cursor, end: start, issue: null, severity: null })
    segments.push({ text: source.slice(start, range.end), start, end: range.end, issue: range.view.index, severity: range.view.issue.severity ?? 'error' })
    cursor = range.end
  }
  if (cursor < source.length || segments.length === 0)
    segments.push({ text: source.slice(cursor), start: cursor, end: source.length, issue: null, severity: null })
  return segments
}

/** 两份问题清单是否相同：按区间、问题码、说明、数据与严重程度逐条比。 */
export function sameExpressionIssues(a: readonly ExpressionInputIssue[], b: readonly ExpressionInputIssue[] | undefined): boolean {
  if (a === b)
    return true
  if (b === undefined)
    return false
  return a.length === b.length && a.every((issue, index) => {
    const other = b[index]!
    return issue.start === other.start
      && issue.end === other.end
      && issue.code === other.code
      && issue.message === other.message
      && (issue.severity ?? 'error') === (other.severity ?? 'error')
      && JSON.stringify(issue.data ?? null) === JSON.stringify(other.data ?? null)
  })
}
