/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 pagination 类型契约。

import type { Cleanup, Direction, Layer, MachineSchema, Placement, PositionEnginePort, PositionResult, PropTypes, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { SelectApi, SelectSchema } from '../select'
import type { PaginationEllipsisSide, PaginationEntryRange, PaginationPage, PaginationPageItem } from './pagination.range'

export interface PaginationPageSizeChangeDetails {
  /** 变化后的每页条数。 */
  pageSize: number
  /** 换算后的页码：改档前的第一条仍留在页内。 */
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

/**
 * 按压通道里「正被按住的那一个」的键：两端翻页钮、页码（按页号）与省略位（按侧）各占一个身份，
 * 摊开面板里的页码与行里的页码同用 item:页号（同一页不会同时出现在两处）。
 */
export type PaginationPressedKey = 'prev' | 'next' | `item:${number}` | `ellipsis:${PaginationEllipsisSide}`

/** 读屏文案。默认英文，与 dialog / popover 的 translations 写法一致。 */
export interface PaginationTranslations {
  /** 根节点的 aria-label，用于区分同页的多个 nav 地标。 */
  root: string
  prevTrigger: string
  nextTrigger: string
  /** 页码按钮的 aria-label。 */
  item: (page: number) => string
  /** 省略位的 aria-label：它是可展开的按钮，需要说明展开的内容。 */
  ellipsis: (count: number) => string
  /** 每页条数控制器的 aria-label。 */
  pageSizeSelect: string
  /** 每一档的显示文字，如「10 条/页」。 */
  pageSizeOption: (size: number) => string
  /** 信息区文本，如「第 1-10 条，共 42 条」；无数据时 start 与 end 都是 0。 */
  summary: (start: number, end: number, count: number) => string
  /** 跳页输入框的 aria-label。 */
  jumper: string
}

export interface PaginationSchema extends MachineSchema {
  props: {
    /** 总条数（不是总页数）。总页数由它与 pageSize 计算。 */
    count?: number
    /** 每页条数，默认 10；小于 1 的值一律按 1 处理。提供即受控，语义同 page。 */
    pageSize?: number
    /** 非受控初始每页条数，默认 10。 */
    defaultPageSize?: number
    /** 可选的每页条数档位，默认 [10, 20, 50, 100]。只做取值来源，不决定长相。 */
    pageSizeOptions?: number[]
    /** 当前页。提供即受控：内部不再自行修改，只发 onPageChange。 */
    page?: number
    /** 非受控初始页，默认 1。 */
    defaultPage?: number
    /** 当前页两侧各显示的页数，默认 1。 */
    siblingCount?: number
    /** 文字方向，只作用于排版；上一页 / 下一页的语义不随之翻转，上一页永远是 page - 1。 */
    dir?: Direction
    translations?: Partial<PaginationTranslations>
    /** 省略位展开后的落点，默认 bottom-start（列表类浮层）。 */
    placement?: Placement
    /** 浮层与省略位之间的间距（px），默认 8。 */
    offset?: number
    /** 指针停在省略位多久后才展开（ms），默认 200；只收有限非负数。 */
    openDelay?: number
    /** 指针离开后多久收起（ms），默认 300：留出斜向划入浮层的时间；只收有限非负数。 */
    closeDelay?: number
    /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    /** 页码变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onPageChange?: (details: PaginationPageChangeDetails) => void
    /** 每页条数变化意图回调，语义同上；一并给出换算后的页码。 */
    onPageSizeChange?: (details: PaginationPageSizeChangeDetails) => void
  }
  context: {
    /** 当前页。受控（page 提供）时 cell 直读 prop，写入只发 onPageChange 不修改内部值。 */
    page: number
    /** 每页条数。受控（pageSize 给定）时同上。 */
    pageSize: number
    /** 当前展开的是哪一侧的省略位；未展开时为 null。 */
    openEllipsis: PaginationEllipsisSide | null
    /** 定位结果，由 trackPosition 回填。 */
    position: PositionResult | null
    /**
     * 按压通道：Space / Enter 或触屏手指按下到松开之间正被按住的那一个，该部件投影 data-pressed；没有按住时为 null。
     * 面板收起时一并松开——摊开面板里的页码被按住期间面板关掉，不会再来 keyup。
     */
    pressed: PaginationPressedKey | null
  }
  computed: Record<string, never>
  refs: {
    config: RuntimeConfig | null
    registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
    /** 省略位共享面板的视觉 Presence；行为资源与它一同完成退场。 */
    presence: PresenceHandle | null
    position: PositionEnginePort | null
    getAnchorEl: () => HTMLElement | null
    getFloatingEl: () => HTMLElement | null
    getContentEl: () => HTMLElement | null
  }
  /**
   * 翻页本身没有状态，这几个态描述的是省略位的浮层：
   * 停留够时长才展开（opening），离开后保留一段时间再收起（visible.closing）。
   */
  state: 'closed' | 'opening' | 'visible' | 'visible.open' | 'visible.closing'
  event:
    | { type: 'PAGE.SET', page: number }
    | { type: 'PAGE_SIZE.SET', pageSize: number }
    | { type: 'PAGE.PREV' }
    | { type: 'PAGE.NEXT' }
    /** 指针进入某个省略位或已展开的浮层。 */
    | { type: 'ELLIPSIS.ENTER', side?: PaginationEllipsisSide }
    | { type: 'ELLIPSIS.LEAVE' }
    /** 点击省略位：已展开的同一侧收起，否则立即展开，不经延时。 */
    | { type: 'ELLIPSIS.TOGGLE', side: PaginationEllipsisSide }
    | { type: 'ELLIPSIS.CLOSE' }
    | { type: 'after.openDelay' }
    | { type: 'after.closeDelay' }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开，key 说的是哪一个；
    // disabled 是该部件自身的禁用事实（两端翻页钮到边界即原生 disabled），由 connect 判定后随事件带入
    | { type: 'PRESS.START', key: PaginationPressedKey, disabled?: boolean }
    | { type: 'PRESS.END', key: PaginationPressedKey }
  tag: never
  action:
    | 'setPage'
    | 'setPageSize'
    | 'goPrev'
    | 'goNext'
    | 'openEllipsis'
    | 'clearEllipsis'
    | 'startPress'
    | 'endPress'
    | 'releasePress'
  guard: 'isSameEllipsis' | 'canPress'
  effect: 'waitForOpenDelay' | 'waitForCloseDelay' | 'trackPosition' | 'trackLayer'
}

/** 分页运行两台状态机：翻页一台，每页条数下拉一台。 */
export interface PaginationServices {
  root: Service<PaginationSchema>
  /** 每页条数控制器；档位与当前档受控于 root，换档经回调送回去。 */
  pageSizeSelect: Service<SelectSchema>
}

export interface PaginationApi<T extends PropTypes = PropTypes> {
  /** 当前页，恒在 [1, max(totalPages, 1)] 内。 */
  page: number
  pageSize: number
  /** 可选的每页条数档位，默认 [10, 20, 50, 100]；已按升序去重并夹到至少 1。 */
  pageSizeOptions: number[]
  count: number
  totalPages: number
  /** 页码序列，作者按它渲染 item 与 ellipsis-trigger。 */
  pages: PaginationPage[]
  /** 同一序列，但省略位附带被折叠的页码：展开省略号需要使用它。 */
  pageItems: PaginationPageItem[]
  /** 当前展开的是哪一侧的省略位；未展开时为 null。 */
  openEllipsis: PaginationEllipsisSide | null
  /** 当前页对应的条目区间，1 基闭区间；无数据时是 { start: 0, end: 0 }。 */
  pageRange: PaginationEntryRange
  /** 信息区文本，由 translations.summary 与 pageRange / count 算出。 */
  summaryText: string
  /** 上一页页码；已在首页（或无数据）时为 null。 */
  previousPage: number | null
  nextPage: number | null
  /** 页码会被夹进合法区间，越界入参不会写出越界的页。 */
  setPage: (page: number) => void
  goToPrevPage: () => void
  goToNextPage: () => void
  /** 更换每页条数：页码随之换算，使改档前的第一条仍留在页内。 */
  setPageSize: (pageSize: number) => void
  /** 按当前页从整份数据中切出该页。 */
  slice: <V>(data: readonly V[]) => V[]
  getRootProps: () => T['element']
  /** 信息区容器；文本由作者放置，默认使用 api.summaryText。 */
  getSummaryProps: () => T['element']
  /** 跳页输入框：输入页码按回车即跳转，越界值由 setPage 夹回合法区间。 */
  getJumperProps: () => T['input']
  getPrevTriggerProps: () => T['button']
  getNextTriggerProps: () => T['button']
  getItemProps: (props: PaginationItemProps) => T['button']
  /** 省略位：可展开的按钮，展开后列出被折叠的页码。 */
  getEllipsisTriggerProps: (props: PaginationEllipsisTriggerProps) => T['button']
  /** 每页条数控制器的挂载点：只负责排布的一格，控件本体是内嵌下拉的角色节点。 */
  getPageSizeSelectProps: () => T['element']
  /**
   * 每页条数的下拉，整份 select 的 api。档位由 collection 给出（文字取
   * translations.pageSizeOption），选中值即当前每页条数；作者按它渲染 select 的角色节点。
   */
  pageSizeSelect: SelectApi<T>
  getPositionerProps: () => T['element']
  getContentProps: () => T['element']
  /** 收起展开的省略位。 */
  closeEllipsis: () => void
}
