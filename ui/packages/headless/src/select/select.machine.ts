import type { Placement, PositionResult } from '@xihan-ui/core'
import type { SelectFocusIntent, SelectSchema } from './select.types'
import { createDismissLayer, createFocusScope, createTypeahead, isItemDisabled, itemValue, navigateItems, queryItems } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { selectItemQuery, selectItemText } from './select.anatomy'

const { createMachine } = setup<SelectSchema>()

/** 未指定 placement 时的落位；定位引擎与 connect 共用这一个缺省。 */
export const SELECT_DEFAULT_PLACEMENT: Placement = 'bottom-start'

export const selectMachine = createMachine({
  name: 'select',
  context: ({ prop, cell }) => ({
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    // 值住在 cell 里，受控/非受控在此收口，不需要影子事件
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 显示文本只能从活 DOM 取：条目文本是作者写的插槽内容，prop 里没有
    valueText: cell<string | null>(() => ({ defaultValue: null })),
    // 高亮锚点：不受控、不对外通知，只服务 roving tabindex 与方向键起点
    highlightedValue: cell<string | null>(() => ({ defaultValue: null })),
    focusIntent: cell<SelectFocusIntent>(() => ({ defaultValue: 'selected' })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    // 缓冲随服务存活：收起态在 trigger 上连打、展开态在 content 上连打共用同一份
    typeahead: createTypeahead(),
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // 挂载即结算一次显示文本：defaultValue / 受控初值都得在首帧就有文字可显示
  entry: ['syncValueText'],
  // 开合受控时用户事件只发意图，宿主写回 open 后由 watch 派发 CONTROLLED.* 无条件回写；值受控走 cell。
  // 值这一路的 watch 只兜宿主侧写入，内部选中当场已同步过文本。
  watch: ({ track, prop, context, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    track([context.dep('value')], () => action(['syncValueText']))
  },
  // 只改值不动开合，收起态连打与外部 setValue 两个状态都认
  on: {
    'VALUE.SET': { actions: ['setValue', 'syncValueText'] },
  },
  states: {
    closed: {
      on: {
        // 受控只发意图，非受控落 target 并通知。
        // 落点意图与焦点归还先记进 context：受控那一拍走 CONTROLLED.OPEN，读不到原按键事件。
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 锚点在进入展开态时就位；条目常挂，此刻查到的顺序即最终顺序。
      entry: ['setInitialHighlightedValue'],
      // 收起就丢缓冲，否则下次展开首字母会拼进上一轮查询串
      exit: ['clearHighlightedValue', 'clearTypeahead'],
      // 进入 open：定位 → 消解 → 焦点。退出 open 时按同序清理，焦点归还发生在消解层撤销之后。
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
        // 选中即关闭：先落值（cell 随即发出 onValueChange），再走与 CLOSE 相同的收口
        'ITEM.SELECT': [
          { guard: 'isOpenControlled', actions: ['setValue', 'syncValueText', 'setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['setValue', 'syncValueText', 'setReturnFocus', 'invokeOnClose'] },
        ],
        'ITEM.HIGHLIGHT': { actions: ['setHighlightedValue'] },
        // 高亮条目被移出 DOM，锚点悬空，就地重挑一个，否则没有条目认领 tabindex=0
        'ITEM.LOST': { actions: ['clearHighlightedValue', 'setInitialHighlightedValue'] },
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.SELECT' || e.type === 'VALUE.SET')
          context.set('value', e.value)
      },
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
      // 显示文本从活 DOM 现查；首帧条目可能还没挂上身份标记，查不到就推迟一拍重来
      syncValueText: ({ refs, context, flush }) => {
        const resolve = (): boolean => {
          const content = refs.get('getContentEl')()
          if (!content)
            return false
          const value = context.get('value')
          if (value == null) {
            context.set('valueText', null)
            return true
          }
          const el = queryItems(content, selectItemQuery).find(item => itemValue(item) === value)
          if (!el)
            return false
          context.set('valueText', selectItemText(el))
          return true
        }
        if (resolve())
          return
        flush(() => {
          resolve()
        })
      },
      setFocusIntent: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'OPEN' || e.type === 'TOGGLE')
          context.set('focusIntent', e.focus ?? 'selected')
      },
      // Tab 与层外交互关闭时把焦点让出，其余出口一律归还 trigger
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside')
        context.set('returnFocus', !handedOff)
      },
      setHighlightedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.HIGHLIGHT')
          context.set('highlightedValue', e.value)
      },
      setInitialHighlightedValue: ({ refs, prop, context, state, flush }) => {
        const pick = (): void => {
          const content = refs.get('getContentEl')()
          // 无 DOM 环境（纯逻辑测试）：锚点留空，状态转移不受影响
          if (!content)
            return
          const items = queryItems(content, selectItemQuery)
          const intent = context.get('focusIntent')
          const selected = context.get('value')
          if (intent === 'selected') {
            // 选中项仍在集合里且可停留就停在它上面，否则退回首个可停留条目
            const current = items.find(el => itemValue(el) === selected && !isItemDisabled(el))
            context.set('highlightedValue', itemValue(current ?? navigateItems(items, null, 'first')))
            return
          }
          // first/last 从边界起步；next/prev 从当前选中项走一步，无选中值时同样落到边界
          const from = intent === 'first' || intent === 'last' ? null : selected
          context.set('highlightedValue', itemValue(navigateItems(items, from, intent, { loop: prop('loop') ?? true })))
        }
        pick()
        // 初始即展开时条目身份标记可能尚未写入，推迟一拍补挑；已挑到或已收起则不补
        flush(() => {
          if (state.get() === 'open' && context.get('highlightedValue') == null)
            pick()
        })
      },
      clearHighlightedValue: ({ context }) => context.set('highlightedValue', null),
      clearTypeahead: ({ refs }) => refs.get('typeahead').clear(),
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读。
      trackPosition: ({ refs, prop, context, flush }) => {
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
              placement: prop('placement') ?? SELECT_DEFAULT_PLACEMENT,
              offset: prop('offset'),
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
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
      // 层只在展开期间入栈，常驻会占死栈顶把下面各层的 Escape 堵死。
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
          // 列表不陷焦点也不回绕：Tab 能走出去，走出去即由消解层判定是否关闭
          trapped: () => false,
          loop: false,
          // 显式指定落焦点为高亮条目：Tab 序列探测会过滤掉写成 <a> 的条目。
          // 每次求值都现查，content 仍带 hidden 的那一帧返回 null，焦点域会自行重试。
          initialFocus: () => {
            const content = refs.get('getContentEl')()
            const anchor = context.get('highlightedValue')
            if (!content || anchor == null)
              return null
            return queryItems(content, selectItemQuery).find(el => itemValue(el) === anchor) ?? null
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
