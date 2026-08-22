import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { TimeSegmentType } from '../time-field'
import type { TimePickerApi, TimePickerColumnUnit, TimePickerPresetState, TimePickerSchema } from './time-picker.types'
import { focusItem, focusSafely, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems, readDirection } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
import { overlayPositioned } from '../shared/overlay'
import {
  appendSegmentDigit,
  dayPeriodLabel,
  draftFromTime,
  formatTimeValue,
  isTimeOutOfRange,
  parseTimeValue,
  resolveHourCycle,
  resolveTimeDraft,
  segmentNumber,
  segmentRange,
  TIME_FIELD_GRANULARITY,
  timeSegments,
  timeSegmentText,
} from '../time-field'
import {
  findTimePickerColumn,
  timePickerAnatomy,
  timePickerColumnQuery,
  timePickerInputQuery,
  timePickerItemQuery,
  timePickerPresetQuery,
} from './time-picker.anatomy'
import {
  resolveTimeStep,
  TIME_PICKER_DEFAULT_PLACEMENT,
  timePickerColumnsFor,
  timePickerItemValue,
} from './time-picker.machine'

const parts = timePickerAnatomy.build()

// 这次激活来自 Enter / Space 的触发器：原生按钮把这两个键翻成一次 click，
// 那次 click 与指针点出来的长得一样，只能靠「按下时记一笔、激活时取走」把两条入口分开。
// 指针按下会把标记撤掉，键按下后没等来激活（按住空格再 Tab 走开）也不会留给下一次点击
const keyActivated = new WeakSet<Element>()

/**
 * 段与列的读屏名字。写死英文语义名，不走 Intl.DisplayNames：
 * 后者依赖运行环境的默认 locale 与 ICU 数据完整度，同一份代码会产出不同 DOM。
 */
const SEGMENT_LABELS: Record<TimeSegmentType, string> = {
  hour: 'hour',
  minute: 'minute',
  second: 'second',
  dayPeriod: 'AM/PM',
}

export function connectTimePicker<T extends PropTypes>(
  service: Service<TimePickerSchema>,
  normalize: NormalizeProps<T>,
): TimePickerApi<T> {
  const { state, context, prop, send, scope } = service
  const open = state.get() === 'open'
  const stateAttr = open ? 'open' : 'closed'
  const ids = scope.ids('time-picker', 'label', 'control', 'trigger', 'content')

  const locale = prop('locale')
  const hourCycle = resolveHourCycle(prop('hourCycle'), locale)
  const granularity = prop('granularity') ?? TIME_FIELD_GRANULARITY
  const step = resolveTimeStep(prop('step'))
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
  // 值还凑不成一个时间时也可能已经填了几段，清空按钮此时就能按
  const dirty = value !== '' || draft.hour != null || draft.minute != null
    || draft.second != null || draft.dayPeriod != null
  const canClear = editable && dirty

  // 位置由引擎写进 context，这里只读结果，不量 DOM、不调引擎
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? TIME_PICKER_DEFAULT_PLACEMENT

  const focusedSegment = context.get('focusedSegment')
  // 从未写过的 cell 读出来是 undefined，对外一律归一成 null
  const focusedColumn = context.get('focusedColumn') ?? null
  const focusedItem = context.get('focusedItem') ?? null

  /**
   * 段间 roving tabindex 的唯一锚点：焦点在组内跟焦点走，否则落在第一段。
   * 判据先过一遍这一段此刻还在不在：granularity 或 hourCycle 变小时它可能已被收起。
   */
  const segmentAnchor: TimeSegmentType = focusedSegment != null && segments.includes(focusedSegment)
    ? focusedSegment
    : segments[0]!

  // 列表是纯函数按当前值算出来的，connect 与机器读到的是同一份
  const columns = timePickerColumnsFor(draft, {
    granularity,
    hourCycle,
    step,
    min: prop('min'),
    max: prop('max'),
  })

  const optionsOf = (unit: TimePickerColumnUnit): readonly string[] =>
    columns.find(column => column.unit === unit)?.options ?? []

  /** 这一列此刻选中的那个值（两位补零）；该段还空着时为 null。 */
  const selectedIn = (unit: TimePickerColumnUnit): string | null => {
    const current = segmentNumber(draft, unit, hourCycle)
    return current == null ? null : timePickerItemValue(current)
  }

  /**
   * 每列各自的 roving 锚点：焦点在本列就跟焦点走，否则停在本列选中的那一格。
   * 两条都拿生成出来的列核对过，锚点指向被 min/max 裁掉的值会让这一列没有 Tab 位。
   *
   * 都没有就是没有锚点（指针打开且这一段还空着）：不预落到首格，
   * 展开那一刻不能有格子看着像被选中，Tab 位与落焦此时归列容器（见 getColumnProps）。
   */
  const anchorOf = (unit: TimePickerColumnUnit): string | null => {
    const options = optionsOf(unit)
    if (focusedColumn === unit && focusedItem != null && options.includes(focusedItem))
      return focusedItem
    const selected = selectedIn(unit)
    return selected != null && options.includes(selected) ? selected : null
  }

  // —— 快捷选项：一条选项就是一次整份写值，写完收起 ——
  /**
   * 作者写的时刻归一成组件自己的值形状（'9:00' → '09:00'，多出的秒按精度截掉），
   * 命中判定与写值都用归一后的串；解析不了的为 null。
   */
  const normalizeTime = (raw: string): string | null => {
    const time = parseTimeValue(raw)
    if (!time)
      return null
    const text = formatTimeValue(draftFromTime(time), granularity)
    return text === '' ? null : text
  }
  // step 只裁列表里排哪些格，不限制值本身（段位里照样能敲出 14:37），快捷选项因此不看它
  const presets: readonly TimePickerPresetState[] = (prop('presets') ?? []).map((preset) => {
    const time = normalizeTime(preset.value)
    // 解析不了、落在 min/max 之外的，按下不写值
    const presetDisabled = !!preset.disabled || time == null || isTimeOutOfRange(time, prop('min'), prop('max'))
    return { ...preset, time, disabled: presetDisabled, selected: time != null && time === value }
  })

  /**
   * 这一列此刻的 Tab 落点：命中且按得下的那一条，没命中就落头一条按得下的。
   * 不另立「聚焦到哪一条」的状态——落点由当前值推得出来，焦点本身交给 DOM。
   */
  const presetAnchor = presets.find(preset => preset.selected && !preset.disabled)?.value
    ?? presets.find(preset => !preset.disabled)?.value
    ?? presets[0]?.value
    ?? null

  /** 快捷选项列里的全部条目，文档序。事件那一刻现查，不缓存节点数组。 */
  const presetItemsIn = (from: HTMLElement): HTMLElement[] =>
    queryItems(from.closest<HTMLElement>(parts.presets.selector), timePickerPresetQuery)

  const pickPreset = (next: string): void => {
    const preset = presets.find(p => p.value === next)
    if (!editable || !preset || preset.disabled || preset.time == null)
      return
    send({ type: 'VALUE.SET', value: preset.time, src: 'preset' })
  }

  const itemSelected = ({ unit, value: option }: { unit: TimePickerColumnUnit, value: string }): boolean =>
    selectedIn(unit) === option

  // 落在 min/max 之外的值不在生成列表里；整个控件禁用时全列都不可选；
  // 离散的不可选值由作者的钩子判，与界外同等对待
  const itemDisabled = ({ unit, value: option }: { unit: TimePickerColumnUnit, value: string }): boolean =>
    disabled || !optionsOf(unit).includes(option) || (prop('isTimeUnavailable')?.(option, unit) ?? false)

  const segmentTextOf = (segment: TimeSegmentType): string =>
    timeSegmentText(draft, segment, { hourCycle, locale })

  /**
   * 格子上的文字。数字列写的就是显示串本身；上下午列的值是 '00' / '01'，
   * 与这一段在 aria-valuenow 上报的数同一个域，要落到「上午 / 下午」得按 locale 现译。
   */
  const itemTextOf = ({ unit, value: option }: { unit: TimePickerColumnUnit, value: string }): string =>
    unit === 'dayPeriod'
      ? dayPeriodLabel(Number(option) >= 1 ? 'pm' : 'am', locale)
      : option

  // ── 分段输入：集合在事件那一刻现查，收起的段（granularity/hourCycle 关掉的）不参与移动 ──

  const liveSegments = (from: HTMLElement): HTMLElement[] =>
    queryItems(from.closest<HTMLElement>(parts.control.selector), timePickerInputQuery)
      .filter(el => !el.hasAttribute('hidden'))

  /**
   * 段间移动，不回绕也不跳过任何一段；禁用是整份控件的事。
   */
  const moveSegment = (from: HTMLElement, current: TimeSegmentType, intent: NavIntent): void => {
    focusSafely(navigateItems(liveSegments(from), current, intent, { loop: false, focusDisabled: true }))
  }

  /** 把焦点送到首段：从组件内任一节点往上找到 root，再往下取第一段。 */
  const focusFirstSegment = (from: HTMLElement): void => {
    const root = from.closest<HTMLElement>(parts.root.selector)
    focusSafely(queryItems(root, timePickerInputQuery).find(el => !el.hasAttribute('hidden')))
  }

  // ── 浮层：列内上下走、列间左右换，集合同样只在事件那一刻现查 ──

  const itemsIn = (column: HTMLElement | null): HTMLElement[] =>
    queryItems(column, timePickerItemQuery)

  /** 列内移动，走到尽头回绕；被裁掉的那些格自报 aria-disabled，自动跳过。 */
  const moveInColumn = (content: HTMLElement, intent: NavIntent): void => {
    const unit = focusedColumn ?? columns[0]?.unit ?? null
    if (unit == null)
      return
    const list = itemsIn(findTimePickerColumn(content, unit))
    focusItem(navigateItems(list, anchorOf(unit), intent, { loop: true }))
  }

  /** 列间移动。不回绕；落到目标列的锚点上（没有锚点就落到首个可停留的格）。 */
  const moveColumn = (content: HTMLElement, intent: NavIntent): void => {
    const live = queryItems(content, timePickerColumnQuery).filter(el => !el.hasAttribute('hidden'))
    const target = navigateItems(live, focusedColumn, intent, { loop: false, focusDisabled: true })
    const unit = itemValue(target) as TimePickerColumnUnit | null
    if (!target || unit == null)
      return
    const list = itemsIn(target)
    const anchor = anchorOf(unit)
    focusItem(list.find(el => itemValue(el) === anchor) ?? navigateItems(list, null, 'first'))
  }

  /** 确认键：认焦点当下所在的那一格，自报禁用的不认。 */
  const commitFocused = (content: HTMLElement): void => {
    if (focusedColumn == null || focusedItem == null)
      return
    const el = itemsIn(findTimePickerColumn(content, focusedColumn))
      .find(option => itemValue(option) === focusedItem)
    if (!el || isItemDisabled(el))
      return
    send({ type: 'ITEM.SELECT', unit: focusedColumn, value: focusedItem })
  }

  return {
    open,
    value,
    empty,
    outOfRange,
    disabled,
    readOnly,
    invalid,
    hourCycle,
    granularity,
    step,
    segments,
    focusedSegment,
    columns,
    focusedColumn,
    focusedItem,
    presets,
    canClear,
    getSegmentText: ({ segment }) => segmentTextOf(segment),
    getItemText: itemTextOf,
    isItemSelected: itemSelected,
    isItemDisabled: itemDisabled,
    setOpen: (next) => {
      if (next !== open)
        send(next ? { type: 'OPEN' } : { type: 'CLOSE' })
    },
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    clear: () => send({ type: 'VALUE.CLEAR' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 三个视觉轴打在根与 positioner 上，输入行与浮层里的部件各从就近的那一处继承皮肤声明的私有槽
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': stateAttr,
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
      // 段是 span 而非原生控件，<label for> 无处可写，点标题聚焦第一段只能在这里接管
      'onClick': (event: MouseEvent) => {
        if (disabled)
          return
        focusFirstSegment(event.currentTarget as HTMLElement)
      },
    }),

    // 输入行整体：定位锚点取它，浮层因此与整个输入框对齐而不是只贴着某一段
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'id': ids.control,
      // 几段合起来才是一个控件，靠 group 兜住，名字由 label 提供
      'role': 'group',
      'aria-labelledby': ids.label,
      // group 只支持全局属性，只读与必填不在其列，那两位由各段自己报
      'aria-disabled': disabled ? 'true' : 'false',
      'aria-invalid': flagged ? 'true' : 'false',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(flagged),
      'data-empty': dataAttr(empty),
      // 点输入行就展开：时间这种东西多数人是来挑的，不该逼着先去点那个小箭头。
      // 触发钮仍是可选部件，留着给键盘与读屏用户一个明写的入口（它才带 aria-haspopup / aria-expanded）
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

    // 段位与作者写在段间的分隔符都挂在这一层，它占满盒里剩下的宽度，尾部按钮因此靠在框内末端
    getSegmentGroupProps: () => normalize.element({
      ...parts['segment-group'].attrs,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(flagged),
    }),

    getInputProps: ({ segment }) => {
      // 这一段此刻参不参与显示；不参与的收起而不是卸载，granularity 改回去时要原地复现
      const active = segments.includes(segment)
      const range = segmentRange(segment, hourCycle)
      const num = segmentNumber(draft, segment, hourCycle)
      return normalize.element({
        ...parts.input.attrs,
        // 每一段都是一个可加减的数，用 spinbutton
        'role': 'spinbutton',
        // 导航与聚焦都以此为段的身份（事件那一刻现查 DOM 时按它定位）
        [ITEM_VALUE_ATTR]: segment,
        'aria-label': (prop('translations')?.[segment] ?? SEGMENT_LABELS[segment]),
        'aria-valuemin': range.min,
        'aria-valuemax': range.max,
        // 空段没有当前值，此时不写 aria-valuenow，写 0 会被念成零点
        'aria-valuenow': num ?? undefined,
        // 读屏念出的与眼睛看到的是同一串，空段念的是占位符
        'aria-valuetext': segmentTextOf(segment),
        'aria-disabled': disabled ? 'true' : 'false',
        'aria-readonly': readOnly ? 'true' : 'false',
        'aria-required': required ? 'true' : 'false',
        'aria-invalid': flagged ? 'true' : 'false',
        'data-placeholder': dataAttr(num == null),
        'data-focus': dataAttr(focusedSegment === segment),
        'data-disabled': dataAttr(disabled),
        'data-readonly': dataAttr(readOnly),
        'data-invalid': dataAttr(flagged),
        'hidden': !active || undefined,
        // 整组只占一个 Tab 位，段之间靠左右键走；禁用时连 -1 都不给，整份控件退出 Tab 序列
        'tabindex': disabled || !active ? undefined : (segmentAnchor === segment ? 0 : -1),
        'onFocus': () => send({ type: 'SEGMENT.FOCUS', segment }),
        'onBlur': () => {
          // 判据是本段当下正持有焦点锚点：段间移动时旧段的 blur 先于新段的 focus 派发，
          // 无条件清会把刚记下的锚点抹掉
          if (context.get('focusedSegment') === segment)
            send({ type: 'SEGMENT.BLUR' })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (disabled)
            return
          // 触发钮是可选部件，键盘那条入口不能只挂在它身上：Alt+ArrowDown 是下拉类控件
          // 通用的展开键，段上原本就不认它（下面那条 altKey 早退会直接丢掉）
          if (event.altKey && event.key === 'ArrowDown' && !open) {
            event.preventDefault()
            send({ type: 'OPEN', focus: 'selected', src: 'trigger' })
            return
          }
          // Enter 收起:段位里敲出来的值不触发"选完即收"(那时人还在打字),
          // 于是得给一个"我填完了"的手势。触发钮是可选部件,不能指望人去点那个箭头
          if (open && !event.altKey && event.key === 'Enter') {
            event.preventDefault()
            send({ type: 'CLOSE' })
            return
          }
          if (event.ctrlKey || event.metaKey || event.altKey)
            return
          const el = event.currentTarget as HTMLElement
          const key = event.key

          // 段间移动只认水平轴与 Home/End，上下键归加减
          const intent = navIntentFromKey(event, { axis: 'horizontal', dir: readDirection(event.currentTarget as Element) })
          if (intent) {
            // 左右键在可聚焦元素上可能滚动页面，必须拦下
            event.preventDefault()
            moveSegment(el, segment, intent)
            return
          }

          if (key === 'ArrowUp' || key === 'ArrowDown') {
            // 改不动的时候不拦，上下键还要留给页面滚动
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
            // 上下午段收 a/p 直接指定，与上下键的翻面并行
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
            // 这一段还吃不吃得下第二位，与机器里跑的是同一个纯函数、同一份入参
            const result = appendSegmentDigit(
              context.get('typeBuffer'),
              key,
              segmentRange(segment, hourCycle),
            )
            send({ type: 'SEGMENT.DIGIT', segment, digit: key })
            // 填满即跳下一段
            if (result.done)
              moveSegment(el, segment, 'next')
          }
        },
      })
    },

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      // 单体控件用原生 disabled：禁用的控件不该有键盘入口；只读不禁用，浮层仍可展开查看
      'disabled': disabled || undefined,
      // 展开的是几列并排的选择面板而不是列表，故报 dialog
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      // 图标按钮自己没有文字，名字借标题；作者写了 aria-label 会盖过这条
      'aria-labelledby': ids.label,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      // 原生 disabled 的按钮不派 click，但程序化派发的 click 照样送得到，故这里再守一次
      'onClick': (event: MouseEvent) => {
        if (disabled)
          return
        // 键盘激活的这一路要有可见落点；指针点开一路不补，展开那一刻不能有格子看着像被选中
        const byKey = keyActivated.delete(event.currentTarget as Element)
        send({ type: 'TOGGLE', focus: byKey ? 'first' : undefined, src: 'trigger' })
      },
      // 指针按下即撤掉键盘标记：这一次激活是指针的，之前那次按键没等来激活也就此作废
      'onPointerDown': (event: PointerEvent) => {
        keyActivated.delete(event.currentTarget as Element)
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (open || disabled)
          return
        // 上下键直接展开，落点跟着方向走：下键落首格、上键落末格
        const intent = navIntentFromKey(event, { axis: 'vertical', home: false })
        if (intent) {
          event.preventDefault()
          send({ type: 'OPEN', focus: intent === 'prev' ? 'last' : 'first', src: 'trigger' })
          return
        }
        // Enter / Space 不在这里接，按钮默认激活会再合成一次 click，两处都收会一开一关；
        // 这里只记下入口是键盘，那次 click 才认得出自己不是指针点的
        if (event.key === 'Enter' || event.key === ' ')
          keyActivated.add(event.currentTarget as Element)
      },
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      // 不占 Tab 位：键盘用户在段上按退格即可清；读屏仍能摸到它，名字走文案键
      'tabindex': -1,
      'aria-label': prop('translations')?.clearTrigger ?? 'Clear',
      // 没值就整个收起，不是禁用：有值才出现，出现即可用
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
      },
    }),

    // 键盘全在 content 上收口，选项只管声明自己。
    // Escape 归消解层管，只有栈顶层响应。
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      // 浮层是非模态对话框，与 trigger 上的 aria-haspopup="dialog" 对上；
      // 里面几列各自是 listbox。模态与否显式说，省略只是没说
      'role': 'dialog',
      'aria-modal': 'false',
      'aria-labelledby': ids.label,
      // 写 -1 而不是整个不给：某些浏览器会把可滚动区域自动塞进 Tab 序列
      'tabindex': -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
      'onKeyDown': (event: KeyboardEvent) => {
        const content = event.currentTarget as HTMLElement

        // 不 preventDefault：浮层让开，焦点按 Tab 序列自然离开
        if (event.key === 'Tab') {
          send({ type: 'CLOSE', src: 'tab' })
          return
        }
        // 快捷选项列自己吃方向键与 Enter（它是另一套集合，不是时分秒那几列）。
        // 不早退的话上下键会跑去动时列、Enter 会把焦点格提交成另一个值
        if ((event.target as HTMLElement | null)?.closest(parts.presets.selector))
          return
        // 上下键与 Home/End 在列内走
        const within = navIntentFromKey(event, { axis: 'vertical' })
        if (within) {
          event.preventDefault()
          moveInColumn(content, within)
          return
        }
        // 左右键换列
        const across = navIntentFromKey(event, { axis: 'horizontal', home: false, dir: readDirection(event.currentTarget as Element) })
        if (across) {
          event.preventDefault()
          moveColumn(content, across)
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          commitFocused(content)
        }
      },
    }),

    // 键盘挂在这一列自己身上：content 的处理器管的是时分秒那几列，两套集合不能共用一个处理器
    getPresetsProps: () => normalize.element({
      ...parts.presets.attrs,
      'role': 'listbox',
      'aria-label': prop('translations')?.presets ?? 'Shortcuts',
      'aria-orientation': 'vertical',
      // 单选与否必须显式说，省略只是没说
      'aria-multiselectable': 'false',
      'aria-disabled': disabled ? 'true' : 'false',
      'hidden': presets.length === 0 || undefined,
      // 一条都没有时由列自己接住焦点——它是 role=listbox 且有名字
      'tabindex': presetAnchor == null ? 0 : -1,
      'onKeyDown': (event: KeyboardEvent) => {
        if (disabled || event.ctrlKey || event.metaKey || event.altKey)
          return
        const items = presetItemsIn(event.currentTarget as HTMLElement)
        const current = (event.target as HTMLElement | null)?.closest<HTMLElement>(parts.preset.selector) ?? null

        // 上下键与 Home/End 在列内走，到头回绕——一列就是一圈选项；禁用的也停得上去，只是按下不写
        const within = navIntentFromKey(event, { axis: 'vertical' })
        if (within) {
          event.preventDefault()
          focusSafely(navigateItems(items, current ? itemValue(current) : null, within, { loop: true, focusDisabled: true }))
          return
        }

        if (event.key === 'Enter' || event.key === ' ') {
          // 焦点还在列上（这一列是空的）时没有可落的条目
          if (!current)
            return
          event.preventDefault()
          pickPreset(itemValue(current) ?? '')
        }
      },
    }),

    getPresetProps: ({ value: option }) => {
      const preset = presets.find(p => p.value === option)
      const presetDisabled = disabled || !!preset?.disabled
      return normalize.element({
        ...parts.preset.attrs,
        // 导航与选中都以此为选项身份
        [ITEM_VALUE_ATTR]: option,
        'role': 'option',
        // listbox 的选中语义是 aria-selected；未选中也要显式输出 false
        'aria-selected': preset?.selected ? 'true' : 'false',
        // 集合条目一律 aria-disabled，不用原生 disabled：原生 disabled 不可聚焦、不派 click
        'aria-disabled': presetDisabled ? 'true' : 'false',
        'data-state': preset?.selected ? 'checked' : 'unchecked',
        'data-disabled': dataAttr(presetDisabled),
        // roving tabindex：只有落点那一条留在 Tab 序列内，其余靠方向键到达
        'tabindex': presetAnchor === option ? 0 : -1,
        'onClick': () => pickPreset(option),
      })
    },

    getColumnProps: ({ unit }) => {
      const active = columns.some(column => column.unit === unit)
      return normalize.element({
        ...parts.column.attrs,
        // 换列时按它定位（事件那一刻现查 DOM）
        [ITEM_VALUE_ATTR]: unit,
        'role': 'listbox',
        'aria-label': (prop('translations')?.[unit] ?? SEGMENT_LABELS[unit]),
        'aria-orientation': 'vertical',
        // 单选与否必须显式说，省略只是没说
        'aria-multiselectable': 'false',
        'aria-disabled': disabled ? 'true' : 'false',
        // 有锚点时 Tab 位归那一格；没有锚点（指针打开且这一段还空着，或整列被界裁空）时
        // 由列本身认领并接住焦点——它是 role=listbox 且有名字，否则这一列没有 Tab 停靠点
        'tabindex': active && anchorOf(unit) == null ? 0 : -1,
        'data-state': stateAttr,
        'data-disabled': dataAttr(disabled),
        // granularity 关掉的列收起，不删作者节点
        'hidden': !active || undefined,
      })
    },

    getItemProps: ({ unit, value: option }) => {
      const selected = itemSelected({ unit, value: option })
      const optionDisabled = itemDisabled({ unit, value: option })
      return normalize.element({
        ...parts.item.attrs,
        // 导航与选中都以此为选项身份
        [ITEM_VALUE_ATTR]: option,
        'role': 'option',
        // listbox 的选中语义是 aria-selected 而非 aria-checked；未选中必须显式输出 false
        'aria-selected': selected ? 'true' : 'false',
        // 集合条目一律 aria-disabled，不用原生 disabled：原生 disabled 不可聚焦、不派 click
        'aria-disabled': optionDisabled ? 'true' : 'false',
        'data-state': selected ? 'checked' : 'unchecked',
        'data-disabled': dataAttr(optionDisabled),
        // 焦点所在与选中互相独立：可以停在一个没被选中的格上
        'data-highlighted': dataAttr(focusedColumn === unit && focusedItem === option),
        // roving tabindex：每列只有锚点那一格留在 Tab 序列内
        'tabindex': anchorOf(unit) === option ? 0 : -1,
        'onClick': () => {
          if (!optionDisabled)
            send({ type: 'ITEM.SELECT', unit, value: option })
        },
        // 焦点是事实不是许可：禁用的格被点到也记锚点，方向键才知道从哪儿起步
        'onFocus': () => send({ type: 'OPTION.FOCUS', unit, value: option }),
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
