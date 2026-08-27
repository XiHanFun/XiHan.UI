// 列拖拽的纯算法：谁能拖、落点折算成列偏好里的下标。
// 不碰 DOM、不认识状态机——连接层在 render 期就要用到它们，此时 DOM 尚不存在。
import type { DragRect, DropTarget } from '../shared/drag'
import type { TableColumn } from './table.types'
import { insertionIndex } from '../shared/drag'
import { orderColumnIds } from './table.columns'

/**
 * 哪些列可以拖。
 *
 * 三种屏障：前缀列（序号 / 勾选 / 展开）不是作者的列，列偏好里根本没有它们；
 * 没声明 reorderable 的列作者说过不动；冻结列跨不过去——落下来那一列会夹在
 * 两根钉住的列当中，跟着它们一起悬在滚动之上。
 *
 * 屏障把可拖范围切成段，取最长的那一段。冻结列在两端时（左钉一列、右钉操作列，
 * 最常见的排法）这一段就是整个中间；有人把中间某列钉住时，短的那段退出，
 * 它们的把手报不可用。
 */
export function draggableColumnIds(columns: readonly TableColumn[]): string[] {
  let best: string[] = []
  let run: string[] = []
  for (const column of columns) {
    if (column.kind !== 'data' || column.sticky || !column.reorderable) {
      if (run.length > best.length)
        best = run
      run = []
      continue
    }
    run.push(column.id)
  }
  return run.length > best.length ? run : best
}

/** 可拖列的矩形快照。前缀列与冻结列不进快照，它们既不是拖动源也不是落点。 */
export function columnDragRects(
  columns: readonly TableColumn[],
  measure: (columnId: string) => { start: number, size: number } | null,
): DragRect[] {
  const out: DragRect[] = []
  for (const id of draggableColumnIds(columns)) {
    const box = measure(id)
    if (box)
      out.push({ value: id, start: box.start, size: box.size })
  }
  return out
}

/**
 * 几何落点 → 列偏好的 `toIndex`。
 *
 * 两套下标空间不是一回事：几何这边是「前缀列 + 未隐藏的数据列」，
 * 列偏好那边是「作者给的全部列（含隐藏列）按 order 排过」。只要表里藏了一列，
 * 两者就差一截。
 *
 * 这里不做下标换算——落点是按列 id 认的（不是按第几个），
 * 于是直接在作者列序上求插入位即可，隐藏列自然留在它原本的邻居旁边。
 */
export function toColumnPreferenceIndex(
  authorColumnIds: readonly string[],
  order: readonly string[] | undefined,
  dragColumnId: string,
  target: DropTarget,
): number | null {
  return insertionIndex(orderColumnIds([...authorColumnIds], order), dragColumnId, target)
}

/** 键盘命令：把这一列在可拖段内挪一格 / 挪到段首末，折算成落点。 */
export function columnMoveCommand(
  draggable: readonly string[],
  columnId: string,
  intent: 'prev' | 'next' | 'first' | 'last',
): DropTarget | null {
  const at = draggable.indexOf(columnId)
  if (at < 0 || draggable.length < 2)
    return null
  switch (intent) {
    case 'prev': {
      const before = draggable[at - 1]
      return before == null ? null : { targetValue: before, position: 'before' }
    }
    case 'next': {
      const after = draggable[at + 1]
      return after == null ? null : { targetValue: after, position: 'after' }
    }
    case 'first': {
      const head = draggable[0]
      return head == null || head === columnId ? null : { targetValue: head, position: 'before' }
    }
    case 'last': {
      const tail = draggable[draggable.length - 1]
      return tail == null || tail === columnId ? null : { targetValue: tail, position: 'after' }
    }
  }
}

/** 方向键 → 命令。水平轴跟着文字方向翻。 */
export function columnMoveIntentFromKey(
  key: string,
  rtl: boolean,
): 'prev' | 'next' | 'first' | 'last' | null {
  switch (key) {
    case 'ArrowLeft':
      return rtl ? 'next' : 'prev'
    case 'ArrowRight':
      return rtl ? 'prev' : 'next'
    case 'Home':
      return rtl ? 'last' : 'first'
    case 'End':
      return rtl ? 'first' : 'last'
    default:
      return null
  }
}

/**
 * 行拖不动的原因，null 表示能拖。
 *
 * 三条都是「拖了也没意义」而不是「拖了会崩」：
 * - `sorted`：排序链非空时顺序由排序键决定，拖出来的新序下一帧就被覆盖；
 * - `hierarchical`：树形行的「换父」两个下标说不出来，那是 tree 承担的语义；
 * - `virtualized`：只渲窗口内那一段时，窗口外的行不在 DOM 里，落点算不出来。
 */
export type TableRowReorderReason = 'sorted' | 'hierarchical' | 'virtualized'

export function rowReorderReason(
  sortLength: number,
  hierarchical: boolean,
  measuredRows?: number,
  dataRows?: number,
): TableRowReorderReason | null {
  if (sortLength > 0)
    return 'sorted'
  if (hierarchical)
    return 'hierarchical'
  // 量到的行数与数据行数对不上 = 宿主只渲了一段。两者都给了才判，渲染前无从得知
  if (measuredRows != null && dataRows != null && measuredRows !== dataRows)
    return 'virtualized'
  return null
}

/** 量出来的一条：行身份、它在纵轴上的位置，以及它是数据行还是详情行。 */
export interface MeasuredRow {
  value: string
  kind: 'data' | 'expanded'
  start: number
  size: number
}

/**
 * 把量到的行并成「行组」：一个数据行连同紧跟它的详情行算作一整块。
 *
 * 落点判定按整块算，否则拖过一个展开着的行时，指针明明还在这一块里，
 * 落点却因为跨进了详情行那一段而反复跳。
 *
 * 详情行紧跟所属数据行是摊平的契约（见 flattenTableRows），这里按 DOM 顺序认：
 * 遇到详情行就并进上一个数据行。孤立的详情行（前面没有数据行）直接丢掉。
 */
export function rowGroupRects(measured: readonly MeasuredRow[]): DragRect[] {
  const out: DragRect[] = []
  for (const row of measured) {
    if (row.kind === 'data') {
      out.push({ value: row.value, start: row.start, size: row.size })
      continue
    }
    const last = out[out.length - 1]
    if (!last)
      continue
    const end = Math.max(last.start + last.size, row.start + row.size)
    const start = Math.min(last.start, row.start)
    out[out.length - 1] = { value: last.value, start, size: end - start }
  }
  return out
}

/** 键盘命令：把这一行在可见数据行里挪一格。 */
export function rowMoveCommand(
  ids: readonly string[],
  rowId: string,
  intent: 'prev' | 'next',
): DropTarget | null {
  const at = ids.indexOf(rowId)
  if (at < 0 || ids.length < 2)
    return null
  const neighbour = intent === 'prev' ? ids[at - 1] : ids[at + 1]
  return neighbour == null
    ? null
    : { targetValue: neighbour, position: intent === 'prev' ? 'before' : 'after' }
}

/** Alt + 上下键 → 命令。纵轴与文字方向无关，不翻。 */
export function rowMoveIntentFromKey(key: string): 'prev' | 'next' | null {
  if (key === 'ArrowUp')
    return 'prev'
  if (key === 'ArrowDown')
    return 'next'
  return null
}

/** 搬完之后的整份行序，可直接拿去写回数据源。 */
export function moveRowIds(
  ids: readonly string[],
  rowId: string,
  target: DropTarget,
): { from: number, to: number, ids: string[] } | null {
  const from = ids.indexOf(rowId)
  const to = insertionIndex(ids, rowId, target)
  if (from < 0 || to == null)
    return null
  const next = [...ids]
  const removed = next.splice(from, 1)
  next.splice(to, 0, ...removed)
  return { from, to, ids: next }
}
