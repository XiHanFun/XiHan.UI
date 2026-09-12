import type { FloatButtonSchema } from './float-button.types'
import { setup } from '@xihan-ui/core'
import { trackOverlayLayer, trackPresenceResources } from '../shared/overlay-shell'

const { createMachine } = setup<FloatButtonSchema>()

/**
 * FloatButton 的专用行为真源。
 *
 * collapsible 只能表达局部开合，无法持有 Document 级的层外交互和 Escape 仲裁；这里把
 * LayerRegistry/DismissableLayer 的完整生命周期与开合放进同一台机器，适配器只提供 DOM 桥。
 */
export const floatButtonMachine = createMachine({
  name: 'float-button',
  context: () => ({}),
  refs: () => ({
    config: null,
    registerLayer: null,
    getRootEl: () => null,
  }),
  // 受控值始终由父级决定；非受控 defaultOpen 在禁用时不建立展开态。
  initialState: ({ prop }) => prop('open') !== undefined
    ? (prop('open') ? 'open' : 'closed')
    : (prop('defaultOpen') && !prop('disabled') ? 'open' : 'closed'),
  effects: ['trackLayer'],
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    track([() => prop('disabled')], () => action(['syncDisabled']))
  },
  states: {
    closed: {
      on: {
        'OPEN': [
          { guard: 'isDisabled' },
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isDisabled' },
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
        'CONTROLLED.CLOSE': {},
        'DISABLE': {},
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
        'DISABLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'CONTROLLED.OPEN': {},
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isDisabled: ({ prop }) => prop('disabled') ?? false,
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
      syncDisabled: ({ prop, send }) => {
        if (prop('disabled')) {
          send({ type: 'DISABLE' })
          return
        }
        const open = prop('open')
        if (open !== undefined)
          send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
    },
    effects: {
      trackLayer: ({ refs, state, prop, send, track, flush }) => trackPresenceResources({
        // FloatButton 的 list 收起即 hidden，没有独立退场容器；逻辑关闭当场结清资源。
        presence: null,
        open: () => state.get() === 'open' && !(prop('disabled') ?? false),
        track,
        acquire: () => {
          const bridge = refs.get('registerLayer')
          return trackOverlayLayer({
            config: refs.get('config'),
            // 层的 kind、包含边界与模态策略属于行为合同，全部留在 Headless；适配器只代为登记。
            registerLayer: bridge
              ? () => bridge({
                  kind: 'popover',
                  node: refs.get('getRootEl'),
                  branches: () => [],
                  isModal: () => false,
                  surfaces: () => [],
                })
              : null,
            flush,
            active: () => state.get() === 'open' && !(prop('disabled') ?? false),
            onDismiss: (reason) => {
              if (reason === 'escape-key') {
                send({ type: 'CLOSE', src: 'esc' })
                return
              }
              // hover 的层外 pointer/focus 与 root pointerleave 属于同一离场动作；只让
              // pointerleave 发意图，避免受控父级尚未写回时同一手势重复通知。
              if (prop('expandTrigger') !== 'hover')
                send({ type: 'CLOSE', src: 'interact-outside' })
            },
          })
        },
      }),
    },
  },
})
