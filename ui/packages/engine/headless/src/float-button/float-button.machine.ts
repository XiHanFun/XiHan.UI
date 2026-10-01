/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 float button 相关实现。

import type { ContextFacade, RefsFacade } from '@xihan-ui/core'
import type { FloatButtonPoint, FloatButtonPosition, FloatButtonSchema } from './float-button.types'
import { setup } from '@xihan-ui/core'
import { trackLiquidGoo } from '@xihan-ui/core/visual-environment'
import { createSpringValue } from '@xihan-ui/motion'
import { createPointerSession, resolveSessionDoc, shouldActivate } from '@xihan-ui/pointer'
import { clearOpenedAtMount, openedAtMountCell } from '../shared/first-frame'
import { trackLiquidPart } from '../shared/liquid'
import { trackOverlayLayer, trackPresenceResources } from '../shared/overlay-shell'
import { waitForSubtreeAnimations } from '../shared/part-presence'
import { resolveFloatButtonOffset } from './float-button.connect'
import { FLOAT_BUTTON_DEFAULT_SNAP, resolveFloatButtonSnap, sameFloatButtonPosition } from './float-button.geometry'

const { createMachine } = setup<FloatButtonSchema>()

/** 结束这一场拖动的指针会话。 */
function releaseDrag(refs: RefsFacade<FloatButtonSchema>): void {
  refs.get('drag')?.session.dispose()
  refs.set('drag', null)
}

/** 撤下落定途中的弹簧；触发器停在弹簧此刻的位置，由调用方决定接下来交给谁。 */
function stopSettle(refs: RefsFacade<FloatButtonSchema>): void {
  const settle = refs.get('settle')
  settle?.x.stop()
  settle?.y.stop()
  refs.set('settle', null)
}

/** 落定：提交位置并撤下跟手的坐标，两件事同一拍做完，样式层接手时位置与弹簧终点重合。 */
function commitPosition(context: ContextFacade<FloatButtonSchema>, position: FloatButtonPosition): void {
  context.set('position', position)
  context.set('movingPoint', null)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max))
}

/** 挂载时开没开：受控值始终由父级决定；非受控 defaultOpen 在禁用时不建立展开态。 */
function openAtMount(prop: (key: 'open' | 'defaultOpen' | 'disabled') => boolean | undefined): boolean {
  return prop('open') !== undefined ? !!prop('open') : !!prop('defaultOpen') && !prop('disabled')
}

/**
 * FloatButton 的专用行为真源。
 *
 * collapsible 只能表达局部开合，无法持有 Document 级的层外交互和 Escape 仲裁；这里把
 * LayerRegistry/DismissableLayer 的完整生命周期与开合放进同一台机器，适配器只提供 DOM 桥。
 */
export const floatButtonMachine = createMachine({
  name: 'float-button',
  // 按压通道（context.pressed）与开合无关：两个状态都认 PRESS.*，禁用时按住的一律松开
  context: ({ cell, prop }) => ({
    // 首帧标记：挂载时开着、还没收起过
    openedAtMount: openedAtMountCell(cell, openAtMount(prop)),
    pressed: cell<boolean>(() => ({ defaultValue: false })),
    merging: cell<boolean>(() => ({ defaultValue: false })),
    position: cell<FloatButtonPosition | null>(() => ({
      value: prop('position'),
      defaultValue: prop('defaultPosition') ?? null,
      isEqual: sameFloatButtonPosition,
      // 通知必须挂在 cell 上：受控时 set 不写内部值，只有这条回调能把拖到的位置送出去
      onChange: (position) => {
        if (position)
          prop('onPositionChange')?.({ position })
      },
    })),
    movingPoint: cell<FloatButtonPoint | null>(() => ({ defaultValue: null })),
    dragging: cell<boolean>(() => ({ defaultValue: false })),
    swallowClick: cell<boolean>(() => ({ defaultValue: false })),
    viewportHeight: cell<number | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    getRootEl: () => null,
    liquidGroup: null,
    drag: null,
    settle: null,
  }),
  initialState: ({ prop }) => (openAtMount(prop) ? 'open' : 'closed'),
  effects: ['trackLayer', 'trackLiquid', 'trackLiquidGroup', 'trackListExit', 'trackViewport'],
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    track([() => prop('disabled')], () => action(['syncDisabled', 'releaseWhenInert']))
  },
  on: {
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
    // 拖动与开合正交：两个状态都认，起拖时展开着就先收起
    'DRAG.START': { guard: 'canDrag', actions: ['armDrag'] },
    'DRAG.MOVE': { actions: ['moveDrag'] },
    'DRAG.END': { actions: ['endDrag'] },
    'CLICK.SWALLOW': { actions: ['clearSwallowClick'] },
    'VIEWPORT.RESIZE': { actions: ['setViewportHeight'] },
  },
  states: {
    closed: {
      // 第一次收起即撤首帧标记：之后的每一次打开都是用户操作带来的
      entry: ['clearOpenedAtMount'],
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
      canDrag: ({ prop }) => !!prop('draggable') && !prop('disabled'),
    },
    actions: {
      clearOpenedAtMount,
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      clearSwallowClick: ({ context }) => context.set('swallowClick', false),
      setViewportHeight: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VIEWPORT.RESIZE')
          context.set('viewportHeight', e.height)
      },

      /**
       * 指针按在触发器上：先不算拖动，移动过激活距离才接管。几何在按下这一刻量好：
       * 触发器此刻的左上角（落定途中按住就是弹簧此刻的位置）、边长、视口与留边。
       */
      armDrag: ({ context, refs, scope, prop, event, send }) => {
        const e = event.current()
        if (e.type !== 'DRAG.START')
          return
        context.set('swallowClick', false)
        releaseDrag(refs)
        const root = refs.get('getRootEl')()
        const trigger = scope.getById<HTMLElement>(scope.partId('float-button', 'trigger'))
        if (!root || !trigger)
          return
        stopSettle(refs)
        const doc = root.ownerDocument
        const rect = trigger.getBoundingClientRect()
        const session = createPointerSession({
          doc: resolveSessionDoc(root),
          pointerId: e.pointerId,
          onMove: ({ point }) => send({ type: 'DRAG.MOVE', clientX: point.clientX, clientY: point.clientY }),
          onEnd: ({ reason, velocity }) => send({ type: 'DRAG.END', velocityX: velocity.x, velocityY: velocity.y, canceled: reason === 'pointercancel' }),
        })
        refs.set('drag', {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          origin: { x: rect.left, y: rect.top },
          size: rect.width,
          // 固定定位的包含块是视口去掉滚动条的那一块
          width: doc.documentElement.clientWidth,
          height: doc.documentElement.clientHeight,
          gap: resolveFloatButtonOffset(prop('offset')),
          rtl: doc.defaultView?.getComputedStyle(root).direction === 'rtl',
          active: false,
          root,
          session,
        })
      },

      /** 跟手：从按下时的位置加上指针位移，夹在视口里（四边各留 offset）。 */
      moveDrag: ({ context, refs, event, state, send }) => {
        const e = event.current()
        const drag = refs.get('drag')
        if (e.type !== 'DRAG.MOVE' || !drag)
          return
        const dx = e.clientX - drag.startX
        const dy = e.clientY - drag.startY
        if (!drag.active) {
          if (!shouldActivate({ x: dx, y: dy }))
            return
          drag.active = true
          context.set('dragging', true)
          // 拖着一组展开的动作满屏跑没有意义，起拖即收起
          if (state.get() === 'open')
            send({ type: 'CLOSE', src: 'drag' })
        }
        context.set('movingPoint', {
          x: clamp(drag.origin.x + dx, drag.gap, drag.width - drag.size - drag.gap),
          y: clamp(drag.origin.y + dy, drag.gap, drag.height - drag.size - drag.gap),
        })
      },

      /**
       * 松手：按 snap 算出贴到哪条边，弹簧带着松手速度把触发器送过去，落定才提交位置。
       * 没拖起来（只是点按）时什么都不做，交给随后那次 click；落定途中被按住又原地放开的，从此刻的位置重新贴边。
       */
      endDrag: ({ context, refs, prop, event }) => {
        const e = event.current()
        const drag = refs.get('drag')
        releaseDrag(refs)
        if (e.type !== 'DRAG.END' || !drag)
          return
        const from = context.get('movingPoint')
        if (!drag.active && from == null)
          return
        context.set('dragging', false)
        // 浏览器紧跟着会在触发器上派一次 click：这一下是拖动的收尾，不能再开合
        if (drag.active)
          context.set('swallowClick', !e.canceled)
        const at = from ?? drag.origin
        const velocity = e.canceled ? { x: 0, y: 0 } : { x: e.velocityX, y: e.velocityY }
        const { target, position } = resolveFloatButtonSnap({
          at,
          velocity,
          size: drag.size,
          width: drag.width,
          height: drag.height,
          gap: drag.gap,
          rtl: drag.rtl,
          snap: prop('snap') ?? FLOAT_BUTTON_DEFAULT_SNAP,
        })
        if (Math.abs(target.x - at.x) < 0.5 && Math.abs(target.y - at.y) < 0.5) {
          commitPosition(context, position)
          return
        }
        const point = { ...at }
        const write = (): void => context.set('movingPoint', { x: point.x, y: point.y })
        const settle = {
          x: createSpringValue({
            spring: 'smooth',
            value: at.x,
            target: drag.root,
            onUpdate: (value) => {
              point.x = value
              write()
            },
          }),
          y: createSpringValue({
            spring: 'smooth',
            value: at.y,
            target: drag.root,
            onUpdate: (value) => {
              point.y = value
              write()
            },
          }),
        }
        refs.set('settle', settle)
        void Promise.all([
          settle.x.to(target.x, { velocity: velocity.x }),
          settle.y.to(target.y, { velocity: velocity.y }),
        ]).then((results) => {
          if (refs.get('settle') !== settle || results.some(result => result !== 'rest'))
            return
          refs.set('settle', null)
          commitPosition(context, position)
        })
      },
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
      /**
       * 视口高度：停在一点时据此定展开组朝上还是朝下长；贴边位置与角落由样式层按包含块排，用不着它。
       * 卸载时一并结清还没结束的拖动与落定
       */
      trackViewport: ({ refs, send, flush }) => {
        let off: (() => void) | undefined
        flush(() => {
          const root = refs.get('getRootEl')()
          const view = root?.ownerDocument.defaultView
          if (!root || !view)
            return
          const measure = (): void => send({ type: 'VIEWPORT.RESIZE', height: root.ownerDocument.documentElement.clientHeight })
          measure()
          view.addEventListener('resize', measure)
          off = () => view.removeEventListener('resize', measure)
        })
        return () => {
          off?.()
          releaseDrag(refs)
          stopSettle(refs)
        }
      },
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
