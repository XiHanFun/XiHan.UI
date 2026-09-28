/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 table.columns 相关实现。

import type {
  TableColumn,
  TableColumnDef,
  TableColumnKind,
  TableColumnPreference,
  TableHeaderCell,
} from './table.types'

/**
 * 列偏好的纯算法：排序、过滤与覆盖。不碰 DOM、不认识状态机。
 * 连接层在 Vue 的 render 期就要用到它们，此时 DOM 尚不存在。
 */

/**
 * 前缀列的 id。两侧下划线是为了与作者自己的列 id 分开——
 * 撞上了会让列号索引取到错的那一列，而两边单看都对。
 */
export const PREFIX_COLUMN_ID: Record<TableColumnKind, string> = {
  index: '__index__',
  select: '__select__',
  expand: '__expand__',
  data: '',
}

/**
 * 按偏好排列列 id：列在 order 里的按此顺序排在前面，没列到的按原顺序跟在后面。
 *
 * 只列一部分也成立，于是「把某一列挪到最前」不必把全表列一遍；
 * order 里指向已不存在的列时直接跳过，不留空位。
 */
export function orderColumnIds(ids: readonly string[], order?: readonly string[]): string[] {
  if (!order || order.length === 0)
    return [...ids]
  const known = new Set(ids)
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of order) {
    if (!known.has(id) || seen.has(id))
      continue
    seen.add(id)
    out.push(id)
  }
  for (const id of ids) {
    if (!seen.has(id))
      out.push(id)
  }
  return out
}

/**
 * 生效列：前缀列在前、数据列在后，数据列按偏好排过序、藏过、覆盖过宽与冻结。
 *
 * 藏起来的列整个不进网格——列号也跟着重排。这是对的：隐藏列不在网格里，
 * 让它继续占列号会让读屏报出一个数不到的格子。
 */
export function resolveTableColumns(
  columns: readonly TableColumnDef[],
  prefix: readonly TableColumnKind[],
  preference?: TableColumnPreference,
): TableColumn[] {
  const defs = new Map<string, TableColumnDef>()
  for (const column of columns) {
    // 列 id 重复时以先出现的为准，取列号是确定的
    if (!defs.has(column.id))
      defs.set(column.id, column)
  }

  const hidden = new Set(preference?.hidden ?? [])
  const ordered = orderColumnIds([...defs.keys()], preference?.order)

  const data: TableColumn[] = []
  for (const id of ordered) {
    if (hidden.has(id))
      continue
    const def = defs.get(id)
    if (!def)
      continue
    const width = preference?.widths?.[id]
    const sticky = preference?.sticky?.[id]
    data.push({
      ...def,
      kind: 'data',
      ...(width === undefined ? {} : { width }),
      ...(sticky === undefined ? {} : { sticky }),
    })
  }

  return [
    ...prefix.map(kind => ({ id: PREFIX_COLUMN_ID[kind], kind })),
    ...data,
  ]
}

/**
 * 分组列摊成叶子列：带 children 的是分组，只在表头占一格，不进列号空间。
 * 没有分组时原样返回同一批列定义。
 */
export function tableLeafColumns(columns: readonly TableColumnDef[]): TableColumnDef[] {
  const out: TableColumnDef[] = []
  const walk = (nodes: readonly TableColumnDef[]): void => {
    for (const column of nodes) {
      if (column.children?.length)
        walk(column.children)
      else out.push(column)
    }
  }
  walk(columns)
  return out
}

/** 叶子列 id → 自根而下的分组链；不在任何分组里的列没有条目。 */
export function tableColumnAncestors(columns: readonly TableColumnDef[]): Map<string, TableColumnDef[]> {
  const out = new Map<string, TableColumnDef[]>()
  const walk = (nodes: readonly TableColumnDef[], chain: TableColumnDef[]): void => {
    for (const column of nodes) {
      if (column.children?.length)
        walk(column.children, [...chain, column])
      else if (chain.length && !out.has(column.id))
        out.set(column.id, chain)
    }
  }
  walk(columns, [])
  return out
}

/**
 * 按生效列（已排序、已隐藏）逐层排出表头：每层一行。
 *
 * 第 L 层上，一个叶子列若在第 L 层之前就有分组祖先，它归那个分组格；相邻叶子列属于同一个分组对象的并成一格。
 * 没有第 L 层分组祖先的叶子列在它起始的那一层出列头、纵向跨到最后一层，其下各层给一条占位。
 * 列偏好把一个分组的叶子列拆开时，分组格按连续的段各出一格。
 */
export function buildTableHeaderRows(
  columns: readonly TableColumn[],
  ancestors: ReadonlyMap<string, readonly TableColumnDef[]>,
): TableHeaderCell[][] {
  const chainOf = (id: string): readonly TableColumnDef[] => ancestors.get(id) ?? []
  let depth = 1
  for (const column of columns)
    depth = Math.max(depth, chainOf(column.id).length + 1)

  const rows: TableHeaderCell[][] = Array.from({ length: depth }, () => [])
  for (let level = 1; level <= depth; level++) {
    let i = 0
    while (i < columns.length) {
      const leaf = columns[i]!
      const chain = chainOf(leaf.id)
      if (level <= chain.length) {
        const group = chain[level - 1]!
        let j = i + 1
        while (j < columns.length && chainOf(columns[j]!.id)[level - 1] === group)
          j++
        rows[level - 1]!.push({ id: group.id, label: group.label, level, colIndex: i + 1, colSpan: j - i, rowSpan: 1, leaf: false, covered: false })
        i = j
        continue
      }
      const start = chain.length + 1
      rows[level - 1]!.push({
        id: leaf.id,
        label: leaf.label,
        level,
        colIndex: i + 1,
        colSpan: 1,
        rowSpan: level === start ? depth - start + 1 : 1,
        leaf: true,
        covered: level > start,
      })
      i++
    }
  }
  return rows
}
