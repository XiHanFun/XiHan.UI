/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 calendar range picker 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { CalendarBaseAction, CalendarBaseApi, CalendarBaseContext, CalendarBaseEffect, CalendarBaseEvent, CalendarBaseProps, CalendarBaseRefs } from '../shared/calendar'

export interface CalendarRangePickerValueChangeDetails {
  /**
   * 区间两端，ISO 串，升序。只在两端都落定时通知，长度恒为 2。
   */
  value: string[]
}

/** 一次按在格子上的指针，从按下记到松手。 */
export interface CalendarRangePickerPress {
  /** 按下的那一格。 */
  value: string
  /**
   * 这一下按下时做了什么：anchor 是落了起点（触屏等满延时才落），
   * boundary 是按在已选区间的一端上要拖它，end 是起点已在、松手即收尾。
   */
  role: 'anchor' | 'boundary' | 'end'
  /** 触屏的延时句柄：抬手抢在它前面就是轻点。 */
  timer: number | null
  /** 起点还没落、等同一格松手再落：按的是邻月的日子，按下就翻页，不从这里起拖。 */
  pending?: boolean
  /** 松手那一下已经落定，随后冒上来的 click 不再处理。 */
  handled?: boolean
}

/** 读屏用的文案，默认英文。 */
export interface CalendarRangePickerTranslations {
  /** 聚焦格上的提示：还没落起点时，告诉读屏用户这一下是开始挑区间。 */
  startRangeSelectionPrompt: string
  /** 起点已落下时的提示：这一下是收尾。 */
  finishRangeSelectionPrompt: string
  /** 区间两端格子的可及名字前缀，带上完整的起止日期。 */
  selectedRange: (start: string, end: string) => string
  /** 今天那一格的可及名字：把日期包成「今天，……」。 */
  todayDate: (date: string) => string
}

export interface CalendarRangePickerRefs extends CalendarBaseRefs {
  /**
   * 区间挑选的边界节点：指针在这些节点之外松开，挑到一半的区间就地收口。
   * 单独使用时是日历根节点；内嵌进日期范围选择器时是浮层与输入行。
   * 缺省时退回网格所在的日历根节点，再退回网格自身。
   */
  getBoundaryEls: () => (HTMLElement | null)[]
  /** 正按在格子上的那一下指针；松手与随后的 click 据此分辨这一下该做什么。 */
  press: CalendarRangePickerPress | null
}

export interface CalendarRangePickerSchema extends MachineSchema {
  props: CalendarBaseProps & {
    /**
     * 作者给的不可用判定，收 ISO 串。返回真的日子与界外日子同等对待。
     * 第二个参数是区间挑到一半时的起点（周期首日的 ISO 串），其余时候为 null：
     * 据此能做「落了起点之后只许挑 7 天内」这类判定。
     */
    isDateUnavailable?: (value: string, anchor: string | null) => boolean
    /**
     * 区间允许跨过不可用的日子，默认关。
     * 关着时落了起点之后，可挑的范围被夹在起点两侧最近的不可用日之间——
     * 一段区间里不会夹着挑不了的日子；开着时不夹，只是那些日子不铺轨道。
     */
    allowsNonContiguousRanges?: boolean
    translations?: Partial<CalendarRangePickerTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: CalendarRangePickerValueChangeDetails) => void
  }
  context: CalendarBaseContext & {
    /**
     * 区间挑选的起点：已落下起点、还没落终点时非空。它不写进 value——
     * 落终点那一下才把两端一并写出，撤掉它时原来的区间原样还在。
     */
    rangeAnchor: string | null
    /** 指针悬停的那天，只用来预览；不受控、不对外通知。 */
    hoveredValue: string | null
    /** 指针正按在格子上拖：按下即落起点，松开在另一格上即落终点。 */
    dragging: boolean
  }
  computed: Record<string, never>
  refs: CalendarRangePickerRefs
  /**
   * 选中值与聚焦日不编码进状态。anchored 是区间落了起点、还没落终点那一段：
   * 它挂着文档级的松手监听，其余逻辑全在 context 与 actions。
   */
  state: 'idle' | 'anchored'
  event:
    | CalendarBaseEvent
    /** 直接改写区间起点：null 即撤掉（Escape）；拖动已选区间的一端时换成另一端。 */
    | { type: 'RANGE.ANCHOR', value: string | null }
    /** 把挑到一半的区间就地收口：终点取悬停日，没有悬停就取聚焦日。 */
    | { type: 'RANGE.COMMIT' }
    | { type: 'DRAG.SET', dragging: boolean }
    | { type: 'HOVER.SET', value: string }
    | { type: 'HOVER.CLEAR' }
  tag: never
  guard: 'startsRange' | 'anchorsRange'
  action:
    | CalendarBaseAction
    | 'setValue'
    | 'selectCell'
    | 'setRangeAnchor'
    | 'commitRange'
    | 'setDragging'
    | 'syncGranularity'
    | 'dropRangeAnchor'
    | 'setHoveredValue'
    | 'clearHoveredValue'
  effect: CalendarBaseEffect | 'trackRangeRelease'
}

export interface CalendarRangePickerApi<T extends PropTypes = PropTypes> extends CalendarBaseApi<T> {
  /** 区间挑到一半时的起点（周期首日的 ISO 串）；其余时候为 null。 */
  rangeAnchor: string | null
  /** 指针正按在格子上拖着挑区间。 */
  dragging: boolean
  /** 直接改写区间起点；传 null 撤掉挑到一半的区间。 */
  setRangeAnchor: (next: string | null) => void
}
