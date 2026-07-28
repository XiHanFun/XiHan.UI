import type { ItemQuery, NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { TimeFieldApi, TimeFieldSchema, TimeSegmentType } from './time-field.types'
import { focusSafely, ITEM_VALUE_ATTR, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { timeFieldAnatomy } from './time-field.anatomy'
import {
  appendSegmentDigit,
  isTimeOutOfRange,
  resolveHourCycle,
  resolveTimeDraft,
  segmentNumber,
  segmentRange,
  TIME_FIELD_GRANULARITY,
  timeSegments,
  timeSegmentText,
} from './time-field.machine'

const parts = timeFieldAnatomy.build()

// 段集合只在事件处理器里查活 DOM：那一刻两个适配器看到的是同一份文档，顺序即文档序。
const SEGMENT_QUERY: ItemQuery = { scope: timeFieldAnatomy.name, part: 'segment' }

/**
 * 段的读屏名字。刻意写死英文语义名，不走 Intl.DisplayNames：
 * 那条路要么依赖运行环境的默认 locale（同一份代码在不同机器上产出不同 DOM），
 * 要么依赖运行时的 ICU 数据完整度，两者都会让两个适配器之外再多一个变量。
 */
const SEGMENT_LABELS: Record<TimeSegmentType, string> = {
  hour: 'hour',
  minute: 'minute',
  second: 'second',
  dayPeriod: 'AM/PM',
}

export function connectTimeField<T extends PropTypes>(
  service: Service<TimeFieldSchema>,
  normalize: NormalizeProps<T>,
): TimeFieldApi<T> {
  const { context, prop, send, scope } = service
  const ids = scope.ids('time-field', 'label', 'control')

  const locale = prop('locale')
  const hourCycle = resolveHourCycle(prop('hourCycle'), locale)
  const granularity = prop('granularity') ?? TIME_FIELD_GRANULARITY
  const placeholder = prop('placeholder')
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const required = !!prop('required')
  // 只读与禁用在"能不能改"上是一回事，在"能不能聚焦"上不是；后者见 tabindex
  const editable = !disabled && !readOnly

  const value = context.get('value')
  const draft = resolveTimeDraft(value, context.get('draft'))
  const segments = timeSegments(granularity, hourCycle)
  const empty = value === ''
  const outOfRange = isTimeOutOfRange(value, prop('min'), prop('max'))
  // 越界与显式 invalid 在读屏那里是同一件事：这份输入现在不合法
  const flagged = invalid || outOfRange

  const focusedSegment = context.get('focusedSegment')
  /**
   * roving tabindex 的唯一锚点：焦点在组内跟焦点走，否则落在第一段。
   * 判据先过一遍"这一段此刻还在不在"——granularity 或 hourCycle 变小时，
   * 焦点记着的那一段可能已经被收起，锚点若还指着它，整组就一个 Tab 位都没有了。
   */
  const anchor: TimeSegmentType = focusedSegment != null && segments.includes(focusedSegment)
    ? focusedSegment
    : segments[0]!

  const textOf = (segment: TimeSegmentType): string =>
    timeSegmentText(draft, segment, { hourCycle, locale, placeholder })

  /** 事件那一刻现查同组段：收起的段（被 granularity/hourCycle 关掉的那些）不参与移动。 */
  const liveSegments = (from: HTMLElement): HTMLElement[] =>
    queryItems(from.closest<HTMLElement>(parts.root.selector), SEGMENT_QUERY)
      .filter(el => !el.hasAttribute('hidden'))

  /**
   * 段间移动。不回绕：末段再按右键该停住，绕回首段会让人以为自己走错了方向。
   * 也不跳过任何一段——段与段之间没有"个别禁用"这回事，禁用是整份控件的事，
   * 那时键盘早在处理器开头就被挡下了。
   */
  const moveFocus = (from: HTMLElement, current: TimeSegmentType, intent: NavIntent): void => {
    const next = navigateItems(liveSegments(from), current, intent, { loop: false, focusDisabled: true })
    focusSafely(next)
  }

  return {
    value,
    empty,
    outOfRange,
    disabled,
    readOnly,
    invalid,
    hourCycle,
    granularity,
    segments,
    focusedSegment,
    getSegmentText: ({ segment }) => textOf(segment),
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    clear: () => send({ type: 'VALUE.CLEAR' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(flagged),
      'data-empty': dataAttr(empty),
      'data-out-of-range': dataAttr(outOfRange),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      'data-disabled': dataAttr(disabled),
      // 段不是可被 <label for> 指向的原生控件（它们是 span），for 无处可写；
      // "点标题聚焦到第一段"这条只能由这里接管
      'onClick': (event: MouseEvent) => {
        if (disabled)
          return
        const root = (event.currentTarget as HTMLElement).closest<HTMLElement>(parts.root.selector)
        const first = queryItems(root, SEGMENT_QUERY).find(el => !el.hasAttribute('hidden'))
        focusSafely(first)
      },
    }),

    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'id': ids.control,
      // 几段合起来才是一个控件，靠 group 把它们兜住，名字由 label 提供
      'role': 'group',
      'aria-labelledby': ids.label,
      // 四个 aria 布尔显式写 true/false：省略是"没说"，显式 false 是"明确说了不是"
      'aria-disabled': disabled ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false',
      'aria-invalid': flagged ? 'true' : 'false',
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(flagged),
      'data-empty': dataAttr(empty),
    }),

    getSegmentProps: ({ segment }) => {
      // 这一段此刻参不参与显示。不参与的收起而不是让作者删掉：节点是作者写的，
      // 替他删了他就再也拿不回来；granularity 改回去时它得原地复现
      const active = segments.includes(segment)
      const range = segmentRange(segment, hourCycle)
      const num = segmentNumber(draft, segment, hourCycle)
      return normalize.element({
        ...parts.segment.attrs,
        // 每一段都是一个可加减的数，spinbutton 是读屏唯一认得的形态
        'role': 'spinbutton',
        // 导航与聚焦都以此为段的身份（事件那一刻现查 DOM 时按它定位）
        [ITEM_VALUE_ATTR]: segment,
        'aria-label': SEGMENT_LABELS[segment],
        'aria-valuemin': range.min,
        'aria-valuemax': range.max,
        // 空段没有"当前值"，此时不写 aria-valuenow：写个 0 会被念成"零点"
        'aria-valuenow': num ?? undefined,
        // 读屏念出的与眼睛看到的是同一串，空段念的是占位符
        'aria-valuetext': textOf(segment),
        'aria-disabled': disabled ? 'true' : 'false',
        'aria-readonly': readOnly ? 'true' : 'false',
        'aria-invalid': flagged ? 'true' : 'false',
        'data-placeholder': dataAttr(num == null),
        'data-focus': dataAttr(focusedSegment === segment),
        'data-disabled': dataAttr(disabled),
        'data-readonly': dataAttr(readOnly),
        'data-invalid': dataAttr(flagged),
        'hidden': !active || undefined,
        // 整组只占一个 Tab 位：段之间靠左右键走。禁用时连 -1 都不给，
        // 与原生 disabled 控件一致——整份控件退出 Tab 序列
        'tabindex': disabled || !active ? undefined : (anchor === segment ? 0 : -1),
        'onFocus': () => send({ type: 'SEGMENT.FOCUS', segment }),
        'onBlur': () => {
          // 判据是"本段当下正持有焦点锚点"，不是"有 blur 就清"：
          // 焦点在段之间移动时浏览器先派旧段的 blur、再派新段的 focus，
          // 若两条都无条件生效，顺序稍有出入就会把刚记下的锚点抹掉
          if (context.get('focusedSegment') === segment)
            send({ type: 'SEGMENT.BLUR' })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (disabled || event.ctrlKey || event.metaKey || event.altKey)
            return
          const el = event.currentTarget as HTMLElement
          const key = event.key

          // 段间移动只认水平轴与 Home/End：上下键归加减，在这里被吃掉就没得加减了
          const intent = navIntentFromKey(event, { axis: 'horizontal' })
          if (intent) {
            // 左右键在可聚焦元素上默认可能滚动页面，必须拦下
            event.preventDefault()
            moveFocus(el, segment, intent)
            return
          }

          if (key === 'ArrowUp' || key === 'ArrowDown') {
            // 改不动的时候不拦：上下键还要留给页面滚动
            if (!editable)
              return
            event.preventDefault()
            send({ type: 'SEGMENT.STEP', segment, delta: key === 'ArrowUp' ? 1 : -1 })
            return
          }

          if (key === 'Backspace' || key === 'Delete') {
            if (!editable)
              return
            event.preventDefault()
            send({ type: 'SEGMENT.CLEAR', segment })
            return
          }

          if (segment === 'dayPeriod') {
            // 上下午段收 a/p 直接指定，与上下键的翻面并行；别的键一概不归它管
            const period = key === 'a' || key === 'A' ? 'am' : key === 'p' || key === 'P' ? 'pm' : null
            if (!period || !editable)
              return
            event.preventDefault()
            send({ type: 'SEGMENT.PERIOD', period })
            return
          }

          if (key.length === 1 && key >= '0' && key <= '9') {
            if (!editable)
              return
            event.preventDefault()
            // 这一段还吃不吃得下第二位，由同一个纯函数说了算——机器里跑的是同一句，
            // 入参也是同一份（缓冲现读、区间同算），因此两边的判断不会分家
            const result = appendSegmentDigit(
              context.get('typeBuffer'),
              key,
              segmentRange(segment, hourCycle),
            )
            send({ type: 'SEGMENT.DIGIT', segment, digit: key })
            // 填满即跳下一段，与逐格验证码同一套手感
            if (result.done)
              moveFocus(el, segment, 'next')
          }
        },
      })
    },

    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      name: prop('name'),
      value,
      // 禁用的控件不该提交出值
      disabled: disabled || undefined,
    }),
  }
}
