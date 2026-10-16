/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 可绑定数据的字段树：宿主描述数据的形状，设计器的字段选择器据此列出可选字段。

import type { JsonPath } from '@xihan-ui/core/json'
import { formatJsonPath } from '@xihan-ui/core/json'

/** 字段的种类：value 为标量；object 为含子字段的对象；list 为数组，子字段描述数组的一个元素。 */
export type DataFieldKind = 'value' | 'object' | 'list'

/** 字段的全部种类。 */
export const DATA_FIELD_KINDS: readonly DataFieldKind[] = ['value', 'object', 'list']

/** 字段树的一个节点。 */
export interface DataField {
  /** 数据里的键，在同级字段里唯一。 */
  readonly name: string
  /** 显示的名称，缺省用 name。 */
  readonly label?: string
  readonly kind: DataFieldKind
  /** object 与 list 的子字段；list 的子字段相对数组的一个元素。 */
  readonly children?: readonly DataField[]
}

/** 列出的一个字段：path 相对起点，text 为它的 formatJsonPath 写法。 */
export interface DataFieldEntry {
  readonly path: JsonPath
  readonly text: string
  readonly field: DataField
}

/** listDataFields 的选项。 */
export interface ListDataFieldsOptions {
  /** 起点：从字段树根开始、只含键的路径；起点须是 object 或 list，是 list 时列它的元素字段。缺省为根。 */
  readonly base?: JsonPath
  /** 只列这些种类，缺省全部。 */
  readonly kinds?: readonly DataFieldKind[]
}

function checkLevel(fields: readonly DataField[]): void {
  const names = new Set<string>()
  for (const field of fields) {
    if (typeof field.name !== 'string' || field.name.length === 0)
      throw new RangeError(`[designer-kit] data field name must be a non-empty string, got ${String(field.name)}`)
    if (!DATA_FIELD_KINDS.includes(field.kind))
      throw new RangeError(`[designer-kit] data field "${field.name}" has unknown kind ${String(field.kind)}`)
    if (names.has(field.name))
      throw new RangeError(`[designer-kit] duplicate data field name "${field.name}"`)
    names.add(field.name)
  }
}

/**
 * 按路径找字段节点：路径从字段树根开始、只含键，经过 list 时进入它的元素字段；找不到时为 undefined。
 * 同级字段重名、名字为空或种类未知时抛 RangeError。
 */
export function findDataField(fields: readonly DataField[], path: JsonPath): DataField | undefined {
  let level = fields
  let found: DataField | undefined
  for (const segment of path) {
    checkLevel(level)
    if (typeof segment !== 'string')
      return undefined
    found = level.find(field => field.name === segment)
    if (found === undefined)
      return undefined
    level = found.children ?? []
  }
  return found
}

/**
 * 深度优先列出起点之下可以直接按路径读到的字段：进入 object 的子字段，不进入 list 的子字段（它们相对数组元素）。
 * 起点找不到或是 value 时为空数组；同级字段重名、名字为空或种类未知时抛 RangeError。
 */
export function listDataFields(fields: readonly DataField[], options: ListDataFieldsOptions = {}): DataFieldEntry[] {
  const base = options.base ?? []
  let start: readonly DataField[] = fields
  if (base.length > 0) {
    const node = findDataField(fields, base)
    if (node === undefined || node.kind === 'value')
      return []
    start = node.children ?? []
  }
  const kinds = options.kinds
  const result: DataFieldEntry[] = []
  const visit = (level: readonly DataField[], prefix: JsonPath): void => {
    checkLevel(level)
    for (const field of level) {
      const path = [...prefix, field.name]
      if (kinds === undefined || kinds.includes(field.kind))
        result.push({ path, text: formatJsonPath(path), field })
      if (field.kind === 'object')
        visit(field.children ?? [], path)
    }
  }
  visit(start, [])
  return result
}
