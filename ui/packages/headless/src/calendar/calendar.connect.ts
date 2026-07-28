import type { CalendarDate } from '@internationalized/date'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { CalendarApi, CalendarCellProps, CalendarSchema } from './calendar.types'
import { DateFormatter, endOfMonth, getLocalTimeZone, startOfMonth, today } from '@internationalized/date'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { calendarAnatomy } from './calendar.anatomy'
import {
  buildMonthGrid,
  buildWeekDays,
  CALENDAR_LOCALE,
  calendarNavFromKey,
  calendarNavTarget,
  parseCalendarDate,
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

  const locale = prop('locale') ?? CALENDAR_LOCALE
  const timeZone = prop('timeZone') ?? getLocalTimeZone()
  const mode = prop('selectionMode') ?? 'single'
  const calendarDisabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const isDateUnavailable = prop('isDateUnavailable')
  const ids = scope.ids('calendar', 'heading')

  const value = context.get('value')
  const min = parseCalendarDate(prop('min'))
  const max = parseCalendarDate(prop('max'))

  /**
   * 聚焦日三路收口：宿主设过的 → 首个选中值 → 今天。恒非空，展示月由它反推。
   * 解析不了的串一路往后退，绝不让脏值把整棵组件树打空。
   */
  const anchor = parseCalendarDate(context.get('focusedValue'))
    ?? parseCalendarDate(value[0])
    ?? today(timeZone)
  const focusedValue = anchor.toString()
  const todayValue = today(timeZone).toString()

  const grid = buildMonthGrid(focusedValue, { locale, fixedWeeks: !!prop('fixedWeeks') })
  const weekDays = buildWeekDays({
    reference: grid.monthStart,
    locale,
    weekdayFormat: prop('weekdayFormat') ?? 'short',
    timeZone,
  })
  const visibleStart = startOfMonth(anchor)
  const headingLabel = new DateFormatter(locale, { year: 'numeric', month: 'long', timeZone })
    .format(visibleStart.toDate(timeZone))
  const cellLabelFormatter = new DateFormatter(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone,
  })

  /**
   * 生效区间的两端。挑到一半时用「起点 + 悬停落点」预览，悬停为空就跟着聚焦日走——
   * 键盘用户按方向键同样看得见区间在长，不必先摸到鼠标。
   */
  const rangeAnchor = parseCalendarDate(context.get('rangeAnchor'))
  const hovered = parseCalendarDate(context.get('hoveredValue'))
  const rangeEnds = ((): [CalendarDate, CalendarDate] | null => {
    if (mode !== 'range')
      return null
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
    // 解析不了的格子一律当不可用：它既不该被选中，也不该被确认键当成落点
    if (!date)
      return true
    if (min && date.compare(min) < 0)
      return true
    if (max && date.compare(max) > 0)
      return true
    return !!isDateUnavailable?.(v)
  }

  const cellState = (item: CalendarCellProps): CellState => {
    const date = parseCalendarDate(item.value)
    const inRange = !!(rangeEnds && date
      && date.compare(rangeEnds[0]) >= 0 && date.compare(rangeEnds[1]) <= 0)
    return {
      date,
      selected: isSelected(item.value),
      disabled: isUnavailable(item.value),
      // 邻月的日子照样是真日子，只是标出来好让皮肤画淡
      outsideMonth: !date || date.year !== grid.year || date.month !== grid.month,
      isToday: item.value === todayValue,
      focused: item.value === focusedValue,
      inRange,
      // 两端也算 in-range：皮肤要靠这一条画连续底色，端点缺一格底色就断了
      rangeStart: !!(rangeEnds && date && date.compare(rangeEnds[0]) === 0),
      rangeEnd: !!(rangeEnds && date && date.compare(rangeEnds[1]) === 0),
    }
  }

  // cell 与 cell-trigger 共用同一份状态标记，样式层两处一致
  const stateAttrs = (state: CellState): Record<string, string | undefined> => ({
    'data-selected': dataAttr(state.selected),
    'data-disabled': dataAttr(state.disabled),
    'data-outside-month': dataAttr(state.outsideMonth),
    'data-today': dataAttr(state.isToday),
    'data-focused': dataAttr(state.focused),
    'data-in-range': dataAttr(state.inRange),
    'data-range-start': dataAttr(state.rangeStart),
    'data-range-end': dataAttr(state.rangeEnd),
  })

  // 上/下一月按不按得动只看边界：整月都落在 min 之前（或 max 之后）就再没有可看的日子。
  // 用相邻月的月末/月首判，而不是拿聚焦日加减一个月去判——1 月 31 日退一月会被夹成
  // 12 月 31 日，按聚焦日判会把整个 12 月误判成够不着
  const prevMonthEnd = endOfMonth(visibleStart.subtract({ months: 1 }))
  const nextMonthStart = startOfMonth(visibleStart.add({ months: 1 }))
  const canGoPrev = !calendarDisabled && (min == null || prevMonthEnd.compare(min) >= 0)
  const canGoNext = !calendarDisabled && (max == null || nextMonthStart.compare(max) <= 0)

  const focusAt = (next: string): void => send({ type: 'FOCUS.SET', value: next })
  /**
   * 网格内的用户操作（方向键、翻页键、点格子）专用：连带把 DOM 焦点搬到落点那一格。
   *
   * 点击也走这一路，不只是键盘：点邻月的日子会翻月，作者随即重画网格，
   * 用户刚点中的那个节点被换掉，焦点掉回 body——值选上了，键盘却从此接不上。
   */
  const focusInGrid = (next: string): void => send({ type: 'FOCUS.SET', value: next, restoreFocus: true })
  const stepMonth = (amount: 1 | -1): void => {
    focusAt(anchor.add({ months: amount }).toString())
  }

  /** 确认键：选中聚焦日。只读与不可用的日子不认，禁用的日历整条不进来。 */
  const commit = (): void => {
    if (readOnly || isUnavailable(focusedValue))
      return
    send({ type: 'CELL.SELECT', value: focusedValue })
  }

  return {
    value,
    selectionMode: mode,
    focusedValue,
    visibleMonth: { year: grid.year, month: grid.month, startValue: grid.monthStart },
    weeks: grid.weeks,
    weekDays,
    headingLabel,
    disabled: calendarDisabled,
    readOnly,
    isSelected,
    isUnavailable,
    canGoPrev,
    canGoNext,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    select: v => send({ type: 'CELL.SELECT', value: v }),
    focus: focusAt,
    goToPrevMonth: () => stepMonth(-1),
    goToNextMonth: () => stepMonth(1),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(calendarDisabled),
      'data-readonly': dataAttr(readOnly),
    }),

    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
    }),

    // 翻月是单体控件，用原生 disabled：不可聚焦、也进不了 Tab 序列，
    // 这正是「这条路走不通」该有的表现。日期格子才用 aria-disabled（禁用后仍要可聚焦）。
    // 可及名字由作者写在按钮里（文案或 aria-label）：这里编不出正确的本地化文案，
    // 硬塞一句英文只会让中文界面的读屏念出一句英文
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

    // 标题是网格的可及名字来源：读屏进网格先念「2024年2月」，否则一堆数字没有上下文
    getHeadingProps: () => normalize.element({
      ...parts.heading.attrs,
      id: ids.heading,
    }),

    // 键盘全在 grid 上收口：格子只管声明自己，一次冒泡一个处理器
    getGridProps: () => normalize.element({
      ...parts.grid.attrs,
      'role': 'grid',
      'aria-labelledby': ids.heading,
      // 三条状态都显式给：省略只是「没说」，读屏无从区分「不是多选」与「作者忘了标」
      'aria-multiselectable': mode === 'single' ? 'false' : 'true',
      'aria-disabled': calendarDisabled ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'data-disabled': dataAttr(calendarDisabled),
      'data-readonly': dataAttr(readOnly),
      'onKeyDown': (event: KeyboardEvent) => {
        if (calendarDisabled)
          return
        // 返回 null 表示这个键不归日历管，此时绝不 preventDefault（页面滚动与读屏要用）
        const intent = calendarNavFromKey(event)
        if (intent) {
          event.preventDefault()
          focusInGrid(calendarNavTarget(focusedValue, intent, locale))
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          commit()
        }
      },
      // 指针离开整张网格才算不再预览：格子之间挪动时 pointerleave 与 pointerenter 成对发，
      // 挂在格子上会让区间预览在缝隙里闪一下
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

    getWeekDayProps: (day) => {
      const meta = weekDays[day.value]
      return normalize.element({
        ...parts['week-day'].attrs,
        'role': 'columnheader',
        // 可见文本是缩写，读屏得念全称：单独一个「一」既可能是星期一也可能是一号
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
        role: 'gridcell',
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
        // 选中与禁用都标在 trigger 上，因为焦点落的是它：读屏播报的是当下持有焦点那个
        // 节点的状态，标在外层 gridcell 上等于把状态说给一个用户永远停不到的节点听
        'aria-selected': state.selected ? 'true' : 'false',
        // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦，
        // 不可用的日子就再也当不成方向键的起点，用户会在网格里撞上一堵看不见的墙
        'aria-disabled': state.disabled ? 'true' : 'false',
        // 格子上只有一个数字，读屏念「15」毫无上下文，必须补一句完整日期。
        // 声明解析不出日期时宁可不写：编一句别的日子出来比没有名字更糟
        'aria-label': state.date ? cellLabelFormatter.format(state.date.toDate(timeZone)) : undefined,
        // roving tabindex：整张网格只有聚焦日那一格留在 Tab 序列内
        'tabindex': state.focused ? 0 : -1,
        'onClick': () => {
          if (calendarDisabled)
            return
          // 焦点锚点无条件跟着点击走（点了邻月的日子就翻到那个月），
          // 但选中要过只读与可用性这两道；两件事分开判，不可用的日子仍是方向键起点
          focusInGrid(item.value)
          if (readOnly || state.disabled)
            return
          send({ type: 'CELL.SELECT', value: item.value })
        },
        // 焦点是事实不是许可：不可用的格子被点到也记锚点，方向键才知道从哪儿起步
        'onFocus': () => focusAt(item.value),
        'onPointerEnter': () => {
          if (mode === 'range' && !calendarDisabled)
            send({ type: 'HOVER.SET', value: item.value })
        },
      })
    },
  }
}
