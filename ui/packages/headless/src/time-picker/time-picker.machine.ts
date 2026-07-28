import type { Placement, PositionResult } from '@xihan-ui/core'
import type { Params } from '@xihan-ui/machine'
import type { TimeDraft, TimeGranularity, TimeHourCycle, TimeSegmentType } from '../time-field'
import type {
  TimePickerColumn,
  TimePickerColumnsOptions,
  TimePickerColumnUnit,
  TimePickerSchema,
} from './time-picker.types'
import { createDismissLayer, createFocusScope } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
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
import { findTimePickerOption } from './time-picker.anatomy'

const { createMachine } = setup<TimePickerSchema>()

/** 未指定 placement 时的落位：浮层沿输入行起始缘展开。定位引擎与 connect 共用这一个缺省。 */
export const TIME_PICKER_DEFAULT_PLACEMENT: Placement = 'bottom-start'

/** 未指定 step 时的分列步进：逐分钟。 */
export const TIME_PICKER_STEP = 1

const MINUTES_IN_HOUR = 60
const SECONDS_IN_MINUTE = 60

/** 列上的选项与段上的文字用同一套两位补零，选中比对才对得上。 */
export function timePickerOptionValue(display: number): string {
  return String(display).padStart(2, '0')
}

/**
 * 实际生效的分列步进。取值域是 [1, 59]：
 * 0 与负数会让循环停不下来，60 及以上则只剩一个 0 分可选，两者都是写错了，一律回落到逐分钟。
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
 * 可选值裁剪。逐段比大小而不是整点比较：
 * 时列只看时、分列在时相等时才看分、秒列在时分都相等时才看秒——
 * 这样"9 点这一格"在 min=09:30 时仍留着（它下面还有 30 分之后的分可选），
 * 而 9 点下的 0-29 分才被裁掉。
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
 * 浮层里排哪几列、每列有哪些可选值。
 *
 * - step 只决定分列的粒度（秒列恒为逐秒：按步进跳秒没有实际用处，反而会让"当前秒"选不中）；
 * - min/max 把不可选的裁掉而不是留着置灰：列是滚动挑选的，留一堆点不动的格子只会碍事；
 * - 分列与秒列的裁剪取决于已选的时（分）——没选时不收窄，否则用户还没挑时就先被限死了。
 *
 * 纯函数：入参全是值，不读机器也不碰 DOM。
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
      hours.push(timePickerOptionValue(display))
  }
  const columns: TimePickerColumn[] = [{ unit: 'hour', options: hours }]
  if (granularity === 'hour')
    return columns

  const minutes: string[] = []
  for (let m = 0; m < MINUTES_IN_HOUR; m += step) {
    if (hour == null || inRange([hour, m], lo, hi))
      minutes.push(timePickerOptionValue(m))
  }
  columns.push({ unit: 'minute', options: minutes })
  if (granularity !== 'second')
    return columns

  const seconds: string[] = []
  for (let s = 0; s < SECONDS_IN_MINUTE; s++) {
    if (hour == null || minute == null || inRange([hour, minute, s], lo, hi))
      seconds.push(timePickerOptionValue(s))
  }
  columns.push({ unit: 'second', options: seconds })
  return columns
}

/** 逐段缓冲 → 生成列表所需的那几个入参。connect 与机器共用这一条，两边看到的列必然相同。 */
export function timePickerColumnsFor(
  draft: TimeDraft,
  options: Pick<TimePickerColumnsOptions, 'granularity' | 'hourCycle' | 'step' | 'min' | 'max'>,
): TimePickerColumn[] {
  return timePickerColumns({
    ...options,
    hour: draft.hour,
    minute: draft.minute,
    // 小时填上了就由它定上下午，没填才看缓冲里记着的那次按键，再没有按上午
    dayPeriod: draft.hour != null ? to12Hour(draft.hour).period : (draft.dayPeriod ?? 'am'),
  })
}

/** 此刻该编辑哪一份逐段值：与 connect 显示用的是同一条规则，不然改的和看到的会是两份东西。 */
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
 * 值的唯一写入口：先落缓冲、再落值。分段输入与浮层选中都经这里。
 *
 * 顺序不能反——落值会触发 syncDraft，它拿缓冲与值对账；缓冲要是还没更新，
 * 这一轮刚改的那一段会被当成"外部改了值"而被拨回去。
 */
function commitDraft(params: Params<TimePickerSchema>, next: TimeDraft): void {
  params.context.set('draft', next)
  params.context.set('value', formatTimeValue(next, currentGranularity(params)))
}

/**
 * 值住在 context 的 cell 里，不编码进状态（cell 本身就是受控/非受控的收口点）；
 * 开合是布尔态、编进 FSM 状态，走「守卫对 + CONTROLLED.* 影子事件 + watch」那一套。
 *
 * 分段输入的每一条语义（加减、数字直输、清段、上午/下午）都直接调 time-field 导出的纯函数，
 * 不在这里另写一份：两个组件因此不可能各算各的，"两条路必须同步"是结构上成立的，
 * 不是靠两处代码互相看齐维持的。
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
      // 逐段比内容而不是比引用：每次写入都产出新对象，值原样不动也会通知宿主一遍
      isEqual: sameTimeDraft,
    })),
    // 段与选项的焦点锚点：都不受控、不对外通知，服务 roving tabindex 与 data-focus 标记
    focusedSegment: cell<TimeSegmentType | null>(() => ({ defaultValue: null })),
    typeBuffer: cell<string>(() => ({ defaultValue: '' })),
    focusedColumn: cell<TimePickerColumnUnit | null>(() => ({ defaultValue: null })),
    focusedOption: cell<string | null>(() => ({ defaultValue: null })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
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
    // 只兜宿主侧的写入（受控回写、外部改 value）：内部提交当场就把缓冲一起更新过了
    track([context.dep('value')], () => action(['syncDraft']))
  },
  // 分段输入与值这几件事与开合无关，两个状态里都得认
  on: {
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
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setReturnFocus', 'invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setReturnFocus', 'invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 锚点在进入展开态时就位：列是按当前值算出来的，不必等 DOM 就知道该停在哪一格。
      // 锚点定了才有选项认领 tabindex=0，焦点域随后按它把焦点交出去
      entry: ['setInitialFocusedOption'],
      exit: ['clearFocusedOption'],
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
        'OPTION.FOCUS': { actions: ['setFocusedOption'] },
        // 选中不收起：时分秒是分列挑的，挑完一列还得接着挑下一列
        'OPTION.SELECT': { guard: 'canEdit', actions: ['selectOption'] },
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      // 只读仍可展开、可在列里走，只是改不动值；禁用连键都不该到这儿
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),

      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },

      /**
       * 每次开合都重算焦点归还策略。Tab 是要去下一个控件、层外指针交互是用户已经点中了别的东西——
       * 这两种情况下抢回焦点，会把光标从他刚点的输入框里拽走。其余出口一律归还触发器。
       */
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside')
        context.set('returnFocus', !handedOff)
      },

      /**
       * 展开那一刻焦点落在时列：已选的时仍在列里就停在它上面，否则退回首格。
       * 列是纯函数按当前值算出来的，所以这里不必查 DOM——首帧选项还没挂上身份标记也不影响锚点。
       */
      setInitialFocusedOption: (params) => {
        const first = currentColumns(params)[0]
        if (!first)
          return
        const current = segmentNumber(currentDraft(params), first.unit, currentHourCycle(params))
        const selected = current == null ? null : timePickerOptionValue(current)
        params.context.set('focusedColumn', first.unit)
        params.context.set(
          'focusedOption',
          selected != null && first.options.includes(selected) ? selected : (first.options[0] ?? null),
        )
      },

      setFocusedOption: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'OPTION.FOCUS')
          return
        context.set('focusedColumn', e.unit)
        context.set('focusedOption', e.value)
      },

      clearFocusedOption: ({ context }) => {
        context.set('focusedColumn', null)
        context.set('focusedOption', null)
      },

      /**
       * 浮层里选中一格：只改对应的那一段，其余段原样留着。
       * 走的是与分段输入同一个 setTimeSegment——12 小时制下时列写的是 1-12，
       * 换算回 0-23 时取当前的上午/下午，这条规则两条路共用一份实现。
       */
      selectOption: (params) => {
        const e = params.event.current()
        if (e.type !== 'OPTION.SELECT')
          return
        params.context.set('typeBuffer', '')
        params.context.set('focusedColumn', e.unit)
        params.context.set('focusedOption', e.value)
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
        // 加减是另一种输入方式，之前敲了一半的数字不再作数
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
        // 还凑不成一个合法值时只记着，不往段上落——落了会让界面在半途闪一个错的数
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
        // 换段就重开一轮数字输入：上一段敲了一半的数不该续到这一段上
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
       * 缓冲算出来的串与当前值一致时直接返回：那说明这一轮变化正是内部提交引起的，
       * 再拨一次会把"填了一半"的那些段（值此时是空串）当成外部清空而抹掉。
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
        const engine = refs.get('position')
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带着 hidden（高度为 0），
        // 此时算出的坐标会少掉浮层自身的尺寸——placement=top 会正好错位一个浮层高度
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
            { placement: prop('placement') ?? TIME_PICKER_DEFAULT_PLACEMENT, offset: prop('offset') },
            result => context.set('position', result),
          )
        })

        return () => {
          disposed = true
          stop?.()
        }
      },

      // 层的入栈出栈与消解层、焦点域绑在同一个效应里：三者生命周期必须完全一致。
      // 层只在展开期间入栈——消解层只让栈顶响应 Escape，若层与开合无关地常驻栈里，
      // 同页后挂载的那个会永久占着栈顶，把它下面每一层的 Escape 都堵死
      trackLayer: ({ refs, context, send }) => {
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
          // 显式指定落焦点为锚点选项，不交给 Tab 序列探测：探测只会落到容器上，
          // 而列里那一格才是方向键的起点。每次求值都现查，content 仍带 hidden 的那一帧返回 null，
          // 焦点域会自行重试到 DOM 就位
          initialFocus: () => {
            const unit = context.get('focusedColumn')
            const value = context.get('focusedOption')
            if (unit == null || value == null)
              return null
            return findTimePickerOption(refs.get('getContentEl')(), unit, value)
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
