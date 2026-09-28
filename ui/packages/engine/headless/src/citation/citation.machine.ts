/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 citation 相关实现。

import type { PositionResult, Scope } from '@xihan-ui/core'
import type { CitationSchema, CitationTriggerTarget } from './citation.types'
import { setTimeoutEffect, setup } from '@xihan-ui/core'
import { OVERLAY_OFFSET, OVERLAY_PLACEMENT_ANCHORED } from '../shared/overlay'
import { trackOverlayLayer, trackPresenceResources } from '../shared/overlay-shell'
import { citationAnatomy } from './citation.anatomy'

const { createMachine } = setup<CitationSchema>()

/** hover 档没传 placement 时卡片交给定位引擎的落点。 */
export const CITATION_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_ANCHORED

/** hover 档：指针停在引用上到卡片出现的缺省等待毫秒，与悬停卡片、文字提示一致。 */
const OPEN_DELAY = 700
/** hover 档：指针离开到收起的缺省等待毫秒。 */
const CLOSE_DELAY = 300
/** hover 档：卡片刚收起的这么久里，指向另一处引用直接接替。 */
const SKIP_DELAY = 300

/** 某份预览的 id：连接层按它发 id，机器按它找节点量高度、等退场。 */
export function citationPreviewId(scope: Scope, sourceId: string): string {
  return scope.partId(citationAnatomy.name, `preview:${sourceId}`)
}

/** 来源条目按钮的 id：从来源列表打开的预览以它为锚点。 */
export function citationSourceLinkId(scope: Scope, sourceId: string): string {
  return scope.partId(citationAnatomy.name, `source-link:${sourceId}`)
}

/**
 * 预览内容区的高度：滚动高度扣掉此刻的上下内缩。展开动画的首帧内缩是 0、滚动高度就是内容高度；
 * 静止时两边都带着内缩——两种情形算出来都是内容区本身的高度。没排版（收起、不在文档里）时量不到。
 */
function contentBlockSize(scope: Scope, node: HTMLElement): number | null {
  if (!node.getClientRects().length)
    return null
  const style = scope.getComputedStyle(node)
  return node.scrollHeight - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom)
}

/** 接替窗口归一：没给取缺省，非有限数与负数按不接替处理。 */
function resolveSkipDelay(ms: number | undefined): number {
  const value = ms ?? SKIP_DELAY
  return Number.isFinite(value) && value > 0 ? value : 0
}

export const citationMachine = createMachine({
  name: 'citation',
  context: ({ prop, cell }) => ({
    activeSourceId: cell<string | null>(() => ({
      value: prop('activeSourceId'),
      defaultValue: prop('defaultActiveSourceId') ?? prop('sources')?.[0]?.sourceId ?? null,
      onChange: sourceId => prop('onActiveSourceChange')?.({ sourceId }),
    })),
    open: cell<boolean>(() => ({
      value: prop('open'),
      defaultValue: prop('defaultOpen') ?? false,
      onChange: open => prop('onOpenChange')?.({ open }),
    })),
    focusedSourceId: cell<string | null>(() => ({ defaultValue: null })),
    activeAnchorIndex: cell<number | null>(() => ({ defaultValue: null })),
    activeTriggerId: cell<string | null>(() => ({ defaultValue: null })),
    // 首帧就露面的那一份：开着且是当前来源
    shownSourceId: cell<string | null>(() => ({
      defaultValue: (prop('open') ?? prop('defaultOpen') ?? false)
        ? prop('activeSourceId') ?? prop('defaultActiveSourceId') ?? prop('sources')?.[0]?.sourceId ?? null
        : null,
    })),
    leavingSourceId: cell<string | null>(() => ({ defaultValue: null })),
    moved: cell<boolean>(() => ({ defaultValue: false })),
    previewBlockSizes: cell<Readonly<Record<string, number>>>(() => ({ defaultValue: {} })),
    activeGroup: cell<readonly string[] | null>(() => ({ defaultValue: null })),
    pendingTarget: cell<CitationTriggerTarget | null>(() => ({ defaultValue: null })),
    focusHeld: cell<boolean>(() => ({ defaultValue: false })),
    closedAt: cell<number>(() => ({ defaultValue: Number.NEGATIVE_INFINITY })),
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    swapped: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getFloatingEl: () => null,
  }),
  initialState: () => 'idle',
  // 悬停卡片的定位与消解层只在 hover 档、卡片开着时挂；inline 档两路都短路
  effects: ['trackPosition', 'trackLayer'],
  watch: ({ track, prop, action, context }) => {
    track([() => prop('disabled')], () => {
      if (prop('disabled'))
        action(['clearFocus'])
    })
    // 露面的预览换了（开、关、换来源，含宿主受控写回）：旧的一份退场，新的一份展开
    track([context.dep('open'), context.dep('activeSourceId')], () => action(['syncPreview']))
  },
  on: {
    'CITATION.ACTIVATE': { target: 'idle', actions: ['clearPending', 'activateCitation'] },
    'SOURCE.ACTIVATE': { target: 'idle', actions: ['clearPending', 'activateSource'] },
    'SOURCE.OPEN': { actions: ['invokeSourceOpen'] },
    'SOURCE.FOCUS': { actions: ['setFocusedSource'] },
    'LIST.BLUR': { actions: ['clearFocus'] },
    'OPEN.SET': { target: 'idle', actions: ['clearPending', 'setOpen'] },
    'PREVIEW.MEASURED': { actions: ['setPreviewBlockSize'] },
    'PREVIEW.LEFT': { actions: ['clearLeaving'] },
    'GROUP.STEP': { actions: ['stepGroup'] },
    'DISMISS': { target: 'idle', actions: ['clearPending', 'clearFocusHeld', 'closeHover'] },
    // 焦点落到某处引用上：不走延时，当场打开并记下焦点在卡片这一侧
    'TRIGGER.FOCUS': { guard: 'isHoverMode', target: 'idle', actions: ['markFocusHeld', 'openTarget'] },
    'FLOATING.FOCUS': { guard: 'isHoverMode', target: 'idle', actions: ['markFocusHeld'] },
    'HOVER.BLUR': { guard: 'isHoverMode', target: 'idle', actions: ['clearFocusHeld', 'closeHover'] },
  },
  states: {
    idle: {
      on: {
        'TRIGGER.ENTER': [
          { guard: 'isSameTarget' },
          // 卡片开着或刚收起不久：直接切过去，不再等
          { guard: 'isWarm', actions: ['openTarget'] },
          { target: 'opening', actions: ['setPending'] },
        ],
        'POINTER.LEAVE': [
          { guard: 'isFocusHeld' },
          { guard: 'isVisible', target: 'closing' },
        ],
      },
    },
    opening: {
      effects: ['waitForOpenDelay'],
      on: {
        'after.openDelay': { target: 'idle', actions: ['openPending'] },
        'TRIGGER.ENTER': { actions: ['setPending'] },
        'POINTER.LEAVE': { target: 'idle', actions: ['clearPending'] },
      },
    },
    closing: {
      effects: ['waitForCloseDelay'],
      on: {
        'after.closeDelay': { target: 'idle', actions: ['closeHover'] },
        // 指针回到卡片或当前那处引用：撤销收起；指向另一处引用：直接切过去
        'FLOATING.ENTER': { target: 'idle' },
        'TRIGGER.ENTER': [
          { guard: 'isSameTarget', target: 'idle' },
          { target: 'idle', actions: ['openTarget'] },
        ],
      },
    },
  },
  implementations: {
    guards: {
      isHoverMode: ({ prop }) => prop('previewMode') === 'hover',
      isVisible: ({ context }) => context.get('open'),
      isFocusHeld: ({ context }) => context.get('focusHeld'),
      // 卡片开着，或最近一次收起离现在不到接替窗口
      isWarm: ({ context, prop }) => {
        if (context.get('open'))
          return true
        const skip = resolveSkipDelay(prop('skipDelayDuration'))
        return skip > 0 && Date.now() - context.get('closedAt') < skip
      },
      isSameTarget: ({ context, event }) => {
        const e = event.current()
        return e.type === 'TRIGGER.ENTER' && context.get('open') && context.get('activeTriggerId') === e.target.triggerId
      },
    },
    actions: {
      /**
       * 露面的预览换了：旧的一份进退场、新的一份展开。
       * 宿主把这一帧提交出去之后，量下新露面那一份的内容区高度（展开从 0 长到它）；
       * 收起的那一份等它身上在播的退场动画播完才报「可以藏起」，没有可等的动画即刻报。
       */
      syncPreview: ({ context, prop, scope, send, flush }) => {
        const next = context.get('open') ? context.get('activeSourceId') : null
        const prev = context.get('shownSourceId')
        if (prev === next)
          return
        context.set('moved', true)
        // hover 档卡片开着时换来源：卡片里就地换内容，旧的一份不播退场
        const swap = prop('previewMode') === 'hover' && prev != null && next != null
        context.set('swapped', swap)
        if (prev != null && !swap) {
          // 收起前量下内容区高度：此刻节点还是露面时的样子；宿主已先一步藏起时沿用展开时量下的那一版
          const node = scope.getById(citationPreviewId(scope, prev))
          const blockSize = node ? contentBlockSize(scope, node) : null
          if (blockSize != null)
            context.set('previewBlockSizes', { ...context.get('previewBlockSizes'), [prev]: blockSize })
          context.set('leavingSourceId', prev)
        }
        // 退场途中又露面：当场展开，不再等那一段退场
        if (next != null && context.get('leavingSourceId') === next)
          context.set('leavingSourceId', null)
        context.set('shownSourceId', next)

        const leaving = context.get('leavingSourceId')
        flush(() => {
          if (next != null && context.get('shownSourceId') === next) {
            const node = scope.getById(citationPreviewId(scope, next))
            const blockSize = node ? contentBlockSize(scope, node) : null
            if (blockSize != null)
              send({ type: 'PREVIEW.MEASURED', sourceId: next, blockSize })
          }
          if (leaving == null || context.get('leavingSourceId') !== leaving)
            return
          const node = scope.getById(citationPreviewId(scope, leaving))
          const animations = node && typeof node.getAnimations === 'function'
            ? node.getAnimations().filter((animation) => {
                const end = animation.effect?.getComputedTiming().endTime
                return Number.isFinite(Number(end)) && Number(end) > 0 && animation.playState !== 'finished'
              })
            : []
          void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
            send({ type: 'PREVIEW.LEFT', sourceId: leaving })
          })
        })
      },
      setPreviewBlockSize: ({ context, event }) => {
        const current = event.current()
        if (current.type === 'PREVIEW.MEASURED')
          context.set('previewBlockSizes', { ...context.get('previewBlockSizes'), [current.sourceId]: current.blockSize })
      },
      clearLeaving: ({ context, event }) => {
        const current = event.current()
        if (current.type === 'PREVIEW.LEFT' && context.get('leavingSourceId') === current.sourceId)
          context.set('leavingSourceId', null)
      },
      activateCitation: ({ context, event }) => {
        const current = event.current()
        if (current.type !== 'CITATION.ACTIVATE')
          return
        const { sourceIds, anchorIndex, triggerId } = current.target
        const same = context.get('activeTriggerId') === triggerId
          && context.get('activeAnchorIndex') === anchorIndex
          && context.get('activeSourceId') != null
          && sourceIds.includes(context.get('activeSourceId')!)
        context.set('activeGroup', sourceIds.length > 1 ? sourceIds : null)
        if (!same)
          context.set('activeSourceId', sourceIds[0]!)
        context.set('activeAnchorIndex', anchorIndex)
        context.set('activeTriggerId', triggerId)
        const open = current.toggle && same ? !context.get('open') : true
        context.set('open', open)
        if (!open)
          context.set('closedAt', Date.now())
      },
      /** 当场打开某处引用：hover 档的聚焦、接替与等到点都走这里。 */
      openTarget: ({ context, event }) => {
        const current = event.current()
        if (current.type !== 'TRIGGER.ENTER' && current.type !== 'TRIGGER.FOCUS')
          return
        const { sourceIds, anchorIndex, triggerId } = current.target
        if (context.get('activeTriggerId') !== triggerId || !context.get('open'))
          context.set('activeSourceId', sourceIds[0]!)
        context.set('activeGroup', sourceIds.length > 1 ? sourceIds : null)
        context.set('activeAnchorIndex', anchorIndex)
        context.set('activeTriggerId', triggerId)
        context.set('open', true)
      },
      setPending: ({ context, event }) => {
        const current = event.current()
        if (current.type === 'TRIGGER.ENTER')
          context.set('pendingTarget', current.target)
      },
      clearPending: ({ context }) => context.set('pendingTarget', null),
      openPending: ({ context }) => {
        const target = context.get('pendingTarget')
        context.set('pendingTarget', null)
        if (target == null)
          return
        context.set('activeSourceId', target.sourceIds[0]!)
        context.set('activeGroup', target.sourceIds.length > 1 ? target.sourceIds : null)
        context.set('activeAnchorIndex', target.anchorIndex)
        context.set('activeTriggerId', target.triggerId)
        context.set('open', true)
      },
      closeHover: ({ context }) => {
        if (!context.get('open'))
          return
        context.set('open', false)
        context.set('closedAt', Date.now())
      },
      markFocusHeld: ({ context }) => context.set('focusHeld', true),
      clearFocusHeld: ({ context }) => context.set('focusHeld', false),
      /** 一处多源：在这几个来源之间换，尽头按 loop 回绕。 */
      stepGroup: ({ context, event, prop }) => {
        const current = event.current()
        const group = context.get('activeGroup')
        const active = context.get('activeSourceId')
        if (current.type !== 'GROUP.STEP' || group == null || active == null)
          return
        const at = group.indexOf(active)
        let next = at + current.delta
        if (prop('loop') ?? true)
          next = (next + group.length) % group.length
        else
          next = Math.min(Math.max(next, 0), group.length - 1)
        if (next === at)
          return
        context.set('activeSourceId', group[next]!)
        context.set('activeAnchorIndex', null)
      },
      activateSource: ({ context, event }) => {
        const current = event.current()
        if (current.type !== 'SOURCE.ACTIVATE')
          return
        context.set('activeSourceId', current.sourceId)
        context.set('activeGroup', null)
        context.set('activeAnchorIndex', null)
        context.set('activeTriggerId', null)
        context.set('open', true)
      },
      invokeSourceOpen: ({ prop, event }) => {
        const current = event.current()
        if (current.type !== 'SOURCE.OPEN')
          return
        const source = prop('sources')?.find(item => item.sourceId === current.sourceId)
        if (!source)
          return
        prop('onSourceOpen')?.({
          sourceId: current.sourceId,
          source,
          anchor: source.anchors?.[current.anchorIndex ?? 0] ?? null,
        })
      },
      setFocusedSource: ({ context, event }) => {
        const current = event.current()
        if (current.type === 'SOURCE.FOCUS')
          context.set('focusedSourceId', current.sourceId)
      },
      clearFocus: ({ context }) => context.set('focusedSourceId', null),
      setOpen: ({ context, event }) => {
        const current = event.current()
        if (current.type !== 'OPEN.SET')
          return
        if (!current.open && context.get('open'))
          context.set('closedAt', Date.now())
        context.set('open', current.open)
      },
    },
    effects: {
      waitForOpenDelay: ({ prop, send }) =>
        setTimeoutEffect(() => send({ type: 'after.openDelay' }), prop('openDelay') ?? OPEN_DELAY),
      waitForCloseDelay: ({ prop, send }) =>
        setTimeoutEffect(() => send({ type: 'after.closeDelay' }), prop('closeDelay') ?? CLOSE_DELAY),

      /**
       * hover 档卡片开着时把定位壳挂到锚点上：当前那处引用编号，从来源列表打开时是那一条来源。
       * 锚点换了（切到另一处引用）重新挂一次；收起即撤，坐标清空，下次打开量完之前卡片藏着。
       */
      trackPosition: ({ refs, prop, context, scope, track, flush }) => {
        let stop: (() => void) | undefined
        let disposed = false
        const detach = (): void => {
          stop?.()
          stop = undefined
        }
        const attach = (): void => {
          detach()
          context.set('position', null)
          const engine = refs.get('position')
          if (disposed || !engine || prop('previewMode') !== 'hover' || !context.get('open'))
            return
          const triggerId = context.get('activeTriggerId')
          const sourceId = context.get('activeSourceId')
          flush(() => {
            if (disposed || !context.get('open'))
              return
            const anchor = triggerId != null
              ? scope.getById(triggerId)
              : sourceId != null ? scope.getById(citationSourceLinkId(scope, sourceId)) : null
            const floating = refs.get('getFloatingEl')()
            if (!anchor || !floating)
              return
            stop = engine.attach(
              anchor,
              floating,
              {
                placement: prop('placement') ?? CITATION_DEFAULT_PLACEMENT,
                offset: prop('offset') ?? OVERLAY_OFFSET,
                // positioner 渲染成 fixed，坐标系跟着走视口系
                strategy: 'fixed',
                dir: prop('dir'),
                // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高
                size: true,
              },
              result => context.set('position', result),
            )
          })
        }
        track([context.dep('open'), context.dep('activeTriggerId'), context.dep('activeSourceId'), () => prop('previewMode')], attach)
        attach()
        return () => {
          disposed = true
          detach()
        }
      },

      /** hover 档卡片开着时入层栈：Escape 与层外按下经消解层收起它；inline 档不入栈，Escape 由根上的处理器接。 */
      trackLayer: ({ refs, prop, context, send, flush, track }) => trackPresenceResources({
        presence: null,
        open: () => prop('previewMode') === 'hover' && context.get('open'),
        track,
        acquire: () => trackOverlayLayer({
          config: refs.get('config'),
          registerLayer: refs.get('registerLayer'),
          flush,
          active: () => prop('previewMode') === 'hover' && context.get('open'),
          onDismiss: () => send({ type: 'DISMISS' }),
        }),
      }),
    },
  },
})
