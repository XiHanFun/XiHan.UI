// 轮播的分页算术：纯函数，不碰 DOM、不认识状态机。
// 覆盖 slidesPerPage 与 slidesPerMove 组合出的总页数、末页落点、回绕收口。
// 页码与条目下标一律 0 基。

/** 一页覆盖的条目下标区间，0 基闭区间；空集用 end < start 表达（没有条目可指）。 */
export interface CarouselSlideRange {
  start: number
  end: number
}

/** 条目总数。负数、小数、NaN 一律收成非负整数。 */
export function normalizeSlideCount(value: number | undefined): number {
  if (value == null || !Number.isFinite(value))
    return 0
  return Math.max(0, Math.trunc(value))
}

/** 一屏放几张，至少 1（0 会让除法给出 Infinity，负数给出反向位移）。 */
export function normalizeSlidesPerPage(value: number | undefined): number {
  if (value == null || !Number.isFinite(value))
    return 1
  return Math.max(1, Math.trunc(value))
}

/** 一次走几张。缺省即跟随 slidesPerPage（整屏翻页），给了就按给的走。 */
export function normalizeSlidesPerMove(value: number | undefined, slidesPerPage: number): number {
  if (value == null || !Number.isFinite(value))
    return normalizeSlidesPerPage(slidesPerPage)
  return Math.max(1, Math.trunc(value))
}

/**
 * 总页数。一张都没有是 0 页（不是 1 页空页）；装得下一屏时恒为 1 页。
 * 多出来的部分按 slidesPerMove 切，末页允许不足一整步，故向上取整再加首页那一页。
 */
export function carouselPageCount(
  slideCount: number | undefined,
  slidesPerPage: number | undefined,
  slidesPerMove: number | undefined,
): number {
  const total = normalizeSlideCount(slideCount)
  if (total === 0)
    return 0
  const perPage = normalizeSlidesPerPage(slidesPerPage)
  if (total <= perPage)
    return 1
  const perMove = normalizeSlidesPerMove(slidesPerMove, perPage)
  return Math.ceil((total - perPage) / perMove) + 1
}

/**
 * 把任意来路的页码收进合法区间。
 * loop=false 时夹取；loop=true 时取模回绕，负页码也绕得回来。总页数为 0 时恒为 0。
 */
export function clampCarouselPage(page: number | undefined, totalPages: number, loop = false): number {
  const max = Math.max(0, Math.trunc(totalPages))
  if (max === 0)
    return 0
  if (page == null || !Number.isFinite(page))
    return 0
  const value = Math.trunc(page)
  if (!loop)
    return Math.min(Math.max(value, 0), max - 1)
  // 先取模再补一圈：JS 的 % 对负数给负余数，直接用会算出 -1 这样的页码
  return ((value % max) + max) % max
}

/**
 * 某一页的首个条目下标。
 * 末页把起点夹回最后一个"能填满一屏"的位置（会与上一页重叠），否则视口末尾会空出一块。
 */
export function carouselPageStart(
  page: number,
  slideCount: number | undefined,
  slidesPerPage: number | undefined,
  slidesPerMove: number | undefined,
): number {
  const total = normalizeSlideCount(slideCount)
  const totalPages = carouselPageCount(total, slidesPerPage, slidesPerMove)
  if (totalPages === 0)
    return 0
  const perPage = normalizeSlidesPerPage(slidesPerPage)
  const perMove = normalizeSlidesPerMove(slidesPerMove, perPage)
  const current = clampCarouselPage(page, totalPages)
  return Math.min(current * perMove, Math.max(0, total - perPage))
}

/** 某一页覆盖的条目区间。末页按实际条数收口，不会指向并不存在的条目。 */
export function carouselSlideRange(
  page: number,
  slideCount: number | undefined,
  slidesPerPage: number | undefined,
  slidesPerMove: number | undefined,
): CarouselSlideRange {
  const total = normalizeSlideCount(slideCount)
  if (total === 0)
    return { start: 0, end: -1 }
  const perPage = normalizeSlidesPerPage(slidesPerPage)
  const start = carouselPageStart(page, total, perPage, slidesPerMove)
  return { start, end: Math.min(start + perPage - 1, total - 1) }
}

/** 每一页的落点下标序列：`[0, 2, 3]` 这样一串。作者拿它渲染指示点（一页一个）。 */
export function carouselPageSnapPoints(
  slideCount: number | undefined,
  slidesPerPage: number | undefined,
  slidesPerMove: number | undefined,
): number[] {
  const total = carouselPageCount(slideCount, slidesPerPage, slidesPerMove)
  return Array.from({ length: total }, (_, page) => carouselPageStart(page, slideCount, slidesPerPage, slidesPerMove))
}

/**
 * 条目轨道要位移的百分比（相对轨道自身宽/高，也就是一整个视口）。
 *
 * 每个条目占 `100% / slidesPerPage`，于是走到第 n 张即位移 `n / slidesPerPage` 个视口。
 * 正常方向是负值（内容往起始缘退），flipped（水平轴 + rtl）时符号翻转。
 * 结果保留四位小数：100/3 这类无限小数不收口会让每帧拼出的字符串都不同。
 */
export function carouselTranslatePercent(
  startIndex: number,
  slidesPerPage: number | undefined,
  flipped = false,
): number {
  const perPage = normalizeSlidesPerPage(slidesPerPage)
  const start = Number.isFinite(startIndex) ? Math.max(0, Math.trunc(startIndex)) : 0
  const percent = Math.round((start / perPage) * 100 * 1e4) / 1e4
  const signed = flipped ? percent : -percent
  // 0 取正号：-0 与 0 在 Object.is 下并不相等
  return signed === 0 ? 0 : signed
}

/**
 * 一次拖拽该翻几页：+1 下一页、-1 上一页、0 原地弹回。
 * 位移没过阈值当成误触，弹回原页；flipped（水平轴 + rtl）时左右含义互换。
 */
export function carouselDragDelta(offset: number, threshold: number, flipped = false): -1 | 0 | 1 {
  if (!Number.isFinite(offset) || offset === 0)
    return 0
  const limit = Number.isFinite(threshold) ? Math.abs(threshold) : 0
  if (Math.abs(offset) < limit)
    return 0
  // 手往起始缘方向推 = 把后面的内容拉过来 = 下一页
  return (flipped ? offset > 0 : offset < 0) ? 1 : -1
}
