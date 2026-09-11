import type { DialogSchema } from './dialog.types'
import { createDismissLayer, createFocusScope, setup, warn } from '@xihan-ui/core'
import { closeReasonOf } from '../shared/close-reason'
import { createModalLayerResources, setupLayerTransaction } from '../shared/overlay-shell'

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
    syncModalResources: null,
    getContentEl: () => null,
    getTriggerEl: () => null,
    branches: () => [],
    partScope: 'dialog',
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // 资源由机器生命周期持有；逻辑关闭之后继续保留，等 Presence 真正退出再释放。
  effects: ['trackOverlay'],
  // 受控时用户事件只发意图回调；宿主写回 open 后由这条 watch 派发 CONTROLLED.* 回写状态。
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    track([() => prop('modal')], () => action(['syncModalResources']))
  },
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
      syncModalResources: ({ refs }) => refs.get('syncModalResources')?.(),
    },
    effects: {
      trackOverlay: ({ refs, prop, scope, send, flush, state, track }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        let reactivateFocus: (() => void) | undefined
        let resourcePolicy: string | undefined
        const acquire = (): (() => void) => setupLayerTransaction(registerLayer, (layer, defer, run) => {
          const role = prop('role') ?? 'dialog'
          resourcePolicy = role
          const getContentEl = refs.get('getContentEl')

          const dismiss = createDismissLayer({
            config,
            layer,
            // 两个开关都现读 prop，展开中途改也立刻生效
            onEscapeKeyDown: (e) => {
              if (state.get() !== 'open' || !(prop('closeOnEscape') ?? true))
                e.preventDefault()
            },
            onInteractOutside: (e) => {
            // 缺省值依赖 role 与 modal，这两项也一并现读：
            // alertdialog 一律不许点外面关，其余回落 modal
              const allowed = (prop('role') ?? 'dialog') === 'alertdialog'
                ? false
                : prop('closeOnInteractOutside') ?? prop('modal') ?? true
              if (state.get() !== 'open' || !allowed)
                e.preventDefault()
            },
            onDismiss: reason =>
              send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
          })
          defer(() => dismiss.dispose())

          // 焦点域无条件建，modal 只决定陷不陷焦点；放进 if (modal) 会让非模态
          // 既不初始聚焦也不归还焦点，restoreFocus 失效
          const focus = createFocusScope({
            config,
            layer,
            container: getContentEl,
            // 退出内容已经 inert，保留焦点域归还资格但不向失活内容反复拉焦点。
            trapped: () => (prop('modal') ?? true) && state.get() === 'open',
            loop: () => prop('modal') ?? true,
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
            // 按 connect 给 trigger 落的 id 现取，没有 trigger 的用法回 null，归还照旧走快照。
            // 组件名取自 refs：抽屉跑同一台机器，它的部件 id 挂在 drawer 名下
            restoreTarget: () => scope.getById<HTMLElement>(scope.partId(refs.get('partScope'), 'trigger')),
          })
          reactivateFocus = focus.reactivate
          defer(() => {
            if (reactivateFocus === focus.reactivate)
              reactivateFocus = undefined
            focus.dispose()
          })

          const modalResources = createModalLayerResources({
            config,
            layer,
            enabled: () => prop('modal') ?? true,
            // 栈中位于本层之上的层一并算作目标：内层浮层 portal 到 body 之后也是 body 的
            // 直接子元素，不排除会被本层的 MutationObserver 打上 inert
            targets: () => [
              getContentEl(),
              ...refs.get('branches')(),
              ...config.layerRegistry.elementsAbove(layer),
            ].filter(Boolean) as Element[],
            flush,
            run,
          })
          defer(modalResources.dispose)
          const syncModalResources = (): void => {
            // 退场期间保留关闭时的策略；重新展开或展开中改值才切换。
            if (state.get() === 'open')
              modalResources.sync()
          }
          refs.set('syncModalResources', syncModalResources)
          defer(() => {
            if (refs.get('syncModalResources') === syncModalResources)
              refs.set('syncModalResources', null)
          })
          syncModalResources()
        }, { registry: config.layerRegistry, flush })

        const presence = refs.get('presence')
        let disposed = false
        let release: (() => void) | undefined
        let lastOpen = false

        const finish = (): void => {
          if (disposed || state.get() === 'open' || !release)
            return
          const cleanup = release
          release = undefined
          cleanup()
          if (!disposed && state.get() !== 'open' && !release)
            prop('onExitComplete')?.()
        }
        const offExit = presence?.onExitComplete(finish)
        const sync = (): void => {
          if (disposed)
            return
          const open = state.get() === 'open'
          let reopening = open && !lastOpen && release !== undefined
          lastOpen = open
          if (open) {
            // 退场中角色改变后需重建初始焦点语义；modal 本身由共享资源控制器原位切换。
            if (reopening && resourcePolicy !== (prop('role') ?? 'dialog')) {
              const cleanup = release
              release = undefined
              cleanup?.()
              reopening = false
            }
            // 退场中重开沿用原资源，旧租约由 Presence 撤销，不重复登记或抢回焦点。
            release ??= acquire()
            refs.get('syncModalResources')?.()
            presence?.update(true)
            if (reopening) {
              const activate = reactivateFocus
              flush(() => scope.getWin().requestAnimationFrame(() => {
                if (!disposed && state.get() === 'open' && release && reactivateFocus === activate)
                  activate?.()
              }))
            }
          }
          else if (!presence || !presence.rendered) {
            finish()
          }
        }
        try {
          track([() => state.get()], sync)
          sync()
        }
        catch (error) {
          disposed = true
          offExit?.()
          release?.()
          throw error
        }
        return () => {
          disposed = true
          offExit?.()
          const cleanup = release
          release = undefined
          cleanup?.()
        }
      },
    },
  },
})
