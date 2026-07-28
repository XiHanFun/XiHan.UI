import type { TableSortDescriptor, TableSortDirection } from './table.types'

/**
 * 多字段排序链的纯算法。链是有序的：下标即优先级，第一个是主排序字段。
 * 同一列在链里只允许出现一次——出现两次的话「按它升序再按它降序」自相矛盾，
 * 而 aria-sort 也只报得出一个方向。
 */

/** 按 id 去重且保序，先出现的那条为准。公开写入与外部传入都经这里收口。 */
export function tableNormalizeSort(sort: readonly TableSortDescriptor[]): TableSortDescriptor[] {
  const seen = new Set<string>()
  const out: TableSortDescriptor[] = []
  for (const item of sort) {
    if (seen.has(item.id))
      continue
    seen.add(item.id)
    out.push({ id: item.id, direction: item.direction })
  }
  return out
}

/** 该列当前的排序方向；不在链里为 null。 */
export function tableSortDirectionOf(
  sort: readonly TableSortDescriptor[],
  id: string,
): TableSortDirection | null {
  return sort.find(item => item.id === id)?.direction ?? null
}

/** 该列在链里的优先级，1 起算；不在链里为 0。 */
export function tableSortIndexOf(sort: readonly TableSortDescriptor[], id: string): number {
  return sort.findIndex(item => item.id === id) + 1
}

export interface TableToggleSortOptions {
  /**
   * 追加到链尾而不是替换整条链（按住 Shift 点表头就是这一路）。
   * 该列已在链里时只改它自己的方向，位置不动——排序优先级是用户先后点出来的，
   * 换个方向不该把它挪到链尾去。
   */
  append?: boolean
}

/**
 * 点一次排序把手：升序 → 降序 → 不排序，三态循环。
 *
 * 不追加时整条链被这一列替换掉（循环回「不排序」即清空链）：
 * 单列排序是默认心智，先点 A 再点 B 应当只按 B 排，而不是悄悄按 A、B 排。
 */
export function tableToggleSort(
  sort: readonly TableSortDescriptor[],
  id: string,
  options: TableToggleSortOptions = {},
): TableSortDescriptor[] {
  const { append = false } = options
  const current = tableSortDirectionOf(sort, id)
  const next: TableSortDirection | null = current === null ? 'asc' : current === 'asc' ? 'desc' : null

  if (!append)
    return next === null ? [] : [{ id, direction: next }]
  if (next === null)
    return sort.filter(item => item.id !== id).map(item => ({ ...item }))
  if (current === null)
    return [...sort.map(item => ({ ...item })), { id, direction: next }]
  return sort.map(item => (item.id === id ? { id, direction: next } : { ...item }))
}
