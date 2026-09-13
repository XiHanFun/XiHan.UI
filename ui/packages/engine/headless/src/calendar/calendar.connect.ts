/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar 相关实现。

import type { CalendarDate } from '@internationalized/date'
import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { CalendarPeriod, CalendarView } from './calendar.grid'
import type { CalendarApi, CalendarCellProps, CalendarPanel, CalendarPress, CalendarSchema, CalendarTranslations } from './calendar.types'
import { DateFormatter, endOfMonth, getLocalTimeZone, startOfMonth, today } from '@internationalized/date'
import { dataAttr, isElement, ITEM_VALUE_ATTR, resolveLocale } from '@xihan-ui/core'
import { calendarAnatomy } from './calendar.anatomy'
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
} from './calendar.grid'

const parts = calendarAnatomy.build()

/** 触屏按住多久才算开始拖：更短的一下是轻点，留给页面滚动。 */
const TOUCH_DRAG_DELAY = 200

/** 一格的派生状态。连接层每帧按作者声明现算，不留任何缓存。 */
interface CellState {
  date: CalendarDate | null
  period: CalendarPeriod | null
  selected: boolean
  disabled: boolean
  outsideMonth: boolean
  isToday: boolean
  focused: boolean
  inRange: boolean
  rangePreview: boolean
  rangeStart: boolean
  rangeEnd: boolean
  invalid: boolean
}

function resolveTranslations(input: Partial<CalendarTranslations> | undefined): CalendarTranslations {
  return {
    startRangeSelectionPrompt: input?.startRangeSelectionPrompt ?? 'Click to start selecting date range',
    finishRangeSelectionPrompt: input?.finishRangeSelectionPrompt ?? 'Click to finish selecting date range',
    selectedRange: input?.selectedRange ?? ((start, end) => `Selected Range: ${start} to ${end}`),
    todayDate: input?.todayDate ?? (date => `Today, ${date}`),
  }
}

/**
 * 读屏合成的指针事件：没有接触面，或是 1×1 且无压感的鼠标事件。
 * 这一路不走按下 / 松开那套拖动逻辑，交给随后的 click。
 */
function isVirtualPointer(event: PointerEvent): boolean {
  return (event.width === 0 && event.height === 0)
    || (event.width === 1 && event.height === 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === 'mouse')
}

export function connectCalendar<T extends PropTypes>(
  service: Service<CalendarSchema>,
  normalize: NormalizeProps<T>,
): CalendarApi<T> {
  const { context, prop, send, scope, refs } = service

  const locale = resolveLocale(prop('locale'), scope)
  const timeZone = prop('timeZone') ?? getLocalTimeZone()
  const mode = prop('selectionMode') ?? 'single'
  const calendarDisabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const isDateUnavailable = prop('isDateUnavailable')
  const translations = resolveTranslations(prop('translations'))
  const ids = scope.ids('calendar', 'heading')

  const value = context.get('value')
  const min = parseCalendarDate(prop('min'))
  const max = parseCalendarDate(prop('max'))

  /** 聚焦日三路收口：宿主设过的 → 首个选中值 → 今天。恒非空，展示月由它反推。 */
  const anchor = parseCalendarDate(context.get('focusedValue'))
    ?? parseCalendarDate(value[0])
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
  const headingLabel = grid.headingLabel
  const cellLabelFormatter = new DateFormatter(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone,
  })

  const periodAt = (v: string, unit: CalendarView = granularity): CalendarPeriod | null =>
    calendarPeriodOf(v, unit, { locale, timeZone })

  // —— 区间：起点、预览与可选范围 ——
  const rangeAnchor = mode === 'range' ? (context.get('rangeAnchor') ?? null) : null
  const anchored = rangeAnchor != null
  const hovered = parseCalendarDate(context.get('hoveredValue'))
  const dragging = mode === 'range' && !!context.get('dragging')

  /**
   * 一个周期挡不挡得住落值：越过 min/max 任一边界即不可选（最终查询范围不能跑出边界），
   * 再交给作者的判定，顺带把区间起点递过去。
   */
  const blockedBy = (period: CalendarPeriod, rangeStart: string | null): boolean => {
    const start = parseCalendarDate(period.start)!
    const end = parseCalendarDate(period.end)!
    if (min && start.compare(min) < 0)
      return true
    if (max && end.compare(max) > 0)
      return true
    return !!isDateUnavailable?.(period.start, rangeStart)
  }

  /**
   * 起点落下后可挑的那一段：从起点向两侧走到最近的不可用周期为止。
   * 只在不许跨过不可用日、且作者真给了判定时才算；扫描以视窗跨度为界，不无限走下去。
   */
  const spanAround = (rangeStart: string | null): [string, string] | null => {
    if (rangeStart == null || prop('allowsNonContiguousRanges') || !isDateUnavailable)
      return null
    const origin = periodAt(rangeStart)
    if (!origin)
      return null
    const limit = visibleCount * calendarPageMonths(granularity)
    const lower = parseCalendarDate(origin.start)!.subtract({ months: limit })
    const upper = parseCalendarDate(origin.end)!.add({ months: limit })
    let first = origin
    for (;;) {
      const beforeStart = parseCalendarDate(first.start)!.subtract({ days: 1 })
      if (beforeStart.compare(lower) < 0)
        break
      const prev = periodAt(beforeStart.toString())
      if (!prev || blockedBy(prev, rangeStart))
        break
      first = prev
    }
    let last = origin
    for (;;) {
      const afterEnd = parseCalendarDate(last.end)!.add({ days: 1 })
      if (afterEnd.compare(upper) > 0)
        break
      const next = periodAt(afterEnd.toString())
      if (!next || blockedBy(next, rangeStart))
        break
      last = next
    }
    return [first.start, last.end]
  }
  const currentSpan = spanAround(rangeAnchor)

  /** 一格可不可选。传入起点时按「假设已落下这个起点」来算——确认键落起点后紧接着要挪焦点。 */
  const unavailableFor = (v: string, rangeStart: string | null = rangeAnchor): boolean => {
    if (calendarDisabled)
      return true
    const period = periodAt(v)
    if (!period)
      return true
    if (blockedBy(period, rangeStart))
      return true
    const span = rangeStart === rangeAnchor ? currentSpan : spanAround(rangeStart)
    return !!span && (period.start < span[0] || period.end > span[1])
  }
  const isUnavailable = (v: string): boolean => unavailableFor(v)

  /** 两端归一成周期后取外缘：五种粒度共用同一套预览算法。 */
  const bounds = (from: string, to: string): [CalendarDate, CalendarDate] | null => {
    const a = periodAt(from)
    const b = periodAt(to)
    if (!a || !b)
      return null
    return a.start <= b.start
      ? [parseCalendarDate(a.start)!, parseCalendarDate(b.end)!]
      : [parseCalendarDate(b.start)!, parseCalendarDate(a.end)!]
  }
  // 已落定的两端；区间只填了一端时另一端是空串，解析成 null
  const committed: [CalendarPeriod | null, CalendarPeriod | null] = mode === 'range'
    ? [value[0] ? periodAt(value[0]) : null, value[1] ? periodAt(value[1]) : null]
    : [null, null]
  /**
   * 此刻亮着的区间：挑到一半是「起点 → 悬停 / 聚焦」，否则是已落定的两端；
   * 只落了一端时把那一端当成首尾同一格的区间。
   */
  const highlighted = ((): [CalendarDate, CalendarDate] | null => {
    if (mode !== 'range')
      return null
    if (anchored)
      return bounds(rangeAnchor, hovered?.toString() ?? focusedValue)
    const [a, b] = committed
    if (a && b)
      return bounds(a.start, b.start)
    const only = a ?? b
    return only ? bounds(only.start, only.start) : null
  })()

  /** 校验失败：作者标了，或已落定的区间有一端落在界外 / 被判为不可用。 */
  const invalid = !!prop('invalid') || (mode === 'range' && !anchored && !!committed[0] && !!committed[1]
    && (blockedBy(committed[0], null) || blockedBy(committed[1], null)))

  const selectedStarts = value
    .map(v => periodAt(v)?.start)
    .filter((v): v is string => v != null)
  const within = (period: CalendarPeriod): boolean => {
    if (!highlighted)
      return false
    const start = parseCalendarDate(period.start)
    const end = parseCalendarDate(period.end)
    return !!start && !!end && start.compare(highlighted[0]) >= 0 && end.compare(highlighted[1]) <= 0
  }
  const isSelected = (v: string): boolean => {
    const period = periodAt(v)
    if (!period)
      return false
    // 区间看两端之间，且不可用的格子不算在内；单选与多选看选中集合
    return mode === 'range' ? within(period) && !unavailableFor(v) : selectedStarts.includes(period.start)
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

  const cellState = (item: CalendarCellProps): CellState => {
    const date = parseCalendarDate(item.value)
    const period = periodAt(item.value, view)
    const panel = panelOf(item)
    // 认领这一天的是并排的另一张面板：这一张只显示日号
    const ownedElsewhere = (ownerOf.get(item.value) ?? panel.index) !== panel.index
    const disabled = unavailableFor(item.value)
    // 区间里不可用的格子不铺轨道：允许跨过不可用日时，轨道在它们那里断开
    const covered = !ownedElsewhere && !!period && within(period)
    const inRange = covered && !disabled
    const periodStart = parseCalendarDate(period?.start)
    const periodEnd = parseCalendarDate(period?.end)
    return {
      date,
      period,
      // 区间下两端之间的格子都算选中，与 aria-selected 同一口径
      selected: mode === 'range' ? inRange : !ownedElsewhere && !!period && selectedStarts.includes(period.start),
      disabled,
      // 页外的格子照样可点可聚焦，标出来供皮肤区分。日视图按「是不是本月」判；
      // 粗粒度视图的格子值是那一段的第一天，与面板起点比月份恒不相等，改用网格自报的 outside
      outsideMonth: view === 'day'
        ? (!date || date.year !== panel.year || date.month !== panel.month)
        : !!panel.cells.find(cell => cell.start === item.value)?.outside,
      isToday: !!period && period.start <= todayValue && period.end >= todayValue,
      focused: period?.start === focusedCell,
      inRange,
      rangePreview: inRange && anchored,
      // 两端也算 in-range
      rangeStart: inRange && !!(highlighted && periodStart && periodStart.compare(highlighted[0]) === 0),
      rangeEnd: inRange && !!(highlighted && periodEnd && periodEnd.compare(highlighted[1]) === 0),
      // 挑到一半时亮的是新区间，旧的不合法与否先不提
      invalid: invalid && mode === 'range' && !anchored && covered,
    }
  }

  // cell 与 cell-trigger 共用同一份状态标记，样式层两处一致
  const stateAttrs = (state: CellState): Record<string, string | undefined> => ({
    'data-selected': dataAttr(state.selected),
    'data-disabled': dataAttr(state.disabled),
    'data-outside-month': dataAttr(state.outsideMonth),
    'data-today': dataAttr(state.isToday),
    'data-focus': dataAttr(state.focused),
    'data-in-range': dataAttr(state.inRange),
    'data-range-preview': dataAttr(state.rangePreview),
    'data-range-start': dataAttr(state.rangeStart),
    'data-range-end': dataAttr(state.rangeEnd),
    'data-invalid': dataAttr(state.invalid),
  })

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

  /** 面板各自的标题 id。首个面板沿用原来那一份，旧标记不受影响。 */
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
  const focusAt = (next: string): void => {
    if (service.getStatus() === 'NotStarted')
      return
    send({ type: 'FOCUS.SET', value: next })
  }
  /**
   * 网格内的用户操作（方向键、翻页键、点格子）专用：连带把 DOM 焦点搬到落点那一格。
   * 点击也走这一路，否则翻月重画后原节点被换掉、焦点掉回 body。
   */
  const focusInGrid = (next: string): void => send({ type: 'FOCUS.SET', value: next, restoreFocus: true })
  // 翻页：聚焦日与视窗一起走同样的量。months 带在事件上，机器据此把视窗整体挪过去——
  // 多面板下翻一页只挪一个月，落点仍在窗内，靠「走出去才挪」是推不动窗的
  const stepMonth = (amount: 1 | -1): void => {
    const months = amount * pageMonths
    send({ type: 'FOCUS.SET', value: anchor.add({ months }).toString(), months })
  }

  /** 大步翻：与 stepMonth 同一条路，只是步长换成 bigMonths。 */
  const stepYear = (amount: 1 | -1): void => {
    const months = amount * bigMonths
    send({ type: 'FOCUS.SET', value: anchor.add({ months }).toString(), months })
  }

  /** 钻到某一层。restoreFocus 让焦点跟到新那一档的格子上。 */
  const zoomTo = (next: CalendarView): void =>
    send({ type: 'VIEW.SET', activeView: next, restoreFocus: true })

  /**
   * 点一格是「往下钻」而不是「选中」时走这一路：把落点挪进刚点的那一段，再钻下一层。
   *
   * 先挪落点再换层：换层那一下机器要拿落点把视窗对到新跨度上，落点得先是新的那个。
   */
  const drillInto = (value: string, next: CalendarView): void => {
    focusInGrid(calendarDrillAnchor(focusedValue, value, next))
    zoomTo(next)
  }

  /** 选中一格：五种粒度都只把周期首日交给同一台选择状态机。 */
  const selectAt = (value: string): void => {
    const period = periodAt(value)
    if (period)
      send({ type: 'CELL.SELECT', value: period.start })
  }

  /**
   * 落起点后把焦点挪开一格，让键盘用户看得出这是在挑一段而不是挑一天：
   * 先试后一格，挑不了再试前一格，都挑不了就留在原地。
   */
  const focusBesideAnchor = (from: string, rangeStart: string): void => {
    const next = calendarNavTarget(from, 'day.next', locale, view)
    if (!unavailableFor(next, rangeStart)) {
      focusInGrid(next)
      return
    }
    const prev = calendarNavTarget(from, 'day.prev', locale, view)
    if (!unavailableFor(prev, rangeStart))
      focusInGrid(prev)
  }

  /** 确认键：选中聚焦日。只读与不可用的日子不认，禁用的日历整条不进来。 */
  const commit = (): void => {
    // 还没钻到作者要的那一档：确认键的意思是「进这一格看看」，不是选中它
    if (zoomIn) {
      drillInto(focusedCell, zoomIn)
      return
    }
    if (readOnly || unavailableFor(focusedValue))
      return
    selectAt(focusedValue)
    if (mode === 'range' && !anchored)
      focusBesideAnchor(focusedValue, periodAt(focusedValue)!.start)
  }

  // —— 区间的指针路：按下即落起点，松开在另一格上即落终点 ——
  const setPress = (press: CalendarPress | null): void => refs.set('press', press)

  /**
   * 从这一格开始拖：起点落下，指针扫过的格子成为预览终点。
   * 只记聚焦日、不搬 DOM 焦点：按下那一下浏览器自己会把焦点落到这一格上，
   * 抢在它前面用脚本聚焦会让浏览器把这次落焦当成键盘来的、画出一圈环
   */
  const startDrag = (value: string): void => {
    send({ type: 'DRAG.SET', dragging: true })
    selectAt(value)
    focusAt(value)
  }

  /** 按在了已落定区间的哪一端上：拖它就是改这一端。 */
  const committedEndOf = (value: string): string | null => {
    const [a, b] = committed
    if (!a || !b || invalid)
      return null
    const period = periodAt(value)
    if (period?.start === a.start)
      return b.start
    if (period?.start === b.start)
      return a.start
    return null
  }

  const pressDown = (value: string, event: PointerEvent, outsideMonth: boolean): void => {
    // 每一下按下都从头记：上一下若没等到 click（拖出格子松手），旧账不能留到这一下
    setPress(null)
    if (mode !== 'range' || calendarDisabled || zoomIn || event.button !== 0 || isVirtualPointer(event))
      return
    if (readOnly || unavailableFor(value))
      return
    // 触屏会把指针捕获在按下的那一格上，松开捕获手指扫过别的格子才收得到进入事件
    const target = event.target
    if (isElement(target) && 'hasPointerCapture' in target && target.hasPointerCapture(event.pointerId))
      target.releasePointerCapture(event.pointerId)
    // 起点已在：这一下是收尾，松手时落终点
    if (anchored) {
      setPress({ value, role: 'end', timer: null })
      return
    }
    // 按在已选区间的一端上：拖动即改写这一端，起点换成另一端
    const other = committedEndOf(value)
    if (other != null) {
      send({ type: 'RANGE.ANCHOR', value: other })
      send({ type: 'DRAG.SET', dragging: true })
      focusAt(value)
      setPress({ value, role: 'boundary', timer: null })
      return
    }
    // 邻月的日子按下就会翻页，指针原地不动也会压到另一格上：起点等松手再落，不从这里起拖
    if (outsideMonth) {
      setPress({ value, role: 'anchor', timer: null, pending: true })
      return
    }
    // 触屏先等一下再拖：更短的一下是轻点，也可能是想滚页面
    if (event.pointerType === 'touch') {
      const timer = scope.getWin().setTimeout(() => {
        const press = refs.get('press')
        if (press?.value === value && press.timer === timer) {
          setPress({ value, role: 'anchor', timer: null })
          startDrag(value)
        }
      }, TOUCH_DRAG_DELAY)
      setPress({ value, role: 'anchor', timer })
      return
    }
    setPress({ value, role: 'anchor', timer: null })
    startDrag(value)
  }

  const pressUp = (value: string): void => {
    const press = refs.get('press')
    if (mode !== 'range' || !press)
      return
    // 按下与松开落在同一格时随后会冒一个 click，那一下不再处理；拖到别格松开不会有 click
    setPress(press.value === value ? { ...press, timer: null, handled: true } : null)
    if (readOnly)
      return
    if (press.timer != null || press.pending) {
      // 起点还没落：触屏轻点抢在延时前抬手，或按的是邻月的日子；同一格松开才算，按普通点选处理
      if (press.timer != null)
        scope.getWin().clearTimeout(press.timer)
      if (press.value === value && !unavailableFor(value)) {
        selectAt(value)
        focusInGrid(value)
      }
      return
    }
    if (unavailableFor(value)) {
      send({ type: 'DRAG.SET', dragging: false })
      return
    }
    // 在已选区间的端点上按下又原地松开：从这一端重新开始挑
    if (press.role === 'boundary' && press.value === value) {
      send({ type: 'RANGE.ANCHOR', value: periodAt(value)?.start ?? value })
      send({ type: 'DRAG.SET', dragging: false })
      return
    }
    // 落起点的那一下原地松开不算收尾；拖到别的格子松手、或第二下按下再松开都收尾。
    // 拖到的那一格必须是指针真扫进去过的：按下那一刻网格换了页，
    // 指针原地没动却压在了另一格上，那一格不算
    const reachedHere = press.value === value || context.get('hoveredValue') === value
    if (anchored && reachedHere && !(press.role === 'anchor' && press.value === value)) {
      selectAt(value)
      focusInGrid(value)
      return
    }
    send({ type: 'DRAG.SET', dragging: false })
  }

  return {
    value,
    selectionMode: mode,
    focusedValue,
    panels,
    visibleMonth: { year: grid.year, month: grid.month, startValue: grid.startValue },
    weeks: grid.weeks,
    periods: grid.periods,
    weekDays,
    headingLabel,
    granularity,
    activeView: view,
    headingOrder: calendarHeadingPieces(visibleStart, locale, timeZone).order,
    canZoomOutYear,
    canZoomOutMonth,
    disabled: calendarDisabled,
    readOnly,
    invalid,
    rangeAnchor,
    dragging,
    isSelected,
    isUnavailable,
    canGoPrev,
    canGoNext,
    canGoPrevYear,
    canGoNextYear,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    select: v => selectAt(v),
    setRangeAnchor: next => send({ type: 'RANGE.ANCHOR', value: next == null ? null : (periodAt(next)?.start ?? next) }),
    focus: focusAt,
    setActiveView: next => send({ type: 'VIEW.SET', activeView: next }),
    goToPrevMonth: () => stepMonth(-1),
    goToNextMonth: () => stepMonth(1),
    goToPrevYear: () => stepYear(-1),
    goToNextYear: () => stepYear(1),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(calendarDisabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
    }),

    // 翻月是单体控件，用原生 disabled（不可聚焦、不进 Tab 序列）；日期格子才用 aria-disabled。
    // 可及名字由作者写在按钮里（文案或 aria-label）
    // 快速翻年：与上下一页同一副长相，只是步子大。两个都是可选部件，不写即不渲染
    getPrevYearTriggerProps: () => normalize.button({
      ...parts['prev-year-trigger'].attrs,
      'type': 'button',
      'disabled': !canGoPrevYear || undefined,
      'data-disabled': dataAttr(!canGoPrevYear),
      'onClick': () => stepYear(-1),
    }),

    getPrevTriggerProps: () => normalize.button({
      ...parts['prev-trigger'].attrs,
      'type': 'button',
      'disabled': !canGoPrev || undefined,
      'data-disabled': dataAttr(!canGoPrev),
      'onClick': () => stepMonth(-1),
    }),

    getNextTriggerProps: () => normalize.button({
      ...parts['next-trigger'].attrs,
      'type': 'button',
      'disabled': !canGoNext || undefined,
      'data-disabled': dataAttr(!canGoNext),
      'onClick': () => stepMonth(1),
    }),

    getNextYearTriggerProps: () => normalize.button({
      ...parts['next-year-trigger'].attrs,
      'type': 'button',
      'disabled': !canGoNextYear || undefined,
      'data-disabled': dataAttr(!canGoNextYear),
      'onClick': () => stepYear(1),
    }),

    // 标题是网格的可及名字来源
    getHeadingProps: (panel = {}) => normalize.element({
      ...parts.heading.attrs,
      // 每个面板一份 id：两张网格各由自己那行标题命名，读屏才报得出这是哪个月那张
      'id': headingId(panel.index),
      'data-index': panelOf(panel).index,
      'data-view': view,
    }),

    // 标题里的年与月各是一个钮，点它钻上一层。两个都是可选部件：只写 heading 就是从前那条不可点的路。
    // 用原生 disabled 而不是 aria-disabled：它们是单体控件，到顶了就该退出 Tab 序列
    getHeadingYearTriggerProps: (panel = {}) => normalize.button({
      ...parts['heading-year-trigger'].attrs,
      'type': 'button',
      'data-index': panelOf(panel).index,
      'data-view': view,
      'disabled': !canZoomOutYear || undefined,
      'data-disabled': dataAttr(!canZoomOutYear),
      'onClick': () => {
        if (canZoomOutYear)
          zoomTo('year')
      },
    }),

    getHeadingMonthTriggerProps: (panel = {}) => normalize.button({
      ...parts['heading-month-trigger'].attrs,
      'type': 'button',
      'data-index': panelOf(panel).index,
      'data-view': view,
      // 日与周视图以月为容器；其余层收起而不是卸载，钻回来时要原地复现
      'hidden': !canZoomOutMonth || undefined,
      'disabled': !canZoomOutMonth || undefined,
      'data-disabled': dataAttr(!canZoomOutMonth),
      'onClick': () => {
        if (canZoomOutMonth)
          zoomTo('month')
      },
    }),

    // 键盘全在 grid 上收口，格子只管声明自己
    getGridProps: (panel = {}) => normalize.element({
      ...parts.grid.attrs,
      'role': 'grid',
      'aria-labelledby': headingId(panel.index),
      'data-index': panelOf(panel).index,
      // 皮肤按它换排布：日视图铺周行，其余周期直接铺进网格
      'data-view': view,
      // 三条状态都显式给，不省略
      'aria-multiselectable': mode === 'single' ? 'false' : 'true',
      'aria-disabled': calendarDisabled ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'data-disabled': dataAttr(calendarDisabled),
      'data-readonly': dataAttr(readOnly),
      'data-dragging': dataAttr(dragging),
      'onKeyDown': (event: KeyboardEvent) => {
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
          commit()
          return
        }
        // 撤掉挑到一半的起点，原来的区间原样还在。不拦默认行为：外层浮层照常收起
        if (event.key === 'Escape') {
          if (anchored)
            send({ type: 'RANGE.ANCHOR', value: null })
          return
        }
        // 焦点要离开网格：挑到一半的区间就地收口，不让起点悬在那儿。按住不放只算一次
        if (event.key === 'Tab' && anchored && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey)
          send({ type: 'RANGE.COMMIT' })
      },
      // 挂在网格上而非格子上：格子间挪动会成对发 pointerleave/pointerenter，预览会闪。
      // 起点已落下时留住预览：指针出去了，轨道停在它最后扫过的那一格
      'onPointerLeave': () => {
        if (mode === 'range' && !anchored)
          send({ type: 'HOVER.CLEAR' })
      },
    }),

    getGridHeadProps: () => normalize.element({
      ...parts['grid-head'].attrs,
      role: 'rowgroup',
    }),

    getGridBodyProps: () => normalize.element({
      ...parts['grid-body'].attrs,
      role: 'rowgroup',
    }),

    getWeekRowProps: () => normalize.element({
      ...parts['week-row'].attrs,
      role: 'row',
    }),

    // 周序号格：在 role=grid 里，一行的标号语义上就是这一行的表头
    getWeekNumberProps: ({ value }) => normalize.element({
      ...parts['week-number'].attrs,
      'role': 'rowheader',
      [ITEM_VALUE_ATTR]: value,
      // 它只是标号，不是可选的格子；读屏念行时带上它即可，不必单独停留
      'aria-hidden': true,
    }),

    // 表头那一格是占位、不带值：解析不了就给空串,让它只占住列宽
    getWeekNumberText: ({ value }) => (parseCalendarDate(value) ? String(isoWeekNumber(value)) : ''),

    getWeekDayProps: (day) => {
      const meta = weekDays[day.value]
      return normalize.element({
        ...parts['week-day'].attrs,
        'role': 'columnheader',
        // 可见文本是缩写，读屏念全称
        'aria-label': meta?.long,
        [ITEM_VALUE_ATTR]: day.value,
      })
    },

    getCellProps: (item) => {
      const state = cellState(item)
      return normalize.element({
        ...parts.cell.attrs,
        ...stateAttrs(state),
        [ITEM_VALUE_ATTR]: item.value,
        // 表格语义留在 cell 上；能点能聚焦的是它里面的 cell-trigger
        'role': 'gridcell',
        // aria-selected 是 gridcell 的属性，选中态标在这一层
        'aria-selected': state.selected ? 'true' : 'false',
      })
    },

    getCellTriggerProps: (item) => {
      const state = cellState(item)
      const period = state.period
      // 补一句完整日期给读屏；解析不出日期时不写
      const dateLabel = (date: CalendarDate | null, fallback: CalendarPeriod | null): string | undefined =>
        (view === 'day' && date ? cellLabelFormatter.format(date.toDate(timeZone)) : fallback?.label)
      let label = dateLabel(state.date, period)
      if (label != null && state.isToday)
        label = translations.todayDate(label)
      // 已落定区间的两端多念一遍整段起止，读屏用户不必逐格探
      const [a, b] = committed
      if (label != null && mode === 'range' && !anchored && a && b && period
        && (period.start === a.start || period.start === b.start)) {
        const startLabel = dateLabel(parseCalendarDate(a.start), a)
        const endLabel = dateLabel(parseCalendarDate(b.start), b)
        if (startLabel != null && endLabel != null)
          label = `${translations.selectedRange(startLabel, endLabel)}, ${label}`
      }
      // 聚焦格上提示这一下是在开始挑一段、还是在收尾
      const prompt = mode === 'range' && state.focused && !readOnly && !state.disabled
        ? (anchored ? translations.finishRangeSelectionPrompt : translations.startRangeSelectionPrompt)
        : undefined
      return normalize.element({
        ...parts['cell-trigger'].attrs,
        ...stateAttrs(state),
        // 导航与选中都以此为格子身份；翻月后靠它在活 DOM 里找回落点
        [ITEM_VALUE_ATTR]: item.value,
        'role': 'button',
        // 禁用标在 trigger 上，焦点落的是它；选中态由外层 gridcell 报
        // 一律 aria-disabled 不用原生 disabled：不可用的日子仍要能当方向键起点
        'aria-disabled': state.disabled ? 'true' : 'false',
        'aria-invalid': state.invalid ? 'true' : undefined,
        'aria-label': label,
        'aria-description': prompt,
        // roving tabindex：整张网格只有聚焦日那一格留在 Tab 序列内
        'tabindex': state.focused ? 0 : -1,
        'onClick': () => {
          if (calendarDisabled)
            return
          // 指针那一路已在按下 / 松开时落定，click 只剩键盘与读屏合成的那一下
          const press = refs.get('press')
          if (press?.handled) {
            setPress(null)
            return
          }
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
          selectAt(item.value)
        },
        'onPointerDown': (event: PointerEvent) => pressDown(item.value, event, state.outsideMonth),
        'onPointerUp': () => pressUp(item.value),
        // 不可用的格子获得焦点也记锚点，方向键据此起步
        'onFocus': () => focusAt(item.value),
        // 触屏只在拖动中才跟着手指走预览：轻扫过去是在滚页面
        'onPointerEnter': (event: PointerEvent) => {
          if (mode === 'range' && !calendarDisabled && !state.disabled && (event.pointerType !== 'touch' || dragging))
            send({ type: 'HOVER.SET', value: item.value })
        },
        // 触屏按住开始拖时不弹出上下文菜单
        'onContextMenu': (event: MouseEvent) => {
          if (dragging)
            event.preventDefault()
        },
      })
    },
  }
}
