import type { TransferCheckState, TransferFilter, TransferItem, TransferSide } from './transfer.types'

/**
 * 两侧集合的全部推导。整块是纯函数：给一份全集、一份 target 集合、一份勾选集合与一个搜索串，
 * 算出"哪些在左、哪些在右、哪些勾得动、搬完之后是什么样"，不碰 DOM、不认识状态机。
 *
 * 贯穿全文的一条口径：**可操作 = 该侧可见（分侧 + 搜索之后）且未禁用**。
 * 三态、全选、搬运、按钮禁用态一律以它为准，绝不各算各的——
 * 少了这条统一口径，就会出现"按钮亮着但按下去什么也没搬走"（按钮按全部勾选算、
 * 搬运按可见的算）这类自相矛盾。
 *
 * 导出名一律带 transfer 前缀：这些是集合算法的通用词（partition/move/toggleAll），
 * 不加前缀合进主入口就会跟别的组件撞名。
 */

/**
 * 值在哪一侧。在 value 里即 target，其余一律 source——
 * "不在右边"就是"在左边"，不需要第二份集合来记左侧，两份记账迟早对不上。
 */
export function transferSideOf(value: readonly string[], itemValue: string): TransferSide {
  return value.includes(itemValue) ? 'target' : 'source'
}

/** 缺省匹配规则：标签大小写不敏感包含。 */
export function transferMatchesQuery(item: TransferItem, query: string): boolean {
  return item.label.toLowerCase().includes(query.toLowerCase())
}

/**
 * 某一侧当下看得见的条目：先按 value 分侧，再套搜索。
 *
 * 顺序恒为 items 原序，两侧同一套规则。这一点是导航的地基：连接层按这个序列
 * 去活 DOM 里取节点（而不是反过来按文档序走），方向键才不会一头扎进被隐去的条目。
 * 纯空白的搜索串按"没搜"处理：用户敲了个空格不该把整份列表清空。
 */
export function transferVisibleItems(
  items: readonly TransferItem[],
  value: readonly string[],
  side: TransferSide,
  query = '',
  filter?: TransferFilter,
): TransferItem[] {
  const match = filter ?? transferMatchesQuery
  const q = query.trim()
  return items.filter(item =>
    transferSideOf(value, item.value) === side && (q === '' || match(item, q)),
  )
}

/**
 * 这一侧此刻接不接受勾选。oneWay 下 target 侧不接受：勾选的唯一用途就是搬运，
 * 而往回搬那条路已经封死，留着一片勾得动却搬不走的复选框只会让人反复试。
 */
export function transferIsCheckable(side: TransferSide, oneWay = false): boolean {
  return !(oneWay && side === 'target')
}

/** 可见条目里真正可操作的那些（未禁用）的值。 */
export function transferOperableValues(visible: readonly TransferItem[]): string[] {
  return visible.filter(item => !item.disabled).map(item => item.value)
}

/** 可操作条目里被勾中的那些，顺序随可操作集合。 */
export function transferCheckedValues(operable: readonly string[], selected: readonly string[]): string[] {
  return operable.filter(v => selected.includes(v))
}

/**
 * 一侧的整体勾选态。可操作集合为空时恒为 none——
 * 空集合上"全都勾了"在逻辑上成立，但读屏念出"已全选"而列表里一条都没有，是纯粹的谎话。
 */
export function transferCheckState(
  operable: readonly string[],
  selected: readonly string[],
): TransferCheckState {
  if (operable.length === 0)
    return 'none'
  const hit = transferCheckedValues(operable, selected).length
  if (hit === 0)
    return 'none'
  return hit === operable.length ? 'all' : 'some'
}

/**
 * 全选 / 取消全选一侧。只动传进来的这批可操作值：
 * 勾中的禁用条目、以及被搜索藏起来的勾选，一律原样留在集合里——
 * 用户点的是"把我看得见的这些都勾上"，不该顺手把他够不着的也清掉。
 */
export function transferToggleAll(
  operable: readonly string[],
  selected: readonly string[],
): string[] {
  if (operable.length === 0)
    return [...selected]
  const all = operable.every(v => selected.includes(v))
  if (all)
    return selected.filter(v => !operable.includes(v))
  return [...selected, ...operable.filter(v => !selected.includes(v))]
}

/** 翻转单个值的勾选态。新值按点击先后追加，不按全集顺序重排。 */
export function transferToggleValue(selected: readonly string[], value: string): string[] {
  return selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]
}

export interface TransferMoveInput {
  /** 当前 target 侧集合。 */
  value: readonly string[]
  /** 当前勾选集合。 */
  selected: readonly string[]
  /** 这一次要搬走的值（调用方已按"可操作且勾中"算好）。 */
  moving: readonly string[]
  /** 搬到哪一侧。 */
  to: TransferSide
  oneWay?: boolean
}

export interface TransferMoveResult {
  value: string[]
  selected: string[]
}

/**
 * 搬运：算出新的 target 集合与新的勾选集合。
 *
 * 搬走的条目一并退出勾选集合——它换了一侧，原来那个勾没有任何意义了；
 * 留着的话用户一按"往回搬"就会把刚搬过去的原样搬回来，像按钮失灵。
 *
 * oneWay 在这里再挡一道：连接层已经把往回搬的按钮禁掉了，但程序化入口（api.move）
 * 与合成事件都绕得过 DOM 上的禁用，约束必须落在算法本身才真的成立。
 */
export function transferMove(input: TransferMoveInput): TransferMoveResult {
  const { value, selected, moving, to, oneWay = false } = input
  if (to === 'source' && oneWay)
    return { value: [...value], selected: [...selected] }

  const move = new Set(moving)
  const nextValue = to === 'target'
    ? [...value, ...[...move].filter(v => !value.includes(v))]
    : value.filter(v => !move.has(v))
  return { value: nextValue, selected: selected.filter(v => !move.has(v)) }
}
