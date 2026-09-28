/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 table.layout 相关实现：挂载后的版面实测。

import type { TableColumnDef, TableColumnPreference, TableLayout } from './table.types'
import { tableLeafColumns } from './table.columns'

/** 还没量过、或不需要量时的版面。 */
export const TABLE_EMPTY_LAYOUT: TableLayout = { columnWidths: {}, rowBoxes: {} }

/** 这张表要量什么：冻结列里有没写数字宽度的就量列宽，有合并或多级表头就量行位。 */
export interface TableLayoutNeeds {
  columns: boolean
  rows: boolean
}

/** 按 props 判定要不要实测：两样都不需要时整套观察都不挂，一张普通表格一点开销都没有。 */
export function tableLayoutNeeds(
  columns: readonly TableColumnDef[],
  preference: TableColumnPreference | undefined,
  hasCellSpan: boolean,
): TableLayoutNeeds {
  const leaves = tableLeafColumns(columns)
  const grouped = leaves.length !== columns.length || columns.some(column => !!column.children?.length)
  const needsColumns = leaves.some((column) => {
    const sticky = preference?.sticky?.[column.id] ?? column.sticky
    const width = preference?.widths?.[column.id] ?? column.width
    return !!sticky && typeof width !== 'number'
  })
  return { columns: needsColumns, rows: hasCellSpan || grouped }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

/** 这个节点是不是直接归这张表：详情行里可以嵌另一张完整的表，它的行与列头不算。 */
function ownedBy(el: Element, root: HTMLElement): boolean {
  return el.closest('[data-scope="table"][data-part="root"]') === root
}

/**
 * 量一次版面。只在效应里调：渲染期不碰 DOM。
 * 列宽取列头的边框盒宽度（占位格不算）；行位按 aria-rowindex 记，上沿扣掉行首那条分隔线，
 * 纵向合并格从起点行的内容盒上沿一直铺到最后一行的下沿。只用差值，root 自己滚动不影响结果。
 */
export function measureTableLayout(root: HTMLElement, needs: TableLayoutNeeds): TableLayout {
  if (!needs.columns && !needs.rows)
    return TABLE_EMPTY_LAYOUT
  const rootTop = root.getBoundingClientRect().top
  const columnWidths: Record<string, number> = {}
  if (needs.columns) {
    for (const el of root.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="column-header"]')) {
      if (!ownedBy(el, root) || el.hasAttribute('data-covered'))
        continue
      const id = el.getAttribute('data-value')
      if (id && !(id in columnWidths))
        columnWidths[id] = round(el.getBoundingClientRect().width)
    }
  }
  const rowBoxes: Record<number, { top: number, bottom: number }> = {}
  if (needs.rows) {
    const win = root.ownerDocument.defaultView
    for (const el of root.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="row"][aria-rowindex]')) {
      if (!ownedBy(el, root))
        continue
      const index = Number(el.getAttribute('aria-rowindex'))
      if (!Number.isFinite(index))
        continue
      const rect = el.getBoundingClientRect()
      const border = Number.parseFloat(win?.getComputedStyle(el).borderTopWidth ?? '') || 0
      rowBoxes[index] = { top: round(rect.top - rootTop + border), bottom: round(rect.bottom - rootTop) }
    }
  }
  return { columnWidths, rowBoxes }
}

/** 逐项比两份版面：值没变就不写 context，免得每一帧都重渲。 */
export function sameTableLayout(a: TableLayout, b: TableLayout | undefined): boolean {
  if (!b)
    return false
  if (a === b)
    return true
  const aw = Object.keys(a.columnWidths)
  const bw = Object.keys(b.columnWidths)
  if (aw.length !== bw.length || aw.some(key => a.columnWidths[key] !== b.columnWidths[key]))
    return false
  const ar = Object.keys(a.rowBoxes)
  const br = Object.keys(b.rowBoxes)
  if (ar.length !== br.length)
    return false
  return ar.every((key) => {
    const x = a.rowBoxes[Number(key)]!
    const y = b.rowBoxes[Number(key)]
    return !!y && x.top === y.top && x.bottom === y.bottom
  })
}
