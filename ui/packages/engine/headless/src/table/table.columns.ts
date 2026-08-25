import type {
  TableColumn,
  TableColumnDef,
  TableColumnKind,
  TableColumnPreference,
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
