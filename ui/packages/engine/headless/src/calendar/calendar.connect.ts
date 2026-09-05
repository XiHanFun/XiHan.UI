import type { CalendarDate } from '@internationalized/date'
import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { CalendarView } from './calendar.grid'
import type { CalendarApi, CalendarCellProps, CalendarPanel, CalendarSchema } from './calendar.types'
import { DateFormatter, endOfMonth, getLocalTimeZone, startOfMonth, today } from '@internationalized/date'
import { dataAttr, ITEM_VALUE_ATTR, resolveLocale } from '@xihan-ui/core'
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
  calendarWeekRange,
  calendarZoomIn,
  isoWeekNumber,
  parseCalendarDate,
  visibleCountOf,
} from './calendar.grid'

const parts = calendarAnatomy.build()

/** 一格的派生状态。连接层每帧按作者声明现算，不留任何缓存。 */
interface CellState {
  date: CalendarDate | null
  selected: boolean
  disabled: boolean
  outsideMonth: boolean
  isToday: boolean
  focused: boolean
  inRange: boolean
  rangeStart: boolean
  rangeEnd: boolean
}

export function connectCalendar<T extends PropTypes>(
  service: Service<CalendarSchema>,
  normalize: NormalizeProps<T>,
): CalendarApi<T> {
  const { context, prop, send, scope } = service

  const locale = resolveLocale(prop('locale'), scope)
  const timeZone = prop('timeZone') ?? getLocalTimeZone()
  const mode = prop('selectionMode') ?? 'single'
  const calendarDisabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const isDateUnavailable = prop('isDateUnavailable')
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

  // 两件事：base 是作者要挑的粒度（点一格即选中的那一档），view 是人此刻钻到了哪一层
  const base = prop('view') ?? 'day'
  const view = context.get('activeView')
  // 钻回 base 的下一站；非空即「点一格是往下钻，不是选中」
  const zoomIn = calendarZoomIn(view, base)
  // 周选只在日视图 + 区间下讲得通：它落的是两端
  const weekSelection = !!prop('weekSelection') && view === 'day' && mode === 'range'
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
        weekNumbers: g.weeks.map(row => isoWeekNumber(row[3]!.value)),
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
      cells: g.cells,
      headingLabel: g.headingLabel,
      // 年视图的标题是整个十年跨度（2020年-2029年），钻不上去了，那一截就是它
      headingYear: view === 'year' ? g.headingLabel : pieces.year,
      // 月与季度这两层没有「月」那一截可点
      headingMonth: '',
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

  /** 生效区间的两端。挑到一半时用「起点 + 悬停落点」预览，悬停为空就跟着聚焦日走。 */
  const rangeAnchor = parseCalendarDate(context.get('rangeAnchor'))
  const hovered = parseCalendarDate(context.get('hoveredValue'))
  const rangeEnds = ((): [CalendarDate, CalendarDate] | null => {
    if (mode !== 'range')
      return null
    // 周选：一格一格拉出来的区间在这里讲不通——两端恒落在整周的外缘。
    // 挑到一半时从起点周铺到悬停那一周，都整周整周地亮，与点下去的结果对得上
    if (weekSelection) {
      const week = (d: CalendarDate): [string, string] => calendarWeekRange(d.toString(), locale)
      if (rangeAnchor) {
        const [aFrom, aTo] = week(rangeAnchor)
        const [hFrom, hTo] = week(hovered ?? anchor)
        return [
          parseCalendarDate(aFrom <= hFrom ? aFrom : hFrom)!,
          parseCalendarDate(aTo >= hTo ? aTo : hTo)!,
        ]
      }
      // 还没落起点：指针扫过哪一周就整周预览那一周
      if (hovered) {
        const [from, to] = week(hovered)
        return [parseCalendarDate(from)!, parseCalendarDate(to)!]
      }
    }
    if (rangeAnchor) {
      const end = hovered ?? anchor
      return rangeAnchor.compare(end) <= 0 ? [rangeAnchor, end] : [end, rangeAnchor]
    }
    const [a, b] = [parseCalendarDate(value[0]), parseCalendarDate(value[1])]
    return a && b ? [a, b] : null
  })()

  const isSelected = (v: string): boolean => value.includes(v)

  const isUnavailable = (v: string): boolean => {
    if (calendarDisabled)
      return true
    const date = parseCalendarDate(v)
    // 解析不了的格子一律当不可用
    if (!date)
      return true
    if (min && date.compare(min) < 0)
      return true
    if (max && date.compare(max) > 0)
      return true
    return !!isDateUnavailable?.(v)
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
  const focusedCell = calendarPeriodOf(focusedValue, view)

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
          if (day.inMonth)
            ownerOf.set(day.value, panel.index)
        }
      }
      continue
    }
    for (const cell of panel.cells) {
      if (cell.inView)
        ownerOf.set(cell.value, panel.index)
    }
  }

  const cellState = (item: CalendarCellProps): CellState => {
    const date = parseCalendarDate(item.value)
    const panel = panelOf(item)
    // 认领这一天的是并排的另一张面板：这一张只显示日号
    const ownedElsewhere = (ownerOf.get(item.value) ?? panel.index) !== panel.index
    const inRange = !ownedElsewhere && !!(rangeEnds && date
      && date.compare(rangeEnds[0]) >= 0 && date.compare(rangeEnds[1]) <= 0)
    return {
      date,
      selected: !ownedElsewhere && isSelected(item.value),
      disabled: isUnavailable(item.value),
      // 页外的格子照样可点可聚焦，标出来供皮肤区分。日视图按「是不是本月」判；
      // 粗粒度视图的格子值是那一段的第一天，与面板起点比月份恒不相等，改用网格自报的 inView
      outsideMonth: view === 'day'
        ? (!date || date.year !== panel.year || date.month !== panel.month)
        : panel.cells.some(cell => cell.value === item.value && !cell.inView),
      isToday: item.value === todayValue,
      focused: item.value === focusedCell,
      inRange,
      // 两端也算 in-range
      rangeStart: !ownedElsewhere && !!(rangeEnds && date && date.compare(rangeEnds[0]) === 0),
      rangeEnd: !ownedElsewhere && !!(rangeEnds && date && date.compare(rangeEnds[1]) === 0),
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
    'data-range-start': dataAttr(state.rangeStart),
    'data-range-end': dataAttr(state.rangeEnd),
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
  const canZoomOutMonth = !calendarDisabled && view === 'day'

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

  /**
   * 选中一格。周选打开时点任意一天落的是整整一周（两端一起给），
   * 其余情形照旧只落这一天。
   */
  const selectAt = (value: string): void => {
    if (!weekSelection) {
      send({ type: 'CELL.SELECT', value })
      return
    }
    const [from, to] = calendarWeekRange(value, locale)
    // 还没落起点：把这一周的首日交给区间那套，rangeAnchor 就位后悬停预览才接得上
    if (!rangeAnchor) {
      send({ type: 'CELL.SELECT', value: from })
      return
    }
    // 已有起点：区间的两端是「起点周与终点周」各自朝外那一头，
    // 于是选出来的恒是整周的整数倍——第 33 周到第 37 周，而不是某天到某天
    const [anchorFrom, anchorTo] = calendarWeekRange(rangeAnchor.toString(), locale)
    send({
      type: 'VALUE.SET',
      value: [anchorFrom <= from ? anchorFrom : from, anchorTo >= to ? anchorTo : to],
    })
  }

  /** 确认键：选中聚焦日。只读与不可用的日子不认，禁用的日历整条不进来。 */
  const commit = (): void => {
    // 还没钻到作者要的那一档：确认键的意思是「进这一格看看」，不是选中它
    if (zoomIn) {
      drillInto(focusedCell, zoomIn)
      return
    }
    if (readOnly || isUnavailable(focusedValue))
      return
    selectAt(focusedValue)
  }

  return {
    value,
    selectionMode: mode,
    focusedValue,
    panels,
    visibleMonth: { year: grid.year, month: grid.month, startValue: grid.startValue },
    weeks: grid.weeks,
    weekDays,
    headingLabel,
    view: base,
    activeView: view,
    headingOrder: calendarHeadingPieces(visibleStart, locale, timeZone).order,
    canZoomOutYear,
    canZoomOutMonth,
    disabled: calendarDisabled,
    readOnly,
    isSelected,
    isUnavailable,
    canGoPrev,
    canGoNext,
    canGoPrevYear,
    canGoNextYear,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    select: v => selectAt(v),
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
      // 只有日视图有月这一截；其余层收起而不是卸载，钻回来时要原地复现
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
      // 皮肤按它换排布：日视图铺周行，粗粒度视图把格子直接铺进网格
      'data-view': view,
      // 三条状态都显式给，不省略
      'aria-multiselectable': mode === 'single' ? 'false' : 'true',
      'aria-disabled': calendarDisabled ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'data-disabled': dataAttr(calendarDisabled),
      'data-readonly': dataAttr(readOnly),
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
        }
      },
      // 挂在网格上而非格子上：格子间挪动会成对发 pointerleave/pointerenter，预览会闪
      'onPointerLeave': () => {
        if (mode === 'range')
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
      return normalize.element({
        ...parts['cell-trigger'].attrs,
        ...stateAttrs(state),
        // 导航与选中都以此为格子身份；翻月后靠它在活 DOM 里找回落点
        [ITEM_VALUE_ATTR]: item.value,
        'role': 'button',
        // 禁用标在 trigger 上，焦点落的是它；选中态由外层 gridcell 报
        // 一律 aria-disabled 不用原生 disabled：不可用的日子仍要能当方向键起点
        'aria-disabled': state.disabled ? 'true' : 'false',
        // 补一句完整日期给读屏；解析不出日期时不写
        'aria-label': state.date ? cellLabelFormatter.format(state.date.toDate(timeZone)) : undefined,
        // roving tabindex：整张网格只有聚焦日那一格留在 Tab 序列内
        'tabindex': state.focused ? 0 : -1,
        'onClick': () => {
          if (calendarDisabled)
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
          selectAt(item.value)
        },
        // 不可用的格子获得焦点也记锚点，方向键据此起步
        'onFocus': () => focusAt(item.value),
        'onPointerEnter': () => {
          if (mode === 'range' && !calendarDisabled)
            send({ type: 'HOVER.SET', value: item.value })
        },
      })
    },
  }
}
