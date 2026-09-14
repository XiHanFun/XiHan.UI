/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 calendar range picker 相关实现。

import type { CalendarDate } from '@internationalized/date'
import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { CalendarCellBaseState, CalendarCellProps, CalendarPeriod } from '../shared/calendar'
import type { CalendarRangePickerApi, CalendarRangePickerPress, CalendarRangePickerSchema, CalendarRangePickerTranslations } from './calendar-range-picker.types'
import { dataAttr, isElement, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { calendarNavTarget, calendarPageMonths, createCalendarFrame, parseCalendarDate } from '../shared/calendar'
import { calendarRangePickerAnatomy } from './calendar-range-picker.anatomy'

const parts = calendarRangePickerAnatomy.build()

/** 触屏按住多久才算开始拖：更短的一下是轻点，留给页面滚动。 */
const TOUCH_DRAG_DELAY = 200

/** 一格在区间下的派生状态：骨架那份之上再加轨道四件与不合法标记。 */
interface RangeCellState extends CalendarCellBaseState {
  selected: boolean
  inRange: boolean
  rangePreview: boolean
  rangeStart: boolean
  rangeEnd: boolean
  invalid: boolean
}

function resolveTranslations(input: Partial<CalendarRangePickerTranslations> | undefined): CalendarRangePickerTranslations {
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

export function connectCalendarRangePicker<T extends PropTypes>(
  service: Service<CalendarRangePickerSchema>,
  normalize: NormalizeProps<T>,
): CalendarRangePickerApi<T> {
  const { context, prop, send, scope, refs } = service
  const translations = resolveTranslations(prop('translations'))
  const frame = createCalendarFrame(service, calendarRangePickerAnatomy.name)
  const { periodAt, focusedValue, view, locale, disabled: calendarDisabled, readOnly } = frame

  const value = context.get('value')
  const isDateUnavailable = prop('isDateUnavailable')

  // —— 区间：起点、预览与可选范围 ——
  const rangeAnchor = context.get('rangeAnchor') ?? null
  const anchored = rangeAnchor != null
  const hovered = parseCalendarDate(context.get('hoveredValue'))
  const dragging = !!context.get('dragging')

  /**
   * 一个周期挡不挡得住落值：越过 min/max 任一边界即不可选（最终查询范围不能跑出边界），
   * 再交给作者的判定，顺带把区间起点递过去。
   */
  const blockedBy = (period: CalendarPeriod, rangeStart: string | null): boolean =>
    frame.boundsBlocked(period) || !!isDateUnavailable?.(period.start, rangeStart)

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
    const limit = frame.visibleCount * calendarPageMonths(frame.granularity)
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
  // 已落定的两端；只填了一端时另一端是空串，解析成 null
  const committed: [CalendarPeriod | null, CalendarPeriod | null] = [
    value[0] ? periodAt(value[0]) : null,
    value[1] ? periodAt(value[1]) : null,
  ]
  /**
   * 此刻亮着的区间：挑到一半是「起点 → 悬停 / 聚焦」，否则是已落定的两端；
   * 只落了一端时把那一端当成首尾同一格的区间。
   */
  const highlighted = ((): [CalendarDate, CalendarDate] | null => {
    if (anchored)
      return bounds(rangeAnchor, hovered?.toString() ?? focusedValue)
    const [a, b] = committed
    if (a && b)
      return bounds(a.start, b.start)
    const only = a ?? b
    return only ? bounds(only.start, only.start) : null
  })()

  /** 校验失败：作者标了，或已落定的区间有一端落在界外 / 被判为不可用。 */
  const invalid = !!prop('invalid') || (!anchored && !!committed[0] && !!committed[1]
    && (blockedBy(committed[0], null) || blockedBy(committed[1], null)))

  const within = (period: CalendarPeriod): boolean => {
    if (!highlighted)
      return false
    const start = parseCalendarDate(period.start)
    const end = parseCalendarDate(period.end)
    return !!start && !!end && start.compare(highlighted[0]) >= 0 && end.compare(highlighted[1]) <= 0
  }
  // 区间看两端之间，且不可用的格子不算在内
  const isSelected = (v: string): boolean => {
    const period = periodAt(v)
    return !!period && within(period) && !unavailableFor(v)
  }

  const cellState = (item: CalendarCellProps): RangeCellState => {
    const base = frame.cellBaseState(item, unavailableFor(item.value))
    const { period } = base
    // 区间里不可用的格子不铺轨道：允许跨过不可用日时，轨道在它们那里断开
    const covered = !base.ownedElsewhere && !!period && within(period)
    const inRange = covered && !base.disabled
    const periodStart = parseCalendarDate(period?.start)
    const periodEnd = parseCalendarDate(period?.end)
    return {
      ...base,
      // 两端之间的格子都算选中，与 aria-selected 同一口径
      selected: inRange,
      inRange,
      rangePreview: inRange && anchored,
      // 两端也算 in-range
      rangeStart: inRange && !!(highlighted && periodStart && periodStart.compare(highlighted[0]) === 0),
      rangeEnd: inRange && !!(highlighted && periodEnd && periodEnd.compare(highlighted[1]) === 0),
      // 挑到一半时亮的是新区间，旧的不合法与否先不提
      invalid: invalid && !anchored && covered,
    }
  }

  // cell 与 cell-trigger 共用同一份状态标记，样式层两处一致
  const stateAttrs = (state: RangeCellState): Record<string, string | undefined> => ({
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

  /**
   * 落起点后把焦点挪开一格，让键盘用户看得出这是在挑一段而不是挑一天：
   * 先试后一格，挑不了再试前一格，都挑不了就留在原地。
   */
  const focusBesideAnchor = (from: string, rangeStart: string): void => {
    const next = calendarNavTarget(from, 'day.next', locale, view)
    if (!unavailableFor(next, rangeStart)) {
      frame.focusInGrid(next)
      return
    }
    const prev = calendarNavTarget(from, 'day.prev', locale, view)
    if (!unavailableFor(prev, rangeStart))
      frame.focusInGrid(prev)
  }

  /** 确认键：选中聚焦日。只读与不可用的日子不认，禁用的日历整条不进来。 */
  const commit = (): void => {
    if (readOnly || unavailableFor(focusedValue))
      return
    frame.selectAt(focusedValue)
    if (!anchored)
      focusBesideAnchor(focusedValue, periodAt(focusedValue)!.start)
  }

  // —— 指针路：按下即落起点，松开在另一格上即落终点 ——
  const setPress = (press: CalendarRangePickerPress | null): void => refs.set('press', press)

  /**
   * 从这一格开始拖：起点落下，指针扫过的格子成为预览终点。
   * 只记聚焦日、不搬 DOM 焦点：按下那一下浏览器自己会把焦点落到这一格上，
   * 抢在它前面用脚本聚焦会让浏览器把这次落焦当成键盘来的、画出一圈环
   */
  const startDrag = (v: string): void => {
    send({ type: 'DRAG.SET', dragging: true })
    frame.selectAt(v)
    frame.focusAt(v)
  }

  /** 按在了已落定区间的哪一端上：拖它就是改这一端。 */
  const committedEndOf = (v: string): string | null => {
    const [a, b] = committed
    if (!a || !b || invalid)
      return null
    const period = periodAt(v)
    if (period?.start === a.start)
      return b.start
    if (period?.start === b.start)
      return a.start
    return null
  }

  const pressDown = (v: string, event: PointerEvent, outsideMonth: boolean): void => {
    // 每一下按下都从头记：上一下若没等到 click（拖出格子松手），旧账不能留到这一下
    setPress(null)
    if (calendarDisabled || frame.zoomIn || event.button !== 0 || isVirtualPointer(event))
      return
    if (readOnly || unavailableFor(v))
      return
    // 触屏会把指针捕获在按下的那一格上，松开捕获手指扫过别的格子才收得到进入事件
    const target = event.target
    if (isElement(target) && 'hasPointerCapture' in target && target.hasPointerCapture(event.pointerId))
      target.releasePointerCapture(event.pointerId)
    // 起点已在：这一下是收尾，松手时落终点
    if (anchored) {
      setPress({ value: v, role: 'end', timer: null })
      return
    }
    // 按在已选区间的一端上：拖动即改写这一端，起点换成另一端
    const other = committedEndOf(v)
    if (other != null) {
      send({ type: 'RANGE.ANCHOR', value: other })
      send({ type: 'DRAG.SET', dragging: true })
      // 端点落在邻月里时同样不翻页，不然拖动一开始格子就从指针底下挪走了
      frame.focusAt(v, { keepVisible: outsideMonth })
      setPress({ value: v, role: 'boundary', timer: null })
      return
    }
    // 邻月的日子按下就会翻页，指针原地不动也会压到另一格上：起点等松手再落，不从这里起拖
    if (outsideMonth) {
      setPress({ value: v, role: 'anchor', timer: null, pending: true })
      return
    }
    // 触屏先等一下再拖：更短的一下是轻点，也可能是想滚页面
    if (event.pointerType === 'touch') {
      const timer = scope.getWin().setTimeout(() => {
        const press = refs.get('press')
        if (press?.value === v && press.timer === timer) {
          setPress({ value: v, role: 'anchor', timer: null })
          startDrag(v)
        }
      }, TOUCH_DRAG_DELAY)
      setPress({ value: v, role: 'anchor', timer })
      return
    }
    setPress({ value: v, role: 'anchor', timer: null })
    startDrag(v)
  }

  const pressUp = (v: string): void => {
    const press = refs.get('press')
    if (!press)
      return
    // 按下与松开落在同一格时随后会冒一个 click，那一下不再处理；拖到别格松开不会有 click
    setPress(press.value === v ? { ...press, timer: null, handled: true } : null)
    if (readOnly)
      return
    if (press.timer != null || press.pending) {
      // 起点还没落：触屏轻点抢在延时前抬手，或按的是邻月的日子；同一格松开才算，按普通点选处理
      if (press.timer != null)
        scope.getWin().clearTimeout(press.timer)
      if (press.value === v && !unavailableFor(v)) {
        frame.selectAt(v)
        frame.focusInGrid(v)
      }
      return
    }
    if (unavailableFor(v)) {
      send({ type: 'DRAG.SET', dragging: false })
      return
    }
    // 在已选区间的端点上按下又原地松开：从这一端重新开始挑
    if (press.role === 'boundary' && press.value === v) {
      send({ type: 'RANGE.ANCHOR', value: periodAt(v)?.start ?? v })
      send({ type: 'DRAG.SET', dragging: false })
      return
    }
    // 落起点的那一下原地松开不算收尾；拖到别的格子松手、或第二下按下再松开都收尾。
    // 拖到的那一格必须是指针真扫进去过的：按下那一刻网格换了页，
    // 指针原地没动却压在了另一格上，那一格不算
    const reachedHere = press.value === v || context.get('hoveredValue') === v
    if (anchored && reachedHere && !(press.role === 'anchor' && press.value === v)) {
      frame.selectAt(v)
      frame.focusInGrid(v)
      return
    }
    send({ type: 'DRAG.SET', dragging: false })
  }

  return {
    value,
    focusedValue,
    panels: frame.panels,
    visibleMonth: { year: frame.grid.year, month: frame.grid.month, startValue: frame.grid.startValue },
    weeks: frame.grid.weeks,
    periods: frame.grid.periods,
    weekDays: frame.weekDays,
    headingLabel: frame.grid.headingLabel,
    granularity: frame.granularity,
    activeView: view,
    headingOrder: frame.headingOrder,
    canZoomOutYear: frame.canZoomOutYear,
    canZoomOutMonth: frame.canZoomOutMonth,
    disabled: calendarDisabled,
    readOnly,
    invalid,
    rangeAnchor,
    dragging,
    isSelected,
    isUnavailable,
    canGoPrev: frame.canGoPrev,
    canGoNext: frame.canGoNext,
    canGoPrevYear: frame.canGoPrevYear,
    canGoNextYear: frame.canGoNextYear,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    select: v => frame.selectAt(v),
    setRangeAnchor: next => send({ type: 'RANGE.ANCHOR', value: next == null ? null : (periodAt(next)?.start ?? next) }),
    focus: frame.focusAt,
    setActiveView: next => send({ type: 'VIEW.SET', activeView: next }),
    goToPrevMonth: () => frame.stepMonth(-1),
    goToNextMonth: () => frame.stepMonth(1),
    goToPrevYear: () => frame.stepYear(-1),
    goToNextYear: () => frame.stepYear(1),

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
      'disabled': !frame.canGoPrevYear || undefined,
      'data-disabled': dataAttr(!frame.canGoPrevYear),
      'onClick': () => frame.stepYear(-1),
    }),

    getPrevTriggerProps: () => normalize.button({
      ...parts['prev-trigger'].attrs,
      'type': 'button',
      'disabled': !frame.canGoPrev || undefined,
      'data-disabled': dataAttr(!frame.canGoPrev),
      'onClick': () => frame.stepMonth(-1),
    }),

    getNextTriggerProps: () => normalize.button({
      ...parts['next-trigger'].attrs,
      'type': 'button',
      'disabled': !frame.canGoNext || undefined,
      'data-disabled': dataAttr(!frame.canGoNext),
      'onClick': () => frame.stepMonth(1),
    }),

    getNextYearTriggerProps: () => normalize.button({
      ...parts['next-year-trigger'].attrs,
      'type': 'button',
      'disabled': !frame.canGoNextYear || undefined,
      'data-disabled': dataAttr(!frame.canGoNextYear),
      'onClick': () => frame.stepYear(1),
    }),

    // 标题是网格的可及名字来源
    getHeadingProps: (panel = {}) => normalize.element({
      ...parts.heading.attrs,
      // 每个面板一份 id：两张网格各由自己那行标题命名，读屏才报得出这是哪个月那张
      'id': frame.headingId(panel.index),
      'data-index': frame.panelOf(panel).index,
      'data-view': view,
    }),

    // 标题里的年与月各是一个钮，点它钻上一层。两个都是可选部件：只写 heading 就是从前那条不可点的路。
    // 用原生 disabled 而不是 aria-disabled：它们是单体控件，到顶了就该退出 Tab 序列
    getHeadingYearTriggerProps: (panel = {}) => normalize.button({
      ...parts['heading-year-trigger'].attrs,
      'type': 'button',
      'data-index': frame.panelOf(panel).index,
      'data-view': view,
      'disabled': !frame.canZoomOutYear || undefined,
      'data-disabled': dataAttr(!frame.canZoomOutYear),
      'onClick': () => {
        if (frame.canZoomOutYear)
          frame.zoomTo('year')
      },
    }),

    getHeadingMonthTriggerProps: (panel = {}) => normalize.button({
      ...parts['heading-month-trigger'].attrs,
      'type': 'button',
      'data-index': frame.panelOf(panel).index,
      'data-view': view,
      // 日与周视图以月为容器；其余层收起而不是卸载，钻回来时要原地复现
      'hidden': !frame.canZoomOutMonth || undefined,
      'disabled': !frame.canZoomOutMonth || undefined,
      'data-disabled': dataAttr(!frame.canZoomOutMonth),
      'onClick': () => {
        if (frame.canZoomOutMonth)
          frame.zoomTo('month')
      },
    }),

    // 键盘全在 grid 上收口，格子只管声明自己
    getGridProps: (panel = {}) => normalize.element({
      ...parts.grid.attrs,
      'role': 'grid',
      'aria-labelledby': frame.headingId(panel.index),
      'data-index': frame.panelOf(panel).index,
      // 皮肤按它换排布：日视图铺周行，其余周期直接铺进网格
      'data-view': view,
      // 三条状态都显式给，不省略。区间两端之间的格子都算选中，网格因此恒报可多选
      'aria-multiselectable': 'true',
      'aria-disabled': calendarDisabled ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'data-disabled': dataAttr(calendarDisabled),
      'data-readonly': dataAttr(readOnly),
      'data-dragging': dataAttr(dragging),
      'onKeyDown': (event: KeyboardEvent) => frame.gridKeyDown(event, {
        onCommit: commit,
        onKeyDown: (e) => {
          // 撤掉挑到一半的起点，原来的区间原样还在。不拦默认行为：外层浮层照常收起
          if (e.key === 'Escape') {
            if (anchored)
              send({ type: 'RANGE.ANCHOR', value: null })
            return
          }
          // 焦点要离开网格：挑到一半的区间就地收口，不让起点悬在那儿。按住不放只算一次
          if (e.key === 'Tab' && anchored && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey)
            send({ type: 'RANGE.COMMIT' })
        },
      }),
      // 挂在网格上而非格子上：格子间挪动会成对发 pointerleave/pointerenter，预览会闪。
      // 起点已落下时留住预览：指针出去了，轨道停在它最后扫过的那一格
      'onPointerLeave': () => {
        if (!anchored)
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
    getWeekNumberProps: ({ value: v }) => normalize.element({
      ...parts['week-number'].attrs,
      'role': 'rowheader',
      [ITEM_VALUE_ATTR]: v,
      // 它只是标号，不是可选的格子；读屏念行时带上它即可，不必单独停留
      'aria-hidden': true,
    }),

    getWeekNumberText: ({ value: v }) => frame.weekNumberText(v),

    getWeekDayProps: (day) => {
      const meta = frame.weekDays[day.value]
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
      const { period } = state
      // 补一句完整日期给读屏；解析不出日期时不写
      let label = frame.dateLabel(state.date, period)
      if (label != null && state.isToday)
        label = translations.todayDate(label)
      // 已落定区间的两端多念一遍整段起止，读屏用户不必逐格探
      const [a, b] = committed
      if (label != null && !anchored && a && b && period && (period.start === a.start || period.start === b.start)) {
        const startLabel = frame.dateLabel(parseCalendarDate(a.start), a)
        const endLabel = frame.dateLabel(parseCalendarDate(b.start), b)
        if (startLabel != null && endLabel != null)
          label = `${translations.selectedRange(startLabel, endLabel)}, ${label}`
      }
      // 聚焦格上提示这一下是在开始挑一段、还是在收尾
      const prompt = state.focused && !readOnly && !state.disabled
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
        'onClick': () => frame.cellClick(item, state, {
          // 指针那一路已在按下 / 松开时落定，click 只剩键盘与读屏合成的那一下
          beforeClick: () => {
            const press = refs.get('press')
            if (press?.handled) {
              setPress(null)
              return true
            }
            return false
          },
          onSelect: () => frame.selectAt(item.value),
        }),
        'onPointerDown': (event: PointerEvent) => pressDown(item.value, event, state.outsideMonth),
        'onPointerUp': () => pressUp(item.value),
        // 不可用的格子获得焦点也记锚点，方向键据此起步。
        // 邻月的格子只记聚焦日不翻页：翻了页格子会从指针底下挪走，松开那一下就压在另一格上；
        // 翻页由松开 / click 里的 focusInGrid 做
        'onFocus': () => frame.focusAt(item.value, { keepVisible: state.outsideMonth }),
        // 触屏只在拖动中才跟着手指走预览：轻扫过去是在滚页面
        'onPointerEnter': (event: PointerEvent) => {
          if (!calendarDisabled && !state.disabled && (event.pointerType !== 'touch' || dragging))
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
