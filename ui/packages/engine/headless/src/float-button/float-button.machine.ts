/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 float button 相关实现。

import type { FloatButtonSchema } from './float-button.types'
import { setup } from '@xihan-ui/core'
import { trackLiquidGoo } from '@xihan-ui/core/visual-environment'
import { trackLiquidPart } from '../shared/liquid'
import { trackOverlayLayer, trackPresenceResources } from '../shared/overlay-shell'
import { waitForSubtreeAnimations } from '../shared/part-presence'

const { createMachine } = setup<FloatButtonSchema>()

/**
 * FloatButton 的专用行为真源。
 *
 * collapsible 只能表达局部开合，无法持有 Document 级的层外交互和 Escape 仲裁；这里把
 * LayerRegistry/DismissableLayer 的完整生命周期与开合放进同一台机器，适配器只提供 DOM 桥。
 */
export const floatButtonMachine = createMachine({
  name: 'float-button',
  // 按压通道（context.pressed）与开合无关：两个状态都认 PRESS.*，禁用时按住的一律松开
  context: ({ cell }) => ({
    pressed: cell<boolean>(() => ({ defaultValue: false })),
    merging: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    getRootEl: () => null,
    liquidGroup: null,
  }),
  // 受控值始终由父级决定；非受控 defaultOpen 在禁用时不建立展开态。
  initialState: ({ prop }) => prop('open') !== undefined
    ? (prop('open') ? 'open' : 'closed')
    : (prop('defaultOpen') && !prop('disabled') ? 'open' : 'closed'),
  effects: ['trackLayer', 'trackLiquid', 'trackLiquidGroup', 'trackListExit'],
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    track([() => prop('disabled')], () => action(['syncDisabled', 'releaseWhenInert']))
  },
  on: {
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    closed: {
      on: {
        'OPEN': [
          { guard: 'isDisabled' },
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['endMerge', 'invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isDisabled' },
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['endMerge', 'invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open', actions: ['endMerge'] },
        'CONTROLLED.CLOSE': {},
        'DISABLE': {},
      },
    },
    open: {
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['startMerge', 'invokeOnClose'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['startMerge', 'invokeOnClose'] },
        ],
        'DISABLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['startMerge', 'invokeOnClose'] },
        ],
        'CONTROLLED.OPEN': {},
        'CONTROLLED.CLOSE': { target: 'closed', actions: ['startMerge'] },
      },
    },
  },
  implementations: {
    guards: {
      isDisabled: ({ prop }) => prop('disabled') ?? false,
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      canPress: ({ prop }) => !prop('disabled'),
    },
    actions: {
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      // 按住途中被禁用：原生 disabled 的按钮不再派 keyup / blur，按压面得由机器自己收
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled'))
          context.set('pressed', false)
      },
      // 收起先把展开组留着：液态组在场且会播放时等动作融回触发器，否则等条目各自的退场动画播完，才藏
      startMerge: ({ context }) => context.set('merging', true),
      endMerge: ({ context }) => context.set('merging', false),
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
      /** 触发器是浮在内容之上的导航层部件：材质轴为 liquid 时按下层换色调、亮边随指针 */
      trackLiquid: ({ scope, flush }) => trackLiquidPart(scope, flush, 'float-button', 'trigger'),
      /**
       * 液态档下触发器与展开组里的动作结成液态组：共用一层色块，靠近时边缘连起来；
       * 展开时动作从触发器里分离出来，收起时融回触发器，融回落定才撤掉 merging、藏起展开组
       */
      trackLiquidGroup: ({ refs, scope, flush, track, state, context }) => {
        let disposed = false
        flush(() => {
          if (disposed)
            return
          const root = refs.get('getRootEl')()
          const trigger = scope.getById<HTMLElement>(scope.partId('float-button', 'trigger'))
          const list = scope.getById<HTMLElement>(scope.partId('float-button', 'list'))
          if (!root || !trigger || !list)
            return
          // 展开组的直接子元素就是一条条动作；文本节点与注释不算
          const items = (): HTMLElement[] => [...list.children] as HTMLElement[]
          refs.set('liquidGroup', {
            goo: trackLiquidGoo(root, { source: trigger, members: () => [trigger, ...items()], domains: () => [list] }),
            items,
          })
        })
        track([() => state.get()], () => {
          const open = state.get() === 'open'
          flush(() => {
            const group = refs.get('liquidGroup')
            if (disposed || !group)
              return
            const animated = group.goo.animated
            void group.goo.split(group.items(), open).then(() => {
              // 融回落定，或被撤出打断：展开组这才藏起来。分离的结局与展开组显隐无关，
              // 融回途中又展开的由 endMerge 收掉。不播放时（standard 档、减弱动效）收尾归 trackListExit：
              // 条目各自的退场动画播完才藏
              if (animated && !open && !disposed && state.get() !== 'open')
                context.set('merging', false)
            })
          })
        })
        return () => {
          disposed = true
          refs.get('liquidGroup')?.goo.dispose()
          refs.set('liquidGroup', null)
        }
      },
      /**
       * 标准档的收起：条目逆着冒出的次序逐条缩回，等它们播完才撤掉 merging、藏起展开组。
       * 液态组会播放时归 trackLiquidGroup 管——拆出来的那几块不挂 CSS 动画，这里一等就会提前收掉。
       */
      trackListExit: ({ refs, scope, state, context, track, flush }) => {
        let stop: (() => void) | undefined
        track([() => state.get()], () => {
          stop?.()
          stop = undefined
          if (state.get() === 'open')
            return
          flush(() => {
            if (state.get() === 'open' || !context.get('merging') || refs.get('liquidGroup')?.goo.animated)
              return
            stop = waitForSubtreeAnimations(scope.getById(scope.partId('float-button', 'list')), () => {
              if (state.get() !== 'open')
                context.set('merging', false)
            })
          })
        })
        return () => stop?.()
      },
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
