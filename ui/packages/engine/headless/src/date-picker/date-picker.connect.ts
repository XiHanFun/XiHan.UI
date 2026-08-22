import type { NavIntent } from '@xihan-ui/behavior'
import type { Dict, NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { DateFieldApi, DateFieldSchema, DateSegmentType } from '../date-field'
import type { TimePickerColumn } from '../time-picker'
import type {
  DatePickerApi,
  DatePickerFieldApi,
  DatePickerPresetState,
  DatePickerServices,
  DatePickerTimeUnit,
  DatePickerTranslations,
} from './date-picker.types'
import { focusSafely, navIntentFromKey, readDirection, stepIndex } from '@xihan-ui/behavior'
import { dataAttr, normalizeProps } from '@xihan-ui/kernel'
import { connectCalendar } from '../calendar'
import {
  applySegmentDigit,
  connectDateField,
  dateFieldAnatomy,
  dateSegmentRange,
  parseBoundary,
  segmentMaxDigits,
} from '../date-field'
import { overlayPositioned } from '../shared/overlay'
import { timePickerColumns } from '../time-picker'
import { datePickerAnatomy } from './date-picker.anatomy'
import { DATE_PICKER_DEFAULT_PLACEMENT } from './date-picker.machine'
import { datePickerPresetDates } from './date-picker.presets'
import { datePickerDatePart, datePickerJoinDateTime, datePickerSetTimeUnit, datePickerTimePart } from './date-picker.time'

const parts = datePickerAnatomy.build()
/** 段位的 CSS 选择器，取自分段输入那一份解剖。 */
const SEGMENT_SELECTOR = dateFieldAnatomy.build().segment.selector

const DIGIT = /^\d$/

function hasModifier(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey
}

function resolveTranslations(input: Partial<DatePickerTranslations> | undefined): DatePickerTranslations {
  return {
    startDate: input?.startDate ?? 'Start date',
    endDate: input?.endDate ?? 'End date',
    presets: input?.presets ?? 'Shortcuts',
    clearTrigger: input?.clearTrigger ?? 'Clear',
  }
}

/** 选中集合与这条快捷选项逐位相同（长度也要一样，只落了起点的区间不算选中）。 */
function sameDates(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_date-picker-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

export function connectDatePicker<T extends PropTypes>(
  services: DatePickerServices,
  normalize: NormalizeProps<T>,
): DatePickerApi<T> {
  const { state, prop, send, context, scope } = services.root
  const open = state.get() === 'open'
  // 两组段位容器各占一个 id：同一份 id 出现两次会被判成重复 id
  const ids = scope.ids('date-picker', 'label', 'trigger', 'content', 'segment-group', 'segment-group-end')

  const value = context.get('value')
  // 空串是区间里空缺那一端的占位，算数的只有填了的
  const filled = value.filter(v => v !== '')
  const selectionMode = prop('selectionMode') ?? 'single'
  const range = selectionMode === 'range'
  const label = resolveTranslations(prop('translations'))
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  // 只读与禁用都改不了选中值，禁用还额外展不开浮层
  const interactive = !disabled && !readOnly
  const canClear = interactive && filled.length > 0
  const stateAttr = open ? 'open' : 'closed'
  // connect 在 render 期求值，不得读 DOM：位置只读引擎写进 context 的结果
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? DATE_PICKER_DEFAULT_PLACEMENT

  // 内嵌日历：整份 api 原样转发
  const calendar = connectCalendar(services.calendar, normalize)

  // —— showTime：值升格为 datetime，面板里多出时间列，收口交给确认按钮 ——
  const showTime = !!prop('showTime') && selectionMode === 'single'
  const timeGranularity = prop('timeGranularity') ?? 'minute'
  // 内嵌面板恒为 24 小时制，生成函数因此不会给出上下午那一列；滤一道把这件事写进类型里
  const timeColumns: readonly TimePickerColumn<DatePickerTimeUnit>[] = showTime
    ? timePickerColumns({ granularity: timeGranularity, hourCycle: 24 })
        .filter((column): column is TimePickerColumn<DatePickerTimeUnit> => column.unit !== 'dayPeriod')
    : []
  const timeValue = showTime && filled[0] != null ? datePickerTimePart(filled[0]) : null

  /** 时间列里那一段在 'HH:mm[:ss]' 里排第几。 */
  const timeSlotOf = (unit: DatePickerTimeUnit): number => (unit === 'hour' ? 0 : unit === 'minute' ? 1 : 2)

  /**
   * 一列此刻的 Tab 落点：选中的那一项，还没选就落头一项。
   *
   * 不另立「聚焦到哪一项」的状态：这几列只是选个数，落点由选中值推得出来，
   * 焦点本身交给 DOM。列里一格都没有时给 null，那时 Tab 位归列自己。
   */
  const timeAnchorOf = (unit: DatePickerTimeUnit): string | null => {
    const column = timeColumns.find(c => c.unit === unit)
    if (!column?.options.length)
      return null
    const picked = timeValue?.split(':')[timeSlotOf(unit)]
    return picked != null && column.options.includes(picked) ? picked : column.options[0]!
  }

  /** 一列里的全部选项，文档序。事件那一刻现查，不缓存节点数组。 */
  const timeItemsIn = (column: HTMLElement | null): HTMLElement[] =>
    column ? [...column.querySelectorAll<HTMLElement>(parts['time-item'].selector)] : []

  /** 同一份浮层里露出来的那几列。收起的列（没开 showTime）不算一站。 */
  const timeColumnsIn = (from: HTMLElement): HTMLElement[] => {
    const content = from.closest<HTMLElement>(parts.content.selector)
      ?? from.closest<HTMLElement>(parts.root.selector)
    return content
      ? [...content.querySelectorAll<HTMLElement>(parts['time-column'].selector)].filter(el => !el.hasAttribute('hidden'))
      : []
  }

  /** 换列：落到目标列的 Tab 落点上（选中项，没有就头一项）。 */
  const moveTimeColumn = (from: HTMLElement, intent: NavIntent): void => {
    const live = timeColumnsIn(from)
    const at = stepIndex(live.length, live.indexOf(from), intent, { loop: false })
    if (at < 0)
      return
    const items = timeItemsIn(live[at]!)
    const unit = live[at]!.getAttribute('data-unit') as DatePickerTimeUnit | null
    const anchor = unit ? timeAnchorOf(unit) : null
    focusSafely(items.find(el => el.getAttribute('data-value') === anchor) ?? items[0])
  }

  // —— 快捷选项：一条选项就是一次整份写值 ——
  /** 这条选项带的日期数与选择模式合不合：单选恰一条、区间恰两条、多选至少一条。 */
  const fitsSelection = (dates: readonly string[]): boolean =>
    selectionMode === 'single' ? dates.length === 1 : selectionMode === 'range' ? dates.length === 2 : dates.length >= 1
  const presetInput = prop('presets') ?? []
  const presets: readonly DatePickerPresetState[] = presetInput.map((preset) => {
    const dates = datePickerPresetDates(preset.value)
    // 与模式不配、或有哪一天落在 min/max 之外 / 被作者判为不可用的，按下不写值；
    // 选中判定只看日期段：showTime 下值里带着时间
    const presetDisabled = !!preset.disabled || !fitsSelection(dates) || dates.some(d => calendar.isUnavailable(d))
    const selected = dates.length > 0 && sameDates(filled.map(datePickerDatePart), dates)
    return { ...preset, dates, disabled: presetDisabled, selected }
  })

  /** 一列里的全部选项，文档序。事件那一刻现查，不缓存节点数组。 */
  const presetItemsIn = (from: HTMLElement): HTMLElement[] => {
    const list = from.closest<HTMLElement>(parts.presets.selector)
    return list ? [...list.querySelectorAll<HTMLElement>(parts.preset.selector)] : []
  }

  /**
   * 这一列此刻的 Tab 落点：命中的那一条，没命中就落头一条。
   * 不另立「聚焦到哪一条」的状态——落点由选中值推得出来，焦点本身交给 DOM。
   */
  const presetAnchor = presets.find(p => p.selected && !p.disabled)?.value
    ?? presets.find(p => !p.disabled)?.value
    ?? presets[0]?.value
    ?? null

  /**
   * 点快捷选项：整份日期一次写进去，收不收浮层由 closeOnSelect 那条守卫决定。
   * showTime 下日期要拼上此刻的时间段（还没有就零点），不然会把已挑好的时间抹掉。
   */
  const pickPreset = (value: string): void => {
    const preset = presets.find(p => p.value === value)
    if (!interactive || !preset || preset.disabled)
      return
    const next = showTime
      ? preset.dates.map(date => datePickerJoinDateTime(date, timeValue, timeGranularity))
      : preset.dates
    send({ type: 'VALUE.SET', value: next, src: 'preset' })
  }

  /** 点时间选项：该单位写进值；还没有日期时以聚焦日起值。 */
  const pickTimeUnit = (unit: 'hour' | 'minute' | 'second', next: string): void => {
    if (!interactive)
      return
    const date = filled[0] != null ? datePickerDatePart(filled[0]) : calendar.focusedValue
    const nextTime = datePickerSetTimeUnit(timeValue, unit, next, timeGranularity)
    send({ type: 'VALUE.SET', value: [datePickerJoinDateTime(date, nextTime, timeGranularity)], src: 'api' })
  }

  /**
   * 内嵌分段输入用恒等归一化连一次，拿到原始 prop 字典。
   *
   * 不能传调用方的归一化器：它已把 onKeyDown 改成各框架的事件键名，再覆盖会变成两个键、两个处理器。
   */
  const fieldRaw = connectDateField(services.field, normalizeProps)
  const fieldEndRaw = services.fieldEnd ? connectDateField(services.fieldEnd, normalizeProps) : null
  const bounds = { min: parseBoundary(prop('min')), max: parseBoundary(prop('max')) }

  /**
   * 同一份分段输入里的全部段位，文档序。事件那一刻现查，不缓存节点数组。
   *
   * 不走 queryItems：它按容器自己的 part 过滤归属，而段位属于分段输入那份解剖，会被全部滤掉。
   */
  const segmentsIn = (from: HTMLElement): HTMLElement[] => {
    const host = from.closest<HTMLElement>(parts['segment-group'].selector)
      ?? from.closest<HTMLElement>(parts.root.selector)?.querySelector<HTMLElement>(parts['segment-group'].selector)
    return host ? [...host.querySelectorAll<HTMLElement>(SEGMENT_SELECTOR)] : []
  }

  // granularity 之外的段带 hidden 留在文档里，换段必须跳过
  const isSpare = (el: HTMLElement): boolean => el.hasAttribute('hidden')

  const focusSegmentAt = (nodes: HTMLElement[], index: number): void => {
    if (index >= 0)
      focusSafely(nodes[index])
  }

  const moveSegment = (from: HTMLElement, intent: NavIntent): void => {
    const nodes = segmentsIn(from)
    focusSegmentAt(nodes, stepIndex(nodes.length, nodes.indexOf(from), intent, {
      loop: false,
      skip: i => isSpare(nodes[i]!),
    }))
  }

  /** 同一份分段输入里第一个没被 granularity 收起的段位。 */
  const firstSegmentIn = (from: HTMLElement): HTMLElement | undefined => {
    const nodes = segmentsIn(from)
    return nodes[stepIndex(nodes.length, -1, 'first', { skip: i => isSpare(nodes[i]!) })]
  }

  const focusFirstSegment = (from: HTMLElement): void => {
    focusSafely(firstSegmentIn(from))
  }

  /**
   * 这一下数字键会不会把本段敲满。必须在 onKeyDown 写入之前算：写完缓冲即被清空。
   */
  const digitFillsSegment = (
    service: Service<DateFieldSchema>,
    event: KeyboardEvent,
    type: DateSegmentType,
  ): boolean => {
    if (!DIGIT.test(event.key))
      return false
    const live = service.context.get('segments')
    const buffer = service.context.get('typing')
    const result = applySegmentDigit(
      buffer?.segment === type ? buffer.digits : '',
      event.key,
      { range: dateSegmentRange(type, live, bounds), maxDigits: segmentMaxDigits(type) },
    )
    return !!result?.complete
  }

  /** 把一组段位包成对外那一面：换段在这里补，其余原样转发。hiddenValue 覆盖表单出口（showTime 提交 datetime）。 */
  const toFieldApi = (
    service: Service<DateFieldSchema>,
    raw: DateFieldApi,
    hiddenValue?: string,
  ): DatePickerFieldApi<T> => ({
    value: raw.value,
    segments: raw.segments,
    complete: raw.complete,
    empty: raw.empty,
    outOfRange: raw.outOfRange,
    segmentOf: raw.segmentOf,

    getSegmentProps: (item) => {
      const base = raw.getSegmentProps(item) as Dict
      // 作者按下标还是按段名声明的都认，两条路的落点由分段输入自己算
      const type = raw.segmentOf(item)?.type
      const onKeyDown = base.onKeyDown as ((event: KeyboardEvent) => void) | undefined
      // 精度用不上的段：分段输入不挂处理器，这里也不补
      if (type == null || onKeyDown == null)
        return normalize.element(base)
      return normalize.element({
        ...base,
        onKeyDown: (event: KeyboardEvent) => {
          const el = event.currentTarget as HTMLElement
          const fills = interactive && !hasModifier(event) && digitFillsSegment(service, event, type)
          // 值那一路交给分段输入：加减、直填、清段与拦默认行为都在它手里
          onKeyDown(event)
          // 换段由这里补：分段输入按自己的根选择器找同组段位，而这里没有那个根节点
          if (!interactive || hasModifier(event))
            return
          if (fills) {
            moveSegment(el, 'next')
            return
          }
          // 只认水平轴与 Home/End；上下键是改值，已由分段输入接走
          const intent = navIntentFromKey(event, { axis: 'horizontal', dir: readDirection(event.currentTarget as Element) })
          if (intent)
            moveSegment(el, intent)
        },
      })
    },

    getHiddenInputProps: () => normalize.input({
      ...raw.getHiddenInputProps() as Dict,
      ...(hiddenValue !== undefined ? { value: hiddenValue } : {}),
    }),
  })

  // showTime 下表单提交整个 datetime，段位里只显示日期段
  const field = toFieldApi(services.field, fieldRaw, showTime ? (filled[0] ?? '') : undefined)
  // 终点那一组只在区间模式下露出
  const fieldEnd = range && services.fieldEnd && fieldEndRaw
    ? toFieldApi(services.fieldEnd, fieldEndRaw)
    : null

  return {
    open,
    value,
    valueAsString: filled[0] ?? null,
    selectionMode,
    // 取日历已收口的结果（宿主设过的 → 首个选中值 → 今天），不在这里重算
    focusedValue: calendar.focusedValue,
    view: calendar.view,
    activeView: calendar.activeView,
    disabled,
    readOnly,
    invalid,
    canClear,
    presets,
    showTime,
    timeColumns,
    timeValue,
    calendar,
    field,
    fieldEnd,
    setOpen: (next) => {
      if (next !== open)
        send({ type: next ? 'OPEN' : 'CLOSE' })
    },
    setValue: next => send({ type: 'VALUE.SET', value: next, src: 'api' }),
    clear: () => send({ type: 'VALUE.CLEAR' }),
    setActiveView: next => send({ type: 'VIEW.SET', activeView: next }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 三个视觉轴打在根与 positioner 上，输入行与浮层里的部件各从就近的那一处继承皮肤声明的私有槽
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      // 段位是 div，不能用 <label for>；点标题落到首段由下面的 onClick 接管
      'data-disabled': dataAttr(disabled),
      'onClick': (event: MouseEvent) => {
        if (!disabled)
          focusFirstSegment(event.currentTarget as HTMLElement)
      },
    }),

    // 输入行整体，同时是浮层的定位锚点
    // 点输入行就展开：日期这种东西多数人是来挑的，不该逼着先去点那个小箭头。
    // 触发钮仍是可选部件，留着给键盘与读屏用户一个明写的入口（它才带 aria-haspopup / aria-expanded）
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'onClick': (event: MouseEvent) => {
        if (disabled)
          return
        // 触发钮与清空钮各有自己的处理器，落在它们身上的这一下不归这里
        const el = event.target as Element | null
        if (el?.closest(parts.trigger.selector) || el?.closest(parts['clear-trigger'].selector))
          return
        // 再点一下收起：点开与收起对称，不然浮层展开后指针那条路就没有出口了
        // （段位敲出来的值不触发"选完即收"，触发钮又是可选部件）
        if (open) {
          send({ type: 'CLOSE' })
          return
        }
        // src=control：这一下的用意是编辑段位，焦点得留在段上，不搬进浮层
        send({ type: 'OPEN', src: 'control' })
      },
    }),

    // 分段容器：role=group 把一排段位兜成整体。单值时名字由 label 提供，
    // 区间的两组各自报名字，否则读屏念出来的是同一个。
    // 它同时承担内嵌分段输入的 root/control 两个部件，不另挂分段输入的根节点
    getSegmentGroupProps: ({ index = 0 } = {}) => {
      const end = index === 1
      const raw = end ? fieldEndRaw : fieldRaw
      const outOfRange = !!raw?.outOfRange
      return normalize.element({
        ...parts['segment-group'].attrs,
        'id': end ? ids['segment-group-end'] : ids['segment-group'],
        'data-index': String(index),
        'role': 'group',
        'aria-labelledby': range ? undefined : ids.label,
        'aria-label': range ? (end ? label.endDate : label.startDate) : undefined,
        'aria-disabled': disabled ? 'true' : 'false',
        'data-disabled': dataAttr(disabled),
        'data-readonly': dataAttr(readOnly),
        'data-invalid': dataAttr(invalid || outOfRange),
        'data-empty': dataAttr(!!raw?.empty),
        'data-complete': dataAttr(!!raw?.complete),
        'data-out-of-range': dataAttr(outOfRange),
        // 触发钮是可选部件，键盘那条入口不能只挂在它身上：Alt+ArrowDown 是下拉类控件通用的展开键。
        // 挂在分段容器而不是段位上——段位属于分段输入那份解剖，keydown 冒到这儿一样收得到
        'onKeyDown': (event: KeyboardEvent) => {
          if (disabled)
            return
          // Alt+ArrowDown 展开：下拉类控件通用的展开键，段位原本就不认它
          if (!open && event.altKey && event.key === 'ArrowDown') {
            event.preventDefault()
            send({ type: 'OPEN', src: 'trigger' })
            return
          }
          // Enter 收起:段位里敲出来的值不触发"选完即收"(那时人还在打字),
          // 于是得给一个"我填完了"的手势。触发钮是可选部件,不能指望人去点那个箭头
          if (open && !event.altKey && event.key === 'Enter') {
            event.preventDefault()
            send({ type: 'CLOSE' })
          }
        },
      })
    },

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      // 用原生 disabled，不可聚焦也不派 click；只读不禁用，日历仍能展开
      'disabled': disabled || undefined,
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      // 图标按钮无文字，名字借标题；作者写的 aria-label 会盖过这条
      'aria-labelledby': ids.label,
      'data-state': stateAttr,
      // 有值时清空钮会顶上来：皮肤据此让位，两个钮不并排堆在框里
      'data-clearable': dataAttr(canClear),
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        // 守卫防程序化派发（原生 disabled 不派 click）
        if (!disabled)
          send({ type: 'TOGGLE', src: 'trigger' })
      },
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      // 不进 Tab 序列：段位上按退格即可清值；读屏仍能按名字找到它
      'tabindex': -1,
      'aria-label': label.clearTrigger,
      // 没值就整个收起：有值才出现，出现即可用
      'hidden': !canClear || undefined,
      // 不拦的话浏览器会把焦点挪到这个按钮上，清完焦点就落在一个隐身节点里
      'onPointerDown': (event: PointerEvent) => {
        if (event.button === 0)
          event.preventDefault()
      },
      'onClick': (event: MouseEvent) => {
        if (!canClear)
          return
        send({ type: 'VALUE.CLEAR' })
        // pointerdown 已拦掉默认聚焦，键盘/程序化激活这一路则要主动把焦点送回首段
        focusFirstSegment(event.currentTarget as HTMLElement)
      },
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
      'dir': prop('dir'),
      // 视觉轴在浮层这一侧再打一次：positioner 被搬到 portal 落点，继承不到根上的私有槽
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      // 锚点被滚出可视区时引擎置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      // 落位才露：皮肤基线把定位层藏着，带这个才显示。展开那几帧坐标还没算出来时就是藏的
      'data-positioned': dataAttr(overlayPositioned(position)),
      'style': {
        position: 'fixed',
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
        ...availableHeightVar(position?.availableHeight),
      },
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      // 浮层是个非模态对话框：trigger 那边报的是 aria-haspopup="dialog"，两处得对上。
      // 模态与否显式说，省略只是「没说」
      'role': 'dialog',
      'aria-modal': 'false',
      'aria-labelledby': ids.label,
      // 写 -1 而不是整个不给：它是可滚动容器，某些浏览器会把可滚动区域自动塞进 Tab 序列
      'tabindex': -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
    }),

    // 键盘挂在这一列自己身上，不挂 content：同一份浮层里还有日历那张网格与时间列，
    // 它们各吃各的方向键，两个处理器挂同一个节点会互相抢
    getPresetsProps: () => normalize.element({
      ...parts.presets.attrs,
      'role': 'listbox',
      'aria-label': label.presets,
      'aria-orientation': 'vertical',
      // 单选与否必须显式说，省略只是「没说」
      'aria-multiselectable': 'false',
      'aria-disabled': disabled ? 'true' : 'false',
      'hidden': presets.length === 0 || undefined,
      // 一条都没有时由列自己接住焦点——它是 role=listbox 且有名字
      'tabindex': presetAnchor == null ? 0 : -1,
      'onKeyDown': (event: KeyboardEvent) => {
        if (disabled || hasModifier(event))
          return
        const items = presetItemsIn(event.currentTarget as HTMLElement)
        const current = (event.target as HTMLElement | null)?.closest<HTMLElement>(parts.preset.selector) ?? null

        // 上下键与 Home/End 在列内走，到头回绕——一列就是一圈选项
        const within = navIntentFromKey(event, { axis: 'vertical' })
        if (within) {
          event.preventDefault()
          const at = stepIndex(items.length, current ? items.indexOf(current) : -1, within, { loop: true })
          if (at >= 0)
            focusSafely(items[at])
          return
        }

        if (event.key === 'Enter' || event.key === ' ') {
          // 焦点还在列上（这一列是空的）时没有可落的条目
          if (!current)
            return
          event.preventDefault()
          const value = current.getAttribute('data-value')
          if (value != null)
            pickPreset(value)
        }
      },
    }),

    getPresetProps: ({ value: v }) => {
      const preset = presets.find(p => p.value === v)
      const presetDisabled = disabled || !!preset?.disabled
      return normalize.element({
        ...parts.preset.attrs,
        'role': 'option',
        // listbox 的选中语义是 aria-selected；未选中也要显式输出 false
        'aria-selected': preset?.selected ? 'true' : 'false',
        // 集合条目一律 aria-disabled，不用原生 disabled：原生 disabled 不可聚焦、不派 click
        'aria-disabled': presetDisabled ? 'true' : 'false',
        'data-value': v,
        'data-state': preset?.selected ? 'checked' : 'unchecked',
        'data-disabled': dataAttr(presetDisabled),
        // roving tabindex：只有落点那一条留在 Tab 序列内，其余靠方向键到达
        'tabindex': presetAnchor === v ? 0 : -1,
        'onClick': () => pickPreset(v),
      })
    },

    // 内嵌日历的挂载点，同时充当日历的根节点：日历自己的 root 部件在这里由它承担，
    // 状态标记照日历那份抄一遍，皮肤两边写法一致
    getCalendarProps: () => normalize.element({
      ...parts.calendar.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
    }),

    // 键盘在列上收口，选项只管声明自己。挂列不挂 content：同一份浮层里还有日历那张网格，
    // 它自己吃方向键，两个处理器挂同一个节点会互相抢
    getTimeColumnProps: ({ unit }) => normalize.element({
      ...parts['time-column'].attrs,
      'role': 'listbox',
      'aria-label': unit,
      'aria-orientation': 'vertical',
      // 单选与否必须显式说，省略只是「没说」
      'aria-multiselectable': 'false',
      'aria-disabled': disabled ? 'true' : 'false',
      'data-unit': unit,
      'hidden': !showTime || undefined,
      // 列里一格都没有时由列自己接住焦点——它是 role=listbox 且有名字，
      // 否则这一列连一个 Tab 停靠点都没有
      'tabindex': showTime && timeAnchorOf(unit) == null ? 0 : -1,
      'onKeyDown': (event: KeyboardEvent) => {
        if (disabled || event.ctrlKey || event.metaKey || event.altKey)
          return
        const column = event.currentTarget as HTMLElement
        const items = timeItemsIn(column)
        // 焦点在哪一格：事件从那一格冒上来。落在列自己身上时从头一格起步
        const current = (event.target as HTMLElement | null)?.closest<HTMLElement>(parts['time-item'].selector) ?? null

        // 上下键与 Home/End 在列内走，到头回绕——一列就是一圈数
        const within = navIntentFromKey(event, { axis: 'vertical' })
        if (within) {
          event.preventDefault()
          const at = stepIndex(items.length, current ? items.indexOf(current) : -1, within, { loop: true })
          if (at >= 0)
            focusSafely(items[at])
          return
        }

        // 左右键换列，两端停住
        const across = navIntentFromKey(event, { axis: 'horizontal', home: false, dir: readDirection(event.currentTarget as Element) })
        if (across) {
          event.preventDefault()
          moveTimeColumn(column, across)
          return
        }

        if (event.key === 'Enter' || event.key === ' ') {
          // 焦点还在列上（这一列是空的）时没有可落的格
          if (!current)
            return
          event.preventDefault()
          const value = current.getAttribute('data-value')
          if (value != null)
            pickTimeUnit(unit, value)
        }
      },
    }),

    getTimeItemProps: ({ unit, value: v }) => {
      const selected = timeValue?.split(':')[timeSlotOf(unit)] === v
      return normalize.element({
        ...parts['time-item'].attrs,
        'role': 'option',
        'aria-selected': selected ? 'true' : 'false',
        'data-unit': unit,
        'data-value': v,
        // 与其余 role=option 组件同一套选中编码
        'data-state': selected ? 'checked' : 'unchecked',
        // roving tabindex：每列只有落点那一格留在 Tab 序列内，其余靠方向键到达
        'tabindex': timeAnchorOf(unit) === v ? 0 : -1,
        'onClick': () => pickTimeUnit(unit, v),
      })
    },

    // showTime 的收口：选完日子与时间由它收浮层
    getConfirmTriggerProps: () => normalize.button({
      ...parts['confirm-trigger'].attrs,
      type: 'button',
      hidden: !showTime || undefined,
      onClick: () => send({ type: 'CLOSE' }),
    }),
  }
}
