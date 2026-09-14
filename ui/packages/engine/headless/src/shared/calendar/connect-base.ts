/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日历连接层的共同骨架：面板铺排、翻页边界、钻层、焦点搬运与格子的基础状态。
// 它只算值、只给动作，不产出任何 DOM 属性——属性字典由两个组件各自的 connect 写，
// 门禁按「哪份 connect 发了哪些属性」逐组件对账，属性得写在组件自己那份文件里。

import type { CalendarDate } from '@internationalized/date'
import type { Service } from '@xihan-ui/core'
import type { CalendarPeriod, CalendarView, CalendarWeekDay } from './grid'
import type { CalendarBaseSchema } from './machine-base'
import type { CalendarCellProps, CalendarPanel } from './types'
import { DateFormatter, endOfMonth, getLocalTimeZone, startOfMonth, today } from '@internationalized/date'
import { resolveLocale } from '@xihan-ui/core'
import {
  buildMonthGrid,
  buildPeriodGrid,
  buildWeekDays,
  calendarDrillAnchor,
  calendarHeadingPieces,
  calendarNavFromKey,
  calendarNavTarget,
  calendarPageMonths,
  calendarPeriodOf,
  calendarPeriodStart,
  calendarZoomIn,
  isoWeekNumber,
  parseCalendarDate,
  visibleCountOf,
} from './grid'

/** 两个日历组件的部件名完全相同，皮肤只按 scope 区分；各自的解剖以此类型标注，保证不漂移。 */
export type CalendarPart
  = | 'root'
    | 'header'
    | 'prev-year-trigger'
    | 'prev-trigger'
    | 'next-trigger'
    | 'next-year-trigger'
    | 'heading'
    | 'heading-year-trigger'
    | 'heading-month-trigger'
    | 'grid'
    | 'grid-head'
    | 'week-day'
    | 'grid-body'
    | 'week-row'
    | 'week-number'
    | 'cell'
    | 'cell-trigger'

/** 一格与选择模型无关的派生状态。连接层每帧按作者声明现算，不留任何缓存。 */
export interface CalendarCellBaseState {
  date: CalendarDate | null
  period: CalendarPeriod | null
  panel: CalendarPanel
  /** 认领这一天的是并排的另一张面板：这一张只显示日号，选中与区间都不画。 */
  ownedElsewhere: boolean
  disabled: boolean
  outsideMonth: boolean
  isToday: boolean
  focused: boolean
}

/** 网格上按键的分派结果：骨架接走的键已 preventDefault，其余交回给选择模型。 */
export interface CalendarGridKeyOptions {
  /** 确认键（Enter / Space）：已钻到目标粒度时怎么落值；还没钻到时骨架自己往下钻，不调用它。 */
  onCommit: () => void
  /** 方向键与确认键之外的按键交给选择模型（区间的 Escape / Tab）。 */
  onKeyDown?: (event: KeyboardEvent) => void
}

export interface CalendarCellClickOptions {
  /** click 前的拦截：返回 true 表示这一下已由指针路处理，click 不再落值。 */
  beforeClick?: () => boolean
  /** 点击落值：已钻到目标粒度、非只读且可用时调用。 */
  onSelect: () => void
}

/** 骨架对外露出的那一面：算好的值与导航动作，两个组件的 connect 据此写属性。 */
export interface CalendarFrame {
  locale: string
  timeZone: string
  disabled: boolean
  readOnly: boolean
  min: CalendarDate | null
  max: CalendarDate | null
  /** 聚焦日三路收口后的落点。 */
  anchor: CalendarDate
  focusedValue: string
  todayValue: string
  granularity: CalendarView
  view: CalendarView
  /** 钻回选择粒度的下一站；非空即「点一格是往下钻，不是选中」。 */
  zoomIn: CalendarView | null
  visibleCount: number
  visibleStart: CalendarDate
  panels: CalendarPanel[]
  grid: CalendarPanel
  weekDays: CalendarWeekDay[]
  headingOrder: readonly ('year' | 'month')[]
  /** 哪一格算「聚焦的那一格」：粗粒度视图里是聚焦日所在那段的第一天。 */
  focusedCell: string
  canGoPrev: boolean
  canGoNext: boolean
  canGoPrevYear: boolean
  canGoNextYear: boolean
  canZoomOutYear: boolean
  canZoomOutMonth: boolean
  periodAt: (value: string, unit?: CalendarView) => CalendarPeriod | null
  /** 一个周期是否越过 min/max 任一边界（最终查询范围不能跑出边界）。 */
  boundsBlocked: (period: CalendarPeriod) => boolean
  panelOf: (item: { index?: number }) => CalendarPanel
  /** 面板各自的标题 id。首个面板沿用原来那一份，旧标记不受影响。 */
  headingId: (index?: number) => string
  /** 完整日期文案（日视图）或周期标签（粗粒度），给读屏用；解析不出时为 undefined。 */
  dateLabel: (date: CalendarDate | null, fallback: CalendarPeriod | null) => string | undefined
  /** 这一行该显示的周序号文字；解析不了给空串，让它只占住列宽。 */
  weekNumberText: (value: string) => string
  /**
   * 格子拿到焦点时把聚焦日记下来；机器还没挂载就丢掉。
   * keepVisible：只记落点、视窗不动——邻月的格子被指针按住时用，翻页留给选中那一下。
   */
  focusAt: (value: string, options?: { keepVisible?: boolean }) => void
  /** 网格内的用户操作专用：连带把 DOM 焦点搬到落点那一格。 */
  focusInGrid: (value: string) => void
  stepMonth: (amount: 1 | -1) => void
  stepYear: (amount: 1 | -1) => void
  zoomTo: (view: CalendarView) => void
  drillInto: (value: string, next: CalendarView) => void
  /** 选中一格：五种粒度都只把周期首日交给选择状态机。 */
  selectAt: (value: string) => void
  cellBaseState: (item: CalendarCellProps, disabled: boolean) => CalendarCellBaseState
  /** 网格上的键盘分派：方向键搬焦点、确认键钻层或落值，其余交回。 */
  gridKeyDown: (event: KeyboardEvent, options: CalendarGridKeyOptions) => void
  /** 格子的点击分派：钻层或落值，只读与不可用不落。 */
  cellClick: (item: CalendarCellProps, state: CalendarCellBaseState, options: CalendarCellClickOptions) => void
}

export function createCalendarFrame<S extends CalendarBaseSchema>(service: Service<S>, scopeName: string): CalendarFrame {
  const { context, prop, send, scope } = service

  const locale = resolveLocale(prop('locale'), scope)
  const timeZone = prop('timeZone') ?? getLocalTimeZone()
  const calendarDisabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const ids = scope.ids(scopeName, 'heading')

  const value = context.get('value')
  const min = parseCalendarDate(prop('min'))
  const max = parseCalendarDate(prop('max'))

  /** 聚焦日三路收口：宿主设过的 → 首个选中值 → 今天。恒非空，展示月由它反推。 */
  const anchor = parseCalendarDate(context.get('focusedValue'))
    ?? parseCalendarDate(value.find(v => v !== ''))
    ?? today(timeZone)
  const focusedValue = anchor.toString()
  const todayValue = today(timeZone).toString()

  // 两件事：granularity 是作者要挑的周期，view 是人此刻钻到了哪一层
  const granularity = prop('granularity') ?? 'day'
  const view = context.get('activeView')
  // 钻回选择粒度的下一站；非空即「点一格是往下钻，不是选中」
  const zoomIn = calendarZoomIn(view, granularity)
  // 翻一页走多少个月：日视图一个月，月/季度一年，年视图十年
  const pageMonths = calendarPageMonths(view)
  // 大步翻：日视图走一年，粗粒度视图走十页——月/季度即十年，年视图即一百年
  const bigMonths = view === 'day' ? 12 : pageMonths * 10
  const visibleCount = visibleCountOf(prop('visibleCount'))
  /**
   * 视窗最左那个月。
   *
   * 机器只记"用户翻到哪儿了"，这里做最后一道推导：那个位置还看得见聚焦日就照用，
   * 看不见（受控回写、重新展开拉回选中值、方向键走出去）就重新对齐到刚好露出它的那一端。
   *
   * 两件事必须分开——多面板下点第二个面板里的日子，聚焦日落到了下个月，
   * 视窗要是跟着聚焦日走，每点一下就整窗往后推一个月，看着就像"点一下翻一页、选不中"。
   */
  const visibleStart = ((): CalendarDate => {
    // 粗粒度视图的"一页"不是一个月，视窗起点要归到跨度的头上，否则标题与格子对不齐
    const align = (d: CalendarDate): CalendarDate => (view === 'day' ? startOfMonth(d) : calendarPeriodStart(d, view))
    const target = align(anchor)
    const stored = parseCalendarDate(context.get('visibleStart'))
    if (!stored)
      return target
    const first = align(stored)
    // 指针按在邻月格子上落的焦点：机器已明说这一下不翻页，兜底也不替它翻——
    // 翻了页格子会从指针底下挪走，松开与 click 就压在另一格上
    if (context.get('heldFocus') === focusedValue)
      return first
    if (target.compare(first) < 0)
      return target
    if (target.compare(first.add({ months: (visibleCount - 1) * pageMonths })) > 0)
      return target.subtract({ months: (visibleCount - 1) * pageMonths })
    return first
  })()
  const headingFormatter = new DateFormatter(locale, { year: 'numeric', month: 'long', timeZone })
  // 一个锚点铺出 N 个连续月：翻页只动锚点，整窗一起走
  const panels: CalendarPanel[] = Array.from({ length: visibleCount }, (_, index) => {
    // 一页跨多少个月由视图定：日视图一个月，月/季度一年，年视图十年
    const start = visibleStart.add({ months: index * pageMonths })
    const pieces = calendarHeadingPieces(start, locale, timeZone)
    if (view === 'day') {
      const g = buildMonthGrid(start.toString(), { locale, fixedWeeks: !!prop('fixedWeeks') })
      return {
        index,
        year: g.year,
        month: g.month,
        startValue: g.monthStart,
        weeks: g.weeks,
        // 每行取行中那天算周序号：行首日随 locale 变（周日或周一），行中那天恒落在这一行覆盖的那个 ISO 周里
        weekNumbers: g.weeks.map(row => isoWeekNumber(row[3]!.start)),
        periods: g.weeks.flat(),
        cells: [],
        headingLabel: headingFormatter.format(start.toDate(timeZone)),
        headingYear: pieces.year,
        headingMonth: pieces.month,
      }
    }
    const g = buildPeriodGrid(start.toString(), view, { locale, timeZone })
    const first = parseCalendarDate(g.startValue)!
    return {
      index,
      year: first.year,
      month: first.month,
      startValue: g.startValue,
      weeks: [],
      weekNumbers: [],
      periods: g.cells,
      cells: g.cells,
      headingLabel: g.headingLabel,
      // 年视图的标题是整个十年跨度（2020年-2029年），钻不上去了，那一截就是它
      headingYear: view === 'year' ? g.headingLabel : pieces.year,
      // 周视图仍以月为容器；月、季度、年三层没有这一截
      headingMonth: view === 'week' ? pieces.month : '',
    }
  })
  const grid = panels[0]!
  const weekDays = buildWeekDays({
    reference: grid.startValue,
    locale,
    weekdayFormat: prop('weekdayFormat') ?? 'short',
    timeZone,
  })
  const cellLabelFormatter = new DateFormatter(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone,
  })

  const periodAt = (v: string, unit: CalendarView = granularity): CalendarPeriod | null =>
    calendarPeriodOf(v, unit, { locale, timeZone })

  /** 一个周期越过 min/max 任一边界即不可选：最终查询范围不能跑出边界。 */
  const boundsBlocked = (period: CalendarPeriod): boolean => {
    const start = parseCalendarDate(period.start)!
    const end = parseCalendarDate(period.end)!
    if (min && start.compare(min) < 0)
      return true
    if (max && end.compare(max) > 0)
      return true
    return false
  }

  /** 这一格挂在哪个面板上。作者没声明就按首个面板算，单面板时与从前一致。 */
  const panelOf = (item: { index?: number }): CalendarPanel =>
    panels[Math.min(Math.max(Math.trunc(item.index ?? 0), 0), panels.length - 1)]!

  /**
   * 哪一格算「聚焦的那一格」。
   *
   * 粗粒度视图里格子的值是「那段时间的第一天」，而聚焦日是具体某一天，两者一般不等；
   * 直接比会让一页里一格都对不上，于是整张网格连一个 Tab 位都不剩、键盘进不去。
   */
  const focusedCell = periodAt(focusedValue, view)?.start ?? focusedValue

  /**
   * 每一天归哪张面板：各面板只认领落在自己那一页里的格子。
   *
   * 并排两张面板时同一天会各出现一次（7 月 31 日既在七月的末行、也在八月的首行），
   * 认领不到的那一张只把它当页外的格子显示，区间与选中都不画，读屏也只念一次。
   */
  const ownerOf = new Map<string, number>()
  for (const panel of panels) {
    if (panel.weeks.length > 0) {
      for (const row of panel.weeks) {
        for (const day of row) {
          if (!day.outside)
            ownerOf.set(day.start, panel.index)
        }
      }
      continue
    }
    for (const cell of panel.cells) {
      if (!cell.outside)
        ownerOf.set(cell.start, panel.index)
    }
  }

  const cellBaseState = (item: CalendarCellProps, disabled: boolean): CalendarCellBaseState => {
    const date = parseCalendarDate(item.value)
    const period = periodAt(item.value, view)
    const panel = panelOf(item)
    return {
      date,
      period,
      panel,
      ownedElsewhere: (ownerOf.get(item.value) ?? panel.index) !== panel.index,
      disabled,
      // 页外的格子照样可点可聚焦，标出来供皮肤区分。日视图按「是不是本月」判；
      // 粗粒度视图的格子值是那一段的第一天，与面板起点比月份恒不相等，改用网格自报的 outside
      outsideMonth: view === 'day'
        ? (!date || date.year !== panel.year || date.month !== panel.month)
        : !!panel.cells.find(cell => cell.start === item.value)?.outside,
      isToday: !!period && period.start <= todayValue && period.end >= todayValue,
      focused: period?.start === focusedCell,
    }
  }

  // 上/下一月按不按得动只看边界：整月都落在 min 之前（或 max 之后）即不可用。
  // 用相邻月的月末/月首判，不拿聚焦日加减一个月（1 月 31 日退一月会被夹成 12 月 31 日）
  const prevMonthEnd = endOfMonth(visibleStart.subtract({ months: pageMonths }))
  // 往后翻新露出来的是窗口末尾再往后一个月；单面板时 visibleCount 为 1，与从前逐字一致
  const nextMonthStart = startOfMonth(visibleStart.add({ months: visibleCount * pageMonths }))
  const canGoPrev = !calendarDisabled && (min == null || prevMonthEnd.compare(min) >= 0)
  const canGoNext = !calendarDisabled && (max == null || nextMonthStart.compare(max) <= 0)
  // 大步翻的边界同理，只是把步长换成大步
  const prevYearEnd = endOfMonth(visibleStart.subtract({ months: bigMonths }))
  const nextYearStart = startOfMonth(visibleStart.add({ months: visibleCount * pageMonths + bigMonths - pageMonths }))
  const canGoPrevYear = !calendarDisabled && (min == null || prevYearEnd.compare(min) >= 0)
  const canGoNextYear = !calendarDisabled && (max == null || nextYearStart.compare(max) <= 0)

  /**
   * 钻上去还有没有地方可去。
   *
   * 年视图已经到顶（没有世纪那一层），那一截只作标题显示、不可按；
   * 月这一截只有日视图才有——月/季度/年那三层里压根没有「某个月」这个位。
   */
  const canZoomOutYear = !calendarDisabled && view !== 'year'
  const canZoomOutMonth = !calendarDisabled && (view === 'day' || view === 'week')

  const headingId = (index?: number): string => {
    const i = panelOf({ index }).index
    return i === 0 ? ids.heading : `${ids.heading}-${i}`
  }

  /**
   * 格子拿到焦点时把聚焦日记下来。
   *
   * 机器还没挂载就直接丢掉：内嵌进 date-picker 且展开态初值为真时，浮层的焦点域在
   * 编排机挂载那一刻就把焦点送进了格子，而日历这台机器排在它后面才挂载。那一下的落点
   * 本就是按 props 算出来的聚焦日，记不记都一样。
   */
  const focusAt = (next: string, options?: { keepVisible?: boolean }): void => {
    if (service.getStatus() === 'NotStarted')
      return
    send({ type: 'FOCUS.SET', value: next, keepVisible: options?.keepVisible || undefined } as S['event'])
  }
  /**
   * 网格内的用户操作（方向键、翻页键、点格子）专用：连带把 DOM 焦点搬到落点那一格。
   * 点击也走这一路，否则翻月重画后原节点被换掉、焦点掉回 body。
   */
  const focusInGrid = (next: string): void => send({ type: 'FOCUS.SET', value: next, restoreFocus: true } as S['event'])
  // 翻页：聚焦日与视窗一起走同样的量。months 带在事件上，机器据此把视窗整体挪过去——
  // 多面板下翻一页只挪一个月，落点仍在窗内，靠「走出去才挪」是推不动窗的
  const stepMonth = (amount: 1 | -1): void => {
    const months = amount * pageMonths
    send({ type: 'FOCUS.SET', value: anchor.add({ months }).toString(), months } as S['event'])
  }

  /** 大步翻：与 stepMonth 同一条路，只是步长换成 bigMonths。 */
  const stepYear = (amount: 1 | -1): void => {
    const months = amount * bigMonths
    send({ type: 'FOCUS.SET', value: anchor.add({ months }).toString(), months } as S['event'])
  }

  /** 钻到某一层。restoreFocus 让焦点跟到新那一档的格子上。 */
  const zoomTo = (next: CalendarView): void =>
    send({ type: 'VIEW.SET', activeView: next, restoreFocus: true } as S['event'])

  /**
   * 点一格是「往下钻」而不是「选中」时走这一路：把落点挪进刚点的那一段，再钻下一层。
   *
   * 先挪落点再换层：换层那一下机器要拿落点把视窗对到新跨度上，落点得先是新的那个。
   */
  const drillInto = (v: string, next: CalendarView): void => {
    focusInGrid(calendarDrillAnchor(focusedValue, v, next))
    zoomTo(next)
  }

  /** 选中一格：五种粒度都只把周期首日交给同一台选择状态机。 */
  const selectAt = (v: string): void => {
    const period = periodAt(v)
    if (period)
      send({ type: 'CELL.SELECT', value: period.start } as S['event'])
  }

  const dateLabel = (date: CalendarDate | null, fallback: CalendarPeriod | null): string | undefined =>
    (view === 'day' && date ? cellLabelFormatter.format(date.toDate(timeZone)) : fallback?.label)

  return {
    locale,
    timeZone,
    disabled: calendarDisabled,
    readOnly,
    min,
    max,
    anchor,
    focusedValue,
    todayValue,
    granularity,
    view,
    zoomIn,
    visibleCount,
    visibleStart,
    panels,
    grid,
    weekDays,
    headingOrder: calendarHeadingPieces(visibleStart, locale, timeZone).order,
    focusedCell,
    canGoPrev,
    canGoNext,
    canGoPrevYear,
    canGoNextYear,
    canZoomOutYear,
    canZoomOutMonth,
    periodAt,
    boundsBlocked,
    panelOf,
    headingId,
    dateLabel,
    // 表头那一格是占位、不带值：解析不了就给空串，让它只占住列宽
    weekNumberText: v => (parseCalendarDate(v) ? String(isoWeekNumber(v)) : ''),
    focusAt,
    focusInGrid,
    stepMonth,
    stepYear,
    zoomTo,
    drillInto,
    selectAt,
    cellBaseState,

    gridKeyDown: (event, options) => {
      if (calendarDisabled)
        return
      // 返回 null 表示这个键不归日历管，此时不得 preventDefault
      const intent = calendarNavFromKey(event)
      if (intent) {
        event.preventDefault()
        // 粗粒度视图走的是格子：一格一格、一行一行，不是一天一天
        focusInGrid(calendarNavTarget(focusedValue, intent, locale, view))
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        // 还没钻到作者要的那一档：确认键的意思是「进这一格看看」，不是选中它
        if (zoomIn) {
          drillInto(focusedCell, zoomIn)
          return
        }
        options.onCommit()
        return
      }
      options.onKeyDown?.(event)
    },

    cellClick: (item, state, options) => {
      if (calendarDisabled)
        return
      // 指针那一路已在按下 / 松开时落定，click 只剩键盘与读屏合成的那一下
      if (options.beforeClick?.())
        return
      // 还没钻到作者要的那一档：这一下是导航，往下钻一层。
      // 不看 disabled——粗粒度格子的可用性按「那一段的第一天」判，7 月 1 日界外
      // 不等于整个 7 月都挑不了，拦住就再也钻不进去了
      if (zoomIn) {
        drillInto(item.value, zoomIn)
        return
      }
      // 焦点锚点无条件跟着点击走（点了邻月的日子就翻到那个月），选中另过只读与可用性两道
      focusInGrid(item.value)
      if (readOnly || state.disabled)
        return
      options.onSelect()
    },
  }
}
