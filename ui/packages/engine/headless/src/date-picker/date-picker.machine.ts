import type { Placement, PositionResult } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { CalendarSchema, CalendarSelectionMode } from '../calendar'
import type { DateFieldSchema, DateGranularity } from '../date-field'
import type { DatePickerSchema, DatePickerValueSource } from './date-picker.types'
import { getLocalTimeZone, today } from '@internationalized/date'
import { createDismissLayer, createFocusScope, itemValue } from '@xihan-ui/behavior'
import { resetDeclaredValue, setup } from '@xihan-ui/machine'
import { calendarAnatomy } from '../calendar'
import { datePickerDatePart, datePickerJoinDateTime, datePickerTimePart } from './date-picker.time'

const { createMachine, guards } = setup<DatePickerSchema>()
const { and } = guards

/** 未指定 placement 时的默认落位，定位引擎与 connect 共用。 */
export const DATE_PICKER_DEFAULT_PLACEMENT: Placement = 'bottom-start'

/** 内嵌分段输入的精度：天，值格式 YYYY-MM-DD。 */
export const DATE_PICKER_GRANULARITY: DateGranularity = 'day'

/** 日期格子的 CSS 选择器，取自日历解剖。 */
const CELL_TRIGGER_SELECTOR = calendarAnatomy.build()['cell-trigger'].selector

/** 裸串归一为单元素数组；undefined 必须原样透传，受控与否靠它区分。 */
function toValues(input: string | string[] | undefined): string[] | undefined {
  if (input === undefined)
    return undefined
  return typeof input === 'string' ? [input] : [...input]
}

/** 按字典序比较 ISO 日期串（YYYY-MM-DD 定长补零，字典序即时间序）。 */
function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/**
 * 对外的值：裁掉尾部的空位，前面的空缺原样留着。
 * 区间只填了终点时是 ['', 终点]——受控回写读的是同一份下标，抹掉这个空位会让终点
 * 落回起点那一格。只填起点时尾部无空位，仍是长度 1。
 */
function trimTrailingHoles(value: readonly string[]): string[] {
  const out = [...value]
  while (out.length > 0 && out[out.length - 1] === '')
    out.pop()
  return out
}

/** 收口选中集合：空串是占位先丢掉，单选长度 ≤ 1，多选去重升序，区间最多两端且有序。 */
function normalizeSelection(next: readonly string[], mode: CalendarSelectionMode): string[] {
  const filled = next.filter(v => v !== '')
  if (mode === 'single')
    return filled.slice(0, 1)
  const unique = [...new Set(filled)].sort(compareIso)
  return mode === 'range' ? unique.slice(0, 2) : unique
}

// 数组按位比：受控时每次读都归一成新数组，用默认的 Object.is 会把每次读写都判成变更。
// 空串是占位，与该位缺席算同一件事：对外通知过滤掉空串，回写的那一份短一截
function sameValues(a: string[], b: string[] | undefined): boolean {
  if (!b)
    return false
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i += 1) {
    if ((a[i] ?? '') !== (b[i] ?? ''))
      return false
  }
  return true
}

/** 首个真实存在的选中值；空串是占位不算数。 */
function firstValue(values: readonly string[]): string | null {
  return values.find(v => v !== '') ?? null
}

/** 取区间某一端；空串占位视同没有值。 */
function valueAt(values: readonly string[], index: 0 | 1): string | null {
  return values[index] || null
}

/**
 * 按位写入区间的一端：另一端原样留着，空缺处填空串占位，位置不因缺值而错位。
 * 两端都空即空集合。
 */
function writeRangeAt(current: readonly string[], index: 0 | 1, value: string | null): string[] {
  const next: [string, string] = [current[0] ?? '', current[1] ?? '']
  next[index] = value ?? ''
  return next[0] === '' && next[1] === '' ? [] : next
}

function timeZoneOf(service: Service<DatePickerSchema>): string {
  return service.prop('timeZone') ?? getLocalTimeZone()
}

/**
 * 生效聚焦日：context 未定过则退回首个选中值，再退回今天。
 *
 * 恒返回非空串：日历的 focusedValue 须始终受控，不得在受控与非受控之间切换。
 */
export function datePickerFocusedValue(service: Service<DatePickerSchema>): string {
  const fallback = firstValue(service.context.get('value'))
  return service.context.get('focusedValue')
    // showTime 下选中值带时间段，聚焦日只要日期段
    ?? (fallback != null ? datePickerDatePart(fallback) : null)
    ?? today(timeZoneOf(service)).toString()
}

/** showTime 生效（只支持单选，其余模式维持纯日期值）。 */
export function datePickerShowTime(service: Service<DatePickerSchema>): boolean {
  return !!service.prop('showTime') && (service.prop('selectionMode') ?? 'single') === 'single'
}

/** showTime 的时间段精度，默认分钟。 */
export function datePickerTimeGranularity(service: Service<DatePickerSchema>): 'minute' | 'second' {
  return service.prop('timeGranularity') ?? 'minute'
}

/** 喂给内嵌日历的那份 props：值与聚焦日受控，选中与聚焦经回调送回编排机。 */
export function datePickerCalendarProps(service: Service<DatePickerSchema>): CalendarSchema['props'] {
  const { prop, context, send } = service
  const withTime = datePickerShowTime(service)
  return {
    // showTime 下值带时间段，日历只认日期段
    value: withTime ? context.get('value').map(datePickerDatePart) : context.get('value'),
    focusedValue: datePickerFocusedValue(service),
    selectionMode: prop('selectionMode'),
    // 区间默认两个面板：起止常跨月，一个面板要来回翻页
    visibleCount: prop('visibleCount') ?? (prop('selectionMode') === 'range' ? 2 : 1),
    min: prop('min'),
    max: prop('max'),
    locale: prop('locale'),
    timeZone: prop('timeZone'),
    isDateUnavailable: prop('isDateUnavailable'),
    disabled: prop('disabled'),
    readOnly: prop('readOnly'),
    onValueChange: ({ value }) => {
      if (!withTime) {
        send({ type: 'VALUE.SET', value, src: 'calendar' })
        return
      }
      // 选日保时：新挑的日子接上原来的时间段，还没有时间就落零点
      const time = datePickerTimePart(firstValue(context.get('value')) ?? '')
      const granularity = datePickerTimeGranularity(service)
      send({
        type: 'VALUE.SET',
        value: value.map(v => datePickerJoinDateTime(v, time, granularity)),
        src: 'calendar',
      })
    },
    onFocusedValueChange: ({ focusedValue }) => send({ type: 'FOCUSED.SET', value: focusedValue }),
  }
}

/**
 * 喂给某一组段位的那份 props。
 *
 * 区间模式下 index 即它承载的那一端；其余模式只有起点那一组，终点那台的值恒为空。
 */
function datePickerFieldPropsAt(
  service: Service<DatePickerSchema>,
  index: 0 | 1,
): DateFieldSchema['props'] {
  const { prop, context, send } = service
  const range = (prop('selectionMode') ?? 'single') === 'range'
  const src: DatePickerValueSource = index === 0 ? 'field' : 'field-end'
  const spare = index === 1 && !range
  const withTime = datePickerShowTime(service)
  const rawValue = spare ? null : valueAt(context.get('value'), index)
  return {
    // showTime 下值带时间段，段位只认日期段
    value: rawValue != null && withTime ? datePickerDatePart(rawValue) : rawValue,
    granularity: DATE_PICKER_GRANULARITY,
    min: prop('min'),
    max: prop('max'),
    locale: prop('locale'),
    timeZone: prop('timeZone'),
    disabled: prop('disabled'),
    readOnly: prop('readOnly'),
    invalid: prop('invalid'),
    required: prop('required'),
    name: index === 0 ? prop('name') : prop('endName'),
    onValueChange: ({ value }) => {
      // 非区间模式下终点那台不参与写值
      if (spare)
        return
      // 改日保时：段位敲的是日期段，原来的时间段接回去
      const merged = value != null && withTime
        ? datePickerJoinDateTime(
            value,
            datePickerTimePart(firstValue(context.get('value')) ?? ''),
            datePickerTimeGranularity(service),
          )
        : value
      const current = context.get('value')
      const next = range
        ? writeRangeAt(current, index, merged)
        : (merged == null ? current.slice(1) : [merged, ...current.slice(1)])
      send({ type: 'VALUE.SET', value: next, src })
    },
  }
}

/** 喂给起点那组段位的 props：区间模式下承载 value[0]，其余模式承载唯一的选中值。 */
export function datePickerFieldProps(service: Service<DatePickerSchema>): DateFieldSchema['props'] {
  return datePickerFieldPropsAt(service, 0)
}

/** 喂给终点那组段位的 props：承载 value[1]，表单名走 endName。 */
export function datePickerFieldEndProps(service: Service<DatePickerSchema>): DateFieldSchema['props'] {
  return datePickerFieldPropsAt(service, 1)
}

/**
 * 在浮层里按 ISO 串找到那一天的格子。
 *
 * 不能改用 queryItems：容器是本组件的 content、格子属于 calendar scope，归属过滤会把格子全滤掉。
 */
export function findDatePickerCellEl(container: HTMLElement | null, value: string | null): HTMLElement | null {
  if (!container || value == null)
    return null
  const cells = [...container.querySelectorAll<HTMLElement>(CELL_TRIGGER_SELECTOR)]
  return cells.find(el => itemValue(el) === value) ?? null
}

// 这台机器只管开合、值同步与焦点去处；日期数学由日历算好后以 ISO 串送进来。
// 值的受控收口在 cell（给定 prop 即受控）；开合编进 FSM 状态，受控时走守卫对 + CONTROLLED.* 影子事件 + watch。
export const datePickerMachine = createMachine({
  name: 'date-picker',
  context: ({ prop, cell }) => ({
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    value: cell<string[]>(() => ({
      value: toValues(prop('value')),
      defaultValue: toValues(prop('defaultValue')) ?? [],
      isEqual: sameValues,
      onChange: value => prop('onValueChange')?.({ value: trimTrailingHoles(value) }),
    })),
    // 聚焦日不受控，onFocusedValueChange 只作对外重画通知
    focusedValue: cell<string | null>(() => ({
      defaultValue: null,
      onChange: (focusedValue) => {
        if (focusedValue != null)
          prop('onFocusedValueChange')?.({ focusedValue })
      },
    })),
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
  // 开合受控（给定 open prop）时用户事件只发意图、不自改状态；宿主写回 open 后由 watch
  // 派发 CONTROLLED.* 回写状态
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
  },
  // 两个状态都要认；展开态另行声明的 VALUE.SET 会盖过这里这一条
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { actions: ['setValue', 'syncFocusedValue'] },
    'VALUE.CLEAR': { actions: ['clearValue'] },
    'FOCUSED.SET': { actions: ['setFocusedValue'] },
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
      // 焦点域靠这个值去活 DOM 里找落点格子
      entry: ['focusSelectedDay'],
      // 进入顺序：定位 → 消解 + 焦点；退出时逆序拆，焦点归还发生在消解层撤销之后
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
        // closeOnSelect 时收起；受控的是 open 不是值，两条分支都照落值
        'VALUE.SET': [
          {
            guard: and('closesOnSelect', 'isOpenControlled'),
            actions: ['setValue', 'syncFocusedValue', 'setReturnFocus', 'invokeOnClose'],
          },
          {
            guard: 'closesOnSelect',
            target: 'closed',
            actions: ['setValue', 'syncFocusedValue', 'setReturnFocus', 'invokeOnClose'],
          },
          { actions: ['setValue', 'syncFocusedValue'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,

      /**
       * 这一次写值该不该收起浮层：只认日历那一路，多选不收起，区间要两端都落定。
       * showTime 下选完日子还要挑时间，收口交给确认按钮。
       */
      closesOnSelect: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET' || e.src !== 'calendar')
          return false
        if (prop('showTime') && (prop('selectionMode') ?? 'single') === 'single')
          return false
        if ((prop('closeOnSelect') ?? true) === false)
          return false
        const mode = prop('selectionMode') ?? 'single'
        if (mode === 'multiple')
          return false
        return e.value.length >= (mode === 'range' ? 2 : 1)
      },
    },
    actions: {
      resetToDefault: (params) => {
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
        params.context.reset('focusedValue')
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

      // Tab 关闭与层外交互不归还焦点：焦点已落在别处，抢回会把光标从新落点拽走；其余出口归还
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside')
        context.set('returnFocus', !handedOff)
      },

      // 段位来的区间值按位落：不排序也不去重，两端各自对应一组输入框
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        const mode = prop('selectionMode') ?? 'single'
        const fromField = e.src === 'field' || e.src === 'field-end'
        context.set(
          'value',
          mode === 'range' && fromField ? e.value.slice(0, 2) : normalizeSelection(e.value, mode),
        )
      },

      clearValue: ({ context }) => context.set('value', []),

      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'FOCUSED.SET')
          context.set('focusedValue', e.value)
      },

      /**
       * 值变了，日历跟着翻到那一天所在的月：终点那组段位跟终点，其余跟首个选中值。
       *
       * 不认日历那一路：日历点选时已先发过 FOCUSED.SET，这里再改一遍会把区间终点的焦点拽回起点。
       */
      syncFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET' || e.src === 'calendar')
          return
        const values = context.get('value')
        const next = e.src === 'field-end' ? valueAt(values, 1) : firstValue(values)
        if (next != null)
          context.set('focusedValue', next)
      },

      /** 展开那一刻把聚焦日拉回当前选中值；没有选中就落到今天。 */
      focusSelectedDay: ({ context, prop }) => {
        const first = firstValue(context.get('value'))
        context.set('focusedValue', first ?? today(prop('timeZone') ?? getLocalTimeZone()).toString())
      },
    },
    effects: {
      // 引擎订阅的返回值即 cleanup；位置结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => {
        const engine = refs.get('position')
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带着 hidden（高度为 0），
        // 此时算出的坐标会少掉浮层自身尺寸
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
              placement: prop('placement') ?? DATE_PICKER_DEFAULT_PLACEMENT,
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

      // 层的入栈出栈与消解层、焦点域同生命周期，绑在同一个效应里。
      // 层只能在展开期间入栈：消解层只让栈顶响应 Escape，常驻栈里会堵死其下各层的 Escape。
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
          // 日历不陷焦点也不回绕：Tab 能走出去，走出去由消解层判定是否关闭
          trapped: () => false,
          loop: false,
          // 落点显式指定为聚焦日那一格，交给 Tab 序列探测会停在第一个可聚焦元素。
          // 每次求值都现查：content 仍带 hidden 的那一帧返回 null，焦点域会重试到 DOM 就位
          initialFocus: () => findDatePickerCellEl(refs.get('getContentEl')(), context.get('focusedValue')),
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
