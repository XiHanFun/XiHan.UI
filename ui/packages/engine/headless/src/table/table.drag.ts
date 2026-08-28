// 列拖拽的纯算法：谁能拖、落点折算成列偏好里的下标。
// 不碰 DOM、不认识状态机——连接层在 render 期就要用到它们，此时 DOM 尚不存在。
import type { DragRect, DropTarget } from '../shared/drag'
import type { TableColumn, TableRowDef, TableVisibleRow } from './table.types'
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
 * - `virtualized`：只渲窗口内那一段时，窗口外的行不在 DOM 里，落点算不出来。
 */
export type TableRowReorderReason = 'sorted' | 'virtualized'

export function rowReorderReason(
  sortLength: number,
  measuredRows?: number,
  dataRows?: number,
): TableRowReorderReason | null {
  if (sortLength > 0)
    return 'sorted'
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

/** 行搬家：把某一行放到某个父行下的第几位。父为 null 即根层。 */
export interface TableRowMove {
  id: string
  parent: string | null
  index: number
}

/**
 * 目标是不是被拖那一行自己或它的后代。
 *
 * 判据是大纲编号（`1.2.3`）的前缀关系：它就是这一行在树里的下标路径，
 * 与树那边比 `indexPath` 是同一件事。比它天然无环——沿 parentId 往上走的话，
 * 作者写出互相指向的两行就转不出来了。
 *
 * 前缀要按段比，不能比字符串：`1.1` 是 `1.10` 的字符串前缀，却不是它的祖先。
 */
export function isSelfOrDescendantRow(
  rows: readonly TableVisibleRow[],
  dragged: string,
  target: string,
): boolean {
  const from = rows.find(row => row.id === dragged && row.kind === 'data')?.outline
  const to = rows.find(row => row.id === target && row.kind === 'data')?.outline
  if (from == null || to == null)
    return false
  const a = from.split('.')
  const b = to.split('.')
  if (b.length < a.length)
    return false
  return a.every((seg, i) => seg === b[i])
}

/**
 * 落点折算成搬家。
 *
 * `inside` 落进目标的子层末尾；`before` / `after` 落进目标所在那一层。
 * 下标吃「先摘后插」的修正：同一层内往后搬时，摘掉自己之后目标的序号少了一位。
 */
export function tableRowMoveOf(
  rows: readonly TableVisibleRow[],
  dragged: string,
  target: DropTarget,
): TableRowMove | null {
  const data = rows.filter(row => row.kind === 'data')
  const self = data.find(row => row.id === dragged)
  const to = data.find(row => row.id === target.targetValue)
  if (!self || !to)
    return null
  if (isSelfOrDescendantRow(rows, dragged, target.targetValue))
    return null

  if (target.position === 'inside') {
    const childCount = data.filter(row => row.parentId === to.id).length
    const already = self.parentId === to.id
    const index = already ? childCount - 1 : childCount
    // 本来就是这个父的末位孩子：算下来还是原位，不发一次空搬家
    if (already && index === self.posInSet - 1)
      return null
    return { id: dragged, parent: to.id, index }
  }

  const parent = to.parentId
  let index = to.posInSet - 1 + (target.position === 'after' ? 1 : 0)
  if (self.parentId === parent) {
    const from = self.posInSet - 1
    if (from < index)
      index -= 1
    if (from === index)
      return null
  }
  return { id: dragged, parent, index }
}

/**
 * 搬完之后的整份 rows 顺序。
 *
 * 表格的树是**带 parentId 的扁平数组**：结构由 parentId 定，同层次序由数组里的先后定。
 * 所以搬家要做两件事——把那一行的 parentId 换掉，再把它挪到新同层的正确位置上。
 * 这里只算顺序，parentId 由使用者按 move.parent 自己写回。
 */
export function reorderTableRows(
  rows: readonly TableRowDef[],
  move: TableRowMove,
): string[] {
  const ids = rows.map(row => row.id)
  if (!ids.includes(move.id))
    return ids

  const rest = rows.filter(row => row.id !== move.id)
  const parentOf = new Map(rest.map(row => [row.id, row.parentId ?? null]))
  /** 子树连着走：插进别人的子树中间虽然不改层级，但数组读起来是乱的。 */
  const inSubtreeOf = (id: string, root: string): boolean => {
    for (let at: string | null | undefined = id; at != null; at = parentOf.get(at)) {
      if (at === root)
        return true
    }
    return false
  }

  const siblings = rest.filter(row => (row.parentId ?? null) === move.parent).map(row => row.id)
  let insertAt: number
  const anchor = siblings[move.index]
  if (anchor != null) {
    // 插在新同层第 index 位那一行之前
    insertAt = rest.findIndex(row => row.id === anchor)
  }
  else if (siblings.length > 0) {
    // 落在这一层的末尾：要越过最后一个兄弟整棵子树
    const last = siblings[siblings.length - 1]!
    insertAt = rest.findIndex(row => row.id === last) + 1
    while (insertAt < rest.length && inSubtreeOf(rest[insertAt]!.id, last))
      insertAt += 1
  }
  else if (move.parent != null) {
    // 新父还没有孩子：紧跟在父行之后
    insertAt = rest.findIndex(row => row.id === move.parent) + 1
  }
  else {
    insertAt = rest.length
  }

  const out = rest.map(row => row.id)
  out.splice(insertAt, 0, move.id)
  return out
}

/** 树形行的键盘命令：同层前后挪，或改一层缩进。 */
export function tableRowMoveCommand(
  rows: readonly TableVisibleRow[],
  id: string,
  intent: 'prev' | 'next' | 'outdent' | 'indent',
): DropTarget | null {
  const data = rows.filter(row => row.kind === 'data')
  const self = data.find(row => row.id === id)
  if (!self)
    return null
  const siblings = data.filter(row => row.parentId === self.parentId).map(row => row.id)
  const at = siblings.indexOf(id)
  if (at < 0)
    return null

  if (intent === 'prev' || intent === 'next') {
    const neighbour = intent === 'prev' ? siblings[at - 1] : siblings[at + 1]
    return neighbour == null
      ? null
      : { targetValue: neighbour, position: intent === 'prev' ? 'before' : 'after' }
  }
  // 已经在根层就没得往外了
  if (intent === 'outdent')
    return self.parentId == null ? null : { targetValue: self.parentId, position: 'after' }
  // 缩进：认上一个兄弟当爹。没有上一个兄弟就没得缩
  const previous = siblings[at - 1]
  return previous == null ? null : { targetValue: previous, position: 'inside' }
}

/**
 * 这一行收不收得下孩子。
 *
 * 判据是「作者说它可展开」或「它已经有孩子」——只有这样的行才给「落进去」那一档。
 * 一行普通数据行不该因为拖到它中间就凭空长出子层。
 */
export function canOwnChildren(rows: readonly TableRowDef[], id: string): boolean {
  const row = rows.find(item => item.id === id)
  if (!row)
    return false
  return !!row.expandable || rows.some(item => item.parentId === id)
}

/**
 * 树形行的方向键映射：上下同层挪，左右改缩进。
 *
 * 横轴跟着文字方向翻——「往里去」的那个方向恒是缩进。纵轴不翻。
 */
export function treeRowIntentFromKey(
  key: string,
  rtl: boolean,
): 'prev' | 'next' | 'outdent' | 'indent' | null {
  if (key === 'ArrowUp')
    return 'prev'
  if (key === 'ArrowDown')
    return 'next'
  if (key === 'ArrowRight')
    return rtl ? 'outdent' : 'indent'
  if (key === 'ArrowLeft')
    return rtl ? 'indent' : 'outdent'
  return null
}
