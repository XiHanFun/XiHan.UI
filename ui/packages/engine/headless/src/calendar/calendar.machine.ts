/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar 相关实现。

import type { CalendarDate } from '@internationalized/date'
import type { CalendarGranularity, CalendarView } from './calendar.grid'
import type { CalendarSchema, CalendarSelectionMode } from './calendar.types'
import { getLocalTimeZone, startOfMonth, today } from '@internationalized/date'
import { contains, focusItem, isElement, itemValue, queryItems, setup } from '@xihan-ui/core'
import { resolveSessionDoc } from '@xihan-ui/pointer'
import { sameArray as sameValues, toArray as toValues } from '../shared/array'
import { calendarAnatomy, calendarCellTriggerQuery } from './calendar.anatomy'
import {
  calendarPageMonths,
  calendarPeriodOf,
  calendarPeriodStart,
  parseCalendarDate,
  visibleCountOf,
} from './calendar.grid'

const { createMachine } = setup<CalendarSchema>()

const ROOT_SELECTOR = calendarAnatomy.build().root.selector
const CELL_TRIGGER_SELECTOR = calendarAnatomy.build()['cell-trigger'].selector

/** 建机器时的视窗起点：与连接层的兜底同一条——聚焦日 → 首个选中值 → 今天。 */
function initialVisibleStart(prop: (key: 'focusedValue' | 'defaultFocusedValue' | 'value' | 'defaultValue' | 'timeZone') => unknown): string {
  const focused = parseCalendarDate(prop('focusedValue') as string | undefined)
    ?? parseCalendarDate(prop('defaultFocusedValue') as string | undefined)
    ?? parseCalendarDate(toValues(prop('value') as string | string[] | undefined)?.[0])
    ?? parseCalendarDate(toValues(prop('defaultValue') as string | string[] | undefined)?.[0])
    ?? today((prop('timeZone') as string | undefined) ?? getLocalTimeZone())
  return startOfMonth(focused).toString()
}

/**
 * 把视窗对齐到「刚好露出这一天」：落在窗内一动不动，走出去才挪到最近的那一端。
 *
 * 这是视窗唯一会自己动的规则，翻页那条另算（见 pageVisibleStart）。
 */
function alignVisibleStart(
  context: { get: (key: 'visibleStart') => string | null, set: (key: 'visibleStart', value: string) => void },
  prop: (key: 'visibleCount') => number | undefined,
  view: CalendarView,
  value: string,
): void {
  const target = parseCalendarDate(value)
  const start = parseCalendarDate(context.get('visibleStart'))
  if (!target || !start)
    return
  // 一页跨多少个月由视图定；按月算会把落在窗内的格子判成走出去，于是每点一下就整窗翻一页
  const page = calendarPageMonths(view)
  const align = (d: CalendarDate): CalendarDate => (view === 'day' ? startOfMonth(d) : calendarPeriodStart(d, view))
  const first = align(start)
  const cell = align(target)
  const span = (visibleCountOf(prop('visibleCount')) - 1) * page
  if (cell.compare(first) < 0) {
    context.set('visibleStart', cell.toString())
    return
  }
  if (cell.compare(first.add({ months: span })) > 0)
    context.set('visibleStart', cell.subtract({ months: span }).toString())
}

/** ISO 日期串按字典序比就是按时间比（YYYY-MM-DD 定长补零）。 */
function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** 选中集合的不变量：单选长度 ≤ 1，多选去重升序，区间最多两端且有序。 */
function normalizeSelection(next: readonly string[], mode: CalendarSelectionMode): string[] {
  if (mode === 'single')
    return next.slice(0, 1)
  const unique = [...new Set(next)].sort(compareIso)
  return mode === 'range' ? unique.slice(0, 2) : unique
}

// 选中值与聚焦日住在 context 的 cell 里（prop 给定即受控），不编码进 FSM 状态。
// 状态只有两个：idle 与 anchored（区间落了起点、还没落终点）；后者挂着文档级的松手监听。
// 日期数学不在机器里做：落点由连接层算好、以 ISO 串送进来。
export const calendarMachine = createMachine({
  name: 'calendar',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: toValues(prop('value')),
      defaultValue: toValues(prop('defaultValue')) ?? [],
      isEqual: sameValues,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    focusedValue: cell<string | null>(() => ({
      value: prop('focusedValue'),
      defaultValue: prop('defaultFocusedValue') ?? null,
      // 兜底（退回选中值或今天）留在连接层，兜底出来的日子不发回调
      onChange: (focusedValue) => {
        if (focusedValue != null)
          prop('onFocusedValueChange')?.({ focusedValue })
      },
    })),
    // 人钻到了哪一层。缺省即作者要挑的那一档——没人点标题时两者一直相等
    activeView: cell<CalendarView>(() => ({
      value: prop('activeView'),
      defaultValue: prop('defaultActiveView') ?? prop('granularity') ?? 'day',
      onChange: activeView => prop('onActiveViewChange')?.({ activeView }),
    })),
    // 视窗起点不受控、不对外通知：它是纯粹的浏览位置。
    // 建机器时就钉住——内嵌进 date-picker 时日历的 focusedValue 是受控的，
    // 点格子那一下宿主会先把它改成刚点的那天，懒到那时再钉就钉错了月份
    visibleStart: cell<string | null>(() => ({
      defaultValue: initialVisibleStart(prop),
    })),
    // 区间起点、悬停与拖动都不受控、不对外通知
    rangeAnchor: cell<string | null>(() => ({ defaultValue: null })),
    hoveredValue: cell<string | null>(() => ({ defaultValue: null })),
    dragging: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    getGridEl: () => null,
    getBoundaryEls: () => [],
    press: null,
    alive: false,
  }),
  initialState: () => 'idle',
  effects: ['trackLiveness'],
  // 作者换了选择粒度，钻层与原选择都失去语义：回到新粒度并清空。
  watch: ({ track, prop, action }) => {
    track([() => prop('granularity')], () => action(['syncGranularity']))
    track([() => prop('selectionMode')], () => action(['syncSelectionMode']))
    // 值被宿主整份改写（快捷选项、清空、段位输入）：挑到一半的那个起点作废
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
        // 区间第一下只落起点、进入 anchored；其余模式当场改值、不换状态
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
      startsRange: ({ prop, context }) => prop('selectionMode') === 'range' && context.get('rangeAnchor') == null,
      anchorsRange: ({ prop, event }) => {
        const e = event.current()
        return prop('selectionMode') === 'range' && e.type === 'RANGE.ANCHOR' && e.value != null
      },
    },
    effects: {
      // 存活标记：搬焦点的 flush 回调撤不回，卸载后仍会跑，靠它自己认账
      trackLiveness: ({ refs }) => {
        refs.set('alive', true)
        return () => refs.set('alive', false)
      },

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
      // 整体改写不动区间起点
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeSelection(e.value, prop('selectionMode') ?? 'single'))
        // 整份替换即一次落定，挑到一半的那个起点作废——否则下一次点还以为在续上一段
        context.set('rangeAnchor', null)
        context.set('hoveredValue', null)
      },

      selectCell: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'CELL.SELECT')
          return
        const mode = prop('selectionMode') ?? 'single'
        if (mode === 'single') {
          context.set('value', [e.value])
          return
        }
        if (mode === 'multiple') {
          const current = context.get('value')
          const next = current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value]
          context.set('value', normalizeSelection(next, mode))
          return
        }
        // range：起点空着就把这一天记成起点，选中值一动不动；
        // 起点已在就把两端收成区间并清掉起点
        const anchor = context.get('rangeAnchor')
        if (anchor == null) {
          context.set('rangeAnchor', e.value)
          return
        }
        context.set('value', normalizeSelection([anchor, e.value], mode))
        context.set('rangeAnchor', null)
        context.set('hoveredValue', null)
      },

      setRangeAnchor: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'RANGE.ANCHOR' || prop('selectionMode') !== 'range')
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
        context.set('value', normalizeSelection([anchor, end], 'range'))
        context.set('rangeAnchor', null)
        context.set('hoveredValue', null)
      },

      setDragging: ({ context, event }) => {
        const e = event.current()
        context.set('dragging', e.type === 'DRAG.SET' ? e.dragging : false)
      },

      setFocusedValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'FOCUS.SET')
          return
        context.set('focusedValue', e.value)
        // 键盘或点击把焦点搬走时，预览改跟聚焦日：留着旧的悬停会让轨道停在指针早已离开的那一格
        if (e.restoreFocus)
          context.set('hoveredValue', null)
        // 翻页那一路的视窗归 pageVisibleStart 管，这里让开：两条都动就走了双份
        if (e.months != null)
          return
        // 新落点走出视窗才把视窗挪过去；落在窗内一动不动——
        // 多面板下点第二个面板里的日子正是这一路
        alignVisibleStart(context, prop, context.get('activeView'), e.value)
      },

      /**
       * 钻到另一层。视窗跟着对到新那一档的跨度上——
       * 一页从「一个月」变成「一个十年」，旧起点与新格子对不齐，标题就会与格子各说各话。
       */
      setActiveView: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VIEW.SET')
          return
        context.set('activeView', e.activeView)
        // 受控时宿主可能不写回，那一刻视窗也不该动
        if (context.get('activeView') !== e.activeView)
          return
        const focused = context.get('focusedValue')
        if (focused != null)
          alignVisibleStart(context, prop, e.activeView, focused)
      },

      /**
       * 翻页：视窗整体走同样的量。多面板下翻一页只挪一个月、落点仍在窗内，
       * 靠「走出去才挪」那条是推不动窗的，所以单独一条。
       *
       * 判据是聚焦日真的走到了请求的那天：受控 focusedValue 时宿主可能不写回，
       * 那一刻视窗也不该动，否则展示月与聚焦日就各说各话了。
       */
      pageVisibleStart: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'FOCUS.SET' || e.months == null)
          return
        if (context.get('focusedValue') !== e.value)
          return
        const start = parseCalendarDate(context.get('visibleStart'))
        if (!start)
          return
        context.set('visibleStart', startOfMonth(start).add({ months: e.months }).toString())
      },

      /** 作者换了粒度：回到新层级，并清空不能跨粒度解释的选择与预览。 */
      syncGranularity: ({ context, prop, send }) => {
        const granularity = (prop('granularity') ?? 'day') as CalendarGranularity
        context.set('activeView', granularity)
        context.set('value', [])
        send({ type: 'RANGE.ANCHOR', value: null })
      },

      /** 切换模式时收口现值；挑到一半的起点在新模式下没有意义，一并撤掉。 */
      syncSelectionMode: ({ context, prop, send }) => {
        const mode = prop('selectionMode') ?? 'single'
        context.set('value', normalizeSelection(context.get('value'), mode))
        send({ type: 'RANGE.ANCHOR', value: null })
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

      /**
       * 把 DOM 焦点搬到聚焦日那一格，只认网格内键盘操作发来的那一路（restoreFocus）。
       * 推迟到宿主提交之后再搬：跨月时新月份的格子这一刻还不存在。
       */
      focusVisibleCell: ({ refs, context, event, flush }) => {
        const e = event.current()
        if ((e.type !== 'FOCUS.SET' && e.type !== 'VIEW.SET') || !e.restoreFocus)
          return
        flush(() => {
          if (!refs.get('alive'))
            return
          const focused = context.get('focusedValue')
          const container = refs.get('getGridEl')()
          if (focused == null || !container)
            return
          // 粗粒度视图里格子的值是「那段时间的第一天」，拿聚焦日直接比一格都对不上
          const next = calendarPeriodOf(focused, context.get('activeView'))?.start ?? focused
          // 现查节点：缓存下来的数组会是上一个月的
          const cell = queryItems(container, calendarCellTriggerQuery).find(el => itemValue(el) === next)
          focusItem(cell ?? null)
        })
      },
    },
  },
})
