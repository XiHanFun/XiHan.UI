import type { Direction, PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'
import type { PaginationEntryRange, PaginationPage } from './pagination.range'

export interface PaginationPageChangeDetails {
  /** 变化后的页码，恒在 [1, totalPages] 内。 */
  page: number
  /** 一并带上每页条数：作者拿到这一条就够发请求了，不用再去读自己的 props。 */
  pageSize: number
}

/**
 * 条目自报家门：页码由作者在部件上声明，connect 据此产出属性。
 * connect 因此是 (context, 本条目声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface PaginationItemProps {
  page: number
}

/** 读屏用的文案。默认英文，与 dialog / popover 的 translations 同一套写法。 */
export interface PaginationTranslations {
  /** 根节点的 aria-label：一页上可能有多个 nav 地标，不给名字读屏就分不出这是哪一个。 */
  root: string
  prevTrigger: string
  nextTrigger: string
  /** 页码按钮的 aria-label；只有数字的按钮读起来像一串孤立的数。 */
  item: (page: number) => string
}

export interface PaginationSchema extends MachineSchema {
  props: {
    /** 总条数（不是总页数）。总页数由它与 pageSize 算出。 */
    count?: number
    /** 每页条数，默认 10；小于 1 的值一律按 1 处理。 */
    pageSize?: number
    /** 当前页。给定即受控：内部不再自改，只发 onPageChange。 */
    page?: number
    /** 非受控初始页，默认 1。 */
    defaultPage?: number
    /** 当前页两侧各显示几页，默认 1。 */
    siblingCount?: number
    /**
     * 文字方向。只作用于排版：RTL 下页码要从右往左排，靠根节点上的 dir 交给浏览器排。
     * 上一页/下一页的语义不随之翻转——"上一页"永远是 page - 1。
     */
    dir?: Direction
    translations?: Partial<PaginationTranslations>
    /** 页码变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onPageChange?: (details: PaginationPageChangeDetails) => void
  }
  context: {
    /** 当前页。受控（page 给定）时 cell 直读 prop，写只发 onPageChange 不改内部值。 */
    page: number
  }
  computed: Record<string, never>
  refs: Record<string, never>
  /** 分页器没有阶段可分：页码住在 context 的 cell 里，机器只是它的写入口。 */
  state: 'idle'
  event:
    | { type: 'PAGE.SET', page: number }
    | { type: 'PAGE.PREV' }
    | { type: 'PAGE.NEXT' }
  tag: never
  guard: never
  action: 'setPage' | 'goPrev' | 'goNext'
  effect: never
}

export interface PaginationApi<T extends PropTypes = PropTypes> {
  /** 当前页，恒在 [1, max(totalPages, 1)] 内：count 变小后停在越界页也读得到一个可用的值。 */
  page: number
  pageSize: number
  count: number
  totalPages: number
  /** 页码序列，作者照着渲染 item 与 ellipsis。 */
  pages: PaginationPage[]
  /** 当前页对应的条目区间，1 基闭区间；无数据时是 { start: 0, end: 0 }。 */
  pageRange: PaginationEntryRange
  /** 上一页页码；已在首页（或无数据）时为 null。 */
  previousPage: number | null
  nextPage: number | null
  /** 页码会被夹进合法区间，越界入参不会写出越界的页。 */
  setPage: (page: number) => void
  goToPrevPage: () => void
  goToNextPage: () => void
  /** 客户端分页的顺手工具：按当前页从整份数据里切出这一页。 */
  slice: <V>(data: readonly V[]) => V[]
  getRootProps: () => T['element']
  getPrevTriggerProps: () => T['button']
  getNextTriggerProps: () => T['button']
  getItemProps: (props: PaginationItemProps) => T['button']
  getEllipsisProps: () => T['element']
}
