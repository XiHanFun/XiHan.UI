import type { DialogSchema } from './dialog.types'
import { acquireScrollLock, createDismissLayer, createFocusScope, hideOutside, setup, warn } from '@xihan-ui/core'
import { closeReasonOf } from '../shared/close-reason'

const { createMachine } = setup<DialogSchema>()

// 选择器写错时不让异常穿出 rAF 回调，回 null 走默认聚焦顺序
function queryInContent(content: HTMLElement | null, selector: string): HTMLElement | null {
  if (!content)
    return null
  try {
    return content.querySelector<HTMLElement>(selector)
  }
  catch {
    warn(false, `dialog: initialFocus 不是合法的选择器：${selector}`)
    return null
  }
}

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
      invokeOnClose: ({ prop, event }) => prop('onOpenChange')?.({ open: false, reason: closeReasonOf(event.current()) }),
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
    },
    effects: {
      trackOverlay: ({ refs, prop, scope, send, flush }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        // 层只在展开期间入栈：只有栈顶响应 Escape，常驻的层会堵死其下各层
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

        // 焦点域无条件建，modal 只决定陷不陷焦点；放进 if (modal) 会让非模态
        // 既不初始聚焦也不归还焦点，restoreFocus 失效
        const focus = createFocusScope({
          config,
          layer,
          container: getContentEl,
          trapped: () => modal,
          loop: modal,
          initialFocus: () => {
            const selector = prop('initialFocus')
            // 给了选择器就只认它；还没匹配上回 null，把机会留给下一帧重试
            if (selector !== undefined)
              return queryInContent(getContentEl(), selector)
            // alertdialog 焦点落在 content 容器本身，不预选按钮；
            // 普通 dialog 交给 tabbable 探测选首个可聚焦元素
            return role === 'alertdialog' ? getContentEl() : null
          },
          restoreFocus: () => prop('restoreFocus') ?? true,
          // 归还落点显式给 trigger：指针打开那一刻焦点未必真在它身上（Safari 点按不给按钮焦点），
          // 靠焦点域的创建前快照会把 Escape 之后的 Tab 起点丢到 body 上。
          // 按 connect 给 trigger 落的 id 现取，没有 trigger 的用法回 null，归还照旧走快照
          restoreTarget: () => scope.getById<HTMLElement>(scope.partId('dialog', 'trigger')),
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
