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

/** 未指定 placement 时的落位：日历沿输入行起始缘展开。定位引擎与 connect 共用这一个缺省。 */
export const DATE_PICKER_DEFAULT_PLACEMENT: Placement = 'bottom-start'

/**
 * 内嵌分段输入的精度恒为「天」：日期选择器的值与日历同源，都是 YYYY-MM-DD。
 * 要时分秒的形态由 TimeField 单独承担，硬塞进来只会让两侧的值对不齐。
 */
export const DATE_PICKER_GRANULARITY: DateGranularity = 'day'

/** 日期格子的 CSS 选择器（日历那一份解剖的部件）。焦点落点靠它在活 DOM 里找回。 */
const CELL_TRIGGER_SELECTOR = calendarAnatomy.build()['cell-trigger'].selector

/** 裸串是单选的简写，内部一律按数组处理；undefined 要原样透传，受控与否靠它区分。 */
function toValues(input: string | string[] | undefined): string[] | undefined {
  if (input === undefined)
    return undefined
  return typeof input === 'string' ? [input] : [...input]
}

/**
 * ISO 日期串按字典序比就是按时间比（YYYY-MM-DD 定长补零）。
 * 不用解析成值对象再比：这里只关心先后，解析一趟只是把脏值的抛错风险搬进排序里。
 */
function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/**
 * 选中集合的不变量，与日历那边逐字相同：单选恒为长度 ≤ 1，多选去重升序，区间最多两端且有序。
 * 日历送进来的值本就满足它；这里收口的是另外两路——分段输入的写回与公开 API。
 * 区间尤其要排序：在段位里改了起点，很可能就改到终点后面去了。
 */
function normalizeSelection(next: readonly string[], mode: CalendarSelectionMode): string[] {
  if (mode === 'single')
    return next.slice(0, 1)
  const unique = [...new Set(next)].sort(compareIso)
  return mode === 'range' ? unique.slice(0, 2) : unique
}

/**
 * 数组按元素比。默认的 Object.is 在这里不成立：受控时每次读都要把 prop 归一成新数组，
 * 引用恒不相等——版本号会每读一次自增一次（track 空转），
 * 写入时又会把「值其实没变」判成变了，onValueChange 便会重复发。
 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

function timeZoneOf(service: Service<DatePickerSchema>): string {
  return service.prop('timeZone') ?? getLocalTimeZone()
}

/**
 * 生效聚焦日：宿主还没定过就退回首个选中值，再退回今天——与日历自己的三路收口同一套顺序。
 *
 * 提前在这里算出来，是为了让日历的聚焦日**恒处于受控**：只有把唯一事实源收在编排机手里，
 * 「段位里敲了个新日期，日历跟着翻过去」这条同步才推得动。
 * 中途在受控与非受控之间来回切是最难查的一类 bug，宁可每次都给足值。
 */
export function datePickerFocusedValue(service: Service<DatePickerSchema>): string {
  return service.context.get('focusedValue')
    ?? service.context.get('value')[0]
    ?? today(timeZoneOf(service)).toString()
}

/**
 * 喂给内嵌日历的那份 props。
 *
 * 值与聚焦日都受控（唯一事实源在编排机），其余是原样转发的约束条件。
 * 选中与聚焦的意图经两个回调送回编排机，日历自己不落值——
 * 于是「日历选了什么」与「输入框显示什么」不可能各说各话。
 */
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

/**
 * 喂给内嵌分段输入的那份 props。
 *
 * 段位只承载首个选中值：区间的终点、多选的其余项在一排段位里表达不出来。
 * 写回时因此只替换首项、其余原样留着（区间里改起点不该把终点抹掉），
 * 排序与去重交给 setValue 收口。
 */
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
 * 不走 queryItems：它的归属过滤拿「容器自己的 part」当判据，而这里容器是本组件的 content、
 * 格子是日历那一份解剖的部件，两者 scope 不同，过滤会把格子全部滤掉。
 * 嵌套两个日期选择器也不会串：content 是各自浮层的根，查询本就限在自己那一棵子树里。
 */
export function findDatePickerCellEl(container: HTMLElement | null, value: string | null): HTMLElement | null {
  if (!container || value == null)
    return null
  const cells = [...container.querySelectorAll<HTMLElement>(CELL_TRIGGER_SELECTOR)]
  return cells.find(el => itemValue(el) === value) ?? null
}

// 选中值住在 cell 里（cell 本身就是受控/非受控的收口点：给定 prop 即受控，
// 读直取 prop、写只发回调不落内部值），因此这一路不需要影子事件。
// 开合是布尔态、编进 FSM 状态，走「守卫对 + CONTROLLED.* 影子事件 + watch」那一套。
//
// 日期数学一概不在这里做：落点由日历用纯函数算好、以 ISO 串送进来。
// 这台机器只管开合、值同步与焦点去处三件事。
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
    // 聚焦日不受控（宿主要盯的是选中值），但要对外通知：网格是作者渲染的，
    // 这条回调是「该重画了」的唯一信号
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
  // 开合受控（open prop 给定）时用户事件只发意图、不自改状态；宿主写回 open 后由 watch
  // 派发影子事件 CONTROLLED.* 无条件回写。值受控走 cell，不需要这一套。
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
  },
  // 这两件事与开合无关，两个状态里都得认。展开态另行声明的 VALUE.SET 会盖过这里那一条
  // （那儿还要判断选完了没有、要不要收起）。
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
      // 每次展开都把聚焦日拉回当前选中值（无选中则今天）：上一轮翻到别处的月份不该留到下一次，
      // 焦点域也正是靠这个值去活 DOM 里找落点格子的
      entry: ['focusSelectedDay'],
      // 进入 open：定位 → 消解 + 焦点。退出 open 时逆序拆，焦点归还发生在消解层撤销之后
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
        // 日历选完一天：closeOnSelect 时顺手收起（区间要两端都落定）。
        // 值照落不误——受控的是 open，不是值；两者各自按各自的契约走
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
       * 这一次写值该不该顺手收起浮层。
       * 只认日历那一路：段位里敲日期时浮层多半没开着，敲到一半就收起更是灾难。
       * 区间要两端都落定——只落了起点就收起，用户根本选不完一段。
       */
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

      // 每次开合都重算：Tab 关闭要把焦点让给 Tab 序列的下一个元素，层外交互是用户已经点中了
      // 别的东西——这两种情况下抢回焦点，会把光标从他刚点的输入框里拽走。
      // 其余出口（Escape、选完收起、再点一次 trigger）一律归还。
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
       * 值变了，日历跟着翻到那一天所在的月。
       *
       * 刻意不认日历自己那一路：点日期时日历已经先发过一次 FOCUSED.SET（落点就是被点的那天），
       * 这里再按首个选中值改一遍，区间选终点时焦点会被拽回起点。
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
            { placement: prop('placement') ?? DATE_PICKER_DEFAULT_PLACEMENT, offset: prop('offset') },
            result => context.set('position', result),
          )
        })

        return () => {
          disposed = true
          stop?.()
        }
      },

      // 层的入栈出栈与消解层、焦点域绑在同一个效应里：三者生命周期必须完全一致。
      // 层只在展开期间入栈——消解层只让栈顶响应 Escape，若层在挂载期就注册、与开合无关地
      // 常驻栈里，同页后挂载的那个会永久占着栈顶，把它下面每一层的 Escape 都堵死。
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
          // 日历不陷焦点也不回绕：Tab 能走出去，走出去即由消解层判定是否关闭
          trapped: () => false,
          loop: false,
          // 显式指定落点为聚焦日那一格，不交给 Tab 序列探测：探测会停在浮层里第一个
          // 可聚焦元素（多半是上一月按钮），用户一展开就得先按半天方向键才走到日期上。
          // 每次求值都现查，content 仍带 hidden 的那一帧返回 null，焦点域会自行重试到 DOM 就位
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
