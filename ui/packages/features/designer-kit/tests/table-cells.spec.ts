import type { TableCell, TableLinePlan, TableSize } from '../src'
import { describe, expect, it } from 'vitest'
import { checkTableCells, planCellMerge, planCellSplit, planTableLineInsert, planTableLineRemove } from '../src'

function cell(id: string, row: number, column: number, rowSpan = 1, columnSpan = 1): TableCell {
  return { id, row, column, rowSpan, columnSpan }
}

/** 2 × 3 的表格：a 横跨前两列，其余各占一格。 */
const SIZE: TableSize = { rows: 2, columns: 3 }
const CELLS: readonly TableCell[] = [cell('a', 0, 0, 1, 2), cell('b', 0, 2), cell('c', 1, 0), cell('d', 1, 1), cell('e', 1, 2)]

/** 把增删行列的结果套回单元格，得到新网格。 */
function applied(cells: readonly TableCell[], plan: TableLinePlan): TableCell[] {
  const updated = new Map(plan.updates.map(item => [item.id, item]))
  const kept = cells.filter(item => !plan.removed.includes(item.id)).map(item => updated.get(item.id) ?? item)
  return [...kept, ...plan.added.map((position, index) => cell(`n${index}`, position.row, position.column))]
}

describe('检查单元格', () => {
  it('铺满且不重叠时没有问题', () => {
    expect(checkTableCells(SIZE, CELLS)).toEqual([])
  })

  it('越界、重叠、留空与非法单元格都报出，留空按行优先', () => {
    expect(checkTableCells(SIZE, [
      cell('a', 0, 0, 1, 2),
      cell('b', 0, 1),
      cell('c', 1, 2, 2, 1),
      cell('d', 1, 1.5),
      cell('e', 0, 0, 0, 1),
    ])).toEqual([
      { code: 'overlap', id: 'b' },
      { code: 'out-of-bounds', id: 'c' },
      { code: 'invalid-cell', id: 'd' },
      { code: 'invalid-cell', id: 'e' },
      { code: 'gap', row: 0, column: 2 },
      { code: 'gap', row: 1, column: 0 },
      { code: 'gap', row: 1, column: 1 },
      { code: 'gap', row: 1, column: 2 },
    ])
  })

  it('尺寸不合法时只报 invalid-size', () => {
    expect(checkTableCells({ rows: -1, columns: 2 }, CELLS)).toEqual([{ code: 'invalid-size' }])
  })
})

describe('合并', () => {
  it('左上角的单元格扩成整个矩形，其余按输入顺序并入', () => {
    expect(planCellMerge(CELLS, ['d', 'a', 'c'])).toEqual({ ok: true, anchor: 'a', rowSpan: 2, columnSpan: 2, absorbed: ['c', 'd'] })
    expect(checkTableCells(SIZE, [cell('a', 0, 0, 2, 2), cell('b', 0, 2), cell('e', 1, 2)])).toEqual([])
  })

  it('拼不成矩形、矩形里有未选的单元格、少于两个与未知单元格都失败', () => {
    expect(planCellMerge(CELLS, ['a', 'e'])).toEqual({ ok: false, code: 'not-rectangle' })
    expect(planCellMerge(CELLS, ['c', 'b'])).toEqual({ ok: false, code: 'not-rectangle' })
    expect(planCellMerge(CELLS, ['a', 'c'])).toEqual({ ok: false, code: 'not-rectangle' })
    expect(planCellMerge(CELLS, ['a', 'a'])).toEqual({ ok: false, code: 'too-few-cells' })
    expect(planCellMerge(CELLS, ['a', 'x'])).toEqual({ ok: false, code: 'unknown-cell', id: 'x' })
  })
})

describe('拆分', () => {
  it('跨度还原成 1，按行优先列出要补的位置', () => {
    expect(planCellSplit(cell('a', 1, 1, 2, 2))).toEqual([{ row: 1, column: 2 }, { row: 2, column: 1 }, { row: 2, column: 2 }])
    expect(planCellSplit(cell('a', 0, 0))).toEqual([])
  })
})

describe('增删行列', () => {
  it('插入一列：跨过的单元格加长，其后的后移，没被覆盖的位置补新格，结果仍铺满', () => {
    const plan = planTableLineInsert(SIZE, CELLS, 'column', 1)
    expect(plan.size).toEqual({ rows: 2, columns: 4 })
    expect(plan.updates).toEqual([cell('a', 0, 0, 1, 3), cell('b', 0, 3), cell('d', 1, 2), cell('e', 1, 3)])
    expect(plan.added).toEqual([{ row: 1, column: 1 }])
    expect(plan.removed).toEqual([])
    expect(checkTableCells(plan.size, applied(CELLS, plan))).toEqual([])
  })

  it('在末尾追加一行', () => {
    const plan = planTableLineInsert(SIZE, CELLS, 'row', 2)
    expect(plan.updates).toEqual([])
    expect(plan.added).toEqual([{ row: 2, column: 0 }, { row: 2, column: 1 }, { row: 2, column: 2 }])
    expect(checkTableCells(plan.size, applied(CELLS, plan))).toEqual([])
  })

  it('删除一列：只占这一列的删除，跨过的缩短，其后的前移，结果仍铺满', () => {
    const plan = planTableLineRemove(SIZE, CELLS, 'column', 1)
    expect(plan.size).toEqual({ rows: 2, columns: 2 })
    expect(plan.updates).toEqual([cell('a', 0, 0, 1, 1), cell('b', 0, 1), cell('e', 1, 1)])
    expect(plan.removed).toEqual(['d'])
    expect(checkTableCells(plan.size, applied(CELLS, plan))).toEqual([])
  })

  it('删除跨行单元格的起始行时它缩短而位置不变', () => {
    const cells = [cell('a', 0, 0, 2, 1), cell('b', 0, 1), cell('c', 1, 1)]
    const plan = planTableLineRemove({ rows: 2, columns: 2 }, cells, 'row', 0)
    expect(plan.updates).toEqual([cell('a', 0, 0, 1, 1), cell('c', 0, 1)])
    expect(plan.removed).toEqual(['b'])
  })

  it('位置越界或只剩一行（列）时抛 RangeError', () => {
    expect(() => planTableLineInsert(SIZE, CELLS, 'row', 3)).toThrow(RangeError)
    expect(() => planTableLineInsert(SIZE, CELLS, 'row', -1)).toThrow(RangeError)
    expect(() => planTableLineRemove(SIZE, CELLS, 'column', 3)).toThrow(RangeError)
    expect(() => planTableLineRemove({ rows: 1, columns: 3 }, CELLS, 'row', 0)).toThrow(RangeError)
  })

  it('结果冻结，不修改输入', () => {
    const plan = planTableLineInsert(SIZE, CELLS, 'row', 0)
    expect(Object.isFrozen(plan.updates[0])).toBe(true)
    expect(CELLS[0]).toEqual(cell('a', 0, 0, 1, 2))
  })
})
