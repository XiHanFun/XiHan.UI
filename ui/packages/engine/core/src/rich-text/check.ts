/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 富文本模型的结构检查：不抛异常，逐项给出问题；不认识的块、行内类型、样式与多余的键都报出来。

import type { JsonPath } from '../json'
import { findJsonViolation, isPlainObject } from '../json'
import { toSafeLinkHref } from '../url'
import { RICH_MARK_KEYS, RICH_TEXT_MAX_LIST_DEPTH } from './types'
import { isRichAlign, isRichColor, isRichFontFamily, isRichFontSize } from './values'

/**
 * 问题码：
 * - invalid-document：不是 `{ blocks: [...] }` 形状的对象；
 * - unknown-block / unknown-inline / unknown-mark：不认识的块类型、行内类型或样式键；
 * - unknown-key：认识的对象上多出来的键；
 * - missing：缺少必填的字段；
 * - invalid-value：字段的类型或取值不对；
 * - unsafe-link：链接地址没过 `toSafeLinkHref`；
 * - conflicting-marks：上标与下标同时打开；
 * - list-too-deep：列表嵌套超过三层。
 */
export type RichTextIssueCode
  = | 'invalid-document'
    | 'unknown-block'
    | 'unknown-inline'
    | 'unknown-mark'
    | 'unknown-key'
    | 'missing'
    | 'invalid-value'
    | 'unsafe-link'
    | 'conflicting-marks'
    | 'list-too-deep'

/** 一个问题：path 从文档根算起，指到出问题的字段。 */
export interface RichTextIssue {
  readonly code: RichTextIssueCode
  readonly path: JsonPath
}

type Report = (code: RichTextIssueCode, path: JsonPath) => void

function checkKeys(value: Record<string, unknown>, allowed: readonly string[], path: JsonPath, report: Report): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key))
      report('unknown-key', [...path, key])
  }
}

function checkMarks(marks: unknown, path: JsonPath, report: Report): void {
  if (!isPlainObject(marks)) {
    report('invalid-value', path)
    return
  }
  for (const [key, value] of Object.entries(marks)) {
    const at = [...path, key]
    switch (key) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'lineThrough':
      case 'superscript':
      case 'subscript':
        if (typeof value !== 'boolean')
          report('invalid-value', at)
        break
      case 'color':
      case 'background':
        if (!isRichColor(value))
          report('invalid-value', at)
        break
      case 'fontSize':
        if (!isRichFontSize(value))
          report('invalid-value', at)
        break
      case 'fontFamily':
        if (!isRichFontFamily(value))
          report('invalid-value', at)
        break
      case 'link':
        if (typeof value !== 'string')
          report('invalid-value', at)
        else if (toSafeLinkHref(value) !== value)
          report('unsafe-link', at)
        break
      default:
        if (!(RICH_MARK_KEYS as readonly string[]).includes(key))
          report('unknown-mark', at)
    }
  }
  if (marks.superscript === true && marks.subscript === true)
    report('conflicting-marks', path)
}

function checkRuns(runs: unknown, path: JsonPath, report: Report): void {
  if (!Array.isArray(runs)) {
    report(runs === undefined ? 'missing' : 'invalid-value', path)
    return
  }
  runs.forEach((run: unknown, index) => {
    const at = [...path, index]
    if (!isPlainObject(run)) {
      report('invalid-value', at)
      return
    }
    switch (run.type) {
      case 'text':
        checkKeys(run, ['type', 'text', 'marks'], at, report)
        if (typeof run.text !== 'string')
          report(run.text === undefined ? 'missing' : 'invalid-value', [...at, 'text'])
        break
      case 'field':
        checkKeys(run, ['type', 'field', 'format', 'marks'], at, report)
        if (typeof run.field !== 'string' || run.field.trim() === '')
          report(run.field === undefined ? 'missing' : 'invalid-value', [...at, 'field'])
        if (run.format !== undefined && (!isPlainObject(run.format) || findJsonViolation(run.format) !== undefined))
          report('invalid-value', [...at, 'format'])
        break
      case 'break':
        checkKeys(run, ['type'], at, report)
        return
      default:
        report(run.type === undefined ? 'missing' : 'unknown-inline', [...at, 'type'])
        return
    }
    if (run.marks !== undefined)
      checkMarks(run.marks, [...at, 'marks'], report)
  })
}

function checkBlocks(blocks: unknown, path: JsonPath, depth: number, report: Report): void {
  if (!Array.isArray(blocks)) {
    report(blocks === undefined ? 'missing' : 'invalid-value', path)
    return
  }
  blocks.forEach((block: unknown, index) => {
    const at = [...path, index]
    if (!isPlainObject(block)) {
      report('invalid-value', at)
      return
    }
    switch (block.type) {
      case 'paragraph':
        checkKeys(block, ['type', 'runs', 'align'], at, report)
        checkRuns(block.runs, [...at, 'runs'], report)
        if (block.align !== undefined && !isRichAlign(block.align))
          report('invalid-value', [...at, 'align'])
        break
      case 'heading':
        checkKeys(block, ['type', 'level', 'runs', 'align'], at, report)
        if (block.level !== 1 && block.level !== 2 && block.level !== 3)
          report(block.level === undefined ? 'missing' : 'invalid-value', [...at, 'level'])
        checkRuns(block.runs, [...at, 'runs'], report)
        if (block.align !== undefined && !isRichAlign(block.align))
          report('invalid-value', [...at, 'align'])
        break
      case 'list': {
        checkKeys(block, ['type', 'ordered', 'start', 'items'], at, report)
        if (depth + 1 > RICH_TEXT_MAX_LIST_DEPTH)
          report('list-too-deep', at)
        if (typeof block.ordered !== 'boolean')
          report(block.ordered === undefined ? 'missing' : 'invalid-value', [...at, 'ordered'])
        if (block.start !== undefined && !(Number.isInteger(block.start) && (block.start as number) >= 0 && (block.start as number) <= 999_999))
          report('invalid-value', [...at, 'start'])
        if (!Array.isArray(block.items)) {
          report(block.items === undefined ? 'missing' : 'invalid-value', [...at, 'items'])
          break
        }
        block.items.forEach((item: unknown, itemIndex) => {
          const itemPath = [...at, 'items', itemIndex]
          if (!isPlainObject(item)) {
            report('invalid-value', itemPath)
            return
          }
          checkKeys(item, ['blocks'], itemPath, report)
          checkBlocks(item.blocks, [...itemPath, 'blocks'], depth + 1, report)
        })
        break
      }
      case 'divider':
        checkKeys(block, ['type'], at, report)
        break
      default:
        report(block.type === undefined ? 'missing' : 'unknown-block', [...at, 'type'])
    }
  })
}

/**
 * 检查一个值是不是合规的富文本文档，返回全部问题；没有问题时返回空数组。不认识的块、行内类型与样式键、
 * 认识的对象上多出来的键都报出来，不抛异常也不静默丢掉。
 *
 * @example
 * checkRichTextDocument({ blocks: [{ type: 'quote', runs: [] }] })
 * // [{ code: 'unknown-block', path: ['blocks', 0, 'type'] }]
 */
export function checkRichTextDocument(value: unknown): RichTextIssue[] {
  const issues: RichTextIssue[] = []
  const report: Report = (code, path) => issues.push({ code, path })
  if (!isPlainObject(value)) {
    report('invalid-document', [])
    return issues
  }
  checkKeys(value, ['blocks'], [], report)
  if (!Array.isArray(value.blocks)) {
    report('invalid-document', ['blocks'])
    return issues
  }
  checkBlocks(value.blocks, ['blocks'], 0, report)
  return issues
}
