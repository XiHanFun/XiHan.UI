/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 选项与选项树的结构校验：选择、单选组、复选组、树选择、级联等组件吃的节点形状，供模板保存与宿主数据校验。

import type { Tone } from '@xihan-ui/core'
import { appendJsonPointer, isPlainObject } from '@xihan-ui/core/json'

/**
 * 选项结构的问题码：
 * - `not-array`：选项列表或 `children` 不是数组；
 * - `not-object`：某个选项不是普通对象；
 * - `invalid-value` / `invalid-label` / `invalid-disabled` / `invalid-description` / `invalid-tone` / `invalid-has-children`：对应的键取值不合法，或必填的 `value`（以及要求时的 `label`）缺失；
 * - `unknown-key`：严格模式下出现了选项没有的键（非树形时 `children` 与 `hasChildren` 也算）；
 * - `duplicate-value`：`value` 重复，按 `unique` 判定范围；
 * - `too-deep`：树的层数超过上限。
 */
export type OptionViolationCode
  = | 'not-array'
    | 'not-object'
    | 'invalid-value'
    | 'invalid-label'
    | 'invalid-disabled'
    | 'invalid-description'
    | 'invalid-tone'
    | 'invalid-has-children'
    | 'unknown-key'
    | 'duplicate-value'
    | 'too-deep'

/** 第一处问题：`pointer` 是出问题的位置（JSON Pointer，相对传入的值），`code` 是原因。 */
export interface OptionViolation {
  readonly pointer: string
  readonly code: OptionViolationCode
}

/** 校验选项。 */
export interface OptionViolationOptions {
  /** 是否为选项树：允许 `children` 与 `hasChildren`。缺省 `false`。 */
  readonly tree?: boolean
  /** `value` 不得重复的范围：同一层（`level`，缺省）或整棵树（`tree`）。按值单选的树选择用 `tree`。 */
  readonly unique?: 'level' | 'tree'
  /** 树的层数上限，顶层为第 1 层，缺省 32。 */
  readonly maxDepth?: number
  /** 是否要求每个选项都有 `label`。缺省 `false`，组件以 `value` 回退显示。 */
  readonly requireLabel?: boolean
  /** 严格模式：出现选项没有的键即报 `unknown-key`。缺省 `false`，组件不理会多余的键。 */
  readonly strict?: boolean
}

const TONES: ReadonlySet<string> = new Set(['brand', 'neutral', 'success', 'warning', 'danger', 'info'] satisfies Tone[])
const FLAT_KEYS: ReadonlySet<string> = new Set(['value', 'label', 'disabled', 'tone', 'description'])
const TREE_KEYS: ReadonlySet<string> = new Set([...FLAT_KEYS, 'children', 'hasChildren'])

function violation(pointer: string, code: OptionViolationCode): OptionViolation {
  return Object.freeze({ pointer, code })
}

function optionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string'
}

function optionalBoolean(value: unknown): boolean {
  return value === undefined || typeof value === 'boolean'
}

/**
 * 查找选项列表里第一处不合法的位置；整体合法时返回 `undefined`。
 * 每个选项须是 `{ value: string, label?: string, disabled?: boolean, tone?: Tone, description?: string }`，
 * 选项树另可带 `children`（选项数组）与 `hasChildren`（布尔，懒加载分支）。
 */
export function findOptionViolation(value: unknown, options: OptionViolationOptions = {}): OptionViolation | undefined {
  const tree = options.tree === true
  const maxDepth = options.maxDepth ?? 32
  const allowed = tree ? TREE_KEYS : FLAT_KEYS
  const everywhere = options.unique === 'tree' ? new Set<string>() : null

  function visitList(list: unknown, pointer: string, depth: number): OptionViolation | undefined {
    if (!Array.isArray(list))
      return violation(pointer, 'not-array')
    if (depth > maxDepth)
      return violation(pointer, 'too-deep')
    const seen = everywhere ?? new Set<string>()
    for (let index = 0; index < list.length; index += 1) {
      const at = appendJsonPointer(pointer, index)
      const found = visitItem(list[index], at, depth, seen)
      if (found !== undefined)
        return found
    }
    return undefined
  }

  function visitItem(item: unknown, pointer: string, depth: number, seen: Set<string>): OptionViolation | undefined {
    if (!isPlainObject(item))
      return violation(pointer, 'not-object')
    if (options.strict === true) {
      const unknown = Object.keys(item).find(key => !allowed.has(key))
      if (unknown !== undefined)
        return violation(appendJsonPointer(pointer, unknown), 'unknown-key')
    }
    if (typeof item.value !== 'string')
      return violation(appendJsonPointer(pointer, 'value'), 'invalid-value')
    if (seen.has(item.value))
      return violation(appendJsonPointer(pointer, 'value'), 'duplicate-value')
    seen.add(item.value)
    if (options.requireLabel === true ? typeof item.label !== 'string' : !optionalString(item.label))
      return violation(appendJsonPointer(pointer, 'label'), 'invalid-label')
    if (!optionalBoolean(item.disabled))
      return violation(appendJsonPointer(pointer, 'disabled'), 'invalid-disabled')
    if (!optionalString(item.description))
      return violation(appendJsonPointer(pointer, 'description'), 'invalid-description')
    if (item.tone !== undefined && !(typeof item.tone === 'string' && TONES.has(item.tone)))
      return violation(appendJsonPointer(pointer, 'tone'), 'invalid-tone')
    if (!tree)
      return undefined
    if (!optionalBoolean(item.hasChildren))
      return violation(appendJsonPointer(pointer, 'hasChildren'), 'invalid-has-children')
    return item.children === undefined ? undefined : visitList(item.children, appendJsonPointer(pointer, 'children'), depth + 1)
  }

  return visitList(value, '', 1)
}
