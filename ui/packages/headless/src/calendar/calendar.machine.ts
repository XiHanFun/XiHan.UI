import type { CalendarSchema, CalendarSelectionMode } from './calendar.types'
import { focusItem, itemValue, queryItems } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { calendarCellTriggerQuery } from './calendar.anatomy'

const { createMachine } = setup<CalendarSchema>()

/** 裸串是单选的简写，内部一律按数组处理；undefined 要原样透传，cell 靠它区分受控与否。 */
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
 * 选中集合的不变量：单选恒为长度 ≤ 1，多选去重升序，区间最多两端且有序。
 * 公开 API 与内部选中都经这里收口，免得造出 UI 自己造不出的选中集合。
 */
function normalizeSelection(next: readonly string[], mode: CalendarSelectionMode): string[] {
  if (mode === 'single')
    return next.slice(0, 1)
  const unique = [...new Set(next)].sort(compareIso)
  return mode === 'range' ? unique.slice(0, 2) : unique
}

/**
 * 数组按元素比。默认的 Object.is 在这里不成立：受控时 cell 每次读都要把 prop 归一成
 * 新数组，引用恒不相等——版本号会每读一次自增一次（track 空转），
 * 写入时又会把「值其实没变」判成变了，onValueChange 便会重复发。
 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

// 选中值与聚焦日都住在 context 的 cell 里，不编码进 FSM 状态：cell 本身就是受控/非受控的
// 收口点（prop 给定即受控，读直取 prop、写只发回调不落内部值），因此不需要影子事件与受控守卫。
// 机器只有一个状态，逻辑全在 context + actions。
//
// 日期数学一概不在机器里做：落点由连接层用纯函数算好、以 ISO 串送进来。
// 机器只管「记住哪一天」与「把焦点搬过去」这两件与时序有关的事。
export const calendarMachine = createMachine({
  name: 'calendar',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: toValues(prop('value')),
      defaultValue: toValues(prop('defaultValue')) ?? [],
      isEqual: sameValues,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    focusedValue: cell<string | null>(() => ({
      value: prop('focusedValue'),
      defaultValue: prop('defaultFocusedValue') ?? null,
      // 兜底（退回选中值或今天）留在连接层：那儿才知道 locale 与时区，
      // 而且兜底出来的日子不该冒充「宿主设过的聚焦日」发回调
      onChange: (focusedValue) => {
        if (focusedValue != null)
          prop('onFocusedValueChange')?.({ focusedValue })
      },
    })),
    // 区间起点与悬停都不受控、不对外通知：前者只在挑区间的中途有意义，后者纯粹为了预览
    rangeAnchor: cell<string | null>(() => ({ defaultValue: null })),
    hoveredValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    getGridEl: () => null,
    alive: false,
  }),
  initialState: () => 'idle',
  effects: ['trackLiveness'],
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'CELL.SELECT': { actions: ['selectCell'] },
        'FOCUS.SET': { actions: ['setFocusedValue', 'focusVisibleCell'] },
        'HOVER.SET': { actions: ['setHoveredValue'] },
        'HOVER.CLEAR': { actions: ['clearHoveredValue'] },
      },
    },
  },
  implementations: {
    effects: {
      // 存活标记：搬焦点的回调推迟到宿主提交之后才跑，这中间组件可能已经卸载。
      // flush 在三个运行时里都撤不回，只能让回调自己认账。
      trackLiveness: ({ refs }) => {
        refs.set('alive', true)
        return () => refs.set('alive', false)
      },
    },
    actions: {
      // 整体改写不动区间起点：挑区间正是靠起点钉住不动才能来回收窄
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeSelection(e.value, prop('selectionMode') ?? 'single'))
      },

      selectCell: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'CELL.SELECT')
          return
        const mode = prop('selectionMode') ?? 'single'
        if (mode === 'single') {
          context.set('value', [e.value])
          return
        }
        if (mode === 'multiple') {
          const current = context.get('value')
          const next = current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value]
          context.set('value', normalizeSelection(next, mode))
          return
        }
        // range：起点空着就把这一天记成起点（此时选中集合只有一个值，宿主看得见半成品）；
        // 起点已在就把两端收成区间并清掉起点，下一次点击重新开一段
        const anchor = context.get('rangeAnchor')
        if (anchor == null) {
          context.set('rangeAnchor', e.value)
          context.set('value', [e.value])
          return
        }
        context.set('value', normalizeSelection([anchor, e.value], mode))
        context.set('rangeAnchor', null)
      },

      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'FOCUS.SET')
          context.set('focusedValue', e.value)
      },

      setHoveredValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'HOVER.SET')
          context.set('hoveredValue', e.value)
      },

      clearHoveredValue: ({ context }) => context.set('hoveredValue', null),

      /**
       * 把 DOM 焦点搬到聚焦日那一格。
       *
       * 只认网格内键盘操作发来的那一路：翻月按钮点一下同样会改聚焦日，那时焦点该留在
       * 按钮上，抢走它用户就再也连点不了下一月；格子被点中时浏览器自己会把焦点给它，
       * 也无需代劳。
       *
       * 搬焦点推迟到宿主提交之后：跨月时新月份的格子这一刻还不存在，现查必然查空。
       */
      focusVisibleCell: ({ refs, context, event, flush }) => {
        const e = event.current()
        if (e.type !== 'FOCUS.SET' || !e.restoreFocus)
          return
        flush(() => {
          if (!refs.get('alive'))
            return
          const next = context.get('focusedValue')
          const container = refs.get('getGridEl')()
          if (next == null || !container)
            return
          // 集合在这一刻现查：作者刚把新月份渲染出来，缓存下来的节点数组全是上一个月的
          const cell = queryItems(container, calendarCellTriggerQuery).find(el => itemValue(el) === next)
          focusItem(cell ?? null)
        })
      },
    },
  },
})
