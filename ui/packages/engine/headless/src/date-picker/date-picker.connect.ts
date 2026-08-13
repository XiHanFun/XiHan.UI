import type { NavIntent } from '@xihan-ui/behavior'
import type { Dict, NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { DateFieldApi, DateFieldSchema, DateSegmentType } from '../date-field'
import type {
  DatePickerApi,
  DatePickerFieldApi,
  DatePickerServices,
  DatePickerTranslations,
} from './date-picker.types'
import { focusSafely, navIntentFromKey, stepIndex } from '@xihan-ui/behavior'
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
import { timePickerColumns } from '../time-picker'
import { datePickerAnatomy } from './date-picker.anatomy'
import { DATE_PICKER_DEFAULT_PLACEMENT } from './date-picker.machine'
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
  }
}

export function connectDatePicker<T extends PropTypes>(
  services: DatePickerServices,
  normalize: NormalizeProps<T>,
): DatePickerApi<T> {
  const { state, prop, send, context, scope } = services.root
  const open = state.get() === 'open'
  // 两组段位容器各占一个 id：同一份 id 出现两次会被判成重复 id
  const ids = scope.ids('date-picker', 'label', 'trigger', 'content', 'input', 'input-end')

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
  const timeColumns = showTime ? timePickerColumns({ granularity: timeGranularity, hourCycle: 24 }) : []
  const timeValue = showTime && filled[0] != null ? datePickerTimePart(filled[0]) : null

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
    const host = from.closest<HTMLElement>(parts.input.selector)
      ?? from.closest<HTMLElement>(parts.root.selector)?.querySelector<HTMLElement>(parts.input.selector)
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

  const focusFirstSegment = (from: HTMLElement): void => {
    const nodes = segmentsIn(from)
    focusSegmentAt(nodes, stepIndex(nodes.length, -1, 'first', { skip: i => isSpare(nodes[i]!) }))
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

    getSegmentProps: (item) => {
      const base = raw.getSegmentProps(item) as Dict
      const type = raw.segments[item.index]?.type
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
          const intent = navIntentFromKey(event, { axis: 'horizontal' })
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
    disabled,
    readOnly,
    invalid,
    canClear,
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

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
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
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    // 分段容器：role=group 把一排段位兜成整体。单值时名字由 label 提供，
    // 区间的两组各自报名字，否则读屏念出来的是同一个。
    // 它同时承担内嵌分段输入的 root/control 两个部件，不另挂分段输入的根节点
    getInputProps: ({ index = 0 } = {}) => {
      const end = index === 1
      const raw = end ? fieldEndRaw : fieldRaw
      const outOfRange = !!raw?.outOfRange
      return normalize.element({
        ...parts.input.attrs,
        'id': end ? ids['input-end'] : ids.input,
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
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        // 守卫防程序化派发（原生 disabled 不派 click）
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      // 不进 Tab 序列也不报给读屏：段位上按退格即可清值
      'tabindex': -1,
      'aria-hidden': true,
      'disabled': !canClear || undefined,
      'data-disabled': dataAttr(!canClear),
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
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      'style': {
        position: 'fixed',
        insetInlineStart: `${position?.x ?? 0}px`,
        insetBlockStart: `${position?.y ?? 0}px`,
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

    // 内嵌日历的挂载点，同时充当日历的根节点：日历自己的 root 部件在这里由它承担，
    // 状态标记照日历那份抄一遍，皮肤两边写法一致
    getCalendarProps: () => normalize.element({
      ...parts.calendar.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
    }),

    getTimeColumnProps: ({ unit }) => normalize.element({
      ...parts['time-column'].attrs,
      'role': 'listbox',
      'aria-label': unit,
      'data-unit': unit,
      'hidden': !showTime || undefined,
    }),

    getTimeItemProps: ({ unit, value: v }) => {
      const at = unit === 'hour' ? 0 : unit === 'minute' ? 1 : 2
      const selected = timeValue?.split(':')[at] === v
      return normalize.element({
        ...parts['time-item'].attrs,
        'role': 'option',
        'aria-selected': selected ? 'true' : 'false',
        'data-unit': unit,
        'data-value': v,
        'data-selected': dataAttr(selected),
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
