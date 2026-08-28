// 节点拖拽的纯算法：落点合不合法、落点折算成「搬到哪个父的第几位」。
// 不碰 DOM、不认识状态机——连接层在 render 期就要用到它们，此时 DOM 尚不存在。
import type { DropTarget } from '../shared/drag'
import type { TreeNodeMeta } from './tree.types'

/** 搬家：把某个节点放到某个父节点下的第几位。父为 null 即根层。 */
export interface TreeMove {
  /** 被搬的节点。 */
  value: string
  /** 搬到谁下面；null 是根层。 */
  parent: string | null
  /** 在那一层的第几位，0 起算。已经算过「先摘后插」的修正。 */
  index: number
}

/**
 * 目标是不是被拖节点自己或它的后代。
 *
 * 判据是 `indexPath` 的前缀关系，不是沿 `parent` 往上走：
 * 作者写出自引用的数据是被支持的（collectNodes 有祖先链防护），沿 parent 上溯会死循环；
 * 而同一个 value 挂在两个父下时 `parent` 只留先出现的那一支，判出来的祖先也是错的。
 * 前缀比较 O(深度)，且天然无环。
 */
export function isSelfOrDescendant(
  dragged: TreeNodeMeta | undefined,
  target: TreeNodeMeta | undefined,
): boolean {
  if (!dragged || !target)
    return false
  const from = dragged.indexPath
  const to = target.indexPath
  if (to.length < from.length)
    return false
  return from.every((seg, i) => seg === to[i])
}

/**
 * 这个落点合不合法。
 *
 * 三条：不能落进自己或自己的后代（拖出一个环）、不能落在禁用的节点上、
 * 作者的 allowDrop 说了不行就不行。
 */
export function isTreeDropAllowed(
  meta: ReadonlyMap<string, TreeNodeMeta>,
  dragged: string,
  target: DropTarget,
  allowDrop?: (details: TreeMove) => boolean,
): boolean {
  const targetMeta = meta.get(target.targetValue)
  if (!targetMeta)
    return false
  if (isSelfOrDescendant(meta.get(dragged), targetMeta))
    return false
  // 禁用只拦「放进去」：往一个禁用的分支里塞东西说不通，
  // 但在它前后插只是绕着它排序，与它自己动不动得了无关。
  // 同一口径在 table 与 tabs 那边也成立——禁用的行/标签照样是前后插的参照
  if (targetMeta.disabled && target.position === 'inside')
    return false
  const move = treeMoveOf(meta, dragged, target)
  if (!move)
    return false
  return allowDrop ? allowDrop(move) : true
}

/**
 * 落点折算成搬家。
 *
 * `inside` 落进目标的子层末尾；`before` / `after` 落进目标所在那一层，
 * 位置由目标的同层序号定。
 *
 * 下标吃「先摘后插」的修正：同一层内往后搬时，摘掉自己之后目标的序号少了一位。
 * 少这一下的表现是「往下拖一格纹丝不动」，看着像没生效其实是刚好抵消。
 */
export function treeMoveOf(
  meta: ReadonlyMap<string, TreeNodeMeta>,
  dragged: string,
  target: DropTarget,
): TreeMove | null {
  const draggedMeta = meta.get(dragged)
  const targetMeta = meta.get(target.targetValue)
  if (!draggedMeta || !targetMeta)
    return null

  if (target.position === 'inside') {
    // 落进子层末尾。已经在这个父下面时不必减一：末尾就是末尾
    const childCount = countChildren(meta, target.targetValue)
    const already = draggedMeta.parent === target.targetValue
    const index = already ? childCount - 1 : childCount
    // 本来就是这个父的末位孩子：算下来还是原位，不发一次空搬家。
    // 与下面 before / after 那一支同一条约定
    if (already && index === draggedMeta.posInSet - 1)
      return null
    return { value: dragged, parent: target.targetValue, index }
  }

  const parent = targetMeta.parent
  // posInSet 从 1 起算，这里要 0 起算的下标
  let index = targetMeta.posInSet - 1 + (target.position === 'after' ? 1 : 0)
  if (draggedMeta.parent === parent) {
    const from = draggedMeta.posInSet - 1
    if (from < index)
      index -= 1
    if (from === index)
      return null
  }
  return { value: dragged, parent, index }
}

/** 这个节点下面有几个孩子。元信息里没有直接的孩子数，按 parent 反查。 */
function countChildren(meta: ReadonlyMap<string, TreeNodeMeta>, value: string): number {
  let count = 0
  for (const node of meta.values()) {
    if (node.parent === value)
      count += 1
  }
  return count
}

/**
 * 键盘命令：在可见节点里挪一格，或改一层缩进。
 *
 * - `prev` / `next`：在**同一层的兄弟**里前后挪。跨层不由方向键承担，
 *   否则按住下键会一路钻进别人的子树里，看着像失控。
 * - `outdent`：变成父节点的下一个兄弟。
 * - `indent`：变成上一个兄弟的最后一个孩子——这与文件管理器和大纲编辑器的惯例一致。
 */
export function treeMoveCommand(
  meta: ReadonlyMap<string, TreeNodeMeta>,
  siblings: readonly string[],
  value: string,
  intent: 'prev' | 'next' | 'outdent' | 'indent',
): DropTarget | null {
  const self = meta.get(value)
  if (!self)
    return null
  const at = siblings.indexOf(value)
  if (at < 0)
    return null

  if (intent === 'prev' || intent === 'next') {
    const neighbour = intent === 'prev' ? siblings[at - 1] : siblings[at + 1]
    return neighbour == null
      ? null
      : { targetValue: neighbour, position: intent === 'prev' ? 'before' : 'after' }
  }

  if (intent === 'outdent') {
    // 已经在根层就没得往外了
    return self.parent == null ? null : { targetValue: self.parent, position: 'after' }
  }

  // 缩进：认上一个兄弟当爹。没有上一个兄弟就没得缩
  const previous = siblings[at - 1]
  return previous == null ? null : { targetValue: previous, position: 'inside' }
}

/** 方向键 → 命令。带 Alt 时才走这一路，裸方向键仍是导航与展开收起。 */
export function treeMoveIntentFromKey(
  key: string,
  rtl: boolean,
): 'prev' | 'next' | 'outdent' | 'indent' | null {
  if (key === 'ArrowUp')
    return 'prev'
  if (key === 'ArrowDown')
    return 'next'
  // 横轴跟着文字方向翻：往里去的那个方向恒是缩进
  if (key === 'ArrowRight')
    return rtl ? 'outdent' : 'indent'
  if (key === 'ArrowLeft')
    return rtl ? 'indent' : 'outdent'
  return null
}
