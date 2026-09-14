/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar picker 相关实现。

import type { CalendarPickerSchema, CalendarPickerSelectionMode } from './calendar-picker.types'
import { setup } from '@xihan-ui/core'
import {
  calendarBaseActions,
  calendarBaseContext,
  calendarBaseRefs,
  sortIso,
  syncGranularityBase,
  trackLiveness,
} from '../shared/calendar'
import { calendarPickerCellTriggerQuery } from './calendar-picker.anatomy'

const { createMachine } = setup<CalendarPickerSchema>()

/** 选中集合的不变量：单选长度 ≤ 1，多选去重升序。 */
function normalizeSelection(next: readonly string[], mode: CalendarPickerSelectionMode): string[] {
  return mode === 'single' ? next.slice(0, 1) : sortIso(next)
}

// 选中值与聚焦日住在 context 的 cell 里（prop 给定即受控），不编码进 FSM 状态。
// 单选与多选没有中间态，状态只有 idle；日期数学不在机器里做：落点由连接层算好、以 ISO 串送进来。
export const calendarPickerMachine = createMachine({
  name: 'calendar-picker',
  context: params => calendarBaseContext(params, value => params.prop('onValueChange')?.({ value })),
  refs: () => calendarBaseRefs(),
  initialState: () => 'idle',
  effects: ['trackLiveness'],
  // 作者换了选择粒度，钻层与原选择都失去语义：回到新粒度并清空。
  watch: ({ track, prop, action }) => {
    track([() => prop('granularity')], () => action(['syncGranularity']))
    track([() => prop('selectionMode')], () => action(['syncSelectionMode']))
  },
  on: {
    'VALUE.SET': { actions: ['setValue'] },
    'CELL.SELECT': { actions: ['selectCell'] },
    'FOCUS.SET': { actions: ['setFocusedValue', 'pageVisibleStart', 'focusVisibleCell'] },
    // 钻层要顺带把视窗对到新那一档的跨度上：一页的长度变了，旧起点会与格子错开
    'VIEW.SET': { actions: ['setActiveView', 'focusVisibleCell'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    effects: {
      trackLiveness: trackLiveness(),
    },
    actions: {
      ...calendarBaseActions({ cellTriggerQuery: calendarPickerCellTriggerQuery }),

      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeSelection(e.value, prop('selectionMode') ?? 'single'))
      },

      // 单选替换、多选切换
      selectCell: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'CELL.SELECT')
          return
        if ((prop('selectionMode') ?? 'single') === 'single') {
          context.set('value', [e.value])
          return
        }
        const current = context.get('value')
        const next = current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value]
        context.set('value', normalizeSelection(next, 'multiple'))
      },

      /** 作者换了粒度：回到新层级，并清空不能跨粒度解释的选择。 */
      syncGranularity: params => syncGranularityBase(params),

      /** 切换模式时收口现值：多选变单选只留第一个。 */
      syncSelectionMode: ({ context, prop }) => {
        context.set('value', normalizeSelection(context.get('value'), prop('selectionMode') ?? 'single'))
      },
    },
  },
})
