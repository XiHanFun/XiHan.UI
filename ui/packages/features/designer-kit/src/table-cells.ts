/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 带合并单元格的表格网格：检查越界、重叠与留空，算出合并、拆分、增删行列之后的几何；只给结果，编辑操作由各设计器自己生成。

/** 表格的行数与列数。 */
export interface TableSize {
  readonly rows: number
  readonly columns: number
}

/** 一个单元格：左上角所在的行与列（从 0 起）和跨越的行数、列数（至少 1）。 */
export interface TableCell {
  readonly id: string
  readonly row: number
  readonly column: number
  readonly rowSpan: number
  readonly columnSpan: number
}

/** 表格的方向：行或列。 */
export type TableAxis = 'row' | 'column'

/**
 * 表格网格的问题：
 * - `invalid-size`：行数或列数不是非负安全整数；
 * - `invalid-cell`：单元格的位置不是非负安全整数，或跨度不是正安全整数；
 * - `out-of-bounds`：单元格伸出表格；
 * - `overlap`：单元格与先出现的单元格重叠，报在后出现的那个上；
 * - `gap`：这个位置没有被任何单元格覆盖，按行优先依次报出。
 */
export type TableCellIssue
  = | { readonly code: 'invalid-size' }
    | { readonly code: 'invalid-cell' | 'out-of-bounds' | 'overlap', readonly id: string }
    | { readonly code: 'gap', readonly row: number, readonly column: number }

/** 合并的结果：成功时左上角的单元格扩成整个矩形，其余所选单元格并入它；失败时给出原因。 */
export type TableMergePlan
  = | { readonly ok: true, readonly anchor: string, readonly rowSpan: number, readonly columnSpan: number, readonly absorbed: readonly string[] }
    | { readonly ok: false, readonly code: 'unknown-cell', readonly id: string }
    | { readonly ok: false, readonly code: 'too-few-cells' | 'not-rectangle' }

/** 一个新单元格的位置，跨度都是 1。 */
export interface TableCellPosition {
  readonly row: number
  readonly column: number
}

/** 增删一行（列）之后的网格：新尺寸、位置或跨度变了的单元格（新几何）、要新建的单元格与要删除的单元格。 */
export interface TableLinePlan {
  readonly size: TableSize
  readonly updates: readonly TableCell[]
  readonly added: readonly TableCellPosition[]
  readonly removed: readonly string[]
}

interface AxisKeys {
  readonly position: 'row' | 'column'
  readonly span: 'rowSpan' | 'columnSpan'
  readonly count: 'rows' | 'columns'
}

const AXES: Readonly<Record<TableAxis, AxisKeys>> = {
  row: { position: 'row', span: 'rowSpan', count: 'rows' },
  column: { position: 'column', span: 'columnSpan', count: 'columns' },
}

function isCount(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0
}

function isValidCell(cell: TableCell): boolean {
  return isCount(cell.row) && isCount(cell.column) && Number.isSafeInteger(cell.rowSpan) && cell.rowSpan >= 1 && Number.isSafeInteger(cell.columnSpan) && cell.columnSpan >= 1
}

function freezeCell(cell: TableCell): TableCell {
  return Object.freeze({ id: cell.id, row: cell.row, column: cell.column, rowSpan: cell.rowSpan, columnSpan: cell.columnSpan })
}

/** 检查单元格是否都落在表格内、互不重叠且铺满整张表格，返回全部问题；没有问题时为空数组。 */
export function checkTableCells(size: TableSize, cells: readonly TableCell[]): readonly TableCellIssue[] {
  if (!isCount(size.rows) || !isCount(size.columns))
    return Object.freeze([Object.freeze({ code: 'invalid-size' })])
  const owner: (string | null)[] = Array.from<string | null>({ length: size.rows * size.columns }).fill(null)
  const issues: TableCellIssue[] = []
  for (const cell of cells) {
    if (!isValidCell(cell)) {
      issues.push(Object.freeze({ code: 'invalid-cell', id: cell.id }))
      continue
    }
    if (cell.row + cell.rowSpan > size.rows || cell.column + cell.columnSpan > size.columns) {
      issues.push(Object.freeze({ code: 'out-of-bounds', id: cell.id }))
      continue
    }
    let overlapped = false
    for (let row = cell.row; row < cell.row + cell.rowSpan; row += 1) {
      for (let column = cell.column; column < cell.column + cell.columnSpan; column += 1) {
        const index = row * size.columns + column
        if (owner[index] === null)
          owner[index] = cell.id
        else
          overlapped = true
      }
    }
    if (overlapped)
      issues.push(Object.freeze({ code: 'overlap', id: cell.id }))
  }
  owner.forEach((id, index) => {
    if (id === null)
      issues.push(Object.freeze({ code: 'gap', row: Math.floor(index / size.columns), column: index % size.columns }))
  })
  return Object.freeze(issues)
}

/**
 * 合并所选单元格：所选单元格必须至少两个、恰好拼成一个矩形，且矩形里没有未选的单元格。
 * 成功时左上角的单元格是 `anchor`，`absorbed` 按 `cells` 里的顺序列出其余所选单元格。
 */
export function planCellMerge(cells: readonly TableCell[], ids: readonly string[]): TableMergePlan {
  const chosen = new Set(ids)
  for (const id of chosen) {
    if (!cells.some(cell => cell.id === id))
      return Object.freeze({ ok: false, code: 'unknown-cell', id })
  }
  if (chosen.size < 2)
    return Object.freeze({ ok: false, code: 'too-few-cells' })
  const selected = cells.filter(cell => chosen.has(cell.id))
  const top = Math.min(...selected.map(cell => cell.row))
  const left = Math.min(...selected.map(cell => cell.column))
  const bottom = Math.max(...selected.map(cell => cell.row + cell.rowSpan))
  const right = Math.max(...selected.map(cell => cell.column + cell.columnSpan))
  const area = selected.reduce((sum, cell) => sum + cell.rowSpan * cell.columnSpan, 0)
  const anchor = selected.find(cell => cell.row === top && cell.column === left)
  const intrudes = cells.some(cell => !chosen.has(cell.id)
    && cell.row < bottom && cell.row + cell.rowSpan > top && cell.column < right && cell.column + cell.columnSpan > left)
  if (anchor === undefined || area !== (bottom - top) * (right - left) || intrudes)
    return Object.freeze({ ok: false, code: 'not-rectangle' })
  return Object.freeze({
    ok: true,
    anchor: anchor.id,
    rowSpan: bottom - top,
    columnSpan: right - left,
    absorbed: Object.freeze(selected.filter(cell => cell !== anchor).map(cell => cell.id)),
  })
}

/** 拆分一个单元格：它的跨度还原成 1，返回空出来、要补上新单元格的位置（行优先）；本来就是 1 × 1 时为空数组。 */
export function planCellSplit(cell: TableCell): readonly TableCellPosition[] {
  const positions: TableCellPosition[] = []
  for (let row = cell.row; row < cell.row + cell.rowSpan; row += 1) {
    for (let column = cell.column; column < cell.column + cell.columnSpan; column += 1) {
      if (row !== cell.row || column !== cell.column)
        positions.push(Object.freeze({ row, column }))
    }
  }
  return Object.freeze(positions)
}

function lineIndex(at: number, max: number, what: string): void {
  if (!Number.isSafeInteger(at) || at < 0 || at > max)
    throw new RangeError(`[designer-kit] table line ${what} must be an integer from 0 to ${max}, got ${at}`)
}

/**
 * 在第 `at` 行（列）之前插入一整行（列），`at` 等于行（列）数时追加在末尾。
 * 跨过插入位置的单元格加长，其后的单元格后移，没被加长单元格覆盖的位置补上新单元格。`at` 越界时抛 `RangeError`。
 */
export function planTableLineInsert(size: TableSize, cells: readonly TableCell[], axis: TableAxis, at: number): TableLinePlan {
  const keys = AXES[axis]
  const other = AXES[axis === 'row' ? 'column' : 'row']
  lineIndex(at, size[keys.count], 'at')
  const updates: TableCell[] = []
  const covered = new Set<number>()
  for (const cell of cells) {
    const position = cell[keys.position]
    if (position >= at) {
      updates.push(freezeCell({ ...cell, [keys.position]: position + 1 }))
    }
    else if (at < position + cell[keys.span]) {
      updates.push(freezeCell({ ...cell, [keys.span]: cell[keys.span] + 1 }))
      for (let offset = 0; offset < cell[other.span]; offset += 1)
        covered.add(cell[other.position] + offset)
    }
  }
  const added: TableCellPosition[] = []
  for (let line = 0; line < size[other.count]; line += 1) {
    if (!covered.has(line))
      added.push(Object.freeze(axis === 'row' ? { row: at, column: line } : { row: line, column: at }))
  }
  return Object.freeze({
    size: Object.freeze({ ...size, [keys.count]: size[keys.count] + 1 }),
    updates: Object.freeze(updates),
    added: Object.freeze(added),
    removed: Object.freeze([]),
  })
}

/**
 * 删除第 `at` 行（列）：只占这一行（列）的单元格删除，跨过它的单元格缩短，其后的单元格前移。
 * 表格只剩一行（列）或 `at` 越界时抛 `RangeError`。
 */
export function planTableLineRemove(size: TableSize, cells: readonly TableCell[], axis: TableAxis, at: number): TableLinePlan {
  const keys = AXES[axis]
  const count = size[keys.count]
  if (count <= 1)
    throw new RangeError(`[designer-kit] cannot remove the only ${axis} of a table`)
  lineIndex(at, count - 1, 'at')
  const updates: TableCell[] = []
  const removed: string[] = []
  for (const cell of cells) {
    const position = cell[keys.position]
    const span = cell[keys.span]
    if (position === at && span === 1)
      removed.push(cell.id)
    else if (position <= at && at < position + span)
      updates.push(freezeCell({ ...cell, [keys.span]: span - 1 }))
    else if (position > at)
      updates.push(freezeCell({ ...cell, [keys.position]: position - 1 }))
  }
  return Object.freeze({
    size: Object.freeze({ ...size, [keys.count]: count - 1 }),
    updates: Object.freeze(updates),
    added: Object.freeze([]),
    removed: Object.freeze(removed),
  })
}
