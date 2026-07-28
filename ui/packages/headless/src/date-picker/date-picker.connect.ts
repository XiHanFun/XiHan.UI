import type { NavIntent } from '@xihan-ui/behavior'
import type { Dict, NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { DateSegmentType } from '../date-field'
import type { DatePickerApi, DatePickerFieldApi, DatePickerServices } from './date-picker.types'
import { focusSafely, navIntentFromKey, stepIndex } from '@xihan-ui/behavior'
import { dataAttr, normalizeProps } from '@xihan-ui/core'
import { connectCalendar } from '../calendar'
import {
  applySegmentDigit,
  connectDateField,
  dateFieldAnatomy,
  dateSegmentRange,
  parseBoundary,
  segmentMaxDigits,
} from '../date-field'
import { datePickerAnatomy } from './date-picker.anatomy'
import { DATE_PICKER_DEFAULT_PLACEMENT } from './date-picker.machine'

const parts = datePickerAnatomy.build()
/** 段位的 CSS 选择器（分段输入那一份解剖的部件）：换段在事件那一刻靠它现查同组段位。 */
const SEGMENT_SELECTOR = dateFieldAnatomy.build().segment.selector

const DIGIT = /^\d$/

/** 带 Ctrl/Cmd/Alt 的组合一律归浏览器与读屏，分段输入一条都不接。 */
function hasModifier(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey
}

export function connectDatePicker<T extends PropTypes>(
  services: DatePickerServices,
  normalize: NormalizeProps<T>,
): DatePickerApi<T> {
  const { state, prop, send, context, scope } = services.root
  const open = state.get() === 'open'
  const ids = scope.ids('date-picker', 'label', 'trigger', 'content', 'input')

  const value = context.get('value')
  const selectionMode = prop('selectionMode') ?? 'single'
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  // 只读与禁用都改不了选中值；两者的区别在于禁用连浮层都展不开
  const interactive = !disabled && !readOnly
  const canClear = interactive && value.length > 0
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context；这里只读结果，不量 DOM、不调引擎，保持纯函数
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? DATE_PICKER_DEFAULT_PLACEMENT

  // 内嵌日历：整份 api 原样转发，选日期/翻月/键盘导航一条都不在这里重写
  const calendar = connectCalendar(services.calendar, normalize)

  /**
   * 内嵌分段输入先用恒等归一化连一次，拿到**原始** prop 字典。
   *
   * 不能直接用调用方的归一化器：那一步已经把 onKeyDown 改写成了各框架认的事件键名，
   * 之后再往上盖一个 onKeyDown 就成了两个键、两个处理器（Vue 侧新加的那个还永不触发）。
   * 原始字典上覆盖再统一归一，键才只有一个。
   */
  const fieldRaw = connectDateField(services.field, normalizeProps)
  const bounds = { min: parseBoundary(prop('min')), max: parseBoundary(prop('max')) }

  /**
   * 同一份分段输入里的全部段位，文档序。事件那一刻现查，不缓存节点数组。
   *
   * 不走 queryItems：它的归属过滤拿「容器自己的 part」当判据，而这里容器是本组件的 input、
   * 段位是分段输入那一份解剖的部件，两者 scope 不同，过滤会把段位全部滤掉。
   */
  const segmentsIn = (from: HTMLElement): HTMLElement[] => {
    const host = from.closest<HTMLElement>(parts.input.selector)
      ?? from.closest<HTMLElement>(parts.root.selector)?.querySelector<HTMLElement>(parts.input.selector)
    return host ? [...host.querySelectorAll<HTMLElement>(SEGMENT_SELECTOR)] : []
  }

  // granularity 之外的段带着 hidden 留在文档里（不卸载作者节点），换段时必须跳过它们
  const isSpare = (el: HTMLElement): boolean => el.hasAttribute('hidden')

  const focusSegmentAt = (nodes: HTMLElement[], index: number): void => {
    if (index >= 0)
      focusSafely(nodes[index])
  }

  const moveSegment = (from: HTMLElement, intent: NavIntent): void => {
    const nodes = segmentsIn(from)
    // 两端停住不回绕：末段再按右键该停下，绕回首段会让人以为值被重置了
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
   * 这一下数字键会不会把本段敲满。必须在写之前算：写完缓冲就被清了，
   * 事后问不出「这一段是不是刚敲满」。与分段输入的连接层用的是同一个纯函数、同一份活值，
   * 两处算出来的结论必然一致。
   */
  const digitFillsSegment = (event: KeyboardEvent, type: DateSegmentType): boolean => {
    if (!DIGIT.test(event.key))
      return false
    const live = services.field.context.get('segments')
    const buffer = services.field.context.get('typing')
    const result = applySegmentDigit(
      buffer?.segment === type ? buffer.digits : '',
      event.key,
      { range: dateSegmentRange(type, live, bounds), maxDigits: segmentMaxDigits(type) },
    )
    return !!result?.complete
  }

  const field: DatePickerFieldApi<T> = {
    value: fieldRaw.value,
    segments: fieldRaw.segments,
    complete: fieldRaw.complete,
    empty: fieldRaw.empty,
    outOfRange: fieldRaw.outOfRange,

    getSegmentProps: (item) => {
      const base = fieldRaw.getSegmentProps(item) as Dict
      const type = fieldRaw.segments[item.index]?.type
      const onKeyDown = base.onKeyDown as ((event: KeyboardEvent) => void) | undefined
      // 精度用不上的段：分段输入已把它收起且不挂处理器，这里也不补
      if (type == null || onKeyDown == null)
        return normalize.element(base)
      return normalize.element({
        ...base,
        onKeyDown: (event: KeyboardEvent) => {
          const el = event.currentTarget as HTMLElement
          const filled = interactive && !hasModifier(event) && digitFillsSegment(event, type)
          // 值那一路照原样交给分段输入：加减、直填、清段与拦默认行为全在它手里
          onKeyDown(event)
          // 换段这一路它做不了：它按自己的根选择器找同组段位，而这里段位挂在本组件的 input
          // 里，那个根节点根本不存在（内嵌的是段位，不是一整份分段输入）。落点因此由这里补上
          if (!interactive || hasModifier(event))
            return
          if (filled) {
            moveSegment(el, 'next')
            return
          }
          // 只认水平轴与 Home/End：上下键是改值，已由分段输入接走
          const intent = navIntentFromKey(event, { axis: 'horizontal' })
          if (intent)
            moveSegment(el, intent)
        },
      })
    },

    getHiddenInputProps: () => normalize.input(fieldRaw.getHiddenInputProps() as Dict),
  }

  return {
    open,
    value,
    valueAsString: value[0] ?? null,
    selectionMode,
    // 日历那边已经做过「宿主设过的 → 首个选中值 → 今天」三路收口，直接取它的结论，
    // 免得同一件事在两处各算一遍、算出两个答案
    focusedValue: calendar.focusedValue,
    disabled,
    readOnly,
    invalid,
    canClear,
    calendar,
    field,
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
      // 段位是 div，不是可被 <label for> 标注的控件，所以不产出 for；
      // 点标题该落到首段这件事只能自己接管
      'data-disabled': dataAttr(disabled),
      'onClick': (event: MouseEvent) => {
        if (!disabled)
          focusFirstSegment(event.currentTarget as HTMLElement)
      },
    }),

    // 输入行整体：定位锚点取它，浮层因此与整个输入框对齐而不是只贴着图标按钮
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    // 分段容器：一排段位在读屏那里是一个整体，靠 group 兜住，名字由 label 提供。
    // 这个节点同时是内嵌分段输入的落脚处——它的 root/control 两个部件在这里由本组件承担，
    // 否则同一棵树里会挂出第二个分段输入的根节点
    getInputProps: () => normalize.element({
      ...parts.input.attrs,
      'id': ids.input,
      'role': 'group',
      'aria-labelledby': ids.label,
      'aria-disabled': disabled ? 'true' : 'false',
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid || fieldRaw.outOfRange),
      'data-empty': dataAttr(fieldRaw.empty),
      'data-complete': dataAttr(fieldRaw.complete),
      'data-out-of-range': dataAttr(fieldRaw.outOfRange),
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      // trigger 是单体控件（与日期格子相反）：用原生 disabled，不可聚焦也不派 click。
      // 只读不禁用——日历仍该展得开，改不动的只是选中值
      'disabled': disabled || undefined,
      // 展开的是一个日历对话框，不是列表
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      // 图标按钮自己没有文字，名字借标题；作者写了 aria-label 会盖过这条
      'aria-labelledby': ids.label,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        // 原生 disabled 既不可聚焦也不派 click，这道守卫是防程序化派发
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      // 整个控件的 Tab 位归段位与 trigger：键盘用户在段位上按退格就能清，
      // 再暴露一个按钮等于把同一个能力报两遍，还多占一站
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
        position: 'absolute',
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
  }
}
