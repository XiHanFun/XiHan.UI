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

/** 一次按在格子上的指针，从按下记录到松开。 */
export interface CalendarRangePickerPress {
  /** 按下的格子。 */
  value: string
  /**
   * 本次按下的动作：anchor 是落下起点（触屏需满足延时才落下），
   * boundary 是按在已选区间的一端上准备拖动，end 是起点已存在、松开即收尾。
   */
  role: 'anchor' | 'boundary' | 'end'
  /** 触屏的延时句柄：抬起先于它即为轻点。 */
  timer: number | null
  /** 起点尚未落下、等待同一格松开再落下：按下的是邻月的日期，按下即翻页，不从这里开始拖动。 */
  pending?: boolean
  /** 松开时已落定，随后冒泡的 click 不再处理。 */
  handled?: boolean
}

/** 读屏文案，默认英文。 */
export interface CalendarRangePickerTranslations {
  /** 聚焦格上的提示：尚未落下起点时，告知读屏用户本次操作是开始选择区间。 */
  startRangeSelectionPrompt: string
  /** 起点已落下时的提示：本次操作是收尾。 */
  finishRangeSelectionPrompt: string
  /** 区间两端格子的可及名前缀，附带完整的起止日期。 */
  selectedRange: (start: string, end: string) => string
  /** 今天所在格的可及名：把日期包装为「今天，……」。 */
  todayDate: (date: string) => string
}

export interface CalendarRangePickerRefs extends CalendarBaseRefs {
  /**
   * 区间选择的边界节点：指针在这些节点之外松开时，选到一半的区间就地收口。
   * 单独使用时是日历根节点；内嵌进日期范围选择器时是浮层与输入行。
   * 未提供时回退为网格所在的日历根节点，再回退为网格自身。
   */
  getBoundaryEls: () => (HTMLElement | null)[]
  /** 正按在格子上的指针；松开与随后的 click 据此判断应执行的动作。 */
  press: CalendarRangePickerPress | null
}

export interface CalendarRangePickerSchema extends MachineSchema {
  props: CalendarBaseProps & {
    /**
     * 作者提供的不可用判定，接收 ISO 串。返回真的日期与界外日期同等处理。
     * 第二个参数是区间选到一半时的起点（周期首日的 ISO 串），其余时候为 null：
     * 据此可以实现落下起点之后只允许选择 7 天内这类判定。
     */
    isDateUnavailable?: (value: string, anchor: string | null) => boolean
    /**
     * 区间允许跨过不可用的日期，默认关闭。
     * 关闭时落下起点之后，可选范围被夹在起点两侧最近的不可用日之间：
     * 一段区间内不会夹有不可选的日期；开启时不夹，只是这些日期不铺轨道。
     */
    allowsNonContiguousRanges?: boolean
    translations?: Partial<CalendarRangePickerTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValueChange?: (details: CalendarRangePickerValueChangeDetails) => void
  }
  context: CalendarBaseContext & {
    /**
     * 区间选择的起点：已落下起点、尚未落下终点时非空。它不写入 value：
     * 落下终点时才把两端一并写出，撤销它时原来的区间原样保留。
     */
    rangeAnchor: string | null
    /** 指针悬停的日期，只用于预览；不受控、不对外通知。 */
    hoveredValue: string | null
    /** 指针正按在格子上拖动：按下即落下起点，在另一格松开即落下终点。 */
    dragging: boolean
  }
  computed: Record<string, never>
  refs: CalendarRangePickerRefs
  /**
   * 选中值与聚焦日不编码进状态。anchored 是区间已落下起点、尚未落下终点的阶段：
   * 它挂载文档级的松开监听，其余逻辑全在 context 与 actions。
   */
  state: 'idle' | 'anchored'
  event:
    | CalendarBaseEvent
    /** 直接改写区间起点：null 即撤销（Escape）；拖动已选区间的一端时换成另一端。 */
    | { type: 'RANGE.ANCHOR', value: string | null }
    /** 把选到一半的区间就地收口：终点取悬停日，没有悬停时取聚焦日。 */
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
  /** 区间选到一半时的起点（周期首日的 ISO 串）；其余时候为 null。 */
  rangeAnchor: string | null
  /** 指针正按在格子上拖动选择区间。 */
  dragging: boolean
  /** 直接改写区间起点；传 null 撤销选到一半的区间。 */
  setRangeAnchor: (next: string | null) => void
}
