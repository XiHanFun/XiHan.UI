import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type {
  DateFieldApi,
  DateFieldSchema,
  DateFieldSegmentProps,
  DateFieldSegmentState,
  DateSegments,
  DateSegmentType,
} from './date-field.types'
import { getLocalTimeZone, parseDateTime } from '@internationalized/date'
import { focusSafely, navIntentFromKey, queryItems, readDirection, stepIndex } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
import { dateFieldAnatomy } from './date-field.anatomy'
import { isMetaSegment } from './date-field.blocks'
import {
  applySegmentDigit,
  compareDateSegments,
  DATE_FIELD_CLEAR_LABEL,
  DATE_FIELD_GRANULARITY,
  DATE_FIELD_LOCALE,
  DATE_SEGMENT_LABEL,
  DATE_SEGMENT_PLACEHOLDER,
  dateSegmentRange,
  dateSegmentText,
  parseBoundary,
  parseIsoSegments,
  resolveSegmentSet,
  segmentMaxDigits,
} from './date-field.machine'

const parts = dateFieldAnatomy.build()

// 段位集合只在事件处理器里查活 DOM，顺序即文档序。
const SEGMENT_QUERY: ItemQuery = { scope: dateFieldAnatomy.name, part: 'segment' }

const DIGIT = /^\d$/

export function connectDateField<T extends PropTypes>(
  service: Service<DateFieldSchema>,
  normalize: NormalizeProps<T>,
): DateFieldApi<T> {
  const { context, prop, send, scope } = service

  const locale = prop('locale') ?? DATE_FIELD_LOCALE
  const granularity = prop('granularity') ?? DATE_FIELD_GRANULARITY
  const timeZone = prop('timeZone') ?? getLocalTimeZone()
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const required = !!prop('required')
  const editable = !disabled && !readOnly
  const bounds = { min: parseBoundary(prop('min')), max: parseBoundary(prop('max')) }

  // 段集给了就以它为准，没给退回 granularity 那条老路
  const order = resolveSegmentSet(prop('segments'), locale, granularity)
  const segments = context.get('segments')
  const typing = context.get('typing')
  const focusedSegment = context.get('focusedSegment')
  const rawValue = context.get('value')
  const value = rawValue === '' ? null : rawValue
  const complete = value != null
  const empty = order.every(type => segments[type] == null)
  // 拿算出来的值回读再比，不直接比段位：段集在场时段位里带着季度/周这些派生块，
  // 而边界只有年月日，逐段比会把「季度 2 对边界的 0」当成越界
  const outOfRange = complete && isOutOfRange(parseIsoSegments(value, 'second'), bounds)
  const ids = scope.ids('date-field', 'label', 'control')

  const placeholderOf = (type: DateSegmentType): string =>
    prop('placeholder')?.[type] ?? DATE_SEGMENT_PLACEHOLDER[type]

  const labelOf = (type: DateSegmentType): string =>
    prop('translations')?.[type] ?? DATE_SEGMENT_LABEL[type]
  const clearLabel = prop('translations')?.clearTrigger ?? DATE_FIELD_CLEAR_LABEL
  // 填了哪怕一段就能清；禁用与只读下清空钮收起
  const canClear = editable && !empty

  const state = (type: DateSegmentType, index: number): DateFieldSegmentState => {
    const raw = segments[type]
    const range = dateSegmentRange(type, segments, { ...bounds, set: order, locale })
    return {
      index,
      type,
      value: raw ?? null,
      text: dateSegmentText(type, raw, {
        typing: typing?.segment === type ? typing.digits : null,
        placeholder: placeholderOf(type),
        locale,
      }),
      placeholder: placeholderOf(type),
      label: labelOf(type),
      empty: raw == null,
      min: range.min,
      max: range.max,
      focused: focusedSegment === type,
    }
  }

  const segmentStates = order.map(state)

  /**
   * 作者的声明 → 这一格是第几段。
   *
   * 按段名声明时，段集里没有这一块就给 -1——与下标越界同一条路：那一格收起，不卸载作者节点。
   */
  const indexOf = (props: DateFieldSegmentProps): number =>
    props.segment != null ? order.indexOf(props.segment) : Math.trunc(props.index ?? -1)

  // 焦点锚点：焦点在组内就是它，否则退回首段；整组只占一个 Tab 位。
  // 锚点落在已不属于当前 granularity 的段上时要回到首段，否则整组一个 Tab 位都不剩
  const anchor = focusedSegment != null && order.includes(focusedSegment) ? focusedSegment : order[0]

  /** 事件那一刻现查同组段位：文档序即段序，不缓存节点数组。 */
  const nodesOf = (from: HTMLElement): HTMLElement[] =>
    queryItems(from.closest<HTMLElement>(parts.root.selector), SEGMENT_QUERY)

  // granularity 之外的段带着 hidden 留在文档里（不卸载作者节点），移动时必须跳过它们
  const isSpare = (el: HTMLElement): boolean => el.hasAttribute('hidden')

  const focusAt = (nodes: HTMLElement[], index: number): void => {
    if (index >= 0)
      focusSafely(nodes[index])
  }

  const moveFrom = (el: HTMLElement, intent: 'next' | 'prev' | 'first' | 'last'): void => {
    const nodes = nodesOf(el)
    // 两端停住不回绕
    focusAt(nodes, stepIndex(nodes.length, nodes.indexOf(el), intent, {
      loop: false,
      skip: i => isSpare(nodes[i]!),
    }))
  }

  return {
    value,
    valueAsDate: toDate(value, timeZone),
    segments: segmentStates,
    complete,
    empty,
    outOfRange,
    disabled,
    readOnly,
    invalid,
    focusedSegment,
    locale,
    granularity,
    canClear,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    clear: () => send({ type: 'VALUE.CLEAR' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
      'data-complete': dataAttr(complete),
      'data-out-of-range': dataAttr(outOfRange),
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      // 段位是 div，不是可被 <label for> 标注的控件，所以不产出 for，点标题落到首段自己接管
      'data-disabled': dataAttr(disabled),
      'onClick': (event: MouseEvent) => {
        if (disabled)
          return
        const el = event.currentTarget as HTMLElement
        const nodes = nodesOf(el)
        focusAt(nodes, stepIndex(nodes.length, -1, 'first', { skip: i => isSpare(nodes[i]!) }))
      },
    }),

    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'id': ids.control,
      // 一排段位在读屏那里是一个整体，靠 group 兜住，名字由 label 提供
      'role': 'group',
      'aria-labelledby': ids.label,
      'aria-disabled': disabled ? 'true' : 'false',
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    // 段位与作者写在段间的分隔符都挂在这一层，它占满盒里剩下的宽度，清空钮因此靠在框内末端
    getSegmentGroupProps: () => normalize.element({
      ...parts['segment-group'].attrs,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid || outOfRange),
    }),

    segmentOf: props => segmentStates[indexOf(props)],

    getSegmentProps: (props) => {
      const index = indexOf(props)
      const type = order[index]
      const item = type ? state(type, index) : null
      // 多余的段位收起而不是卸载。键一个不少地照出、只是取值为空：
      // 漏写键的话适配器撤不掉上一帧写下的那些属性
      const spare = item == null
      return normalize.element({
        ...parts.segment.attrs,
        // 按段名声明而段集里没有这一块时下标是 -1，那个数没有意义，不产出
        'data-index': index >= 0 ? String(index) : undefined,
        'data-segment': item?.type,
        'data-placeholder': dataAttr(!!item?.empty),
        'data-disabled': dataAttr(!spare && disabled),
        'data-readonly': dataAttr(!spare && readOnly),
        'data-invalid': dataAttr(!spare && (invalid || outOfRange)),
        'data-focus': dataAttr(!!item?.focused),
        'hidden': spare || undefined,
        // role=spinbutton 让读屏念出当前值与区间，三个 aria-value* 必须显式给
        'role': spare ? undefined : 'spinbutton',
        'aria-label': item?.label,
        // 一律转字符串：本仓其余 ARIA 数值都是字符串，数值形态在 WC 侧还要多走一次隐式转换
        'aria-valuemin': item == null ? undefined : String(item.min),
        'aria-valuemax': item == null ? undefined : String(item.max),
        // 未填时不给 valuenow，给 0 会被念成「值是 0」
        'aria-valuenow': item?.value == null ? undefined : String(item.value),
        'aria-valuetext': item?.text,
        'aria-disabled': spare ? undefined : (disabled ? 'true' : 'false'),
        'aria-readonly': spare ? undefined : (readOnly ? 'true' : 'false'),
        'aria-required': spare ? undefined : (required ? 'true' : 'false'),
        'aria-invalid': spare ? undefined : (invalid || outOfRange ? 'true' : 'false'),
        // 禁用时整组退出 Tab 序；其余时候只有锚点占位，组内移动交给方向键
        'tabindex': spare || disabled ? undefined : (anchor === item.type ? 0 : -1),
        'onFocus': spare ? undefined : () => send({ type: 'SEGMENT.FOCUS', segment: item.type }),
        'onBlur': spare
          ? undefined
          : () => {
              // 只在本段当下持有锚点时才清：段间移动时旧段 blur 与新段 focus 的先后会把刚记下的锚点抹掉
              if (context.get('focusedSegment') === item.type)
                send({ type: 'SEGMENT.BLUR' })
            },
        'onKeyDown': spare
          ? undefined
          : (event: KeyboardEvent) => {
              if (disabled || event.ctrlKey || event.metaKey || event.altKey)
                return
              const el = event.currentTarget as HTMLElement
              const key = event.key

              if (key === 'ArrowUp' || key === 'ArrowDown') {
                if (!editable)
                  return
                // 上下键在页面里默认是滚动，接管了就得拦下
                event.preventDefault()
                send({ type: 'SEGMENT.STEP', segment: item.type, delta: key === 'ArrowUp' ? 1 : -1 })
                return
              }

              if (key === 'Backspace') {
                if (!editable)
                  return
                // 部分浏览器把退格当"后退一页"，一律拦下
                event.preventDefault()
                send({ type: 'SEGMENT.CLEAR', segment: item.type })
                return
              }

              // 上下午段收 a / p 直接指定，与上下键的翻面并行；它没有数字位，数字键在这儿不作数。
              // 换段与上下键仍归它，所以这一段只吃掉这两类键，其余照常往下走
              if (isMetaSegment(item.type)) {
                const period = key === 'a' || key === 'A' ? 'am' : key === 'p' || key === 'P' ? 'pm' : null
                if (period) {
                  if (!editable)
                    return
                  event.preventDefault()
                  send({ type: 'SEGMENT.PERIOD', period })
                  return
                }
                if (DIGIT.test(key))
                  return
              }

              if (DIGIT.test(key)) {
                if (!editable)
                  return
                event.preventDefault()
                // 跳不跳段要在写之前算，写完缓冲就被清了；与机器用的是同一个纯函数与同一份活值
                const live = context.get('segments')
                const buffer = context.get('typing')
                const result = applySegmentDigit(
                  buffer?.segment === item.type ? buffer.digits : '',
                  key,
                  {
                    range: dateSegmentRange(item.type, live, { ...bounds, set: order, locale }),
                    maxDigits: segmentMaxDigits(item.type),
                  },
                )
                send({ type: 'SEGMENT.TYPE', segment: item.type, digit: key })
                if (result?.complete)
                  moveFrom(el, 'next')
                return
              }

              // 只认水平轴与 Home/End，上下键已在前面接走
              const intent = navIntentFromKey(event, { axis: 'horizontal', dir: readDirection(event.currentTarget as Element) })
              if (!intent)
                return
              event.preventDefault()
              moveFrom(el, intent)
            },
      })
    },

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      // 不进 Tab 序：段位上按退格即可清值；读屏仍能按名字找到它
      'tabindex': -1,
      'aria-label': clearLabel,
      // 没值或不可编辑就整个收起：出现即可用
      'hidden': !canClear || undefined,
      // 不拦的话浏览器会把焦点挪到这个按钮上，清完焦点就落在一个收起的节点里
      'onPointerDown': (event: PointerEvent) => {
        if (event.button === 0)
          event.preventDefault()
      },
      'onClick': (event: MouseEvent) => {
        if (!canClear)
          return
        send({ type: 'VALUE.CLEAR' })
        // pointerdown 已拦掉默认聚焦，键盘 / 程序化激活这一路则要主动把焦点送回首段
        focusSafely(nodesOf(event.currentTarget as HTMLElement).find(node => !isSpare(node)))
      },
    }),

    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      name: prop('name'),
      value: value ?? '',
      // 禁用的控件不该提交出值
      disabled: disabled || undefined,
    }),
  }
}

/** 填齐的日期是否落在 min/max 之外。逐段比而不是比串：两侧精度不同时字符串比不出先后。 */
function isOutOfRange(
  segments: DateSegments,
  bounds: { min: DateSegments | null, max: DateSegments | null },
): boolean {
  const { min, max } = bounds
  if (min && compareDateSegments(segments, min) < 0)
    return true
  return !!max && compareDateSegments(segments, max) > 0
}

/** ISO 串 → 原生 Date。算不出来（空值、串坏了）就是 null，不抛给调用方。 */
function toDate(iso: string | null, timeZone: string): Date | null {
  if (!iso)
    return null
  try {
    return parseDateTime(iso).toDate(timeZone)
  }
  catch {
    return null
  }
}
