import type { ContextFacade, Params, PropFn } from '@xihan-ui/machine'
import type { TransferSchema, TransferSide } from './transfer.types'
import { setup } from '@xihan-ui/machine'
import {
  transferCheckedValues,
  transferIsCheckable,
  transferMove,
  transferOperableValues,
  transferSideOf,
  transferToggleAll,
  transferToggleValue,
  transferVisibleItems,
} from './transfer.sets'

const { createMachine } = setup<TransferSchema>()

/** 某一侧的搜索串住在哪个 cell 里。连接层与动作共用这一份映射，免得各写各的三元。 */
export function transferQueryKey(side: TransferSide): 'sourceQuery' | 'targetQuery' {
  return side === 'source' ? 'sourceQuery' : 'targetQuery'
}

/** 某一侧的焦点锚点住在哪个 cell 里。 */
export function transferFocusKey(side: TransferSide): 'sourceFocusedValue' | 'targetFocusedValue' {
  return side === 'source' ? 'sourceFocusedValue' : 'targetFocusedValue'
}

/** 对面是哪一侧。 */
export function transferOppositeSide(side: TransferSide): TransferSide {
  return side === 'source' ? 'target' : 'source'
}

type SetParams = Pick<Params<TransferSchema>, 'prop' | 'context'>

/**
 * 某一侧此刻可操作（可见且未禁用）的值。
 *
 * 全部从 props + context 推导，一行 DOM 都不读：机器因此在无 DOM 环境下也算得准，
 * 两个适配器也不会因为"谁先提交 DOM"而算出不同的集合。
 * searchable 关掉时搜索串一律按空处理——那个框此刻带着 hidden，
 * 拿一个用户看不见的串去筛列表是纯粹的幽灵行为。
 */
function operableOn(params: SetParams, side: TransferSide): string[] {
  const { prop, context } = params
  const query = prop('searchable') ? context.get(transferQueryKey(side)) : ''
  const visible = transferVisibleItems(
    prop('items') ?? [],
    context.get('value'),
    side,
    query,
    prop('filter'),
  )
  return transferOperableValues(visible)
}

/** 去重且保序：两个集合都是集合，重复元素没有意义。 */
function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

/**
 * 数组按元素比。默认的 Object.is 在这里不成立：受控时 cell 每次读都要把 prop 归一成
 * 新数组，引用恒不相等——版本号会每读一次自增一次（track 空转），
 * 写入时又会把「值其实没变」判成变了，回调便会重复发。
 */
function sameValues(a: string[], b: string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((v, i) => v === b[i])
}

/** 整个控件禁用时用户改不动任何东西；程序化入口（VALUE.SET / SELECTED.SET）不受此限。 */
function locked(prop: PropFn<TransferSchema>): boolean {
  return !!prop('disabled')
}

/** 焦点锚点写入的收口：两侧各自一份。 */
function setFocused(context: ContextFacade<TransferSchema>, side: TransferSide, value: string | null): void {
  context.set(transferFocusKey(side), value)
}

// value（右侧集合）、selected（勾选集合）与两侧搜索串都住在 context 的 cell 里，
// 不编码进 FSM 状态：cell 本身就是受控/非受控的收口点（prop 给定即受控，
// 读直取 prop、写只发回调不落内部值），因此不需要影子事件与受控守卫。
export const transferMachine = createMachine({
  name: 'transfer',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? [],
      isEqual: sameValues,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    selected: cell<string[]>(() => ({
      value: prop('selected'),
      defaultValue: prop('defaultSelected') ?? [],
      isEqual: sameValues,
      onChange: selected => prop('onSelectedChange')?.({ selected }),
    })),
    // 搜索串与焦点锚点都不受控、不对外通知：前者只影响"看得见什么"，
    // 后者只服务 roving tabindex 与方向键起点
    sourceQuery: cell<string>(() => ({ defaultValue: '' })),
    targetQuery: cell<string>(() => ({ defaultValue: '' })),
    sourceFocusedValue: cell<string | null>(() => ({ defaultValue: null })),
    targetFocusedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'SELECTED.SET': { actions: ['setSelected'] },
        'ITEM.TOGGLE': { actions: ['toggleItem'] },
        'SIDE.TOGGLE_ALL': { actions: ['toggleAll'] },
        'ITEMS.MOVE': { actions: ['moveItems'] },
        'SEARCH.SET': { actions: ['setQuery'] },
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'LIST.BLUR': { actions: ['clearFocusedValue'] },
      },
    },
  },
  implementations: {
    actions: {
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', unique(e.value))
      },

      setSelected: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'SELECTED.SET')
          return
        context.set('selected', unique(e.selected))
      },

      /**
       * 勾选切换。三道闸门都在这里收口，程序化入口（api.toggle）与合成事件同样过得了 DOM
       * 却过不了这里：整体禁用、oneWay 下的 target 侧、以及"这个条目此刻并不可操作"
       * （禁用了、或被搜索藏起来了）。
       */
      toggleItem: ({ prop, context, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.TOGGLE' || locked(prop))
          return
        const side = transferSideOf(context.get('value'), e.value)
        if (!transferIsCheckable(side, prop('oneWay')))
          return
        if (!operableOn({ prop, context }, side).includes(e.value))
          return
        context.set('selected', transferToggleValue(context.get('selected'), e.value))
      },

      toggleAll: ({ prop, context, event }) => {
        const e = event.current()
        if (e.type !== 'SIDE.TOGGLE_ALL' || locked(prop))
          return
        if (!transferIsCheckable(e.side, prop('oneWay')))
          return
        context.set('selected', transferToggleAll(operableOn({ prop, context }, e.side), context.get('selected')))
      },

      /**
       * 搬运。搬的是**对面此刻可操作且勾中**的那些——与三态、按钮禁用态同一口径：
       * 被搜索藏起来的勾选留在原地，用户看不见的东西不该随一次点击悄悄换边。
       */
      moveItems: ({ prop, context, event }) => {
        const e = event.current()
        if (e.type !== 'ITEMS.MOVE' || locked(prop))
          return
        const from = transferOppositeSide(e.to)
        const selected = context.get('selected')
        const moving = transferCheckedValues(operableOn({ prop, context }, from), selected)
        const next = transferMove({
          value: context.get('value'),
          selected,
          moving,
          to: e.to,
          oneWay: prop('oneWay'),
        })
        context.set('value', next.value)
        context.set('selected', next.selected)
      },

      setQuery: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'SEARCH.SET')
          return
        context.set(transferQueryKey(e.side), e.query)
        // 刻意不动焦点锚点：搜索把它藏起来时，连接层会把锚点投影成 null
        // （见 connect），清空搜索后焦点还回得到原处
      },

      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.FOCUS')
          setFocused(context, e.side, e.value)
      },

      // 焦点离场只清这一侧的锚点：另一侧的锚点与两边的勾选都留着
      clearFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'LIST.BLUR')
          setFocused(context, e.side, null)
      },
    },
  },
})
