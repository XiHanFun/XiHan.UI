import type { ItemQuery } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type {
  DateFieldApi,
  DateFieldSchema,
  DateFieldSegmentState,
  DateSegments,
  DateSegmentType,
} from './date-field.types'
import { getLocalTimeZone, parseDateTime } from '@internationalized/date'
import { focusSafely, navIntentFromKey, queryItems, stepIndex } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { dateFieldAnatomy } from './date-field.anatomy'
import {
  applySegmentDigit,
  compareDateSegments,
  DATE_FIELD_GRANULARITY,
  DATE_FIELD_LOCALE,
  DATE_SEGMENT_LABEL,
  DATE_SEGMENT_PLACEHOLDER,
  dateSegmentOrder,
  dateSegmentRange,
  dateSegmentText,
  parseBoundary,
  segmentMaxDigits,
} from './date-field.machine'

const parts = dateFieldAnatomy.build()

// 段位集合只在事件处理器里查活 DOM：那一刻两个适配器看到的是同一份文档，顺序即文档序。
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

  const order = dateSegmentOrder(locale, granularity)
  const segments = context.get('segments')
  const typing = context.get('typing')
  const focusedSegment = context.get('focusedSegment')
  const rawValue = context.get('value')
  const value = rawValue === '' ? null : rawValue
  const complete = value != null
  const empty = order.every(type => segments[type] == null)
  const outOfRange = complete && isOutOfRange(segments, bounds)
  const ids = scope.ids('date-field', 'label', 'control')

  const placeholderOf = (type: DateSegmentType): string =>
    prop('placeholder')?.[type] ?? DATE_SEGMENT_PLACEHOLDER[type]

  const labelOf = (type: DateSegmentType): string =>
    prop('translations')?.[type] ?? DATE_SEGMENT_LABEL[type]

  const state = (type: DateSegmentType, index: number): DateFieldSegmentState => {
    const raw = segments[type]
    const range = dateSegmentRange(type, segments, bounds)
    return {
      index,
      type,
      value: raw ?? null,
      text: dateSegmentText(type, raw, {
        typing: typing?.segment === type ? typing.digits : null,
        placeholder: placeholderOf(type),
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

  // 焦点锚点：焦点在组内就是它，否则退回首段。整组只占一个 Tab 位——
  // 一个日期要按三次 Tab 才能走完，Tab 序里就再也没人愿意走了。
  // 锚点落在已经不属于当前 granularity 的段上时（精度从 second 改成 day）要回到首段，
  // 否则整组一个 Tab 位都不剩。
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
    // 两端停住不回绕：末段再按右键该停下，绕回首段会让人以为值被重置了
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
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    clear: () => send({ type: 'VALUE.CLEAR' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
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
      // 段位是 div，不是可被 <label for> 标注的控件，所以不产出 for；
      // 点标题该落到首段这件事只能自己接管
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

    getSegmentProps: ({ index }) => {
      const type = order[index]
      const item = type ? state(type, index) : null
      // 作者写的段位节点比当前精度需要的多：多出来的收起而不是卸载——节点是作者写的，
      // 替他删掉他就再也拿不回来了。键一个不少地照出，只是取值为空：
      // 精度改小时那几个键要能被适配器当成"这一帧不再写"从而撤掉，漏写键就撤不掉
      const spare = item == null
      return normalize.element({
        ...parts.segment.attrs,
        'data-index': String(index),
        'data-segment': item?.type,
        'data-placeholder': dataAttr(!!item?.empty),
        'data-disabled': dataAttr(!spare && disabled),
        'data-readonly': dataAttr(!spare && readOnly),
        'data-invalid': dataAttr(!spare && (invalid || outOfRange)),
        'data-focus': dataAttr(!!item?.focused),
        'hidden': spare || undefined,
        // role=spinbutton 让读屏念出当前值与区间；三个 aria-value* 显式给，
        // 省略时读屏只念得出节点里的那串数字，念不出这一段能取到哪儿
        'role': spare ? undefined : 'spinbutton',
        'aria-label': item?.label,
        'aria-valuemin': item?.min,
        'aria-valuemax': item?.max,
        // 未填时不给 valuenow：给 0 会被念成"值是 0"，那和"还没填"是两回事
        'aria-valuenow': item?.value ?? undefined,
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
              // 判据是"本段当下正持有锚点"，不是"有 blur 就清"：
              // 焦点在段之间移动时浏览器先派旧段的 blur、再派新段的 focus，
              // 两条都无条件生效的话，顺序稍有出入就会把刚记下的锚点抹掉
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

              if (DIGIT.test(key)) {
                if (!editable)
                  return
                event.preventDefault()
                // 跳不跳段要在写之前算：写完缓冲就被清了，事后问不出"这一段是不是刚敲满"。
                // 与机器里用的是同一个纯函数、同一份活值，两处算出来的结论必然一致
                const live = context.get('segments')
                const buffer = context.get('typing')
                const result = applySegmentDigit(
                  buffer?.segment === item.type ? buffer.digits : '',
                  key,
                  { range: dateSegmentRange(item.type, live, bounds), maxDigits: segmentMaxDigits(item.type) },
                )
                send({ type: 'SEGMENT.TYPE', segment: item.type, digit: key })
                if (result?.complete)
                  moveFrom(el, 'next')
                return
              }

              // 只认水平轴与 Home/End：上下键已在前面接走，别让导航再抢一次
              const intent = navIntentFromKey(event, { axis: 'horizontal' })
              if (!intent)
                return
              event.preventDefault()
              moveFrom(el, intent)
            },
      })
    },

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
