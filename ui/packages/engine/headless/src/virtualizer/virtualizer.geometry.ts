/**
 * 虚拟滚动的几何计算：每条落在哪儿、整份多长、此刻该渲哪一段、滚到某条要把滚动量放到几。
 * 纯函数层，不碰 DOM、不认识状态机，输入全部由调用方给全。
 */

/**
 * 默认过扫描条数：可视区前后各多渲这么多条。
 * 给 0 的话快速滚动时边缘会露白。
 */
export const VIRTUALIZER_DEFAULT_OVERSCAN = 5

/** 一条的绝对几何。start / end 与滚动量同一坐标系，已含 scrollMargin 与 paddingStart。 */
export interface VirtualizerMeasurement {
  index: number
  /** 条目身份，来自 getItemKey；默认即下标。实测尺寸按它记账。 */
  key: string | number
  start: number
  end: number
  size: number
  /** 多列网格里落在第几道；lanes 为 1 时恒 0。 */
  lane: number
}

/** 排布参数。除 estimateSize / getItemKey 外都是像素长度。 */
export interface VirtualizerMetrics {
  count: number
  estimateSize: (index: number) => number
  getItemKey?: (index: number) => string | number
  gap: number
  paddingStart: number
  paddingEnd: number
  scrollMargin: number
  lanes: number
}

/** 可视区首末条下标（不含过扫描），闭区间。 */
export interface VirtualizerRange {
  startIndex: number
  endIndex: number
}

/** 该渲的下标闭区间（含过扫描）。 */
export interface VirtualizerWindow {
  from: number
  to: number
}

/** 目标条停在视口的哪一侧。auto 只在目标不在视口里时才滚，且走最近的那一侧。 */
export type VirtualizerAlign = 'start' | 'center' | 'end' | 'auto'

/**
 * 尺寸收成非负有限值。
 * 一条 NaN 会顺着累加位移污染它之后的每一条，且让二分查找的比较全部为假、退化成返回 0。
 */
function finiteSize(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0
}

/** 长度参数（间距、内边距、外距）收成非负有限值。 */
function finiteLength(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0
}

/** 过扫描条数：给了就用，没给用默认；负数按 0 收。 */
export function resolveVirtualizerOverscan(overscan: number | undefined): number {
  if (overscan == null || !Number.isFinite(overscan))
    return VIRTUALIZER_DEFAULT_OVERSCAN
  return Math.max(0, Math.trunc(overscan))
}

/** 分道数：至少 1；0 与负数会让分道数组长度为 0，整份列表算不出区间。 */
export function resolveVirtualizerLanes(lanes: number | undefined): number {
  if (lanes == null || !Number.isFinite(lanes))
    return 1
  return Math.max(1, Math.trunc(lanes))
}

/** 总条数：非有限值与负数按 0 收，小数取整。 */
export function resolveVirtualizerCount(count: number | undefined): number {
  if (count == null || !Number.isFinite(count))
    return 0
  return Math.max(0, Math.trunc(count))
}

/**
 * 估算尺寸归一成函数形态，也允许直接给一个数字。
 * 两边都没给按 0 算（尺寸未知）：此时所有条目都会落进窗口，
 * 先整份渲出来再靠 measureElement 把真实尺寸回喂进来。
 */
export function resolveVirtualizerEstimate(
  estimateSize: number | ((index: number) => number) | undefined,
): (index: number) => number {
  if (typeof estimateSize === 'function')
    return estimateSize
  const fixed = typeof estimateSize === 'number' && Number.isFinite(estimateSize) ? estimateSize : 0
  return () => fixed
}

/** 排布参数归一。调用方给什么都收得住，下面各函数不再重复防御。 */
export function normalizeVirtualizerMetrics(metrics: VirtualizerMetrics): VirtualizerMetrics {
  return {
    count: resolveVirtualizerCount(metrics.count),
    estimateSize: metrics.estimateSize,
    getItemKey: metrics.getItemKey,
    gap: finiteLength(metrics.gap),
    paddingStart: finiteLength(metrics.paddingStart),
    paddingEnd: finiteLength(metrics.paddingEnd),
    scrollMargin: finiteLength(metrics.scrollMargin),
    lanes: resolveVirtualizerLanes(metrics.lanes),
  }
}

/**
 * 下一条落到哪一道：先挑还空着的道（按道序），都占上了就挑当前最短的那道，齐平时取道序小的。
 * ends[i] 为 null 即第 i 道还空着。
 */
function shortestLane(ends: readonly (number | null)[]): number {
  let best = 0
  for (let lane = 0; lane < ends.length; lane++) {
    const end = ends[lane]
    if (end == null)
      return lane
    const bestEnd = ends[best]
    if (bestEnd != null && end < bestEnd)
      best = lane
  }
  return best
}

/**
 * 逐条算出绝对几何。
 *
 * previous 与 from 是增量重排的入口：[0, from) 那一段原样复用，只从 from 起重算。
 * 排布参数变了的那一轮必须给 from = 0，否则前缀是按旧参数排的。
 */
export function measureVirtualizerItems(
  metrics: VirtualizerMetrics,
  sizes: ReadonlyMap<string | number, number>,
  previous: readonly VirtualizerMeasurement[] = [],
  from = 0,
): VirtualizerMeasurement[] {
  const { count, estimateSize, getItemKey, gap, paddingStart, scrollMargin, lanes } = normalizeVirtualizerMetrics(metrics)
  const reuse = Math.max(0, Math.min(from, previous.length, count))
  const items = previous.slice(0, reuse)

  // 复用段的末尾就是各道当前的进度，从后往前扫，每道只认最靠后的那一条
  const laneEnds = Array.from<number | null>({ length: lanes }).fill(null)
  let seeded = 0
  for (let i = items.length - 1; i >= 0 && seeded < lanes; i--) {
    const item = items[i]!
    if (item.lane < lanes && laneEnds[item.lane] == null) {
      laneEnds[item.lane] = item.end
      seeded++
    }
  }

  const origin = paddingStart + scrollMargin
  for (let index = items.length; index < count; index++) {
    const lane = shortestLane(laneEnds)
    const laneEnd = laneEnds[lane]
    // 一道上的第一条贴着起点，之后每条与同道前一条隔一个 gap
    const start = laneEnd == null ? origin : laneEnd + gap
    const key = getItemKey ? getItemKey(index) : index
    const size = finiteSize(sizes.get(key) ?? estimateSize(index))
    const end = start + size
    items.push({ index, key, start, end, size, lane })
    laneEnds[lane] = end
  }

  return items
}

/**
 * 整份列表的主轴总长：最靠后那道的末缘减掉 scrollMargin，再加尾内边距。
 * scrollMargin 是列表上方那截别人的内容，不算进本列表的长度。
 */
export function virtualizerTotalSize(
  measurements: readonly VirtualizerMeasurement[],
  metrics: VirtualizerMetrics,
): number {
  const { paddingStart, paddingEnd, scrollMargin, lanes } = normalizeVirtualizerMetrics(metrics)
  if (measurements.length === 0)
    return paddingStart + paddingEnd

  let end = 0
  if (lanes === 1) {
    end = measurements[measurements.length - 1]!.end
  }
  else {
    // 每道最靠后的那条才是该道的末缘，从后往前扫到各道都见过为止
    const seen = new Set<number>()
    for (let i = measurements.length - 1; i >= 0 && seen.size < lanes; i--) {
      const item = measurements[i]!
      if (seen.has(item.lane))
        continue
      seen.add(item.lane)
      if (item.end > end)
        end = item.end
    }
  }

  return Math.max(end - scrollMargin + paddingEnd, 0)
}

/**
 * 取最后一条 start <= offset 的下标。
 * start 随下标单调不减（每条都排在当前最短那道的末尾，各道最短值只增不减），二分成立。
 */
function findLastStartAtOrBefore(measurements: readonly VirtualizerMeasurement[], offset: number): number {
  let low = 0
  let high = measurements.length - 1
  while (low <= high) {
    const middle = (low + high) >>> 1
    const start = measurements[middle]!.start
    if (start < offset)
      low = middle + 1
    else if (start > offset)
      high = middle - 1
    else
      return middle
  }
  return low > 0 ? low - 1 : 0
}

/**
 * 此刻可视区盖住哪一段。视口量不到尺寸（未布局 / 无 DOM）时返回 null，此时一条都不该渲。
 */
export function findVirtualizerRange(
  measurements: readonly VirtualizerMeasurement[],
  scrollOffset: number,
  viewportSize: number,
  lanes: number,
): VirtualizerRange | null {
  const laneCount = resolveVirtualizerLanes(lanes)
  if (measurements.length === 0 || !Number.isFinite(viewportSize) || viewportSize <= 0)
    return null

  const lastIndex = measurements.length - 1
  if (measurements.length <= laneCount)
    return { startIndex: 0, endIndex: lastIndex }

  const offset = Number.isFinite(scrollOffset) ? scrollOffset : 0
  const limit = offset + viewportSize
  let startIndex = findLastStartAtOrBefore(measurements, offset)
  let endIndex = startIndex

  if (laneCount === 1) {
    while (endIndex < lastIndex && measurements[endIndex]!.end < limit)
      endIndex++
    return { startIndex, endIndex }
  }

  // 多列时同一下标附近的条目分散在各道上，得逐道确认都越过了边界才算扫完
  const laneEnds = Array.from<number>({ length: laneCount }).fill(0)
  while (endIndex < lastIndex && laneEnds.some(end => end < limit)) {
    const item = measurements[endIndex]!
    if (item.lane < laneCount)
      laneEnds[item.lane] = item.end
    endIndex++
  }

  const laneStarts = Array.from<number>({ length: laneCount }).fill(limit)
  while (startIndex >= 0 && laneStarts.some(start => start >= offset)) {
    const item = measurements[startIndex]!
    if (item.lane < laneCount)
      laneStarts[item.lane] = item.start
    startIndex--
  }

  // 补齐成整行：条目按道轮流落位，半行会让同一行的邻居缺席
  startIndex = Math.max(0, startIndex - (startIndex % laneCount))
  endIndex = Math.min(lastIndex, endIndex + (laneCount - 1 - (endIndex % laneCount)))
  return { startIndex, endIndex }
}

/** 把可视区间往两头各撑 overscan 条，并夹在 [0, count - 1] 内。 */
export function expandVirtualizerRange(
  range: VirtualizerRange,
  overscan: number,
  count: number,
): VirtualizerWindow {
  const extra = resolveVirtualizerOverscan(overscan)
  const total = resolveVirtualizerCount(count)
  return {
    from: Math.max(range.startIndex - extra, 0),
    to: Math.min(range.endIndex + extra, total - 1),
  }
}

/**
 * 滚到某一条时滚动量该放到几。返回值已夹在 [0, maxScrollOffset] 内。
 * auto：目标已整条落在视口里就原地不动，否则走最近的那一侧。
 */
export function virtualizerOffsetForItem(
  item: VirtualizerMeasurement,
  align: VirtualizerAlign,
  scrollOffset: number,
  viewportSize: number,
  maxScrollOffset: number,
): number {
  const offset = Number.isFinite(scrollOffset) ? scrollOffset : 0
  const size = Number.isFinite(viewportSize) && viewportSize > 0 ? viewportSize : 0
  const max = Number.isFinite(maxScrollOffset) && maxScrollOffset > 0 ? maxScrollOffset : 0

  let resolved = align
  if (align === 'auto') {
    if (item.end >= offset + size)
      resolved = 'end'
    else if (item.start <= offset)
      resolved = 'start'
    else
      return offset
  }

  let target = item.start
  if (resolved === 'center')
    target = item.start + (item.size - size) / 2
  else if (resolved === 'end')
    target = item.end - size

  return Math.max(0, Math.min(max, target))
}
