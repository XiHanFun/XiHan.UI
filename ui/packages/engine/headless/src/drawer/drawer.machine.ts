import type { DrawerSchema } from './drawer.types'
import { acquireScrollLock, createDismissLayer, createFocusScope } from '@xihan-ui/behavior'
import { hideOutside } from '@xihan-ui/kernel'
import { setup } from '@xihan-ui/machine'
import { closeReasonOf } from '../shared/close-reason'

const { createMachine } = setup<DrawerSchema>()

export const drawerMachine = createMachine({
  name: 'drawer',
  refs: () => ({
    config: null,
    registerLayer: null,
    presence: null,
    getContentEl: () => null,
    getTriggerEl: () => null,
    branches: () => [],
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // 受控（open prop 给定）时用户事件只发意图回调、不自改状态；宿主写回 open 后
  // 由此 watch 追踪变化，派发 CONTROLLED.* 回写状态。
  watch: ({ track, prop, action }) => track([() => prop('open')], () => action(['syncOpen'])),
  states: {
    closed: {
      on: {
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
      // 装配 dismiss → focus → scroll，并推迟一帧挂背景失活
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
      invokeOnClose: ({ prop, event }) => prop('onOpenChange')?.({ open: false, reason: closeReasonOf(event.current()) }),
      // 只在受控（open 为布尔）时回写；open 变回 undefined 表示转非受控，不强制关闭
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

        // 层只在展开期间入栈：只有栈顶层响应 Escape，常驻的层会堵死其下所有层
        const { layer, dispose: disposeLayer } = registerLayer()

        // 开场快照：滚动锁与背景失活装配一次就定了，事后补不回来
        const modal = prop('modal') ?? true
        const role = prop('role') ?? 'dialog'
        const getContentEl = refs.get('getContentEl')
        const disposers: Array<() => void> = []

        const dismiss = createDismissLayer({
          config,
          layer,
          // 两个开关都现读 prop，展开中途改也立刻生效
          onEscapeKeyDown: (e) => {
            if (!(prop('closeOnEscape') ?? true))
              e.preventDefault()
          },
          onInteractOutside: (e) => {
            // 缺省值依赖 role 与 modal，这两项也一并现读：
            // alertdialog 一律不许点外面关，其余回落 modal
            const allowed = (prop('role') ?? 'dialog') === 'alertdialog'
              ? false
              : prop('closeOnInteractOutside') ?? prop('modal') ?? true
            if (!allowed)
              e.preventDefault()
          },
          onDismiss: reason =>
            send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
        })
        disposers.push(() => dismiss.dispose())

        // 焦点域无条件建，modal 只决定陷不陷焦点：放进 if (modal) 会让非模态抽屉
        // 既不初始聚焦也不归还焦点，restoreFocus 失效
        const focus = createFocusScope({
          config,
          layer,
          container: getContentEl,
          trapped: () => modal,
          loop: modal,
          // alertdialog 焦点落在 content 容器本身；普通抽屉交给 tabbable 探测取首个可聚焦元素
          initialFocus: () => (role === 'alertdialog' ? getContentEl() : null),
          restoreFocus: () => prop('restoreFocus') ?? true,
        })
        disposers.push(() => focus.dispose())

        if (modal) {
          const lock = acquireScrollLock({ config })
          disposers.push(() => lock.dispose())

          // 栈中位于本层之上的层一并算作目标：内层浮层 portal 到 body 之后也是 body 的
          // 直接子元素，不排除会被本层的 MutationObserver 打上 inert
          const getTargets = (): Element[] => [
            getContentEl(),
            ...refs.get('branches')(),
            ...config.layerRegistry.elementsAbove(layer),
          ].filter(Boolean) as Element[]

          // 背景失活须推迟到宿主提交那一帧之后：进入 open 的这一刻 content 尚未渲染，
          // 此时取 targets 得到空数组，背景永远不会 inert
          let hidden: (() => void) | undefined
          let alive = true
          flush(() => {
            if (!alive)
              return
            if (getTargets().length)
              hidden = hideOutside(getTargets, config.scope)
          })
          // flush 回调可能在效应拆除之后才跑，用存活标志挡住，避免给已关闭的抽屉补挂背景失活
          disposers.push(() => {
            alive = false
            hidden?.()
          })
        }

        // 逆序拆除：先撤依赖层的订阅，最后把层移出栈
        return () => {
          for (let i = disposers.length - 1; i >= 0; i--) disposers[i]!()
          disposeLayer()
        }
      },
    },
  },
})
