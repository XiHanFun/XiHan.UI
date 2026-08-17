import type { CalendarDate } from '@internationalized/date'
import type { CalendarView } from './calendar.grid'
import type { CalendarSchema, CalendarSelectionMode } from './calendar.types'
import { getLocalTimeZone, startOfMonth, today } from '@internationalized/date'
import { focusItem, itemValue, queryItems } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { calendarCellTriggerQuery } from './calendar.anatomy'
import {
  calendarPageMonths,
  calendarPeriodOf,
  calendarPeriodStart,
  parseCalendarDate,
  visibleCountOf,
} from './calendar.grid'

const { createMachine } = setup<CalendarSchema>()

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

/** 裸串是单选的简写，内部一律按数组处理；undefined 要原样透传，cell 靠它区分受控与否。 */
function toValues(input: string | string[] | undefined): string[] | undefined {
  if (input === undefined)
    return undefined
  return typeof input === 'string' ? [input] : [...input]
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

/** 数组按元素比：受控时每次读都把 prop 归一成新数组，默认的 Object.is 会判成每次都变。 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

// 选中值与聚焦日住在 context 的 cell 里（prop 给定即受控），不编码进 FSM 状态，
// 机器只有一个状态，逻辑全在 context + actions。
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
      defaultValue: prop('defaultActiveView') ?? prop('view') ?? 'day',
      onChange: activeView => prop('onActiveViewChange')?.({ activeView }),
    })),
    // 视窗起点不受控、不对外通知：它是纯粹的浏览位置。
    // 建机器时就钉住——内嵌进 date-picker 时日历的 focusedValue 是受控的，
    // 点格子那一下宿主会先把它改成刚点的那天，懒到那时再钉就钉错了月份
    visibleStart: cell<string | null>(() => ({
      defaultValue: initialVisibleStart(prop),
    })),
    // 区间起点与悬停都不受控、不对外通知
    rangeAnchor: cell<string | null>(() => ({ defaultValue: null })),
    hoveredValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    getGridEl: () => null,
    alive: false,
  }),
  initialState: () => 'idle',
  effects: ['trackLiveness'],
  // 作者换了要挑的粒度（日历从按天挑改成按月挑），人钻到哪一层就得跟着回到那一档
  watch: ({ track, prop, action }) => {
    track([() => prop('view')], () => action(['syncActiveView']))
  },
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'CELL.SELECT': { actions: ['selectCell'] },
        'FOCUS.SET': { actions: ['setFocusedValue', 'pageVisibleStart', 'focusVisibleCell'] },
        // 钻层要顺带把视窗对到新那一档的跨度上：一页的长度变了，旧起点会与格子错开
        'VIEW.SET': { actions: ['setActiveView', 'focusVisibleCell'] },
        'HOVER.SET': { actions: ['setHoveredValue'] },
        'HOVER.CLEAR': { actions: ['clearHoveredValue'] },
      },
    },
  },
  implementations: {
    effects: {
      // 存活标记：搬焦点的 flush 回调撤不回，卸载后仍会跑，靠它自己认账
      trackLiveness: ({ refs }) => {
        refs.set('alive', true)
        return () => refs.set('alive', false)
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
        // range：起点空着就把这一天记成起点（选中集合此时只有一个值）；
        // 起点已在就把两端收成区间并清掉起点
        const anchor = context.get('rangeAnchor')
        if (anchor == null) {
          context.set('rangeAnchor', e.value)
          context.set('value', [e.value])
          return
        }
        context.set('value', normalizeSelection([anchor, e.value], mode))
        context.set('rangeAnchor', null)
      },

      setFocusedValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'FOCUS.SET')
          return
        context.set('focusedValue', e.value)
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
       * 聚焦日走出视窗时才把视窗挪过去，挪到刚好把它露出来的那一端。
       * 落在窗内则一动不动——多面板下点第二个面板里的日子正是这一路，
       * 视窗要是跟着走，每点一下就整窗往后推一个月。
       */
      /**
       * 翻页：视窗整体走同样的量。多面板下翻一页只挪一个月、落点仍在窗内，
       * 靠下面那条"走出去才挪"是推不动窗的，所以单独一条。
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

      /** 作者换了 view：钻到哪一层的记录随之作废，回到新的那一档。 */
      syncActiveView: ({ context, prop }) => {
        context.set('activeView', prop('view') ?? 'day')
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
          const next = calendarPeriodOf(focused, context.get('activeView'))
          // 现查节点：缓存下来的数组会是上一个月的
          const cell = queryItems(container, calendarCellTriggerQuery).find(el => itemValue(el) === next)
          focusItem(cell ?? null)
        })
      },
    },
  },
})
