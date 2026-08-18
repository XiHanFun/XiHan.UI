import type { Placement, PositionResult } from '@xihan-ui/kernel'
import type { MenuFocusIntent, MenuSchema } from './menu.types'
import { createDismissLayer, createFocusScope, itemValue, navigateItems, queryItems, trackHoverIntent } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { OVERLAY_ARROW_PADDING, OVERLAY_ARROW_SIZE } from '../shared/overlay'
import { menuItemQuery } from './menu.anatomy'

const { createMachine } = setup<MenuSchema>()

/** 未指定 placement 时的默认落位。 */
export const MENU_DEFAULT_PLACEMENT: Placement = 'bottom-start'

/** 子菜单贴着触发条目的侧向展开，其余菜单从触发器下方展开。 */
export function menuFallbackPlacement(submenu: boolean | undefined, dir: string | undefined): Placement {
  if (!submenu)
    return MENU_DEFAULT_PLACEMENT
  return dir === 'rtl' ? 'left-start' : 'right-start'
}

export const menuMachine = createMachine({
  name: 'menu',
  context: ({ cell }) => ({
    // 位置结果由 trackPosition 回填
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    // 焦点锚点，服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    focusIntent: cell<MenuFocusIntent>(() => ({ defaultValue: 'first' })),
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
  // 悬停意图跟机器不跟状态位：关着要接得住进入、开着要接得住离开
  effects: ['trackHover'],
  // 受控时用户事件只发意图，宿主写回 open 后由 watch 派发 CONTROLLED.*
  watch: ({ track, prop, action }) => track([() => prop('open')], () => action(['syncOpen'])),
  states: {
    closed: {
      on: {
        // 受控只发意图，非受控落 target；落焦端与焦点归还策略先记进 context
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
      // 进入展开态时挑好锚点，由它认领 tabindex=0
      entry: ['setInitialFocusedValue'],
      exit: ['clearFocusedValue'],
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
        // 选中即关闭：先发选中详情再收起
        'ITEM.SELECT': [
          { guard: 'isOpenControlled', actions: ['invokeOnSelect', 'setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnSelect', 'setReturnFocus', 'invokeOnClose'] },
        ],
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'FOCUS.CLEAR': { actions: ['clearFocusedValue'] },
        // 焦点条目被移出 DOM 时重挑锚点
        'ITEM.LOST': { actions: ['clearFocusedValue', 'setInitialFocusedValue'] },
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
      invokeOnSelect: ({ prop, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.SELECT')
          prop('onSelect')?.({ value: e.value })
      },
      // 仅受控时回写；open 变回 undefined 即转非受控
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
      setFocusIntent: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'OPEN' || e.type === 'TOGGLE')
          context.set('focusIntent', e.focus ?? 'first')
      },
      // Tab 与层外交互时不归还焦点；Escape、选中条目、再点 trigger 一律归还
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside' || e.src === 'hover')
        context.set('returnFocus', !handedOff)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.FOCUS')
          context.set('focusedValue', e.value)
      },
      setInitialFocusedValue: ({ refs, context, state, flush }) => {
        const pick = (): void => {
          const intent = context.get('focusIntent')
          // 指针与命令式入口不预先落焦，焦点由焦点域兜底落到 content 上
          if (intent === 'none')
            return
          const content = refs.get('getContentEl')()
          // 无 DOM 环境时锚点留空
          if (!content)
            return
          const items = queryItems(content, menuItemQuery)
          // 从边界起步找第一个可停留条目，禁用项跳过
          context.set('focusedValue', itemValue(navigateItems(items, null, intent)))
        }
        pick()
        // WC 条目身份标记在首次 wire() 后才写上，推迟一帧补挑一次
        flush(() => {
          if (state.get() === 'open' && context.get('focusedValue') == null)
            pick()
        })
      },
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
    },
    effects: {
      // 悬停触发：进锚点延时开、经安全三角离开才收。挂载后推迟一拍再接线，
      // 机器启动那一刻锚点元素还没就位
      trackHover: ({ refs, prop, send, flush }) => {
        if (!(prop('openOnHover') ?? !!prop('submenu')))
          return undefined
        let cleanup: (() => void) | undefined
        let disposed = false
        flush(() => {
          if (disposed)
            return
          cleanup = trackHoverIntent({
            getTriggerEl: () => refs.get('getAnchorEl')(),
            getContentEl: () => refs.get('getContentEl')(),
            openDelay: prop('hoverOpenDelay'),
            closeDelay: prop('hoverCloseDelay'),
            onOpenIntent: () => send({ type: 'OPEN', focus: 'none' }),
            onCloseIntent: () => {
              send({ type: 'CLOSE', src: 'hover' })
              // 悬停收口时焦点若还留在触发条目或本层 content 上，让渡给父层 content：
              // 父层 content 的 onFocus 会把父层锚点清掉，触发条目不残留高亮
              const trigger = refs.get('getAnchorEl')()
              const content = refs.get('getContentEl')()
              const active = trigger?.ownerDocument.activeElement
              if (trigger && (active === trigger || (content != null && active === content)))
                trigger.closest<HTMLElement>('[data-part="content"]')?.focus()
            },
          })
        })
        return () => {
          disposed = true
          cleanup?.()
        }
      },
      // 挂载定位引擎，结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => {
        const engine = refs.get('position')
        // 无引擎时不定位
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 等 DOM 落定再挂
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
              placement: prop('placement') ?? menuFallbackPlacement(prop('submenu'), prop('dir')),
              offset: prop('offset'),
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
              // start / end 是逻辑对齐，RTL 下行内轴要翻过来
              dir: prop('dir'),
              // 引擎量不到箭头，尺寸与让开圆角的余量由这里交进去
              arrow: { size: OVERLAY_ARROW_SIZE, padding: OVERLAY_ARROW_PADDING },
              // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高
              size: true,
            },
            result => context.set('position', result),
          )
        })

        return () => {
          disposed = true
          stop?.()
        }
      },
      // 层、消解层与焦点域绑在同一个效应里，三者生命周期必须一致。层只在展开期间入栈——
      // 消解层只让栈顶响应 Escape，层若在挂载期就注册、与开合无关地常驻栈里，
      // 同页后挂载的那个会永久占着栈顶，把它下面每一层的 Escape 都堵死
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

        const focus = createFocusScope({
          config,
          layer,
          // 每次读最新 ref，容器晚一拍就位也能命中
          container: () => refs.get('getContentEl')(),
          // 不陷焦点也不回绕，Tab 走出后由消解层判定是否关闭
          trapped: () => false,
          loop: false,
          // 显式指定初始焦点为锚点条目，每次求值现查：默认的 Tab 序列探测会滤掉写成 <a> 的条目
          initialFocus: () => {
            const content = refs.get('getContentEl')()
            const anchor = context.get('focusedValue')
            if (!content || anchor == null)
              return null
            return queryItems(content, menuItemQuery).find(el => itemValue(el) === anchor) ?? null
          },
          restoreFocus: () => context.get('returnFocus'),
        })

        // 逆序拆：先撤订阅，最后移出层栈
        return () => {
          focus.dispose()
          dismiss.dispose()
          disposeLayer()
        }
      },
    },
  },
})
