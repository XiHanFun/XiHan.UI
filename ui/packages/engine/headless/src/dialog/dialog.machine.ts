import type { DialogSchema } from './dialog.types'
import { acquireScrollLock, createDismissLayer, createFocusScope } from '@xihan-ui/behavior'
import { hideOutside } from '@xihan-ui/kernel'
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
  // 受控时用户事件只发意图回调；宿主写回 open 后由这条 watch 派发 CONTROLLED.* 回写状态。
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

        // 层只在展开期间入栈：只有栈顶响应 Escape，常驻的层会堵死其下各层
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

        // 焦点域无条件建，modal 只决定陷不陷焦点；放进 if (modal) 会让非模态
        // 既不初始聚焦也不归还焦点，restoreFocus 失效
        const focus = createFocusScope({
          config,
          layer,
          container: getContentEl,
          trapped: () => modal,
          loop: modal,
          // alertdialog 焦点落在 content 容器本身，不预选按钮；
          // 普通 dialog 交给 tabbable 探测选首个可聚焦元素
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

          // 背景失活推迟到宿主提交那一帧之后：进入 open 时 content 尚未渲染，
          // 此刻 targets 为空会导致背景永不 inert
          let hidden: (() => void) | undefined
          let alive = true
          flush(() => {
            if (!alive)
              return
            if (getTargets().length)
              hidden = hideOutside(getTargets, config.scope)
          })
          // flush 回调可能在效应拆除之后才跑，用存活标志挡住
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
