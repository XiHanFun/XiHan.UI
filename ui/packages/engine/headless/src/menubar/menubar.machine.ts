import type { Placement, PositionResult } from '@xihan-ui/kernel'
import type { MenubarFocusIntent, MenubarSchema } from './menubar.types'
import {
  createDismissLayer,
  createFocusScope,
  createTypeahead,
  focusItem,
  itemValue,
  navigateItems,
  queryItems,
} from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { menubarItemQuery, menubarTriggerQuery } from './menubar.anatomy'

const { createMachine } = setup<MenubarSchema>()

/** 未指定 placement 时的默认落位。 */
export const MENUBAR_DEFAULT_PLACEMENT: Placement = 'bottom-start'

/**
 * 菜单栏：一排 trigger，同时只展开一张浮层菜单。
 * 展开项存在 context.value，状态只表示有无菜单展开；value 变化后由 watch 派发 SYNC.* 转移状态。
 */
export const menubarMachine = createMachine({
  name: 'menubar',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 位置结果由 trackPosition 回填
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    // 两个焦点锚点：focusedValue 服务 trigger 的 roving tabindex，focusedItem 服务菜单内条目导航
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    focusedItem: cell<string | null>(() => ({ defaultValue: null })),
    // 缺省 none：挂载即展开时不抢焦点
    focusIntent: cell<MenubarFocusIntent>(() => ({ defaultValue: 'none' })),
    // 最近一次由掠过/聚焦自动展开的项，供 shouldAbsorbToggle 判据用
    autoValue: cell<string | null>(() => ({ defaultValue: null })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    getRootEl: () => null,
    typeahead: createTypeahead(),
    reanchor: null,
  }),
  // 受控判据同 cell：显式给了 value 就以它为准，否则看 defaultValue
  initialState: ({ prop }) => {
    const value = prop('value') !== undefined ? prop('value') : prop('defaultValue')
    return value != null ? 'open' : 'idle'
  },
  // 展开项变化后统一重算状态跳转、定位重挂与条目锚点
  watch: ({ track, context, action }) => {
    track([context.dep('value')], () => action(['syncOpenState']))
  },
  on: {
    // 收起的公共出口；已收起时 clearValue 是空操作
    'CLOSE': { actions: ['setReturnFocus', 'clearValue'] },
    'MENUBAR.BLUR': { actions: ['setReturnFocus', 'clearFocusedValue', 'clearValue'] },
    'VALUE.SET': { actions: ['setValueFromEvent'] },
  },
  states: {
    idle: {
      on: {
        'TRIGGER.TOGGLE': { actions: ['openFromEvent'] },
        'TRIGGER.OPEN': { actions: ['openFromEvent'] },
        // 一个菜单都没展开时掠过不展开
        'TRIGGER.POINTER': { guard: 'hasValue', actions: ['setFocusedValue', 'switchValue'] },
        'TRIGGER.FOCUS': { actions: ['setFocusedValue'] },
        'SYNC.OPEN': { target: 'open' },
      },
    },
    open: {
      // 进入展开态时挑好条目锚点，由它认领 tabindex=0
      entry: ['setInitialFocusedItem'],
      // 先把焦点归还给 focusedValue 指向的 trigger，再清锚点
      exit: ['restoreTriggerFocus', 'clearFocusedItem', 'clearTypeahead'],
      effects: ['trackPosition', 'trackLayer'],
      on: {
        // 一次点击是 focus + click 两拍：吸收紧跟聚焦的那一拍并清掉 autoValue，再点一次才走 isCurrent 收起
        'TRIGGER.TOGGLE': [
          { guard: 'shouldAbsorbToggle', actions: ['clearAutoValue'] },
          { guard: 'isCurrent', actions: ['setReturnFocus', 'clearValue'] },
          { actions: ['openFromEvent'] },
        ],
        'TRIGGER.OPEN': { actions: ['openFromEvent'] },
        // 已有菜单展开时，掠过别的 trigger 直接切换
        'TRIGGER.POINTER': { actions: ['setFocusedValue', 'switchValue'] },
        // 焦点落到相邻 trigger 时展开项跟着切换
        'TRIGGER.FOCUS': [
          { guard: 'shouldSwitch', actions: ['setFocusedValue', 'switchValue'] },
          { actions: ['setFocusedValue'] },
        ],
        // 选中即收起：先发选中详情再清 value
        'ITEM.SELECT': { actions: ['invokeOnSelect', 'setReturnFocus', 'clearValue'] },
        'ITEM.FOCUS': { actions: ['setFocusedItem'] },
        // 焦点条目被移出 DOM 时重挑锚点
        'ITEM.LOST': { actions: ['clearFocusedItem', 'setInitialFocusedItem'] },
        'SYNC.CLOSE': { target: 'idle' },
      },
    },
  },
  implementations: {
    guards: {
      // cell 初值可能是 undefined，先归一再判
      hasValue: ({ context }) => (context.get('value') ?? null) != null,
      // 只认 autoValue，受控下 value 在宿主写回前仍是旧值
      shouldAbsorbToggle: ({ context, event }) => {
        const e = event.current()
        return e.type === 'TRIGGER.TOGGLE' && e.value === context.get('autoValue')
      },
      isCurrent: ({ context, event }) => {
        const e = event.current()
        return e.type === 'TRIGGER.TOGGLE' && e.value === (context.get('value') ?? null)
      },
      // 焦点落到别的非禁用 trigger 上才算换项
      shouldSwitch: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TRIGGER.FOCUS' || e.disabled)
          return false
        const value = context.get('value') ?? null
        return value != null && e.value !== value
      },
    },
    actions: {
      /** 状态跟随展开项的唯一出口；换项时状态不重入，只重挂定位与条目锚点。 */
      syncOpenState: ({ context, state, send, action }) => {
        const value = context.get('value') ?? null
        const open = state.get() === 'open'
        if (value == null) {
          if (open)
            send({ type: 'SYNC.CLOSE' })
          return
        }
        if (!open) {
          send({ type: 'SYNC.OPEN' })
          return
        }
        action(['reanchor', 'clearFocusedItem', 'setInitialFocusedItem'])
      },

      openFromEvent: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TRIGGER.OPEN' && e.type !== 'TRIGGER.TOGGLE')
          return
        // 点击与 Enter 用 none：焦点留在 trigger 上，不预先高亮条目
        context.set('focusIntent', e.type === 'TRIGGER.OPEN' ? (e.focus ?? 'first') : 'none')
        context.set('focusedValue', e.value)
        context.set('value', e.value)
        // 显式激活的展开不算自动
        context.set('autoValue', null)
      },
      // 掠过/聚焦换项：焦点归 trigger，不预先高亮任何条目
      switchValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TRIGGER.POINTER' && e.type !== 'TRIGGER.FOCUS')
          return
        context.set('focusIntent', 'none')
        context.set('value', e.value)
        // 记下自动弹出的项，紧跟的 click 会被吸收
        context.set('autoValue', e.value)
      },
      // 程序化改写不动 roving 锚点
      setValueFromEvent: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('focusIntent', 'none')
        context.set('value', e.value)
        context.set('autoValue', null)
      },
      clearValue: ({ context }) => {
        context.set('value', null)
        context.set('autoValue', null)
      },
      clearAutoValue: ({ context }) => context.set('autoValue', null),

      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TRIGGER.POINTER' || e.type === 'TRIGGER.FOCUS')
          context.set('focusedValue', e.value)
      },
      // 焦点离场即清锚点，Tab 位交回 root
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),

      setFocusedItem: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.FOCUS')
          context.set('focusedItem', e.value)
      },
      clearFocusedItem: ({ context }) => context.set('focusedItem', null),
      setInitialFocusedItem: ({ refs, context, state, flush }) => {
        const pick = (): void => {
          // 指针与点击入口不预先落焦，焦点留在 trigger 上
          if (context.get('focusIntent') === 'none')
            return
          const content = refs.get('getContentEl')()
          // 无 DOM 环境时锚点留空
          if (!content)
            return
          const items = queryItems(content, menubarItemQuery)
          // 从边界起步找第一个可停留条目，禁用项跳过
          context.set('focusedItem', itemValue(navigateItems(items, null, context.get('focusIntent') === 'last' ? 'last' : 'first')))
        }
        pick()
        // WC 条目身份标记在首次 wire() 后才写上，推迟一帧补挑一次
        flush(() => {
          if (state.get() === 'open' && context.get('focusedItem') == null)
            pick()
        })
      },

      // Tab 与层外交互时不归还焦点；Escape、选中条目、再点 trigger 一律归还
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'MENUBAR.BLUR'
          || (e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside'))
        context.set('returnFocus', !handedOff)
      },
      /** 收起时把焦点还给 roving 锚点指向的 trigger。 */
      restoreTriggerFocus: ({ refs, context }) => {
        if (!context.get('returnFocus'))
          return
        const root = refs.get('getRootEl')()
        const value = context.get('focusedValue')
        if (!root || value == null)
          return
        focusItem(queryItems(root, menubarTriggerQuery).find(el => itemValue(el) === value) ?? null)
      },

      invokeOnSelect: ({ prop, context, event }) => {
        const e = event.current()
        const menu = context.get('value') ?? null
        if (e.type === 'ITEM.SELECT' && menu != null)
          prop('onSelect')?.({ menu, value: e.value })
      },
      // 收起时必须丢缓冲，否则下次打开第一个字母会被拼进上一轮的查询串
      clearTypeahead: ({ refs }) => refs.get('typeahead').clear(),
      reanchor: ({ refs }) => refs.get('reanchor')?.(),
    },
    effects: {
      /** 挂载定位引擎，结果写进 context 供 connect 读；换项时由 reanchor 撤旧订阅后重挂。 */
      trackPosition: ({ refs, prop, context, flush }) => {
        const engine = refs.get('position')
        // 无引擎时不定位
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let queued = false
        let disposed = false

        const attach = (): void => {
          queued = false
          if (disposed)
            return
          stop?.()
          stop = undefined
          const anchor = refs.get('getAnchorEl')()
          const floating = refs.get('getFloatingEl')()
          if (!anchor || !floating)
            return
          stop = engine.attach(
            anchor,
            floating,
            {
              placement: prop('placement') ?? MENUBAR_DEFAULT_PLACEMENT,
              offset: prop('offset'),
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
              // start / end 是逻辑对齐，RTL 下行内轴要翻过来
              dir: prop('dir'),
              // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高
              size: true,
            },
            result => context.set('position', result),
          )
        }

        // 等 DOM 落定再挂，同一拍内的多次请求合并成一次
        const schedule = (): void => {
          if (queued || disposed)
            return
          queued = true
          flush(attach)
        }

        refs.set('reanchor', schedule)
        schedule()

        return () => {
          disposed = true
          refs.set('reanchor', null)
          stop?.()
        }
      },
      // 层、消解层与焦点域同生共死，仅在有菜单展开期间入栈
      trackLayer: ({ refs, context, send }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境时不挂副作用
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()

        const dismiss = createDismissLayer({
          config,
          layer,
          onDismiss: reason =>
            send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
        })

        /** 焦点域用于把焦点送进刚展开的菜单，仅键盘入口（focusIntent 非 none）才建。 */
        const focus = context.get('focusIntent') === 'none'
          ? null
          : createFocusScope({
              config,
              layer,
              // 每次读最新 ref，容器晚一拍就位或中途换菜单都能命中
              container: () => refs.get('getContentEl')(),
              // 不陷焦点也不回绕，Tab 走出后由消解层判定是否收起
              trapped: () => false,
              loop: false,
              // 显式指定初始焦点为锚点条目：默认的 Tab 序列探测会滤掉写成 <a> 的条目
              initialFocus: () => {
                const content = refs.get('getContentEl')()
                const anchor = context.get('focusedItem')
                if (!content || anchor == null)
                  return null
                return queryItems(content, menubarItemQuery).find(el => itemValue(el) === anchor) ?? null
              },
              // 焦点归还由 restoreTriggerFocus 收口
              restoreFocus: () => false,
            })

        // 逆序拆：先撤订阅，最后移出层栈
        return () => {
          focus?.dispose()
          dismiss.dispose()
          disposeLayer()
        }
      },
    },
  },
})
