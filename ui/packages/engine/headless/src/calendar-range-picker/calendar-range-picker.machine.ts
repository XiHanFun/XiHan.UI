/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar range picker 相关实现。

import type { CalendarGranularity } from '../shared/calendar'
import type { CalendarRangePickerSchema } from './calendar-range-picker.types'
import { contains, isElement, setup } from '@xihan-ui/core'
import { resolveSessionDoc } from '@xihan-ui/pointer'
import {
  calendarBaseActions,
  calendarBaseContext,
  calendarBaseRefs,
  calendarPeriodOf,
  sortIso,
  syncGranularityBase,
  trackLiveness,
} from '../shared/calendar'
import { calendarRangePickerAnatomy, calendarRangePickerCellTriggerQuery } from './calendar-range-picker.anatomy'

const { createMachine } = setup<CalendarRangePickerSchema>()

const ROOT_SELECTOR = calendarRangePickerAnatomy.build().root.selector
const CELL_TRIGGER_SELECTOR = calendarRangePickerAnatomy.build()['cell-trigger'].selector

/** 选中集合的不变量：最多两端、去重且升序。 */
function normalizeRange(next: readonly string[]): string[] {
  return sortIso(next).slice(0, 2)
}

// 选中值与聚焦日住在 context 的 cell 里（prop 给定即受控），不编码进 FSM 状态。
// 状态只有两个：idle 与 anchored（落了起点、还没落终点）；后者挂着文档级的松手监听。
// 日期数学不在机器里做：落点由连接层算好、以 ISO 串送进来。
export const calendarRangePickerMachine = createMachine({
  name: 'calendar-range-picker',
  context: params => ({
    ...calendarBaseContext(params, value => params.prop('onValueChange')?.({ value })),
    // 区间起点、悬停与拖动都不受控、不对外通知
    rangeAnchor: params.cell<string | null>(() => ({ defaultValue: null })),
    hoveredValue: params.cell<string | null>(() => ({ defaultValue: null })),
    dragging: params.cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    ...calendarBaseRefs(),
    getBoundaryEls: () => [],
    press: null,
  }),
  initialState: () => 'idle',
  effects: ['trackLiveness'],
  // 作者换了选择粒度，钻层与原选择都失去语义：回到新粒度并清空。
  watch: ({ track, prop, action }) => {
    track([() => prop('granularity')], () => action(['syncGranularity']))
    // 值被宿主整份改写（快捷选项、清空、段位输入）：挑到一半的那个起点作废。
    // 盯的是引用：清空时 [] 换成另一份 []，内容没变也算改写；宿主每次读都归一出新数组的话得自己缓存
    track([() => prop('value')], () => action(['dropRangeAnchor']))
  },
  // 两个状态都要认的事件
  on: {
    'VALUE.SET': { target: 'idle', actions: ['setValue'] },
    'FOCUS.SET': { actions: ['setFocusedValue', 'pageVisibleStart', 'focusVisibleCell'] },
    // 钻层要顺带把视窗对到新那一档的跨度上：一页的长度变了，旧起点会与格子错开
    'VIEW.SET': { actions: ['setActiveView', 'focusVisibleCell'] },
    'HOVER.SET': { actions: ['setHoveredValue'] },
    'HOVER.CLEAR': { actions: ['clearHoveredValue'] },
    'DRAG.SET': { actions: ['setDragging'] },
  },
  states: {
    idle: {
      on: {
        // 第一下只落起点、进入 anchored
        'CELL.SELECT': [
          { guard: 'startsRange', target: 'anchored', actions: ['selectCell'] },
          { actions: ['selectCell'] },
        ],
        'RANGE.ANCHOR': [
          { guard: 'anchorsRange', target: 'anchored', actions: ['setRangeAnchor'] },
          { actions: ['setRangeAnchor'] },
        ],
      },
    },
    anchored: {
      // 松手落在边界之外即就地收口；拖动期间挡住触屏滚动
      effects: ['trackRangeRelease'],
      exit: ['setDragging'],
      on: {
        'CELL.SELECT': { target: 'idle', actions: ['selectCell'] },
        'RANGE.ANCHOR': [
          { guard: 'anchorsRange', actions: ['setRangeAnchor'] },
          { target: 'idle', actions: ['setRangeAnchor'] },
        ],
        'RANGE.COMMIT': { target: 'idle', actions: ['commitRange'] },
      },
    },
  },
  implementations: {
    guards: {
      startsRange: ({ context }) => context.get('rangeAnchor') == null,
      anchorsRange: ({ event }) => {
        const e = event.current()
        return e.type === 'RANGE.ANCHOR' && e.value != null
      },
    },
    effects: {
      trackLiveness: trackLiveness(),

      /**
       * 起点落下后盯着整份文档：指针在边界之外松开，就把区间收在起点与悬停 / 聚焦日之间。
       * 松在格子上的那一下由格子自己处理，落在翻页钮、标题、浮层这些边界之内的不动。
       * 拖动期间拦住 touchmove，手指划过格子时页面不跟着滚。
       */
      trackRangeRelease: ({ refs, context, send }) => {
        const grid = refs.get('getGridEl')()
        const doc = resolveSessionDoc(grid)
        if (!doc)
          return
        const boundaries = (): (HTMLElement | null)[] => {
          const declared = refs.get('getBoundaryEls')().filter(Boolean)
          if (declared.length > 0)
            return declared
          const live = refs.get('getGridEl')()
          return [live?.closest<HTMLElement>(ROOT_SELECTOR) ?? live]
        }
        const release = (event: PointerEvent): void => {
          const target = event.target
          // 松在格子上的那一下由格子自己处理——按下落起点的那一格可能在同一拍里已被重画摘掉，
          // 认的是它的部件身份而不是它还在不在树上
          const onCell = isElement(target) && target.closest(CELL_TRIGGER_SELECTOR) != null
          const inside = onCell || (isElement(target) && boundaries().some(el => contains(el, target)))
          if (inside) {
            send({ type: 'DRAG.SET', dragging: false })
            return
          }
          send({ type: 'RANGE.COMMIT' })
        }
        const cancel = (): void => send({ type: 'DRAG.SET', dragging: false })
        const blockScroll = (event: TouchEvent): void => {
          if (context.get('dragging'))
            event.preventDefault()
        }
        doc.addEventListener('pointerup', release)
        doc.addEventListener('pointercancel', cancel)
        doc.addEventListener('touchmove', blockScroll, { passive: false, capture: true })
        return () => {
          doc.removeEventListener('pointerup', release)
          doc.removeEventListener('pointercancel', cancel)
          doc.removeEventListener('touchmove', blockScroll, { capture: true })
        }
      },
    },
    actions: {
      ...calendarBaseActions({
        cellTriggerQuery: calendarRangePickerCellTriggerQuery,
        // 键盘或点击把焦点搬走时，预览改跟聚焦日：留着旧的悬停会让轨道停在指针早已离开的那一格
        onFocusMoved: ({ context }, restoreFocus) => {
          if (restoreFocus)
            context.set('hoveredValue', null)
        },
      }),

      // 整体改写不动区间起点
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeRange(e.value))
        // 整份替换即一次落定，挑到一半的那个起点作废——否则下一次点还以为在续上一段
        context.set('rangeAnchor', null)
        context.set('hoveredValue', null)
      },

      // 起点空着就把这一天记成起点，选中值一动不动；起点已在就把两端收成区间并清掉起点
      selectCell: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'CELL.SELECT')
          return
        const anchor = context.get('rangeAnchor')
        if (anchor == null) {
          context.set('rangeAnchor', e.value)
          return
        }
        context.set('value', normalizeRange([anchor, e.value]))
        context.set('rangeAnchor', null)
        context.set('hoveredValue', null)
      },

      setRangeAnchor: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'RANGE.ANCHOR')
          return
        context.set('rangeAnchor', e.value)
        if (e.value == null)
          context.set('hoveredValue', null)
      },

      /** 就地收口：终点取悬停日，没有悬停就取聚焦日；聚焦日没定过就退回起点自己。 */
      commitRange: ({ context, prop }) => {
        const anchor = context.get('rangeAnchor')
        if (anchor == null)
          return
        const granularity = (prop('granularity') ?? 'day') as CalendarGranularity
        const options = { locale: prop('locale'), timeZone: prop('timeZone') }
        const end = context.get('hoveredValue')
          ?? calendarPeriodOf(context.get('focusedValue') ?? anchor, granularity, options)?.start
          ?? anchor
        context.set('value', normalizeRange([anchor, end]))
        context.set('rangeAnchor', null)
        context.set('hoveredValue', null)
      },

      setDragging: ({ context, event }) => {
        const e = event.current()
        context.set('dragging', e.type === 'DRAG.SET' ? e.dragging : false)
      },

      /** 作者换了粒度：回到新层级，清空不能跨粒度解释的选择，并撤掉挑到一半的起点。 */
      syncGranularity: (params) => {
        syncGranularityBase(params)
        params.send({ type: 'RANGE.ANCHOR', value: null })
      },

      // 值由别处整份写过（受控回写、快捷选项、清空）：起点跟着作废
      dropRangeAnchor: ({ context, send }) => {
        if (context.get('rangeAnchor') == null)
          return
        send({ type: 'RANGE.ANCHOR', value: null })
      },

      setHoveredValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'HOVER.SET')
          context.set('hoveredValue', e.value)
      },

      clearHoveredValue: ({ context }) => context.set('hoveredValue', null),
    },
  },
})
