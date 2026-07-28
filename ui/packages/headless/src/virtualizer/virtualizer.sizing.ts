/**
 * 快照形状与"把快照翻成内联样式"的纯函数层。
 *
 * 区间与尺寸的计算全部交给 @tanstack/virtual-core（测量缓存、二分定位、多列分道
 * 都在它那边），这里只做三件它不管的事：
 * ① 把内核的条目投影成组件自己的快照形状（并把 scrollMargin 折算掉）；
 * ② 判两次快照等不等——不判就会每个滚动事件都换一批新对象，两个适配器空转重渲；
 * ③ 把快照翻成内联样式串。
 *
 * 整块不碰 DOM、不认识状态机，因此能脱离布局单测。
 */

/**
 * 默认过扫描条数：可视区前后各多渲这么多条。
 * 给 0 的话快速滚动时边缘会露白（滚动事件到重渲之间隔着一帧）。
 */
export const VIRTUALIZER_DEFAULT_OVERSCAN = 5

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
 * 两份快照等不等。默认的 Object.is 在这里恒为 false：内核每被问一次就产出一批新对象，
 * 于是"滚了一点点但可见区间没变"也会被判成变了，两个适配器每个滚动事件都白重渲一遍。
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
 * 按下标取条目。窗口里通常只有几十条且按下标升序，线性找足够；
 * 找不到即"这条此刻不在窗口里"，连接层据此把它收起来。
 */
export function findVirtualizerItem(
  items: readonly VirtualizerItemState[],
  index: number,
): VirtualizerItemState | undefined {
  return items.find(item => item.index === index)
}

/**
 * 像素长度转 CSS 串。留两位小数：实测尺寸是浮点数，不截尾巴会拼出
 * 33.333333333333336px 这种串，两个适配器的内联样式也会对不上。
 */
function px(value: number): string {
  return `${Math.round(value * 100) / 100}px`
}

/** 过扫描条数：给了就用，没给用默认；负数按 0 收（内核不接受负数）。 */
export function resolveVirtualizerOverscan(overscan: number | undefined): number {
  if (overscan == null || !Number.isFinite(overscan))
    return VIRTUALIZER_DEFAULT_OVERSCAN
  return Math.max(0, Math.trunc(overscan))
}

/** 分道数：至少 1。给 0 或负数会让内核的分道数组长度为 0，整份列表算不出区间。 */
export function resolveVirtualizerLanes(lanes: number | undefined): number {
  if (lanes == null || !Number.isFinite(lanes))
    return 1
  return Math.max(1, Math.trunc(lanes))
}

/**
 * 估算尺寸归一成函数形态。允许直接给一个数字：Web Components 侧属性只能是字符串，
 * 等高列表若非写个函数不可，作者就得为一个常量去写 property。
 * 两边都没给按 0 算（即"尺寸未知"）——此时所有条目都会落进窗口，
 * 先整份渲出来、再靠 measureElement 把真实尺寸回喂给内核，而不是白屏。
 */
export function resolveVirtualizerEstimate(
  estimateSize: number | ((index: number) => number) | undefined,
): (index: number) => number {
  if (typeof estimateSize === 'function')
    return estimateSize
  const fixed = typeof estimateSize === 'number' && Number.isFinite(estimateSize) ? estimateSize : 0
  return () => fixed
}

/**
 * content 的内联样式：主轴写总长，交叉轴清空交还给样式表。
 *
 * 两条轴的键每帧都写全（用不上的那条写空串）：WC 侧是 Object.assign 到 style 上，
 * 只写新键不会撤掉上一帧的旧键，运行期把 horizontal 翻过来时会同时留着
 * block-size 与 inline-size，滚动行程就此被两轴一起钉死。
 */
export function virtualizerContentStyle(totalSize: number, horizontal: boolean): Record<string, string> {
  return horizontal
    ? { blockSize: '', inlineSize: px(totalSize) }
    : { inlineSize: '', blockSize: px(totalSize) }
}

/**
 * 比例转百分比。留两位小数：不截尾巴会拼出 33.333333333333336% 这种串，
 * 两个适配器的内联样式也会对不上。
 *
 * 刻意不用 calc(100% / N) 那种"更精确"的写法：CSS 解析器会把它归一化
 * （不同实现归一化的结果还不一样），同一份产出经不同引擎落到 DOM 上就成了不同的串。
 * 三道时末尾差的那 0.01% 在任何屏幕上都不足一个像素。
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
 *
 * 只写位移、不写主轴尺寸：写了就等于把测量钉死在估算值上——量到的永远等于钉上去的那个数，
 * measureElement 于是永远收敛不了。等高列表由作者按 api 给出的 size 自己写。
 *
 * 交叉轴只在多列（lanes > 1）时归连接层，单列时写空串交还给样式表，
 * 这样作者能在自己的样式里改条目宽度。
 *
 * item 为 undefined 即"这条此刻不在窗口里"：四个键全清空，
 * 否则被复用的节点会带着上一轮的位移停在半空。
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
