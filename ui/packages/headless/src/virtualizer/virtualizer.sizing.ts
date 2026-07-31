/**
 * 快照形状与把快照翻成内联样式的纯函数层，不碰 DOM、不认识状态机。
 * 区间与尺寸由 virtualizer.geometry 算，这里只做三件事：
 * 定下快照形状、判两次快照等不等、把快照翻成内联样式串。
 */

import { resolveVirtualizerLanes } from './virtualizer.geometry'

/** 一条被渲出来的条目。位移已折算成"距 content 起点"，作者不必再减 scrollMargin。 */
export interface VirtualizerItemState {
  index: number
  /** 条目身份，来自 getItemKey；默认即下标。 */
  key: string | number
  /** 距 content 起点的主轴位移（px）。 */
  start: number
  /** start + size（px）。 */
  end: number
  /** 主轴尺寸（px）：量过就是实测值，没量过是估算值。 */
  size: number
  /** 多列网格里落在第几道；lanes 为 1 时恒 0。 */
  lane: number
}

/** 某一刻该渲什么的完整答案。连接层只读它，不回头问内核。 */
export interface VirtualizerSnapshot {
  /** 当前该渲染的条目（含过扫描），按下标升序。 */
  items: readonly VirtualizerItemState[]
  /** 整份列表的主轴总长（px），content 靠它撑出滚动行程。 */
  totalSize: number
  /** 可视区首条下标（不含过扫描）；一条都排不下时为 null。 */
  startIndex: number | null
  /** 可视区末条下标（不含过扫描）；一条都排不下时为 null。 */
  endIndex: number | null
}

/** 还没量到视口尺寸时的快照：一条不渲、总长为 0。 */
export const VIRTUALIZER_EMPTY_SNAPSHOT: VirtualizerSnapshot = {
  items: [],
  totalSize: 0,
  startIndex: null,
  endIndex: null,
}

/** 逐字段比一条条目。 */
function sameItem(a: VirtualizerItemState, b: VirtualizerItemState): boolean {
  return a.index === b.index
    && a.key === b.key
    && a.start === b.start
    && a.end === b.end
    && a.size === b.size
    && a.lane === b.lane
}

/**
 * 两份快照等不等。内核每被问一次就产出一批新对象，默认的 Object.is 恒为 false。
 */
export function virtualizerSnapshotEqual(a: VirtualizerSnapshot, b: VirtualizerSnapshot | undefined): boolean {
  if (!b)
    return false
  if (a === b)
    return true
  if (a.totalSize !== b.totalSize || a.startIndex !== b.startIndex || a.endIndex !== b.endIndex)
    return false
  if (a.items.length !== b.items.length)
    return false
  return a.items.every((item, i) => sameItem(item, b.items[i]!))
}

/**
 * 按下标取条目。找不到即这条此刻不在窗口里，连接层据此把它收起来。
 */
export function findVirtualizerItem(
  items: readonly VirtualizerItemState[],
  index: number,
): VirtualizerItemState | undefined {
  return items.find(item => item.index === index)
}

/** 像素长度转 CSS 串，留两位小数。 */
function px(value: number): string {
  return `${Math.round(value * 100) / 100}px`
}

/**
 * content 的内联样式：主轴写总长，交叉轴清空交还给样式表。
 * 两条轴的键每帧都写全（用不上的写空串）：WC 侧 Object.assign 到 style 上不会撤掉旧键，
 * 翻转 horizontal 时两轴会同时被钉死。
 */
export function virtualizerContentStyle(totalSize: number, horizontal: boolean): Record<string, string> {
  return horizontal
    ? { blockSize: '', inlineSize: px(totalSize) }
    : { inlineSize: '', blockSize: px(totalSize) }
}

/**
 * 比例转百分比，留两位小数。
 * 不用 calc(100% / N)：CSS 解析器会归一化它，且各实现归一化的结果不一样，
 * 同一份产出落到不同引擎的 DOM 上会成为不同的串。
 */
function pct(ratio: number): string {
  return `${Math.round(ratio * 10000) / 100}%`
}

/** 某一道在交叉轴上的起点与宽度。 */
function laneSpan(lane: number, lanes: number): { start: string, size: string } {
  return { start: pct(lane / lanes), size: pct(1 / lanes) }
}

/**
 * 一条条目的内联样式。
 * 只写位移、不写主轴尺寸：写了会把测量钉死在估算值上，measureElement 永远收敛不了。
 * 交叉轴只在多列（lanes > 1）时归连接层，单列写空串交还给样式表。
 * item 为 undefined 即这条此刻不在窗口里，四个键全清空，否则复用的节点会带着上一轮的位移。
 */
export function virtualizerItemStyle(
  item: VirtualizerItemState | undefined,
  options: { horizontal: boolean, lanes: number },
): Record<string, string> {
  if (!item)
    return { insetBlockStart: '', insetInlineStart: '', blockSize: '', inlineSize: '' }

  const lanes = resolveVirtualizerLanes(options.lanes)
  const cross = lanes > 1 ? laneSpan(item.lane, lanes) : { start: '', size: '' }
  return options.horizontal
    ? {
        insetInlineStart: px(item.start),
        insetBlockStart: cross.start,
        blockSize: cross.size,
        inlineSize: '',
      }
    : {
        insetBlockStart: px(item.start),
        insetInlineStart: cross.start,
        inlineSize: cross.size,
        blockSize: '',
      }
}
