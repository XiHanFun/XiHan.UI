/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日历状态机的共同部分：视窗、聚焦日、钻层与焦点搬运。选择模型（单选/多选 vs 区间）由各自的机器追加。

import type { CalendarDate } from '@internationalized/date'
import type { ActionFn, Bindable, ContextParams, EffectFn, ItemQuery, MachineSchema, Params } from '@xihan-ui/core'
import type { CalendarGranularity, CalendarView } from './grid'
import type { CalendarBaseAction, CalendarBaseContext, CalendarBaseEvent, CalendarBaseProps, CalendarBaseRefs } from './types'
import { getLocalTimeZone, startOfMonth, today } from '@internationalized/date'
import { focusItem, itemValue, queryItems } from '@xihan-ui/core'
import { sameArray as sameValues, toArray as toValues } from '../array'
import { calendarPageMonths, calendarPeriodOf, calendarPeriodStart, parseCalendarDate, visibleCountOf } from './grid'

/**
 * 两个日历机器的公共 schema 下界：只钉住 props / context / refs 三片的最小形状，
 * 事件、action 与状态由具体机器在此之上收窄——那几片是联合类型，收窄后反而不再是下界的子类型，
 * 所以这里只留 MachineSchema 的宽松默认。
 */
export interface CalendarBaseSchema extends MachineSchema {
  props: CalendarBaseProps
  context: CalendarBaseContext
  refs: CalendarBaseRefs
}

/** ISO 日期串按字典序比就是按时间比（YYYY-MM-DD 定长补零）。 */
export function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** 去重并按时间升序。 */
export function sortIso(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareIso)
}

/** 建机器时的视窗起点：与连接层的兜底同一条——聚焦日 → 首个选中值 → 今天。 */
export function initialVisibleStart(prop: (key: 'focusedValue' | 'defaultFocusedValue' | 'value' | 'defaultValue' | 'timeZone') => unknown): string {
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
export function alignVisibleStart(
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

/**
 * 两个日历机器共用的四个 cell。选中值与聚焦日住在 context 的 cell 里（prop 给定即受控），不编码进 FSM 状态。
 * 日期数学不在机器里做：落点由连接层算好、以 ISO 串送进来。
 */
export function calendarBaseContext<S extends CalendarBaseSchema>(
  { prop, cell }: ContextParams<S>,
  onValueChange: (value: string[]) => void,
): { [K in keyof CalendarBaseContext]: Bindable<CalendarBaseContext[K]> } {
  return {
    value: cell<string[]>(() => ({
      value: toValues(prop('value')),
      defaultValue: toValues(prop('defaultValue')) ?? [],
      isEqual: sameValues,
      onChange: onValueChange,
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
    heldFocus: cell<string | null>(() => ({ defaultValue: null })),
  }
}

/** 共用的 refs 初值：网格容器与存活标记。 */
export function calendarBaseRefs(): CalendarBaseRefs {
  return {
    getGridEl: () => null,
    alive: false,
  }
}

/** 存活标记：搬焦点的 flush 回调撤不回，卸载后仍会跑，靠它自己认账。 */
export function trackLiveness<S extends CalendarBaseSchema>(): EffectFn<S> {
  return ({ refs }) => {
    refs.set('alive', true)
    return () => refs.set('alive', false)
  }
}

/**
 * 两个日历机器共用的 action：聚焦日、钻层、翻页与焦点搬运。
 * 各自机器把它们摊进 implementations.actions，再补自己选择模型那几条。
 */
export function calendarBaseActions<S extends CalendarBaseSchema>(
  options: {
    /** 落点格子的查询：搬焦点时按值在活 DOM 里找回它。 */
    cellTriggerQuery: ItemQuery
    /** 聚焦日改写时顺带要做的事（区间模式清掉悬停预览）。 */
    onFocusMoved?: (params: Params<S>, restoreFocus: boolean) => void
  },
): Record<CalendarBaseAction, ActionFn<S>> {
  return {
    setFocusedValue: (params) => {
      const { context, prop, event } = params
      const e = event.current() as CalendarBaseEvent
      if (e.type !== 'FOCUS.SET')
        return
      // 指针按在邻月格子上落的焦点不动窗，翻页留给随后的选中；连接层的兜底推导也照这条认。
      // 先记这条再改聚焦日：同步刷新的运行时每写一个 cell 就重渲一次，反过来写会先按旧规则翻一次页
      context.set('heldFocus', e.keepVisible ? e.value : null)
      context.set('focusedValue', e.value)
      options.onFocusMoved?.(params, !!e.restoreFocus)
      // 翻页那一路的视窗归 pageVisibleStart 管，这里让开：两条都动就走了双份
      if (e.months != null || e.keepVisible)
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
      const e = event.current() as CalendarBaseEvent
      if (e.type !== 'VIEW.SET')
        return
      context.set('activeView', e.activeView)
      context.set('heldFocus', null)
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
      const e = event.current() as CalendarBaseEvent
      if (e.type !== 'FOCUS.SET' || e.months == null)
        return
      if (context.get('focusedValue') !== e.value)
        return
      const start = parseCalendarDate(context.get('visibleStart'))
      if (!start)
        return
      context.set('visibleStart', startOfMonth(start).add({ months: e.months }).toString())
    },

    /**
     * 把 DOM 焦点搬到聚焦日那一格，只认网格内键盘操作发来的那一路（restoreFocus）。
     * 推迟到宿主提交之后再搬：跨月时新月份的格子这一刻还不存在。
     */
    focusVisibleCell: ({ refs, context, event, flush }) => {
      const e = event.current() as CalendarBaseEvent
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
        const cell = queryItems(container, options.cellTriggerQuery).find(el => itemValue(el) === next)
        focusItem(cell ?? null)
      })
    },
  }
}

/** 作者换了粒度：回到新层级并清空不能跨粒度解释的选择。区间机器在此之上再撤起点。 */
export function syncGranularityBase<S extends CalendarBaseSchema>({ context, prop }: Params<S>): void {
  const granularity = (prop('granularity') ?? 'day') as CalendarGranularity
  context.set('activeView', granularity)
  context.set('value', [])
}
