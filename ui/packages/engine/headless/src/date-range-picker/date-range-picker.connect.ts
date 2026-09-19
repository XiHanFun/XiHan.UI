/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date range picker 相关实现。

import type { Dict, NavIntent, NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { CalendarRangePickerTranslations } from '../calendar-range-picker'
import type { DateFieldApi, DateFieldSchema, DateSegmentType } from '../date-field'
import type {
  DateRangePickerApi,
  DateRangePickerFieldApi,
  DateRangePickerPresetState,
  DateRangePickerPressedKey,
  DateRangePickerServices,
  DateRangePickerTranslations,
} from './date-range-picker.types'
import { createPressTracker, dataAttr, focusSafely, navIntentFromKey, normalizeProps, readDirection, stepIndex } from '@xihan-ui/core'
import { connectCalendarRangePicker } from '../calendar-range-picker'
import {
  applySegmentDigit,
  connectDateField,
  dateFieldAnatomy,
  dateSegmentRange,
  parseBoundary,
  segmentMaxDigits,
} from '../date-field'
import { datePickerPresetDates } from '../date-picker'
import { sameArray as sameDates } from '../shared/array'
import { calendarPeriodValue } from '../shared/calendar'
import { overlayAvailableSpaceVars, overlayFixedStyle, overlayPositioned } from '../shared/overlay'
import { dateRangePickerAnatomy } from './date-range-picker.anatomy'
import { DATE_RANGE_PICKER_DEFAULT_PLACEMENT } from './date-range-picker.machine'

const parts = dateRangePickerAnatomy.build()
/** 段位的 CSS 选择器，取自分段输入那一份解剖。 */
const SEGMENT_SELECTOR = dateFieldAnatomy.build().segment.selector

const DIGIT = /^\d$/

function hasModifier(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey
}

/** 只收本组件自己那几句；内嵌日历的文案由日历自己兜底。 */
type OwnTranslations = Omit<DateRangePickerTranslations, keyof CalendarRangePickerTranslations>

function resolveTranslations(input: Partial<DateRangePickerTranslations> | undefined): OwnTranslations {
  return {
    startDate: input?.startDate ?? 'Start date',
    endDate: input?.endDate ?? 'End date',
    presets: input?.presets ?? 'Shortcuts',
    clearTrigger: input?.clearTrigger ?? 'Clear',
  }
}

export function connectDateRangePicker<T extends PropTypes>(
  services: DateRangePickerServices,
  normalize: NormalizeProps<T>,
): DateRangePickerApi<T> {
  const { state, prop, send, context, scope } = services.root
  const open = state.get() === 'open'
  // 两组段位容器各占一个 id：同一份 id 出现两次会被判成重复 id
  const ids = scope.ids('date-range-picker', 'label', 'trigger', 'content', 'segment-group', 'segment-group-end')

  const value = context.get('value')
  // 空串是空缺那一端的占位，算数的只有填了的
  const filled = value.filter(v => v !== '')
  const label = resolveTranslations(prop('translations'))
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  // 只读与禁用都改不了选中值，禁用还额外展不开浮层
  const interactive = !disabled && !readOnly
  const canClear = interactive && filled.length > 0
  const stateAttr = open ? 'open' : 'closed'

  // 按压通道：三类可按部件各自合成一份跟踪器，真源是编排机器 context 里「正被按住的那一个」；
  // Space / Enter 与触屏按住投影 data-pressed，指针按住由 :active 表出，皮肤两者同一档。
  // 日历里的翻页钮、标题与日期格由 calendar-range-picker 自己的机器记。
  // 逐条禁用（作者禁用 / 不成一对 / 不可用的快捷选项、清不了的清空钮）随 PRESS.START 带给守卫
  const pressed = context.get('pressed')
  const press = (key: DateRangePickerPressedKey, pressDisabled = false): PressHandlers & { 'data-pressed': '' | undefined } => {
    const handlers = createPressTracker({
      isPressed: () => context.get('pressed') === key,
      onChange: down => send(down ? { type: 'PRESS.START', key, disabled: pressDisabled } : { type: 'PRESS.END', key }),
    })
    return {
      'data-pressed': dataAttr(pressed === key),
      'onKeyDown': handlers.onKeyDown,
      'onKeyUp': handlers.onKeyUp,
      'onBlur': handlers.onBlur,
      'onPointerDown': handlers.onPointerDown,
      'onPointerUp': handlers.onPointerUp,
      'onPointerCancel': handlers.onPointerCancel,
    }
  }
  // connect 在 render 期求值，不得读 DOM：位置只读引擎写进 context 的结果
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? DATE_RANGE_PICKER_DEFAULT_PLACEMENT

  // 内嵌日历：整份 api 原样转发
  const calendar = connectCalendarRangePicker(services.calendar, normalize)
  // 两端都在才有连续区间可言
  const periodValue = value[0] && value[1]
    ? calendarPeriodValue(calendar.granularity, 'range', [value[0], value[1]], { locale: prop('locale'), timeZone: prop('timeZone') })
    : null

  // —— 快捷选项：一条选项就是一次整份写值 ——
  const presetInput = prop('presets') ?? []
  const presets: readonly DateRangePickerPresetState[] = presetInput.map((preset) => {
    const dates = datePickerPresetDates(preset.value)
    // 不是恰好两端、或有哪一天落在 min/max 之外 / 被作者判为不可用的，按下不写值
    const presetDisabled = !!preset.disabled || dates.length !== 2 || dates.some(d => calendar.isUnavailable(d))
    const selected = dates.length > 0 && sameDates(filled, dates)
    return { ...preset, dates, disabled: presetDisabled, selected }
  })

  /** 一列里的全部选项，文档序。事件那一刻现查，不缓存节点数组。 */
  const presetItemsIn = (from: HTMLElement): HTMLElement[] => {
    const list = from.closest<HTMLElement>(parts['preset-group'].selector)
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

  /** 点快捷选项：两端一次写进去，收不收浮层由 closeOnSelect 那条守卫决定。 */
  const pickPreset = (v: string): void => {
    const preset = presets.find(p => p.value === v)
    if (!interactive || !preset || preset.disabled)
      return
    send({ type: 'VALUE.SET', value: preset.dates, src: 'preset' })
  }

  /**
   * 内嵌分段输入用恒等归一化连一次，拿到原始 prop 字典。
   *
   * 不能传调用方的归一化器：它已把 onKeyDown 改成各框架的事件键名，再覆盖会变成两个键、两个处理器。
   */
  const fieldRaw = connectDateField(services.field, normalizeProps)
  const fieldEndRaw = connectDateField(services.fieldEnd, normalizeProps)
  const bounds = { min: parseBoundary(prop('min')), max: parseBoundary(prop('max')) }
  // 越界与显式 invalid 在读屏那里是同一件事：这份输入现在不合法。
  // 整份控件的不合法态照它发，只标出错的那一组段位等于把反馈藏在输入行里的一小块。
  // 两端各是一份分段输入，任一端越界整份就都算越界；
  // 两端都填了却终点早于起点，同样不合法：两组段位各写各的，顺序只能在这里把关
  const reversed = !!value[0] && !!value[1] && value[1] < value[0]
  const flagged = invalid || !!fieldRaw.outOfRange || !!fieldEndRaw.outOfRange || reversed

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

  /** 把一组段位包成对外那一面：换段在这里补，其余原样转发。 */
  const toFieldApi = (
    service: Service<DateFieldSchema>,
    raw: DateFieldApi,
  ): DateRangePickerFieldApi<T> => ({
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

    getHiddenInputProps: () => normalize.input(raw.getHiddenInputProps() as Dict),
  })

  const field = toFieldApi(services.field, fieldRaw)
  const fieldEnd = toFieldApi(services.fieldEnd, fieldEndRaw)

  // 形态默认落 outline：不写时 root 与 positioner 如实投影同一常量，皮肤不再依赖缺省档
  const variant = prop('variant') ?? 'outline'

  return {
    open,
    value,
    start: value[0] || null,
    end: value[1] || null,
    periodValue,
    // 取日历已收口的结果（宿主设过的 → 首个选中值 → 今天），不在这里重算
    focusedValue: calendar.focusedValue,
    granularity: calendar.granularity,
    activeView: calendar.activeView,
    disabled,
    readOnly,
    // 与根节点的 data-invalid 同一口径：作者标的、越界的、终点早于起点的都算
    invalid: flagged,
    canClear,
    presets,
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
      'data-variant': variant,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(flagged),
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
    // control 是唯一的视觉盒：描边、底色、聚焦环由 Field Chrome 家族画在它身上，
    // 三个状态属性供家族按禁用 / 只读 / 校验切换盒观感；size 缺省 md，variant 与 root 同源
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-xh-field-chrome': '',
      'data-xh-field-size': prop('size') ?? 'md',
      'data-variant': variant,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(flagged),
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

    // 分段容器：role=group 把一排段位兜成整体。两组各自报名字，否则读屏念出来的是同一个。
    // 它同时承担内嵌分段输入的 root/control 两个部件，不另挂分段输入的根节点
    getSegmentGroupProps: ({ index = 0 } = {}) => {
      const end = index === 1
      const raw = end ? fieldEndRaw : fieldRaw
      const outOfRange = raw.outOfRange
      return normalize.element({
        ...parts['segment-group'].attrs,
        'id': end ? ids['segment-group-end'] : ids['segment-group'],
        'data-index': String(index),
        'role': 'group',
        // 两组各自报「开始日期」「结束日期」；字段标题挂在 trigger 与浮层上，两组段位不再各重复一遍
        'aria-label': end ? label.endDate : label.startDate,
        'aria-disabled': disabled ? 'true' : 'false',
        'data-disabled': dataAttr(disabled),
        'data-readonly': dataAttr(readOnly),
        'data-invalid': dataAttr(invalid || outOfRange),
        'data-empty': dataAttr(raw.empty),
        'data-complete': dataAttr(raw.complete),
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

    getRangeSeparatorProps: () => normalize.element({
      ...parts['range-separator'].attrs,
      'aria-hidden': true,
    }),

    // 日历钮走 Action Control 的 field-inset ghost 档：字段底是 canvas，透明 → 悬停 100 → 按下 200；
    // 常驻在场，有值时由皮肤按「清空钮在场」收起；打开中与悬停同档、不另上底，方向由浮层承担
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'field-inset',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
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
      // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active
      ...press('trigger', disabled),
      'onClick': () => {
        // 守卫防程序化派发（原生 disabled 不派 click）
        if (!disabled)
          send({ type: 'TOGGLE', src: 'trigger' })
      },
    }),

    // 清空钮同走 field-inset ghost 档，按 has-value 显隐
    getClearTriggerProps: () => {
      const clearPress = press('clear', !canClear)
      return normalize.button({
        ...parts['clear-trigger'].attrs,
        'data-xh-action-control': '',
        'data-xh-action-profile': 'field-inset',
        'data-xh-action-variant': 'ghost',
        'data-xh-action-display': 'has-value',
        'data-xh-action-size': prop('size') ?? 'md',
        'data-xh-action-has-value': dataAttr(canClear),
        // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active
        'data-pressed': dataAttr(pressed === 'clear'),
        'type': 'button',
        // 不进 Tab 序列：段位上按退格即可清值；读屏仍能按名字找到它
        'tabindex': -1,
        'aria-label': label.clearTrigger,
        // 没值就整个收起：有值才出现，出现即可用
        'hidden': !canClear || undefined,
        // 不拦的话浏览器会把焦点挪到这个按钮上，清完焦点就落在一个隐身节点里；触屏按下仍要进按压通道
        'onPointerDown': (event: PointerEvent) => {
          if (event.button === 0)
            event.preventDefault()
          clearPress.onPointerDown(event)
        },
        'onPointerUp': clearPress.onPointerUp,
        'onPointerCancel': clearPress.onPointerCancel,
        'onKeyDown': clearPress.onKeyDown,
        'onKeyUp': clearPress.onKeyUp,
        'onBlur': clearPress.onBlur,
        'onClick': (event: MouseEvent) => {
          if (!canClear)
            return
          send({ type: 'VALUE.CLEAR' })
          // pointerdown 已拦掉默认聚焦，键盘/程序化激活这一路则要主动把焦点送回首段
          focusFirstSegment(event.currentTarget as HTMLElement)
        },
      })
    },

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
      'dir': prop('dir'),
      // 视觉轴在浮层这一侧再打一次：positioner 被搬到 portal 落点，继承不到根上的私有槽
      'data-variant': variant,
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
        ...overlayFixedStyle(position),
        ...overlayAvailableSpaceVars('date-range-picker', position),
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
      // Presence 保留视觉节点期间，逻辑关闭立即撤出交互与可访问树。
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
    }),

    // 键盘挂在这一列自己身上，不挂 content：同一份浮层里还有日历那张网格与时间列，
    // 它们各吃各的方向键，两个处理器挂同一个节点会互相抢
    getPresetGroupProps: () => normalize.element({
      ...parts['preset-group'].attrs,
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
      // 快捷选项走 Collection Item 的 overlay 语境：悬停 / 高亮 100、按下 200 由家族给，选中只留行尾对号
      return normalize.element({
        ...parts.preset.attrs,
        'data-xh-collection-item': '',
        'data-xh-collection-size': prop('size') ?? 'md',
        'data-xh-collection-context': 'overlay',
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
        // 按住的回执与写值同一道门：只读、逐条禁用都不进；Enter 写值收起后由展开态的 exit 松开
        ...press(`preset:${v}`, presetDisabled || readOnly),
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

  }
}
