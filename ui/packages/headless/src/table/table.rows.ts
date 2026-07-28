import type {
  TableRowDef,
  TableSelection,
  TableSelectionMode,
  TableSelectionState,
  TableVisibleRow,
} from './table.types'

/**
 * 行集合的纯算法：摊平与选择集合的推导，一行 DOM 都不碰、也不认识状态机。
 * 连接层在渲染期就要用到它们（Vue 那一刻 DOM 还不存在），所以必须保持纯粹。
 */

/**
 * 把行定义摊平成**可见行序列**：数据行逐条排开，展开着的行紧随其后插一条详情行。
 *
 * 这是行号（aria-rowindex）的算法源头：展开一行会把它后面所有行的行号整体后移一位，
 * 光看 rows 的下标是算不出来的。方向键、Home/End 也在这个序列上走。
 *
 * 不可展开的行即便混进了展开集合也不出详情行——「能不能展开」由 rows 说了算，
 * 展开集合只是一份意愿。
 *
 * id 重复时只认先出现的那一行：两行同 id 会在 DOM 上抢同一个 data-value，
 * 「按值找行」就此不确定，方向键与选中都会指错人。
 */
export function flattenTableRows(
  rows: readonly TableRowDef[],
  expandedValue: readonly string[],
): TableVisibleRow[] {
  const expanded = new Set(expandedValue)
  const seen = new Set<string>()
  const out: TableVisibleRow[] = []
  for (const row of rows) {
    if (seen.has(row.id))
      continue
    seen.add(row.id)
    const expandable = !!row.expandable
    const isExpanded = expandable && expanded.has(row.id)
    const disabled = !!row.disabled
    out.push({ id: row.id, kind: 'data', disabled, expandable, expanded: isExpanded, index: out.length })
    if (isExpanded)
      out.push({ id: row.id, kind: 'expanded', disabled, expandable, expanded: true, index: out.length })
  }
  return out
}

/**
 * 可选行：未禁用的数据行。
 *
 * 全选的基数与三态都只按它算——禁用行用户根本点不动，把它算进分母会让全选把手
 * 永远停在「半选」上，怎么点都到不了「全选」。id 重复同样只认先出现的那一行。
 */
export function tableSelectableRowIds(rows: readonly TableRowDef[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    if (seen.has(row.id))
      continue
    seen.add(row.id)
    if (!row.disabled)
      out.push(row.id)
  }
  return out
}

/**
 * 把选中集合摊成显式 id 数组。'all' 摊成「当前可选行全集」——
 * 它原本表达的是跨页全选，摊平那一刻跨页的部分就丢了，这是用户一动手就要付的代价。
 */
export function tableSelectionIds(
  selection: TableSelection,
  ids: readonly string[],
): string[] {
  return [...new Set(selection === 'all' ? ids : selection)]
}

export function tableRowSelected(selection: TableSelection, id: string): boolean {
  return selection === 'all' || selection.includes(id)
}

/**
 * 全选把手的三态。ids 是可选行全集。
 *
 * 一行可选的都没有时恒为 none：此时既谈不上「全选」，'all' 也无从落地，
 * 硬报 all 会让空表的全选框显示成勾上的。
 */
export function tableSelectionState(
  selection: TableSelection,
  ids: readonly string[],
): TableSelectionState {
  if (ids.length === 0)
    return 'none'
  if (selection === 'all')
    return 'all'
  const hit = ids.filter(id => selection.includes(id)).length
  if (hit === 0)
    return 'none'
  return hit === ids.length ? 'all' : 'some'
}

/**
 * 切换单行选中。ids 是可选行全集（'all' 摊平的基准）。
 *
 * 单选也允许再点一次取消：把手是复选框形态而不是单选钮，
 * 「点两下把选中点空」在表格里是用户明确要的操作，不像列表那样必须留一个。
 */
export function tableToggleRowSelection(
  selection: TableSelection,
  id: string,
  mode: TableSelectionMode,
  ids: readonly string[],
): string[] {
  const current = tableSelectionIds(selection, ids)
  if (mode === 'none')
    return current
  if (current.includes(id))
    return current.filter(v => v !== id)
  return mode === 'single' ? [id] : [...current, id]
}

/**
 * 全选把手：当前可选行全被选中就整段摘掉，否则整段并进来。
 *
 * 摘掉那一路只动可选行，选中着的禁用行留在集合里——用户按的是他够得着的那一批，
 * 不该顺手把够不着的也清掉。
 */
export function tableToggleSelectAll(
  selection: TableSelection,
  ids: readonly string[],
): string[] {
  const current = tableSelectionIds(selection, ids)
  const all = ids.length > 0 && ids.every(id => current.includes(id))
  if (all)
    return current.filter(v => !ids.includes(v))
  return [...new Set([...current, ...ids])]
}
