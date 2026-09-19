/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar picker 相关实现。

import type { CalendarPickerPressedKey, CalendarPickerSchema, CalendarPickerSelectionMode } from './calendar-picker.types'
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

/** 日期格的按压键以 cell: 开头；只读只挡这一类。 */
function isCellKey(key: CalendarPickerPressedKey): boolean {
  return key.startsWith('cell:')
}

/** 选中集合的不变量：单选长度 ≤ 1，多选去重升序。 */
function normalizeSelection(next: readonly string[], mode: CalendarPickerSelectionMode): string[] {
  return mode === 'single' ? next.slice(0, 1) : sortIso(next)
}

// 选中值与聚焦日住在 context 的 cell 里（prop 给定即受控），不编码进 FSM 状态。
// 单选与多选没有中间态，状态只有 idle；日期数学不在机器里做：落点由连接层算好、以 ISO 串送进来。
export const calendarPickerMachine = createMachine({
  name: 'calendar-picker',
  context: params => ({
    ...calendarBaseContext(params, value => params.prop('onValueChange')?.({ value })),
    // 按压通道：正被按住的那一个（翻页钮 / 标题两截 / 日期格），与选中、聚焦日都无关
    pressed: params.cell<CalendarPickerPressedKey | null>(() => ({ defaultValue: null })),
  }),
  refs: () => calendarBaseRefs(),
  initialState: () => 'idle',
  effects: ['trackLiveness'],
  // 作者换了选择粒度，钻层与原选择都失去语义：回到新粒度并清空。
  watch: ({ track, prop, context, action }) => {
    track([() => prop('granularity')], () => action(['syncGranularity']))
    track([() => prop('selectionMode')], () => action(['syncSelectionMode']))
    // 按住途中整张转入禁用或只读：不会再来 keyup，按压面由机器自己收
    track([() => prop('disabled'), () => prop('readOnly')], () => action(['releaseWhenInert']))
    // 钻层时整页格子换掉、标题钮到顶转禁用：被按住的那一个不会再来 keyup / blur（节点被换掉不派 blur），一并松开
    track([context.dep('activeView')], () => action(['releasePress']))
    // 视窗挪动（Enter 选中邻月格连带翻页）：按住的那一格随页换掉，只松开格子，正按着的翻页钮留着
    track([context.dep('visibleStart')], () => action(['releaseCellPress']))
  },
  on: {
    'VALUE.SET': { actions: ['setValue'] },
    'CELL.SELECT': { actions: ['selectCell'] },
    'FOCUS.SET': { actions: ['setFocusedValue', 'pageVisibleStart', 'focusVisibleCell'] },
    // 钻层要顺带把视窗对到新那一档的跨度上：一页的长度变了，旧起点会与格子错开
    'VIEW.SET': { actions: ['setActiveView', 'focusVisibleCell'] },
    // 按压通道：按 key 记按住的那一个；整张禁用不进，只读时日期格不进，部件自身的禁用由 connect 判定后随事件带入
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    guards: {
      // 整张禁用一票否决；只读只挡日期格（翻页与钻层照常）；到界 / 到顶 / 不可选的事实随事件带入
      canPress: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.START' || prop('disabled') || e.disabled)
          return false
        return !(prop('readOnly') && isCellKey(e.key))
      },
    },
    effects: {
      trackLiveness: trackLiveness(),
    },
    actions: {
      ...calendarBaseActions({ cellTriggerQuery: calendarPickerCellTriggerQuery }),

      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressed', e.key)
      },
      // 只收自己那一下：另一颗钮的 keyup 不该把正按着的这颗松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressed') === e.key)
          context.set('pressed', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        const pressed = context.get('pressed')
        if (pressed != null && (prop('disabled') || (prop('readOnly') && isCellKey(pressed))))
          context.set('pressed', null)
      },
      releasePress: ({ context }) => context.set('pressed', null),
      releaseCellPress: ({ context }) => {
        const pressed = context.get('pressed')
        if (pressed != null && isCellKey(pressed))
          context.set('pressed', null)
      },

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
