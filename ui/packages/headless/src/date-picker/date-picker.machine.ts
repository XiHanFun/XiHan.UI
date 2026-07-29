import type { Placement, PositionResult } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { CalendarSchema, CalendarSelectionMode } from '../calendar'
import type { DateFieldSchema, DateGranularity } from '../date-field'
import type { DatePickerSchema } from './date-picker.types'
import { getLocalTimeZone, today } from '@internationalized/date'
import { createDismissLayer, createFocusScope, itemValue } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { calendarAnatomy } from '../calendar'

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

/** 收口选中集合：单选长度 ≤ 1，多选去重升序，区间最多两端且有序。 */
function normalizeSelection(next: readonly string[], mode: CalendarSelectionMode): string[] {
  if (mode === 'single')
    return next.slice(0, 1)
  const unique = [...new Set(next)].sort(compareIso)
  return mode === 'range' ? unique.slice(0, 2) : unique
}

// 数组按元素比：受控时每次读都归一成新数组，用默认的 Object.is 会把每次读写都判成变更
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
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
  return service.context.get('focusedValue')
    ?? service.context.get('value')[0]
    ?? today(timeZoneOf(service)).toString()
}

/** 喂给内嵌日历的那份 props：值与聚焦日受控，选中与聚焦经回调送回编排机。 */
export function datePickerCalendarProps(service: Service<DatePickerSchema>): CalendarSchema['props'] {
  const { prop, context, send } = service
  return {
    value: context.get('value'),
    focusedValue: datePickerFocusedValue(service),
    selectionMode: prop('selectionMode'),
    min: prop('min'),
    max: prop('max'),
    locale: prop('locale'),
    timeZone: prop('timeZone'),
    isDateUnavailable: prop('isDateUnavailable'),
    disabled: prop('disabled'),
    readOnly: prop('readOnly'),
    onValueChange: ({ value }) => send({ type: 'VALUE.SET', value, src: 'calendar' }),
    onFocusedValueChange: ({ focusedValue }) => send({ type: 'FOCUSED.SET', value: focusedValue }),
  }
}

/** 喂给内嵌分段输入的那份 props：段位只承载首个选中值。 */
export function datePickerFieldProps(service: Service<DatePickerSchema>): DateFieldSchema['props'] {
  const { prop, context, send } = service
  return {
    value: context.get('value')[0] ?? null,
    granularity: DATE_PICKER_GRANULARITY,
    min: prop('min'),
    max: prop('max'),
    locale: prop('locale'),
    timeZone: prop('timeZone'),
    disabled: prop('disabled'),
    readOnly: prop('readOnly'),
    invalid: prop('invalid'),
    required: prop('required'),
    name: prop('name'),
    onValueChange: ({ value }) => {
      const current = context.get('value')
      const next = value == null ? current.slice(1) : [value, ...current.slice(1)]
      send({ type: 'VALUE.SET', value: next, src: 'field' })
    },
  }
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
      onChange: value => prop('onValueChange')?.({ value }),
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

      /** 这一次写值该不该收起浮层：只认日历那一路，多选不收起，区间要两端都落定。 */
      closesOnSelect: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET' || e.src !== 'calendar')
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

      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeSelection(e.value, prop('selectionMode') ?? 'single'))
      },

      clearValue: ({ context }) => context.set('value', []),

      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'FOCUSED.SET')
          context.set('focusedValue', e.value)
      },

      /**
       * 值变了，日历跟着翻到首个选中值所在的月。
       *
       * 不认日历那一路：日历点选时已先发过 FOCUSED.SET，这里再改一遍会把区间终点的焦点拽回起点。
       */
      syncFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET' || e.src === 'calendar')
          return
        const first = context.get('value')[0]
        if (first != null)
          context.set('focusedValue', first)
      },

      /** 展开那一刻把聚焦日拉回当前选中值；没有选中就落到今天。 */
      focusSelectedDay: ({ context, prop }) => {
        const first = context.get('value')[0]
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
            { placement: prop('placement') ?? DATE_PICKER_DEFAULT_PLACEMENT, offset: prop('offset') },
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
