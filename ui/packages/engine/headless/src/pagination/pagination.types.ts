import type { Cleanup, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { PaginationEllipsisSide, PaginationEntryRange, PaginationPage, PaginationPageItem } from './pagination.range'

export interface PaginationPageSizeChangeDetails {
  /** 变化后的每页条数。 */
  pageSize: number
  /** 换算后的页码：改档前第一条仍留在页内。 */
  page: number
}

export interface PaginationPageChangeDetails {
  /** 变化后的页码，恒在 [1, totalPages] 内。 */
  page: number
  /** 一并带上每页条数。 */
  pageSize: number
}

/** 条目属性：页码由作者在部件上声明，connect 据此产出属性，不反查 DOM。 */
export interface PaginationItemProps {
  page: number
}

/** 省略位属性：哪一侧的省略位，由作者在部件上声明。至多两个，用它区分。 */
export interface PaginationEllipsisTriggerProps {
  side: PaginationEllipsisSide
}

/** 读屏用的文案。默认英文，与 dialog / popover 的 translations 同一套写法。 */
export interface PaginationTranslations {
  /** 根节点的 aria-label，用于区分同页的多个 nav 地标。 */
  root: string
  prevTrigger: string
  nextTrigger: string
  /** 页码按钮的 aria-label。 */
  item: (page: number) => string
  /** 省略位的 aria-label：它是个可展开的按钮，得说清展开出来是什么。 */
  ellipsis: (count: number) => string
  /** 每页条数控制器的 aria-label。 */
  pageSizeSelect: string
  /** 每一档的显示文字，如「10 条/页」。 */
  pageSizeOption: (size: number) => string
}

export interface PaginationSchema extends MachineSchema {
  props: {
    /** 总条数（不是总页数）。总页数由它与 pageSize 算出。 */
    count?: number
    /** 每页条数，默认 10；小于 1 的值一律按 1 处理。给定即受控，语义同 page。 */
    pageSize?: number
    /** 非受控初始每页条数，默认 10。 */
    defaultPageSize?: number
    /** 可选的每页条数档位，默认 [10, 20, 50, 100]。只做取值来源，不决定长相。 */
    pageSizeOptions?: number[]
    /** 当前页。给定即受控：内部不再自改，只发 onPageChange。 */
    page?: number
    /** 非受控初始页，默认 1。 */
    defaultPage?: number
    /** 当前页两侧各显示几页，默认 1。 */
    siblingCount?: number
    /** 文字方向，只作用于排版；上一页/下一页的语义不随之翻转，"上一页"永远是 page - 1。 */
    dir?: Direction
    translations?: Partial<PaginationTranslations>
    /** 省略位展开后的落点，默认 bottom-start（列表类浮层）。 */
    placement?: Placement
    /** 浮层与省略位之间的间距（px），默认 8。 */
    offset?: number
    /** 指针停在省略位多久才展开（ms），默认 200。 */
    openDelay?: number
    /** 指针离开后多久收起（ms），默认 300：留出斜着划进浮层的时间。 */
    closeDelay?: number
    /** 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** 页码变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onPageChange?: (details: PaginationPageChangeDetails) => void
    /** 每页条数变化意图回调，语义同上；一并给出换算后的页码。 */
    onPageSizeChange?: (details: PaginationPageSizeChangeDetails) => void
  }
  context: {
    /** 当前页。受控（page 给定）时 cell 直读 prop，写只发 onPageChange 不改内部值。 */
    page: number
    /** 每页条数。受控（pageSize 给定）时同上。 */
    pageSize: number
    /** 此刻摊开的是哪一侧的省略位；没摊开为 null。 */
    openEllipsis: PaginationEllipsisSide | null
    /** 定位结果，由 trackPosition 回填。 */
    position: PositionResult | null
  }
  computed: Record<string, never>
  refs: {
    config: RuntimeConfig | null
    registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
    position: PositionEnginePort | null
    getAnchorEl: () => HTMLElement | null
    getFloatingEl: () => HTMLElement | null
    getContentEl: () => HTMLElement | null
  }
  /**
   * 翻页本身没有状态，这几个态说的是省略位的浮层：
   * 停够时长才展开（opening），离开后留一段时间再收（visible.closing）。
   */
  state: 'closed' | 'opening' | 'visible' | 'visible.open' | 'visible.closing'
  event:
    | { type: 'PAGE.SET', page: number }
    | { type: 'PAGE_SIZE.SET', pageSize: number }
    | { type: 'PAGE.PREV' }
    | { type: 'PAGE.NEXT' }
    /** 指针进入某个省略位或已摊开的浮层。 */
    | { type: 'ELLIPSIS.ENTER', side?: PaginationEllipsisSide }
    | { type: 'ELLIPSIS.LEAVE' }
    /** 点省略位：已摊开的同一侧收起，否则立即摊开，不走延时。 */
    | { type: 'ELLIPSIS.TOGGLE', side: PaginationEllipsisSide }
    | { type: 'ELLIPSIS.CLOSE' }
    | { type: 'after.openDelay' }
    | { type: 'after.closeDelay' }
  tag: never
  action: 'setPage' | 'setPageSize' | 'goPrev' | 'goNext' | 'openEllipsis' | 'clearEllipsis'
  guard: 'isSameEllipsis'
  effect: 'waitForOpenDelay' | 'waitForCloseDelay' | 'trackPosition' | 'trackLayer'
}

export interface PaginationApi<T extends PropTypes = PropTypes> {
  /** 当前页，恒在 [1, max(totalPages, 1)] 内。 */
  page: number
  pageSize: number
  /** 可选的每页条数档位，缺省 [10, 20, 50, 100]；已按升序去重并夹到至少 1。 */
  pageSizeOptions: number[]
  count: number
  totalPages: number
  /** 页码序列，作者照着渲染 item 与 ellipsis-trigger。 */
  pages: PaginationPage[]
  /** 同一串序列，但省略位带着被折叠的那几页——摊开省略号要靠它。 */
  pageItems: PaginationPageItem[]
  /** 此刻摊开的是哪一侧的省略位；没摊开为 null。 */
  openEllipsis: PaginationEllipsisSide | null
  /** 当前页对应的条目区间，1 基闭区间；无数据时是 { start: 0, end: 0 }。 */
  pageRange: PaginationEntryRange
  /** 上一页页码；已在首页（或无数据）时为 null。 */
  previousPage: number | null
  nextPage: number | null
  /** 页码会被夹进合法区间，越界入参不会写出越界的页。 */
  setPage: (page: number) => void
  goToPrevPage: () => void
  goToNextPage: () => void
  /** 换每页条数：页码跟着换算，让改档前第一条仍留在页内。 */
  setPageSize: (pageSize: number) => void
  /** 按当前页从整份数据里切出这一页。 */
  slice: <V>(data: readonly V[]) => V[]
  getRootProps: () => T['element']
  getPrevTriggerProps: () => T['button']
  getNextTriggerProps: () => T['button']
  getItemProps: (props: PaginationItemProps) => T['button']
  /** 省略位：可展开的按钮，摊开后列出被折叠的页码。 */
  getEllipsisTriggerProps: (props: PaginationEllipsisTriggerProps) => T['button']
  /** 每页条数控制器：绑到一个原生 select 上，档位由作者按 pageSizeOptions 渲染成 option。 */
  getPageSizeSelectProps: () => T['select']
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  /** 收起摊开的省略位。 */
  closeEllipsis: () => void
}
