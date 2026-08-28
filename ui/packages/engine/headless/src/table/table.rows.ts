import type {
  TableRowDef,
  TableSelection,
  TableSelectionMode,
  TableSelectionState,
  TableVisibleRow,
} from './table.types'

/**
 * 行集合的纯算法：摊平与选择集合的推导，不碰 DOM、不认识状态机。
 * 连接层在 Vue 的 render 期就要用到它们，此时 DOM 尚不存在。
 */

/**
 * 把行定义摊平成可见行序列：数据行逐条排开，展开着的行紧随其后插一条详情行。
 * 这是行号（aria-rowindex）的算法源头，方向键与 Home/End 也在这个序列上走。
 * 不可展开的行即便在展开集合里也不出详情行。
 * id 重复时只认先出现的那一行，否则两行会在 DOM 上抢同一个 data-value。
 */
export function flattenTableRows(
  rows: readonly TableRowDef[],
  expandedValue: readonly string[],
): TableVisibleRow[] {
  const expanded = new Set(expandedValue)

  // 先按定义序建父子。id 重复只认先出现的那一行，否则两行会在 DOM 上抢同一个 data-value
  const seen = new Set<string>()
  const unique: TableRowDef[] = []
  for (const row of rows) {
    if (seen.has(row.id))
      continue
    seen.add(row.id)
    unique.push(row)
  }

  const childrenOf = new Map<string, TableRowDef[]>()
  // 解析过的父行 id：作者写的 parentId 可能指向不存在的行，这里记的是判过之后的那个
  const parentOf = new Map<string, string | null>()
  const roots: TableRowDef[] = []
  for (const row of unique) {
    // 父行不存在时按根行处理：吞掉这一行会让数据凭空少一条，比排错位置更难查
    const parent = row.parentId != null && seen.has(row.parentId) ? row.parentId : null
    parentOf.set(row.id, parent)
    if (parent == null) {
      roots.push(row)
      continue
    }
    const list = childrenOf.get(parent)
    if (list)
      list.push(row)
    else
      childrenOf.set(parent, [row])
  }

  const out: TableVisibleRow[] = []

  const walk = (list: readonly TableRowDef[], level: number, prefix: string): void => {
    list.forEach((row, i) => {
      const kids = childrenOf.get(row.id)
      const hasKids = !!kids && kids.length > 0
      // 有子行的行以子行为展开对象；没有子行的才看 expandable（详情行）
      const expandable = hasKids || !!row.expandable
      const isExpanded = expandable && expanded.has(row.id)
      const disabled = !!row.disabled
      // 编号取定义序里的下标，不取可见序：收起某一枝时仍在场的行编号一个都不变
      const outline = prefix ? `${prefix}.${i + 1}` : String(i + 1)

      out.push({
        id: row.id,
        kind: 'data',
        disabled,
        expandable,
        expanded: isExpanded,
        index: out.length,
        parentId: parentOf.get(row.id) ?? null,
        level,
        posInSet: i + 1,
        setSize: list.length,
        outline,
      })

      if (!isExpanded)
        return
      if (hasKids) {
        walk(kids, level + 1, outline)
        return
      }
      // 一行不可能既展开出子行、又展开出一块详情，两者互斥
      out.push({
        id: row.id,
        kind: 'expanded',
        disabled,
        expandable,
        expanded: true,
        index: out.length,
        parentId: row.id,
        level: level + 1,
        posInSet: 1,
        setSize: 1,
        outline,
      })
    })
  }

  walk(roots, 1, '')
  return out
}

/**
 * 可选行：未禁用的数据行，全选的基数与三态都按它算。
 * id 重复同样只认先出现的那一行。
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
 * 把选中集合摊成显式 id 数组；'all' 摊成当前可选行全集，跨页的部分在摊平那一刻丢失。
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
 * 一行可选的都没有时恒为 unchecked，此时 'all' 也无从落地。
 */
export function tableSelectionState(
  selection: TableSelection,
  ids: readonly string[],
): TableSelectionState {
  if (ids.length === 0)
    return 'unchecked'
  if (selection === 'all')
    return 'checked'
  const hit = ids.filter(id => selection.includes(id)).length
  if (hit === 0)
    return 'unchecked'
  return hit === ids.length ? 'checked' : 'indeterminate'
}

/**
 * 切换单行选中。ids 是可选行全集（'all' 摊平的基准）。
 * 单选也允许再点一次取消。
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
 * 摘掉那一路只动可选行，选中着的禁用行留在集合里。
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
