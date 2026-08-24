import type { MasonryBreakpoint, MasonryColumns } from './masonry.types'

/** 不写列数时分几列。 */
const DEFAULT_COLUMNS = 3

/**
 * 四档断点的像素宽度，与断点令牌 --xh-breakpoint-sm/-md/-lg/-xl 同值。
 *
 * 列数由脚本定，量的是容器宽度而不是视口宽度，所以换档只能在这里比数字，没有对应的媒体查询。
 * 这份常量是全仓唯一一处在 JS 里复制断点值的地方。check-breakpoints 会把它与
 * --xh-breakpoint-sm/-md/-lg/-xl 逐档对账，改了令牌不同步这里即构建失败。
 */
const BREAKPOINTS: Readonly<Record<MasonryBreakpoint, number>> = { sm: 640, md: 768, lg: 1024, xl: 1280 }

/** 断点档位名，自窄到宽依次接管。 */
const TIERS: readonly MasonryBreakpoint[] = ['sm', 'md', 'lg', 'xl']

/** 列数至少一列且取整；不是有限数时退回缺省列数。 */
function clampColumns(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : DEFAULT_COLUMNS
}

/** 取第 index 项的高度。没量到、量成负数或非有限数一律当 0。 */
function heightAt(heights: readonly number[], index: number): number {
  const value = heights[index]
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

/**
 * 把列数声明化成此刻的列数。
 *
 * 整数即各档同一个列数；断点对象自窄到宽逐档接管，没写的档沿用比它窄的那一档，最窄那一档
 * 也没写就用缺省列数。width 传的是容器自身的宽度：列数由脚本定，量得到容器就不必只问视口，
 * 窄栏里的瀑布流不会因为窗口宽就分成三列。
 */
export function resolveMasonryColumns(columns: MasonryColumns | undefined, width: number): number {
  if (columns == null)
    return DEFAULT_COLUMNS
  if (typeof columns === 'number')
    return clampColumns(columns)
  let picked = columns.base ?? DEFAULT_COLUMNS
  for (const tier of TIERS) {
    const value = columns[tier]
    if (value != null && width >= BREAKPOINTS[tier])
      picked = value
  }
  return clampColumns(picked)
}

/**
 * 最短列优先：每一项落进当前最矮的那一列。
 *
 * 高度打平时先看谁装的项少、再看谁靠前——高度还没量到（全是 0）时这条兜底正好退成逐列轮流，
 * 首帧就有一副像样的版面，不会所有项都堆在第一列。
 */
function fillShortest(heights: readonly number[], count: number, columns: number): number[] {
  const totals = Array.from<number>({ length: columns }).fill(0)
  const counts = Array.from<number>({ length: columns }).fill(0)
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    let pick = 0
    for (let c = 1; c < columns; c++) {
      const shorter = totals[c]! < totals[pick]!
      const asShortButEmptier = totals[c] === totals[pick] && counts[c]! < counts[pick]!
      if (shorter || asShortButEmptier)
        pick = c
    }
    out.push(pick)
    totals[pick] = totals[pick]! + heightAt(heights, i)
    counts[pick] = counts[pick]! + 1
  }
  return out
}

/**
 * 逐列填：项按文档序成段落进各列，读起来仍是「先走完左列，再走下一列」。
 *
 * 段的分界线取累计高度走过「总高 × 第几列 / 列数」的那一刻。一项最多推进一列；
 * 剩下的项数正好等于还没开张的列数时强行换列，免得末尾几列空着。
 */
function fillSequential(heights: readonly number[], count: number, columns: number): number[] {
  let total = 0
  for (let i = 0; i < count; i++) total += heightAt(heights, i)

  // 总高为 0（高度还没量到）时没有高度可比，段的分界线只能按项数画
  if (total <= 0)
    return Array.from({ length: count }, (_, i) => Math.min(columns - 1, Math.floor((i * columns) / count)))

  const out: number[] = []
  let column = 0
  let filled = 0
  for (let i = 0; i < count; i++) {
    out.push(column)
    filled += heightAt(heights, i)
    const rest = count - i - 1
    const columnsLeft = columns - column - 1
    const crossed = filled >= (total * (column + 1)) / columns
    if (column < columns - 1 && rest > 0 && (crossed || rest === columnsLeft))
      column += 1
  }
  return out
}

/**
 * 算出每一项落在第几列，返回的数组与 heights 一一对应。
 *
 * heights 按作者写的项序给，量不到的项传 0；columns 是此刻的列数，sequential 决定按文档序
 * 逐列填还是最短列优先。纯函数不碰 DOM：量高度归适配器，这里只按数字定案。
 */
export function distributeMasonry(
  heights: readonly number[],
  columns: number,
  sequential = false,
): number[] {
  const count = heights.length
  const total = clampColumns(columns)
  // 只有一列时不必挑，全落在第 0 列
  if (total <= 1)
    return Array.from<number>({ length: count }).fill(0)
  return sequential ? fillSequential(heights, count, total) : fillShortest(heights, count, total)
}
