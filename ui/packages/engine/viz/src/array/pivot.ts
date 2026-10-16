/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 长表转宽表：按某个字段的取值把一列值展开成多列，同一身份的行合成一行。

import { VizError } from '../errors'
import { tupleKey, valueKey } from './mixed'

/** 展开出的一列。 */
export interface PivotWiderColumn {
  /** 结果行里的列名。 */
  readonly name: string
  /** 这一列对应的 by 字段取值。 */
  readonly member: unknown
  /** 这一列的值取自哪个 value 字段。 */
  readonly field: string
}

/** 长表转宽表的选项。 */
export interface PivotWiderOptions {
  /** 行身份字段：取值相同（按 valueKey 判同）的行合成一行，结果行保留这些字段。 */
  readonly key: string | readonly string[]
  /** 展开成列的字段：每个不同的取值（缺失值也算一个）各成一列。 */
  readonly by: string
  /** 填进新列的字段；给多个时每个字段各展开一组列。 */
  readonly value: string | readonly string[]
  /** 新列的列名；缺省为取值的字符串形式，value 有多个字段时再在前面加上「字段名:」。 */
  readonly columnName?: (member: unknown, field: string) => string
}

/** 长表转宽表的结果。 */
export interface PivotWiderResult {
  /** 每个身份一行，次序是身份首次出现的次序；没有对应长表行的格子不写。 */
  readonly rows: Record<string, unknown>[]
  /** 新列：先按 value 字段的次序，同一字段内按 by 取值首次出现的次序。 */
  readonly columns: readonly PivotWiderColumn[]
}

function own(row: unknown, field: string): unknown {
  return typeof row === 'object' && row !== null && Object.hasOwn(row, field) ? (row as Readonly<Record<string, unknown>>)[field] : undefined
}

/**
 * 把长表转成宽表：key 相同的行合成一行，by 的每个取值把 value 字段展开成一列。
 * 同一个身份在同一个 by 取值上出现两次时抛 `XH_VIZ_DUPLICATE_KEY`；新列名与身份字段或彼此重名时也抛它。
 */
export function pivotWider(rows: Iterable<unknown>, options: PivotWiderOptions): PivotWiderResult {
  const keys = typeof options.key === 'string' ? [options.key] : options.key
  const fields = typeof options.value === 'string' ? [options.value] : options.value
  const name = options.columnName ?? ((member: unknown, field: string): string => (fields.length > 1 ? `${field}:${String(member)}` : String(member)))

  const members = new Map<string, unknown>()
  const groups = new Map<string, { row: Record<string, unknown>, seen: Set<string> }>()
  for (const row of rows) {
    const identity = tupleKey(keys.map(field => valueKey(own(row, field))))
    let group = groups.get(identity)
    if (!group) {
      group = { row: Object.fromEntries(keys.map(field => [field, own(row, field)])), seen: new Set() }
      groups.set(identity, group)
    }
    const member = own(row, options.by)
    const memberKey = valueKey(member)
    if (group.seen.has(memberKey))
      throw new VizError('XH_VIZ_DUPLICATE_KEY', '长表里同一身份的同一取值出现了两次', { key: keys.map(field => own(row, field)), member })
    group.seen.add(memberKey)
    if (!members.has(memberKey))
      members.set(memberKey, member)
    for (const field of fields)
      group.row[`\u0000${field}\u0000${memberKey}`] = own(row, field)
  }

  const columns: PivotWiderColumn[] = []
  const names = new Set<string>(keys)
  for (const field of fields) {
    for (const member of members.values()) {
      const column = name(member, field)
      if (names.has(column))
        throw new VizError('XH_VIZ_DUPLICATE_KEY', '展开出的列名重复', { column })
      names.add(column)
      columns.push({ name: column, member, field })
    }
  }

  const result: Record<string, unknown>[] = []
  for (const { row } of groups.values()) {
    const wide: Record<string, unknown> = {}
    for (const field of keys)
      wide[field] = row[field]
    for (const column of columns) {
      const slot = `\u0000${column.field}\u0000${valueKey(column.member)}`
      if (Object.hasOwn(row, slot))
        wide[column.name] = row[slot]
    }
    result.push(wide)
  }
  return { rows: result, columns }
}
