import type { Placement, PositionResult } from '@xihan-ui/kernel'
import type { Params } from '@xihan-ui/machine'
import type { TimeDraft, TimeGranularity, TimeHourCycle, TimeSegmentType } from '../time-field'
import type {
  TimePickerColumn,
  TimePickerColumnsOptions,
  TimePickerColumnUnit,
  TimePickerFocusIntent,
  TimePickerSchema,
} from './time-picker.types'
import { createDismissLayer, createFocusScope } from '@xihan-ui/behavior'
import { resetDeclaredValue, setup } from '@xihan-ui/machine'
import {
  appendSegmentDigit,
  clearTimeSegment,
  cycleTimeSegment,
  draftFromTime,
  emptyTimeDraft,
  formatTimeValue,
  parseTimeValue,
  resolveHourCycle,
  resolveTimeDraft,
  sameTimeDraft,
  segmentNumber,
  segmentRange,
  setTimeDayPeriod,
  setTimeSegment,
  TIME_FIELD_GRANULARITY,
  TIME_FIELD_HOUR_CYCLE,
  to12Hour,
  to24Hour,
} from '../time-field'
import { findTimePickerColumn, findTimePickerItem } from './time-picker.anatomy'

const { createMachine, guards } = setup<TimePickerSchema>()
const { and } = guards

/** 未指定 placement 时的落位；定位引擎与 connect 共用这一个缺省。 */
export const TIME_PICKER_DEFAULT_PLACEMENT: Placement = 'bottom-start'

/** 未指定 step 时的分列步进：逐分钟。 */
export const TIME_PICKER_STEP = 1

const MINUTES_IN_HOUR = 60
const SECONDS_IN_MINUTE = 60

/** 列上的选项与段上的文字用同一套两位补零，选中比对才对得上。 */
export function timePickerItemValue(display: number): string {
  return String(display).padStart(2, '0')
}

/**
 * 实际生效的分列步进，取值域 [1, 59]。
 * 0 与负数会让循环停不下来，60 及以上只剩一个 0 分可选，界外一律回落到逐分钟。
 */
export function resolveTimeStep(step?: number): number {
  const n = Math.trunc(step ?? TIME_PICKER_STEP)
  return Number.isFinite(n) && n >= 1 && n < MINUTES_IN_HOUR ? n : TIME_PICKER_STEP
}

/** 时列的显示值序列：12 小时制是 1-12，24 小时制是 0-23。 */
function hourDisplays(hourCycle: TimeHourCycle): number[] {
  if (hourCycle === 12)
    return Array.from({ length: 12 }, (_, i) => i + 1)
  return Array.from({ length: 24 }, (_, i) => i)
}

/**
 * 可选值裁剪，逐段比大小而不是整点比较：
 * 时列只看时、分列在时相等时才看分、秒列在时分都相等时才看秒。
 */
function withinLower(parts: readonly number[], bound: readonly number[]): boolean {
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]! > bound[i]!)
      return true
    if (parts[i]! < bound[i]!)
      return false
  }
  return true
}

function withinUpper(parts: readonly number[], bound: readonly number[]): boolean {
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]! < bound[i]!)
      return true
    if (parts[i]! > bound[i]!)
      return false
  }
  return true
}

function inRange(parts: readonly number[], lo: readonly number[] | null, hi: readonly number[] | null): boolean {
  if (lo && !withinLower(parts, lo.slice(0, parts.length)))
    return false
  if (hi && !withinUpper(parts, hi.slice(0, parts.length)))
    return false
  return true
}

/** ISO 串 → [时, 分, 秒]；解析不了就是 null（此侧不设界）。 */
function boundParts(value: string | undefined): number[] | null {
  const time = parseTimeValue(value)
  return time ? [time.hour, time.minute, time.second] : null
}

/**
 * 浮层里排哪几列、每列有哪些可选值。纯函数，入参全是值，不读机器也不碰 DOM。
 * step 只决定分列的粒度，秒列恒为逐秒；min/max 把不可选的裁掉而不是置灰；
 * 分列与秒列的裁剪取决于已选的时（分），没选时不收窄。
 */
export function timePickerColumns(options: TimePickerColumnsOptions = {}): TimePickerColumn[] {
  const hourCycle = options.hourCycle ?? TIME_FIELD_HOUR_CYCLE
  const granularity = options.granularity ?? TIME_FIELD_GRANULARITY
  const step = resolveTimeStep(options.step)
  const lo = boundParts(options.min)
  const hi = boundParts(options.max)
  const period = options.dayPeriod ?? 'am'
  const hour = options.hour ?? null
  const minute = options.minute ?? null

  const hours: string[] = []
  for (const display of hourDisplays(hourCycle)) {
    // 12 小时制的时列写的是显示值，落到哪个真实小时上要看当前的上午/下午
    const h24 = hourCycle === 12 ? to24Hour(display, period) : display
    if (inRange([h24], lo, hi))
      hours.push(timePickerItemValue(display))
  }
  const columns: TimePickerColumn[] = [{ unit: 'hour', options: hours }]

  if (granularity !== 'hour') {
    const minutes: string[] = []
    for (let m = 0; m < MINUTES_IN_HOUR; m += step) {
      if (hour == null || inRange([hour, m], lo, hi))
        minutes.push(timePickerItemValue(m))
    }
    columns.push({ unit: 'minute', options: minutes })
  }

  if (granularity === 'second') {
    const seconds: string[] = []
    for (let s = 0; s < SECONDS_IN_MINUTE; s++) {
      if (hour == null || minute == null || inRange([hour, minute, s], lo, hi))
        seconds.push(timePickerItemValue(s))
    }
    columns.push({ unit: 'second', options: seconds })
  }

  // 上下午列只在 12 小时制下存在，恒排末位：与分段输入里的段序一致，
  // 也让数字列的下标不随小时制变动。
  // 裁剪与时列互为对方的条件——时列按当前上下午换算成 0-23 比界，这一列则按当前的显示小时比：
  // 小时还没填时不收窄（同分列与秒列在时未填时的做法）
  if (hourCycle === 12) {
    const display = hour == null ? null : to12Hour(hour).hour
    const periods: string[] = []
    for (const candidate of ['am', 'pm'] as const) {
      if (display == null || inRange([to24Hour(display, candidate)], lo, hi))
        periods.push(timePickerItemValue(candidate === 'pm' ? 1 : 0))
    }
    columns.push({ unit: 'dayPeriod', options: periods })
  }

  return columns
}

/** 逐段缓冲转成生成列表所需的入参；connect 与机器共用这一条。 */
export function timePickerColumnsFor(
  draft: TimeDraft,
  options: Pick<TimePickerColumnsOptions, 'granularity' | 'hourCycle' | 'step' | 'min' | 'max'>,
): TimePickerColumn[] {
  return timePickerColumns({
    ...options,
    hour: draft.hour,
    minute: draft.minute,
    // 小时填上了就由它定上下午，没填才看缓冲里记着的那次按键，都没有则按上午
    dayPeriod: draft.hour != null ? to12Hour(draft.hour).period : (draft.dayPeriod ?? 'am'),
  })
}

/** 此刻该编辑哪一份逐段值；与 connect 显示用的是同一条规则。 */
function currentDraft(params: Params<TimePickerSchema>): TimeDraft {
  return resolveTimeDraft(params.context.get('value'), params.context.get('draft'))
}

function currentHourCycle(params: Params<TimePickerSchema>): TimeHourCycle {
  return resolveHourCycle(params.prop('hourCycle'), params.prop('locale'))
}

function currentGranularity(params: Params<TimePickerSchema>): TimeGranularity {
  return params.prop('granularity') ?? TIME_FIELD_GRANULARITY
}

function currentColumns(params: Params<TimePickerSchema>): TimePickerColumn[] {
  return timePickerColumnsFor(currentDraft(params), {
    granularity: currentGranularity(params),
    hourCycle: currentHourCycle(params),
    step: params.prop('step'),
    min: params.prop('min'),
    max: params.prop('max'),
  })
}

/**
 * 值的唯一写入口：先落缓冲、再落值，分段输入与浮层选中都经这里。
 * 顺序不能反：落值会触发 syncDraft 拿缓冲与值对账，缓冲没更新的话这一段会被拨回去。
 */
function commitDraft(params: Params<TimePickerSchema>, next: TimeDraft): void {
  params.context.set('draft', next)
  params.context.set('value', formatTimeValue(next, currentGranularity(params)))
}

/**
 * 值住在 context 的 cell 里，受控/非受控在 cell 收口；
 * 开合编进 FSM 状态，走守卫对加 CONTROLLED.* 影子事件加 watch 那一套。
 * 分段输入的每一条语义都直接调 time-field 导出的纯函数，不在这里另写一份。
 */
export const timePickerMachine = createMachine({
  name: 'time-picker',
  context: ({ prop, cell }) => ({
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    draft: cell<TimeDraft>(() => ({
      defaultValue: draftFromTime(parseTimeValue(prop('value') ?? prop('defaultValue'))),
      // 逐段比内容而不是比引用：每次写入都产出新对象，不比内容会重复通知宿主
      isEqual: sameTimeDraft,
    })),
    // 段与选项的焦点锚点：都不受控、不对外通知，服务 roving tabindex 与 data-focus 标记
    focusedSegment: cell<TimeSegmentType | null>(() => ({ defaultValue: null })),
    typeBuffer: cell<string>(() => ({ defaultValue: '' })),
    focusedColumn: cell<TimePickerColumnUnit | null>(() => ({ defaultValue: null })),
    focusedItem: cell<string | null>(() => ({ defaultValue: null })),
    focusIntent: cell<TimePickerFocusIntent>(() => ({ defaultValue: 'selected' })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
    // 缺省搬：触发钮、键盘与命令式入口都要把焦点送进浮层
    moveFocusIn: cell<boolean>(() => ({ defaultValue: true })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  watch: ({ track, prop, context, action }) => {
    // 开合受控时用户事件只发意图、不自改状态；宿主写回 open 后由这里派发影子事件无条件回写
    track([() => prop('open')], () => action(['syncOpen']))
    // 只兜宿主侧的写入，内部提交当场已把缓冲一起更新
    track([context.dep('value')], () => action(['syncDraft']))
  },
  // 分段输入与值这几件事与开合无关，两个状态里都得认
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { actions: ['setValue'] },
    'VALUE.CLEAR': { guard: 'canEdit', actions: ['clearValue'] },
    'SEGMENT.STEP': { guard: 'canEdit', actions: ['stepSegment'] },
    'SEGMENT.DIGIT': { guard: 'canEdit', actions: ['typeDigit'] },
    'SEGMENT.CLEAR': { guard: 'canEdit', actions: ['clearSegment'] },
    'SEGMENT.PERIOD': { guard: 'canEdit', actions: ['setPeriod'] },
    'SEGMENT.FOCUS': { actions: ['setFocusedSegment'] },
    'SEGMENT.BLUR': { actions: ['clearFocusedSegment'] },
  },
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知。
        // 落点意图先记进 context：受控那一拍走 CONTROLLED.OPEN，读不到原按键事件
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['setFocusIntent', 'setMoveFocusIn', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setFocusIntent', 'setMoveFocusIn', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setFocusIntent', 'setMoveFocusIn', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setFocusIntent', 'setMoveFocusIn', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 锚点在进入展开态时就位：列是按当前值算出来的，不必等 DOM
      entry: ['setInitialFocusedItem'],
      exit: ['clearFocusedItem'],
      // 进入 open：定位 → 消解 + 焦点。退出时逆序拆
      effects: ['trackPosition', 'trackLayer'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['setReturnFocus', 'invokeOnClose'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['setReturnFocus', 'invokeOnClose'] },
        ],
        'OPTION.FOCUS': { actions: ['setFocusedItem'] },
        // 选中不收起：时分秒是分列挑的，挑完一列还得接着挑下一列
        'ITEM.SELECT': { guard: 'canEdit', actions: ['selectItem'] },
        // 快捷选项给的是整份时间，写完就该收；命令式 setValue（无 src）照旧不收。
        // 受控的是 open 不是值，两条分支都照落值
        'VALUE.SET': [
          {
            guard: and('closesOnPreset', 'isOpenControlled'),
            actions: ['setValue', 'setReturnFocus', 'invokeOnClose'],
          },
          {
            guard: 'closesOnPreset',
            target: 'closed',
            actions: ['setValue', 'setReturnFocus', 'invokeOnClose'],
          },
          { actions: ['setValue'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      // 只读仍可展开、可在列里走，只是改不动值
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      /** 这一次写值来自快捷选项：整份时间已经定了，浮层该收起。 */
      closesOnPreset: ({ event }) => {
        const e = event.current()
        return e.type === 'VALUE.SET' && e.src === 'preset'
      },
    },
    actions: {
      resetToDefault: (params) => {
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
        params.context.reset('draft')
        params.context.reset('typeBuffer')
      },

      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),

      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },

      /** Tab 与层外交互关闭时把焦点让出，其余出口一律归还触发器。 */
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside')
        context.set('returnFocus', !handedOff)
      },

      /** 点输入行展开的那一路不搬焦点，其余（触发钮、键盘、命令式）照搬。 */
      setMoveFocusIn: ({ context, event }) => {
        const e = event.current()
        const src = e.type === 'OPEN' || e.type === 'TOGGLE' ? e.src : undefined
        context.set('moveFocusIn', src !== 'control')
      },

      setFocusIntent: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'OPEN' || e.type === 'TOGGLE')
          context.set('focusIntent', e.focus ?? 'selected')
      },

      /**
       * 展开那一刻焦点落在时列：这一段已填的值仍在列里就停在它上面，否则退回意图那一端。
       * 列由纯函数按当前值算出，这里不必查 DOM。
       */
      setInitialFocusedItem: (params) => {
        const first = currentColumns(params)[0]
        if (!first)
          return
        const current = segmentNumber(currentDraft(params), first.unit, currentHourCycle(params))
        const selected = current == null ? null : timePickerItemValue(current)
        // 指针打开且这一段还空着：不落锚点，焦点由焦点域交给列容器，
        // 展开这一刻不能有格子看着像被选中；键盘入口要预落锚点得自带 first/last 意图
        const intent = params.context.get('focusIntent')
        if (intent === 'selected' && selected == null)
          return
        const edge = intent === 'last' ? first.options.at(-1) : first.options[0]
        params.context.set('focusedColumn', first.unit)
        params.context.set(
          'focusedItem',
          selected != null && first.options.includes(selected) ? selected : (edge ?? null),
        )
      },

      setFocusedItem: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'OPTION.FOCUS')
          return
        context.set('focusedColumn', e.unit)
        context.set('focusedItem', e.value)
      },

      clearFocusedItem: ({ context }) => {
        context.set('focusedColumn', null)
        context.set('focusedItem', null)
      },

      /**
       * 浮层里选中一格：只改对应的那一段，其余段原样留着。
       * 走的是与分段输入同一个 setTimeSegment，12 小时制下按当前上午/下午换算回 0-23。
       */
      selectItem: (params) => {
        const e = params.event.current()
        if (e.type !== 'ITEM.SELECT')
          return
        params.context.set('typeBuffer', '')
        params.context.set('focusedColumn', e.unit)
        params.context.set('focusedItem', e.value)
        commitDraft(
          params,
          setTimeSegment(currentDraft(params), e.unit, Number(e.value), currentHourCycle(params)),
        )
      },

      setValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.SET')
          return
        // 走一遍解析再回填：写坏的串等同于清空
        commitDraft(params, draftFromTime(parseTimeValue(e.value)))
      },

      clearValue: (params) => {
        commitDraft(params, emptyTimeDraft())
        params.context.set('typeBuffer', '')
      },

      stepSegment: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.STEP')
          return
        // 加减是另一种输入方式，之前敲了一半的数字作废
        params.context.set('typeBuffer', '')
        commitDraft(params, cycleTimeSegment(currentDraft(params), e.segment, e.delta, currentHourCycle(params)))
      },

      typeDigit: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.DIGIT')
          return
        const hourCycle = currentHourCycle(params)
        const result = appendSegmentDigit(
          params.context.get('typeBuffer'),
          e.digit,
          segmentRange(e.segment, hourCycle),
        )
        params.context.set('typeBuffer', result.buffer)
        // 还凑不成合法值时只记着，不往段上落
        if (result.value == null)
          return
        commitDraft(params, setTimeSegment(currentDraft(params), e.segment, result.value, hourCycle))
      },

      clearSegment: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.CLEAR')
          return
        params.context.set('typeBuffer', '')
        commitDraft(params, clearTimeSegment(currentDraft(params), e.segment))
      },

      setPeriod: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.PERIOD')
          return
        params.context.set('typeBuffer', '')
        commitDraft(params, setTimeDayPeriod(currentDraft(params), e.period))
      },

      setFocusedSegment: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'SEGMENT.FOCUS')
          return
        // 换段就重开一轮数字输入
        if (context.get('focusedSegment') !== e.segment)
          context.set('typeBuffer', '')
        context.set('focusedSegment', e.segment)
      },

      clearFocusedSegment: ({ context }) => {
        context.set('focusedSegment', null)
        context.set('typeBuffer', '')
      },

      /**
       * 把缓冲拨回权威值。
       * 缓冲算出来的串与当前值一致时直接返回，否则会把填了一半的段当成外部清空抹掉。
       */
      syncDraft: (params) => {
        const value = params.context.get('value')
        if (formatTimeValue(params.context.get('draft'), currentGranularity(params)) === value)
          return
        params.context.set('draft', draftFromTime(parseTimeValue(value)))
      },
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => {
        // 进入展开态先清上一次的坐标：引擎量完之前不算落位，皮肤据此藏着。
        // 不清的话重开会按上次的位置判「已落位」——页面滚过就在旧位置闪一帧
        context.set('position', null)
        const engine = refs.get('position')
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带 hidden、高度为 0，算出的坐标会错位
        flush(() => {
          if (disposed)
            return
          const anchor = refs.get('getAnchorEl')()
          const floating = refs.get('getFloatingEl')()
          if (!anchor || !floating)
            return
          stop = engine.attach(
            anchor,
            floating,
            {
              placement: prop('placement') ?? TIME_PICKER_DEFAULT_PLACEMENT,
              offset: prop('offset'),
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
              // start / end 是逻辑对齐，RTL 下行内轴要翻过来
              dir: prop('dir'),
            },
            result => context.set('position', result),
          )
        })

        return () => {
          disposed = true
          stop?.()
        }
      },

      // 层与消解层、焦点域绑在同一个效应里，三者生命周期必须一致；
      // 层只在展开期间入栈，常驻会占死栈顶把下面各层的 Escape 堵死
      trackLayer: (params) => {
        const { refs, context, send } = params
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()

        const dismiss = createDismissLayer({
          config,
          layer,
          onDismiss: reason =>
            send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
        })

        const focus = createFocusScope({
          config,
          layer,
          // 每次读最新 ref，容器晚一拍就位也能命中
          container: () => refs.get('getContentEl')(),
          // 浮层不陷焦点也不回绕：Tab 能走出去，走出去即由消解层判定是否关闭
          trapped: () => false,
          loop: false,
          // 显式指定落焦点，两种落点都不交给 Tab 序列探测：探测按文档序取 content 的可 tab 后代，
          // 作者放在列前面的输入框会把焦点抢走，而键盘处理器挂在 content 上，方向键就此失灵。
          // 每次求值都现查，content 仍带 hidden 的那一帧返回 null，焦点域会自行重试
          initialFocus: () => {
            const content = refs.get('getContentEl')()
            if (!content)
              return null
            // 点输入行展开：焦点本来就在某个段位上，把它原样交回去——
            // 焦点域一拿到非空落点就认账，既不搬走焦点，也不会退回去聚焦浮层里头一个可聚焦元素
            if (!context.get('moveFocusIn')) {
              const anchor = refs.get('getAnchorEl')()
              const active = config.scope.getActiveElement()
              if (anchor && active instanceof HTMLElement && anchor.contains(active))
                return active
            }
            const unit = context.get('focusedColumn')
            const value = context.get('focusedItem')
            if (unit != null && value != null)
              return findTimePickerItem(content, unit, value)
            // 判据与 setInitialFocusedItem 同一条：只有「指针入口且首列那一段还空着」才真的没有锚点。
            // 其余情形是本轮该有锚点却还没挑出来（效应先于 entry 动作挂载），
            // 返回 null 让焦点域重试，别滑到列上定死——落焦一旦成功就不再重试
            const first = currentColumns(params)[0]
            const empty = !first || segmentNumber(currentDraft(params), first.unit, currentHourCycle(params)) == null
            if (!first || !empty || context.get('focusIntent') !== 'selected')
              return null
            // 确实不该有锚点：焦点落到首列，它是 role=listbox 且有名字，
            // 读屏据此进焦点模式，此刻也正认领着 Tab 位
            return findTimePickerColumn(content, first.unit)
          },
          restoreFocus: () => context.get('returnFocus'),
        })

        // 逆序拆：先撤依赖层的两个订阅，最后才把层本身移出栈
        return () => {
          focus.dispose()
          dismiss.dispose()
          disposeLayer()
        }
      },
    },
  },
})
