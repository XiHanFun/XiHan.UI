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
  states: {
    closed: {
      on: {
        OPEN: { target: 'open' },
        TOGGLE: { target: 'open' },
      },
    },
    open: {
      // 进入 open：按固定顺序装配 dismiss → focus → scroll → hideOutside。
      effects: ['trackOverlay'],
      on: {
        CLOSE: { target: 'closed' },
        TOGGLE: { target: 'closed' },
      },
    },
  },
  implementations: {
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
            initialFocus: getContentEl,
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
