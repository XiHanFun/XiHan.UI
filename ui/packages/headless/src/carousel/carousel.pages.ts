// 轮播的分页算术这一路的纯函数：不碰 DOM、不认识状态机，单独测。
// 整块拎出来是因为轮播的坑几乎全在这里——slidesPerPage 与 slidesPerMove 组合出的总页数、
// 末页不足一屏时该停在哪、回绕时首末怎么接上。混在 connect 里会被属性拼装淹没，
// 也没法单独下断言：一屏能放几张、一次走几张，这些都是算术问题，与 aria 属性无关。
//
// 页码一律 0 基：条目下标本来就是 0 基，两套基数混在一起迟早会差一格。

/** 一页覆盖的条目下标区间，0 基闭区间；空集用 end < start 表达（没有条目可指）。 */
export interface CarouselSlideRange {
  start: number
  end: number
}

/** 条目总数。负数、小数、NaN 一律收成非负整数：这些值都来自作者的 props，进算术前必须先落地。 */
export function normalizeSlideCount(value: number | undefined): number {
  if (value == null || !Number.isFinite(value))
    return 0
  return Math.max(0, Math.trunc(value))
}

/** 一屏放几张，至少 1：0 会让除法给出 Infinity，负数会给出反向的位移。 */
export function normalizeSlidesPerPage(value: number | undefined): number {
  if (value == null || !Number.isFinite(value))
    return 1
  return Math.max(1, Math.trunc(value))
}

/**
 * 一次走几张。缺省即跟随 slidesPerPage（整屏翻页，最常见的形态）；
 * 给了就按给的走——一屏三张、一次走一张是"逐张滚动"的橱窗式轮播。
 */
export function normalizeSlidesPerMove(value: number | undefined, slidesPerPage: number): number {
  if (value == null || !Number.isFinite(value))
    return normalizeSlidesPerPage(slidesPerPage)
  return Math.max(1, Math.trunc(value))
}

/**
 * 总页数。
 *
 * 一张都没有是 0 页（不是 1 页空页）——"一页都没有"与"有一页但是空的"对作者不是一回事，
 * 前者该把整条轮播连同两端按钮一起判成不可用。
 *
 * 装得下一屏时恒为 1 页：4 张里一屏放 4 张，没有第二屏可翻。
 * 再多出来的部分按 slidesPerMove 切：末页允许不足一整步（余数那一小截也得有页可去），
 * 所以是向上取整再加上首页那一页。
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
 *
 * loop=false 时夹取；loop=true 时取模回绕，负页码也绕得回来
 * （末页按"下一页"要落到第 0 页，首页按"上一页"要落到末页，两头都靠这一个函数收口）。
 * 总页数为 0 时恒为 0：一页都没有，停在哪儿只需要一个确定答案。
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
 *
 * 关键在末页：`page * slidesPerMove` 会越过 `slideCount - slidesPerPage`，
 * 照着它位移，视口末尾会空出一块（4 张、一屏 2 张、一次走 3 张时，第 1 页会从第 3 张起，
 * 右半屏是空的）。这里把起点夹回最后一个"能填满一屏"的位置——
 * 代价是末页与上一页有重叠，但重叠远比空屏可接受。
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

/**
 * 每一页的落点下标序列：`[0, 2, 3]` 这样一串。
 * 作者拿它渲染指示点（一页一个），调试位移时也是最直观的一份读数。
 */
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
 * 正常方向是负值（内容往起始缘退），flipped（水平轴 + rtl）时符号翻转——
 * CSS 的 translate 没有逻辑属性写法，方向只能自己算。
 *
 * 结果保留四位小数：一屏三张时 100/3 是无限小数，不收口的话两次渲染拼出来的字符串
 * 会因浮点尾数不同而每帧都在变。
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
  // 0 取正号：-0 与 0 在 Object.is 下并不相等，让它漏出去会毒到每一处等值比较
  return signed === 0 ? 0 : signed
}

/**
 * 一次拖拽该翻几页：+1 下一页、-1 上一页、0 原地弹回。
 *
 * 位移没过阈值就当成误触（点一下、或者只是想选中里面的文字），必须弹回原页——
 * 差一个像素就翻页的轮播用起来像是自己在乱动。
 * flipped（水平轴 + rtl）时左右含义互换：那边的"下一张"在左手边。
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
