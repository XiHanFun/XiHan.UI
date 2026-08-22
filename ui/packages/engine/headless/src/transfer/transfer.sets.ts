import type { TransferCheckState, TransferFilter, TransferItem, TransferSide } from './transfer.types'

/**
 * 两侧集合的全部推导，纯函数：不碰 DOM、不认识状态机。
 * 统一口径：可操作 = 该侧可见（分侧 + 搜索之后）且未禁用；三态、全选、搬运、按钮禁用态都以它为准。
 * 导出名一律带 transfer 前缀，这些是集合算法的通用词，不加前缀会跟别的组件撞名。
 */

/** 值在哪一侧：在 value 里即 target，其余一律 source，左侧不另记一份集合。 */
export function transferSideOf(value: readonly string[], itemValue: string): TransferSide {
  return value.includes(itemValue) ? 'target' : 'source'
}

/** 缺省匹配规则：标签大小写不敏感包含。 */
export function transferMatchesQuery(item: TransferItem, query: string): boolean {
  return item.label.toLowerCase().includes(query.toLowerCase())
}

/**
 * 某一侧当下看得见的条目：先按 value 分侧，再套搜索。
 * 顺序恒为 collection 原序；连接层按这个序列去活 DOM 里取节点，方向键才不会走进被隐去的条目。
 * 纯空白的搜索串按没搜处理。
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
 * 这一侧此刻接不接受勾选。oneWay 下 target 侧不接受：勾选的唯一用途是搬运，而往回搬已被封死。
 */
export function transferIsCheckable(side: TransferSide, oneWay = false): boolean {
  return !(oneWay && side === 'target')
}

/** 可见条目里真正可操作的那些（未禁用）的值。 */
export function transferOperableValues(visible: readonly TransferItem[]): string[] {
  return visible.filter(item => !item.disabled).map(item => item.value)
}

/** 可操作条目里被勾中的那些，顺序随可操作集合。 */
export function transferCheckedValues(operable: readonly string[], selection: readonly string[]): string[] {
  return operable.filter(v => selection.includes(v))
}

/** 一侧的整体勾选态。可操作集合为空时恒为 unchecked。 */
export function transferCheckState(
  operable: readonly string[],
  selection: readonly string[],
): TransferCheckState {
  if (operable.length === 0)
    return 'unchecked'
  const hit = transferCheckedValues(operable, selection).length
  if (hit === 0)
    return 'unchecked'
  return hit === operable.length ? 'checked' : 'indeterminate'
}

/**
 * 全选 / 取消全选一侧。只动传进来的这批可操作值，
 * 勾中的禁用条目与被搜索藏起来的勾选一律原样留在集合里。
 */
export function transferToggleAll(
  operable: readonly string[],
  selection: readonly string[],
): string[] {
  if (operable.length === 0)
    return [...selection]
  const all = operable.every(v => selection.includes(v))
  if (all)
    return selection.filter(v => !operable.includes(v))
  return [...selection, ...operable.filter(v => !selection.includes(v))]
}

/** 翻转单个值的勾选态。新值按点击先后追加，不按全集顺序重排。 */
export function transferToggleValue(selection: readonly string[], value: string): string[] {
  return selection.includes(value) ? selection.filter(v => v !== value) : [...selection, value]
}

export interface TransferMoveInput {
  /** 当前 target 侧集合。 */
  value: readonly string[]
  /** 当前勾选集合。 */
  selection: readonly string[]
  /** 这一次要搬走的值（调用方已按"可操作且勾中"算好）。 */
  moving: readonly string[]
  /** 搬到哪一侧。 */
  to: TransferSide
  oneWay?: boolean
}

export interface TransferMoveResult {
  value: string[]
  selection: string[]
}

/**
 * 搬运：算出新的 target 集合与新的勾选集合，搬走的条目一并退出勾选集合。
 * oneWay 在这里再挡一道：程序化入口与合成事件绕得过 DOM 上的禁用。
 */
export function transferMove(input: TransferMoveInput): TransferMoveResult {
  const { value, selection, moving, to, oneWay = false } = input
  if (to === 'source' && oneWay)
    return { value: [...value], selection: [...selection] }

  const move = new Set(moving)
  const nextValue = to === 'target'
    ? [...value, ...[...move].filter(v => !value.includes(v))]
    : value.filter(v => !move.has(v))
  return { value: nextValue, selection: selection.filter(v => !move.has(v)) }
}
