import type { DialogSchema } from './dialog.types'
import { acquireScrollLock, createDismissLayer, createFocusScope } from '@xihan-ui/behavior'
import { hideOutside } from '@xihan-ui/core'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<DialogSchema>()

export const dialogMachine = createMachine({
  name: 'dialog',
  refs: () => ({
    config: null,
    registerLayer: null,
    presence: null,
    getContentEl: () => null,
    getTriggerEl: () => null,
    branches: () => [],
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // 受控（open prop 给定）时，用户事件只发意图回调、不自改状态；宿主写回 open 后
  // 由此 watch 追踪 open 变化，派发影子事件 CONTROLLED.* 无条件回写状态。
  watch: ({ track, prop, action }) => track([() => prop('open')], () => action(['syncOpen'])),
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 进入 open：按固定顺序装配 dismiss → focus → scroll，最后推迟一帧挂背景失活。
      effects: ['trackOverlay'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
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
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
    },
    effects: {
      trackOverlay: ({ refs, prop, send, flush }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        // 层只在展开期间入栈：消解层只让栈顶响应 Escape，常驻的层会占着栈顶，
        // 把它下面每一层的 Escape 都堵死（同页两个 dialog 就会互相锁死）。
        const { layer, dispose: disposeLayer } = registerLayer()

        const modal = prop('modal') ?? true
        const role = prop('role') ?? 'dialog'
        const closeOnEscape = prop('closeOnEscape') ?? true
        const closeOnInteractOutside = role === 'alertdialog'
          ? false
          : (prop('closeOnInteractOutside') ?? modal)
        const getContentEl = refs.get('getContentEl')
        const disposers: Array<() => void> = []

        const dismiss = createDismissLayer({
          config,
          layer,
          onEscapeKeyDown: (e) => {
            if (!closeOnEscape)
              e.preventDefault()
          },
          onInteractOutside: (e) => {
            if (!closeOnInteractOutside)
              e.preventDefault()
          },
          onDismiss: reason =>
            send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
        })
        disposers.push(() => dismiss.dispose())

        // 焦点域无条件建，只用 modal 决定陷不陷焦点——与 popover 同。
        // 塞进 if (modal) 的话，非模态 dialog 打开后焦点根本不进 content、关闭也不归还，
        // restoreFocus 这个 prop 写什么都没用。
        const focus = createFocusScope({
          config,
          layer,
          container: getContentEl,
          trapped: () => modal,
          loop: modal,
          // alertdialog 焦点落在 content 容器本身（不预选按钮，避免误触发破坏性操作）；
          // 普通 dialog 交给 tabbable 探测选首个可聚焦元素（content 自身 tabindex=-1）。
          initialFocus: () => (role === 'alertdialog' ? getContentEl() : null),
          restoreFocus: () => prop('restoreFocus') ?? true,
        })
        disposers.push(() => focus.dispose())

        if (modal) {
          const lock = acquireScrollLock({ config })
          disposers.push(() => lock.dispose())

          // 背景失活推迟到宿主提交那一帧之后再挂：进入 open 的这一刻 content 还没渲染
          // （Vue 要等 presence 的 post 观察者、WC 要等首次 wire 认出角色节点），
          // 此刻现取 targets 会得到空数组、直接跳过——背景就此永远不 inert。
          // 与 popover / tooltip 的定位同一套推迟写法。
          let hidden: (() => void) | undefined
          let alive = true
          flush(() => {
            if (!alive)
              return
            const targets = [getContentEl(), ...refs.get('branches')()].filter(Boolean) as Element[]
            if (targets.length)
              hidden = hideOutside(targets, config.scope)
          })
          // 开关得快时 flush 回调可能排在效应拆掉之后才跑，用存活标志挡住，
          // 别让它给一个已经关上的对话框补挂背景失活
          disposers.push(() => {
            alive = false
            hidden?.()
          })
        }

        // 逆序拆：先撤依赖层的订阅，最后才把层本身移出栈
        return () => {
          for (let i = disposers.length - 1; i >= 0; i--) disposers[i]!()
          disposeLayer()
        }
      },
    },
  },
})
