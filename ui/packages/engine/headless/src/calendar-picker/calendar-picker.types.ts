/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 calendar picker 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { CalendarBaseAction, CalendarBaseApi, CalendarBaseContext, CalendarBaseEffect, CalendarBaseEvent, CalendarBaseProps, CalendarBaseRefs } from '../shared/calendar'

/**
 * 选择模式：
 * - single：一次只中一天，点击与确认键都是「替换」；
 * - multiple：多天复选，点击与确认键都是「切换」，选中集合按日期升序。
 *
 * 区间选择是另一个组件（日历范围选择器），不在这里。
 */
export type CalendarPickerSelectionMode = 'single' | 'multiple'

export interface CalendarPickerValueChangeDetails {
  /** 选中日期集合，ISO 串。单选模式下也是数组（长度 ≤ 1），形状不随模式变。 */
  value: string[]
}

/** 读屏用的文案，默认英文。 */
export interface CalendarPickerTranslations {
  /** 今天那一格的可及名字：把日期包成「今天，……」。 */
  todayDate: (date: string) => string
}

export interface CalendarPickerRefs extends CalendarBaseRefs {}

export interface CalendarPickerSchema extends MachineSchema {
  props: CalendarBaseProps & {
    selectionMode?: CalendarPickerSelectionMode
    /** 作者给的不可用判定，收 ISO 串。返回真的日子与界外日子同等对待。 */
    isDateUnavailable?: (value: string) => boolean
    translations?: Partial<CalendarPickerTranslations>
    /** value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValueChange?: (details: CalendarPickerValueChangeDetails) => void
  }
  context: CalendarBaseContext
  computed: Record<string, never>
  refs: CalendarPickerRefs
  /** 选中值与聚焦日不编码进状态；单选与多选没有中间态，只有一个 idle。 */
  state: 'idle'
  event: CalendarBaseEvent
  tag: never
  guard: never
  action: CalendarBaseAction | 'setValue' | 'selectCell' | 'syncGranularity' | 'syncSelectionMode'
  effect: CalendarBaseEffect
}

export interface CalendarPickerApi<T extends PropTypes = PropTypes> extends CalendarBaseApi<T> {
  selectionMode: CalendarPickerSelectionMode
}
