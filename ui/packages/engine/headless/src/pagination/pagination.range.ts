// 分页算术的纯函数：页码夹取、条目区间、页码序列折叠。不碰 DOM、不认识状态机。

/** 页码序列里的一项：页码本身，或一段被折叠掉的页。 */
export type PaginationPage = number | 'ellipsis'

/**
 * 页码序列里的一项，带上被折叠掉的是哪几页。
 *
 * `pages` 序列只说「这里折了一段」，说不出折的是哪几页；省略号要能摊开就得知道。
 * 至多两个省略位：首页与窗口之间一个（side='start'）、窗口与末页之间一个（side='end'）。
 */
export type PaginationPageItem
  = | { type: 'page', value: number }
    | { type: 'ellipsis', side: PaginationEllipsisSide, pages: number[] }

/** 省略位在序列里的哪一侧。至多两个，用它区分。 */
export type PaginationEllipsisSide = 'start' | 'end'

/** 当前页对应的条目区间，1 基闭区间；无数据时两端都是 0（作者据此显示"暂无数据"）。 */
export interface PaginationEntryRange {
  start: number
  end: number
}

/** 首尾恒显的页数。 */
const BOUNDARY_COUNT = 1

function range(start: number, end: number): number[] {
  const out: number[] = []
  for (let i = start; i <= end; i++) out.push(i)
  return out
}

/** 负数、小数、NaN 一律收成非负整数。 */
export function normalizeCount(value: number | undefined): number {
  if (value == null || !Number.isFinite(value))
    return 0
  return Math.max(0, Math.trunc(value))
}

/** 每页条数至少为 1：0 或负数会让 ceil 除法给出 Infinity / 负页数。 */
export function normalizePageSize(value: number | undefined): number {
  if (value == null || !Number.isFinite(value))
    return 1
  return Math.max(1, Math.trunc(value))
}

/**
 * 换每页条数时的新页码：让改档前第一条仍留在视野里。
 *
 * 直接夹取会把人甩到别处——10 条一页看到第 5 页（第 41 条起），换成 50 条一页后
 * 夹取给出第 2 页（第 51 条起），刚在看的那条反而不见了。按第一条换算给出第 1 页，
 * 第 41 条仍在页内。结果天然落在 [1, 总页数] 内，不必再夹一次。
 */
export function pageForResize(page: number, oldSize: number, newSize: number): number {
  const first = (Math.max(1, Math.trunc(page)) - 1) * normalizePageSize(oldSize)
  return Math.floor(first / normalizePageSize(newSize)) + 1
}

/** 总页数。无数据时是 0 页，而不是 1 页空页。 */
export function totalPagesOf(count: number | undefined, pageSize: number | undefined): number {
  const total = normalizeCount(count)
  if (total === 0)
    return 0
  return Math.ceil(total / normalizePageSize(pageSize))
}

/** 把任意来路的页码夹进 [1, totalPages]；下界恒为 1，总页数为 0 时上界也取 1。 */
export function clampPage(page: number | undefined, totalPages: number): number {
  const max = Math.max(1, Math.trunc(totalPages))
  if (page == null || !Number.isFinite(page))
    return 1
  return Math.min(Math.max(Math.trunc(page), 1), max)
}

/** 当前页对应的条目区间（"第 x-y 条，共 z 条"里的 x 与 y）。 */
export function pageRangeOf(
  page: number | undefined,
  pageSize: number | undefined,
  count: number | undefined,
): PaginationEntryRange {
  const total = normalizeCount(count)
  if (total === 0)
    return { start: 0, end: 0 }
  const size = normalizePageSize(pageSize)
  const current = clampPage(page, totalPagesOf(total, size))
  const start = (current - 1) * size + 1
  // 末页通常不满，end 取实际条数
  return { start, end: Math.min(current * size, total) }
}

function pageItems(values: number[]): PaginationPageItem[] {
  return values.map(value => ({ type: 'page', value }))
}

/** 首页与窗口之间的填充：只隔一两页时直接列出页码，否则折成一个省略位。 */
function headOf(start: number): PaginationPageItem[] {
  if (start <= BOUNDARY_COUNT)
    return []
  if (start <= BOUNDARY_COUNT + 2)
    return pageItems(range(1, start - 1))
  // 折掉的是首页与窗口之间那段
  return [
    { type: 'page', value: 1 },
    { type: 'ellipsis', side: 'start', pages: range(BOUNDARY_COUNT + 1, start - 1) },
  ]
}

/** 窗口与末页之间的填充，规则与 headOf 对称。 */
function tailOf(end: number, totalPages: number): PaginationPageItem[] {
  if (end >= totalPages - BOUNDARY_COUNT + 1)
    return []
  if (end >= totalPages - BOUNDARY_COUNT - 1)
    return pageItems(range(end + 1, totalPages))
  return [
    { type: 'ellipsis', side: 'end', pages: range(end + 1, totalPages - BOUNDARY_COUNT) },
    { type: 'page', value: totalPages },
  ]
}

/**
 * 页码条目序列：页码与省略位交替，省略位自带被折叠的那几页。
 *
 * 两条不变量：
 * 1. 总页数多到需要折叠时，序列长度恒为 `siblingCount * 2 + 5`
 *    （首 + 尾 + 当前 + 两侧兄弟 + 两个省略位）。
 * 2. 序列里的页码严格递增，且必定包含 1、总页数与当前页。
 *
 * @param page 当前页（会先夹进合法区间，越界值不会产出越界序列）
 * @param totalPages 总页数，0 表示无数据
 * @param siblingCount 当前页两侧各显示几页，默认 1
 */
export function buildPageItems(page: number, totalPages: number, siblingCount = 1): PaginationPageItem[] {
  const total = normalizeCount(totalPages)
  if (total === 0)
    return []

  const siblings = Number.isFinite(siblingCount) ? Math.max(0, Math.trunc(siblingCount)) : 0
  const current = clampPage(page, total)
  const slots = siblings * 2 + BOUNDARY_COUNT * 2 + 3

  // 装得下就全列出来，不出省略号
  if (total <= slots)
    return pageItems(range(1, total))

  const windowSize = siblings * 2 + 1
  let start: number
  let end: number
  if (current <= siblings + BOUNDARY_COUNT + 1) {
    // 贴着首页：左边没有可折叠的空隙，省略位让给页码，窗口变宽
    start = 1
    end = windowSize + 2
  }
  else if (current >= total - siblings - BOUNDARY_COUNT) {
    // 贴着末页，与上一支对称
    start = total - windowSize - 1
    end = total
  }
  else {
    start = current - siblings
    end = current + siblings
  }

  return [...headOf(start), ...pageItems(range(start, end)), ...tailOf(end, total)]
}

/**
 * 页码序列：`[1, 'ellipsis', 4, 5, 6, 'ellipsis', 20]` 这样一串。
 *
 * 由 buildPageItems 派生，两者的窗口数学只有一份——各算一遍必然漂移。
 */
export function buildPageSequence(page: number, totalPages: number, siblingCount = 1): PaginationPage[] {
  return buildPageItems(page, totalPages, siblingCount)
    .map(item => (item.type === 'page' ? item.value : 'ellipsis'))
}
