// 分页算术这一路的纯函数：不碰 DOM、不认识状态机，单独测。
// 整块拎出来是因为分页的坑几乎全在这里——省略号该不该出、当前页贴边时窗口往哪挪、
// 总条数为 0 时别产出 NaN 与负数区间。混在 connect 里会被属性拼装淹没，也没法单独下断言。

/** 页码序列里的一项：页码本身，或一段被折叠掉的页。 */
export type PaginationPage = number | 'ellipsis'

/** 当前页对应的条目区间，1 基闭区间；无数据时两端都是 0（作者据此显示"暂无数据"）。 */
export interface PaginationEntryRange {
  start: number
  end: number
}

/** 首尾恒显的页数。做成常量而不是可配项：两端各留一页是分页器的通用形态，配出来的变体没人用。 */
const BOUNDARY_COUNT = 1

function range(start: number, end: number): number[] {
  const out: number[] = []
  for (let i = start; i <= end; i++) out.push(i)
  return out
}

/** 负数、小数、NaN 一律收成非负整数：这些值都来自作者的 props，进算术前必须先落地。 */
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

/** 总页数。无数据时是 0 页，而不是 1 页空页——"一页都没有"与"有一页但是空的"对作者不是一回事。 */
export function totalPagesOf(count: number | undefined, pageSize: number | undefined): number {
  const total = normalizeCount(count)
  if (total === 0)
    return 0
  return Math.ceil(total / normalizePageSize(pageSize))
}

/**
 * 把任意来路的页码夹进 [1, totalPages]。
 * 下界恒为 1（没有第 0 页），上界在总页数为 0 时也取 1——
 * 此时序列本来就是空的，页码取 1 只是给"停在哪一页"一个确定答案。
 */
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
  // 末页通常不满：end 取实际条数，否则会显示出并不存在的条目号
  return { start, end: Math.min(current * size, total) }
}

/**
 * 首页与窗口之间的填充。
 * 只隔一页时直接把那一页显示出来：省略号与一个页码同宽，显示页码信息更多，
 * 而且"点开省略号只多出一页"本身就荒唐。
 */
function headOf(start: number): PaginationPage[] {
  if (start <= BOUNDARY_COUNT)
    return []
  if (start <= BOUNDARY_COUNT + 2)
    return range(1, start - 1)
  return [1, 'ellipsis']
}

/** 窗口与末页之间的填充，规则与 headOf 对称。 */
function tailOf(end: number, totalPages: number): PaginationPage[] {
  if (end >= totalPages - BOUNDARY_COUNT + 1)
    return []
  if (end >= totalPages - BOUNDARY_COUNT - 1)
    return range(end + 1, totalPages)
  return ['ellipsis', totalPages]
}

/**
 * 页码序列：`[1, 'ellipsis', 4, 5, 6, 'ellipsis', 20]` 这样一串，作者照着渲染即可。
 *
 * 两条不变量（单测按这两条守）：
 * 1. 总页数多到需要折叠时，序列长度恒为 `siblingCount * 2 + 5`
 *    （首 + 尾 + 当前 + 两侧兄弟 + 两个省略位）。长度不恒定，切页时整条分页器会左右抖动，
 *    用户的鼠标就永远追不上"下一页"那个按钮。
 * 2. 序列里的页码严格递增，且必定包含 1、总页数与当前页。
 *
 * @param page 当前页（会先夹进合法区间，越界值不会产出越界序列）
 * @param totalPages 总页数，0 表示无数据
 * @param siblingCount 当前页两侧各显示几页，默认 1
 */
export function buildPageSequence(page: number, totalPages: number, siblingCount = 1): PaginationPage[] {
  const total = normalizeCount(totalPages)
  if (total === 0)
    return []

  const siblings = Number.isFinite(siblingCount) ? Math.max(0, Math.trunc(siblingCount)) : 0
  const current = clampPage(page, total)
  const slots = siblings * 2 + BOUNDARY_COUNT * 2 + 3

  // 装得下就全列出来：这时一个省略号都不该出现
  if (total <= slots)
    return range(1, total)

  const windowSize = siblings * 2 + 1
  let start: number
  let end: number
  if (current <= siblings + BOUNDARY_COUNT + 1) {
    // 贴着首页：左边没有可折叠的空隙，把省略位让给页码，窗口顺势变宽
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

  return [...headOf(start), ...range(start, end), ...tailOf(end, total)]
}
