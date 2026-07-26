import type { DialogSchema } from './dialog.types'
import { acquireScrollLock, createDismissLayer, createFocusScope } from '@xihan-ui/behavior'
import { hideOutside } from '@xihan-ui/core'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<DialogSchema>()

export const dialogMachine = createMachine({
  name: 'dialog',
  refs: () => ({
    config: null,
    layer: null,
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
      // 进入 open：按固定顺序装配 dismiss → focus → scroll → hideOutside。
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
      trackOverlay: ({ refs, prop, send }) => {
        const config = refs.get('config')
        const layer = refs.get('layer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !layer)
          return undefined

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

        if (modal) {
          const focus = createFocusScope({
            config,
            layer,
            container: getContentEl,
            trapped: () => true,
            loop: true,
            // alertdialog 焦点落在 content 容器本身（不预选按钮，避免误触发破坏性操作）；
            // 普通 dialog 交给 tabbable 探测选首个可聚焦元素（content 自身 tabindex=-1）。
            initialFocus: () => (role === 'alertdialog' ? getContentEl() : null),
            restoreFocus: () => prop('restoreFocus') ?? true,
          })
          disposers.push(() => focus.dispose())

          const lock = acquireScrollLock({ config })
          disposers.push(() => lock.dispose())

          const targets = [getContentEl(), ...refs.get('branches')()].filter(Boolean) as Element[]
          if (targets.length)
            disposers.push(hideOutside(targets, config.scope))
        }

        return () => {
          for (const d of disposers) d()
        }
      },
    },
  },
})
