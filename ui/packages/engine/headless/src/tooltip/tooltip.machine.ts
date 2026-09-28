/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tooltip 相关实现。

import type { PositionResult, Transition, VirtualAnchor } from '@xihan-ui/core'
import type { TooltipGroup } from './tooltip.group'
import type { TooltipRefs, TooltipSchema } from './tooltip.types'
import { createDismissLayer, setTimeoutEffect, setup } from '@xihan-ui/core'
import { OVERLAY_ARROW_PADDING, OVERLAY_ARROW_SIZE, OVERLAY_OFFSET, OVERLAY_PLACEMENT_ANCHORED } from '../shared/overlay'
import { setupLayerTransaction, trackOverlayPosition, trackPresenceResources } from '../shared/overlay-shell'
import { pageTooltipGroup } from './tooltip.group'

/** 没传 placement 时浮层交给定位引擎的落点。 */
export const TOOLTIP_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_ANCHORED

const { createMachine } = setup<TooltipSchema>()

/** 悬停进入到展开的默认等待毫秒。 */
const OPEN_DELAY = 700
/** 悬停移出到收起的默认等待毫秒。 */
const CLOSE_DELAY = 300
/** 跳过等待的默认窗口毫秒：另一个提示开着或刚收起不到这么久时，下一个直接接替。 */
const SKIP_DELAY = 300

/** 跳过等待的窗口归一：没给取缺省，非有限数与负数按不参与接替处理。 */
function resolveSkipDelay(ms: number | undefined): number {
  const value = ms ?? SKIP_DELAY
  return Number.isFinite(value) && value > 0 ? value : 0
}

/** 所在的提示组：Provider 注入的那一组，没有 Provider 时归页面级的那一组。 */
function groupOf(refs: { get: <K extends keyof TooltipRefs>(key: K) => TooltipRefs[K] }): TooltipGroup {
  return refs.get('group') ?? pageTooltipGroup
}

/** 两项延时的取值顺序：提示自己写的 > 所在组给的缺省 > 内建缺省。 */
function delayOf(own: number | undefined, group: TooltipGroup, key: 'openDelay' | 'closeDelay'): number {
  return own ?? group.defaults()[key] ?? (key === 'openDelay' ? OPEN_DELAY : CLOSE_DELAY)
}

/** 接替窗口同样先看提示自己，再看所在组，最后取内建缺省。 */
function skipDelayOf(own: number | undefined, group: TooltipGroup): number {
  return resolveSkipDelay(own ?? group.defaults().skipDelayDuration)
}

// 展开态收起：受控只发意图、停在原地等宿主写回；非受控直接落到 closed 并一并通知。
const CLOSE_FROM_OPEN: Array<Transition<TooltipSchema>> = [
  { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
  { target: 'closed', actions: ['invokeOnClose'] },
]

// 收起等待态被立即打断：受控退回 visible.open（浮层保持可见）等宿主写回，非受控直接落到 closed。
const CLOSE_FROM_CLOSING: Array<Transition<TooltipSchema>> = [
  { guard: 'isOpenControlled', target: 'visible.open', actions: ['invokeOnClose'] },
  { target: 'closed', actions: ['invokeOnClose'] },
]

// 立即展开：disabled 落回 closed（顺带撤销正在跑的展开等待）；受控只发意图并落回 closed，
// 等宿主写回 open；非受控直接落到 open 并一并通知。
// 展开来源要记进 context：聚焦打开的提示不被一次纯鼠标移出收走。
function openNow(mark: 'markFocusOpened' | 'clearFocusOpened'): Array<Transition<TooltipSchema>> {
  return [
    { guard: 'isDisabled', target: 'closed' },
    { guard: 'isOpenControlled', target: 'closed', actions: [mark, 'syncInstant', 'invokeOnOpen'] },
    { target: 'visible.open', actions: [mark, 'syncInstant', 'invokeOnOpen'] },
  ]
}

const OPEN_FROM_FOCUS = openNow('markFocusOpened')
const OPEN_FROM_POINTER = openNow('clearFocusOpened')

// 受控时用户事件只发意图、不自改状态；宿主写回 open 后由 watch 派发 CONTROLLED.* 无条件回写。
// 延时与定位是本机器独有的副作用。
export const tooltipMachine = createMachine({
  name: 'tooltip',
  context: ({ cell }) => ({
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    // 记住这次是被聚焦打开的：聚焦态的提示不该被一次纯鼠标移出收走
    focusOpened: cell<boolean>(() => ({ defaultValue: false })),
    instant: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    presence: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    group: null,
    cursor: null,
    reanchor: null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'visible' : 'closed'),
  // Layer 与消解资源由顶层 effect 持有，逻辑关闭后等 Presence 真实退场再释放。
  effects: ['trackLayer'],
  watch: ({ track, prop, action }) => track([() => prop('open')], () => action(['syncOpen'])),
  // 跟随鼠标：指针在 trigger 上移动时记下落点，展开态下按新落点重算一轮；其余状态只记不算
  on: {
    'POINTER.MOVE': { actions: ['trackCursor'] },
  },
  states: {
    closed: {
      on: {
        // 悬停先进等待态，到点才展开，避免指针路过就闪一堆提示
        'POINTER.ENTER': [
          { guard: 'isDisabled' },
          { target: 'opening', actions: ['trackCursor'] },
        ],
        // 聚焦与命令式展开都不走延时
        'FOCUS': OPEN_FROM_FOCUS,
        'OPEN': OPEN_FROM_POINTER,
        'CONTROLLED.OPEN': { target: 'visible.open' },
      },
    },
    opening: {
      effects: ['waitForOpenDelay'],
      on: {
        'after.openDelay': OPEN_FROM_POINTER,
        'FOCUS': OPEN_FROM_FOCUS,
        // 等待期内的命令式展开与 closed 态一致，立即展开
        'OPEN': OPEN_FROM_POINTER,
        // 等待期内离开/按下/Escape/命令关闭只是撤销等待：对外从未展开过，不发通知
        'POINTER.LEAVE': { target: 'closed' },
        'POINTER.DOWN': { target: 'closed' },
        'ESCAPE': { target: 'closed' },
        'CLOSE': { target: 'closed' },
        'CONTROLLED.OPEN': { target: 'visible.open' },
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
    // 复合态：两个子态下浮层都可见，定位挂在这一层，指针在两态间来回不重挂
    visible: {
      initial: 'open',
      effects: ['trackPosition', 'trackGroup'],
      exit: ['clearInstant'],
      on: {
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
      states: {
        open: {
          on: {
            // 移出先进等待态，指针在 trigger 与浮层之间穿行时不闪断。
            // 聚焦打开的提示例外，由 BLUR 负责收起（无 target 即消费掉事件、原地不动）
            'POINTER.LEAVE': [
              { guard: 'isFocusOpened' },
              { target: 'visible.closing' },
            ],
            'BLUR': CLOSE_FROM_OPEN,
            'ESCAPE': CLOSE_FROM_OPEN,
            'POINTER.DOWN': CLOSE_FROM_OPEN,
            'CLOSE': CLOSE_FROM_OPEN,
          },
        },
        closing: {
          effects: ['waitForCloseDelay'],
          on: {
            'after.closeDelay': CLOSE_FROM_CLOSING,
            // 等待期内回到锚点即撤销收起
            'POINTER.ENTER': { target: 'visible.open', actions: ['trackCursor'] },
            'FOCUS': { target: 'visible.open' },
            'BLUR': CLOSE_FROM_CLOSING,
            'ESCAPE': CLOSE_FROM_CLOSING,
            'POINTER.DOWN': CLOSE_FROM_CLOSING,
            'CLOSE': CLOSE_FROM_CLOSING,
            'CONTROLLED.OPEN': { target: 'visible.open' },
          },
        },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      isDisabled: ({ prop }) => !!prop('disabled'),
      isFocusOpened: ({ context }) => context.get('focusOpened'),
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),
      markFocusOpened: ({ context }) => context.set('focusOpened', true),
      clearFocusOpened: ({ context }) => context.set('focusOpened', false),
      // 热窗口内打开即接替：不播进场。打开那一刻判，收起即清
      syncInstant: ({ context, prop, scope, refs }) => {
        const group = groupOf(refs)
        context.set('instant', group.isWarm(scope.id, skipDelayOf(prop('skipDelayDuration'), group)))
      },
      clearInstant: ({ context }) => context.set('instant', false),
      // 只记指针的落点：触屏没有悬停落点，锚回 trigger；没带落点的进入（指针移进浮层）不动已记的那一点
      trackCursor: ({ refs, prop, event }) => {
        const e = event.current()
        if ((e.type !== 'POINTER.ENTER' && e.type !== 'POINTER.MOVE') || !prop('followCursor'))
          return
        if (e.pointerType === 'touch')
          refs.set('cursor', null)
        else if (e.point)
          refs.set('cursor', { x: e.point.x, y: e.point.y })
        else
          return
        refs.get('reanchor')?.()
      },
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制收起
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
    },
    effects: {
      // 热窗口内（另一个提示开着或刚收起）不等：下一拍即展开
      waitForOpenDelay: ({ prop, send, scope, refs }) => {
        const group = groupOf(refs)
        return setTimeoutEffect(
          () => send({ type: 'after.openDelay' }),
          group.isWarm(scope.id, skipDelayOf(prop('skipDelayDuration'), group)) ? 0 : delayOf(prop('openDelay'), group, 'openDelay'),
        )
      },
      waitForCloseDelay: ({ prop, send, refs }) =>
        setTimeoutEffect(() => send({ type: 'after.closeDelay' }), delayOf(prop('closeDelay'), groupOf(refs), 'closeDelay')),
      // 引擎经 refs 注入；缺引擎或缺元素时静默跳过，状态转移不受影响。
      // 进入展开态先清上一次的坐标：引擎量完之前不算落位，皮肤据此藏着；
      // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带 hidden、高度为 0，算出的坐标会错位
      trackPosition: ({ refs, prop, context, flush }) => trackOverlayPosition({
        engine: refs.get('position'),
        flush,
        clear: () => context.set('position', null),
        // 跟随鼠标时指针每挪一下就按新落点重挂一轮
        onSchedule: schedule => refs.set('reanchor', schedule),
        getAnchor: () => {
          // 跟随鼠标只跟指针打开的那一次：聚焦打开没有指针落点、触屏落点已清空，这两种锚回 trigger
          if (prop('followCursor') && !context.get('focusOpened') && refs.get('cursor')) {
            const anchor: VirtualAnchor = {
              // 零尺寸矩形钉在指针上：每次量都读最新的落点
              getBoundingClientRect: () => {
                const point = refs.get('cursor') ?? { x: 0, y: 0 }
                return { x: point.x, y: point.y, width: 0, height: 0 }
              },
            }
            return anchor
          }
          return refs.get('getAnchorEl')()
        },
        getFloating: () => refs.get('getFloatingEl')(),
        options: () => ({
          placement: prop('placement') ?? TOOLTIP_DEFAULT_PLACEMENT,
          offset: prop('offset') ?? OVERLAY_OFFSET,
          // positioner 渲染成 fixed，坐标系必须跟着走视口系
          strategy: 'fixed',
          // start / end 是逻辑对齐，RTL 下行内轴要翻过来
          dir: prop('dir'),
          // 引擎量不到箭头，尺寸与让开圆角的余量由这里交进去
          arrow: { size: OVERLAY_ARROW_SIZE, padding: OVERLAY_ARROW_PADDING },
        }),
        onResult: result => context.set('position', result),
      }),
      /** 露面即登记进所在组的热窗口：组里别的开着的提示随之收起；收起时撤下并记下收起时刻。 */
      trackGroup: ({ scope, send, refs }) => groupOf(refs).join(scope.id, () => send({ type: 'CLOSE' })),
      /** 浮层退场完成前保留原栈位；关闭后不再响应消解，不建焦点域、不锁滚动。 */
      trackLayer: ({ refs, send, flush, state, track }) => trackPresenceResources({
        presence: () => refs.get('presence'),
        open: () => state.matches('visible'),
        track,
        acquire: () => {
          const config = refs.get('config')
          const registerLayer = refs.get('registerLayer')
          // 无 DOM 环境（纯逻辑测试 / SSR）：状态机照常转移，不挂副作用
          if (!config || !registerLayer)
            return undefined

          return setupLayerTransaction(registerLayer, (layer, defer) => {
            const dismiss = createDismissLayer({
              config,
              layer,
              onEscapeKeyDown: (event) => {
                if (!state.matches('visible'))
                  event.preventDefault()
              },
              onInteractOutside: (event) => {
                if (!state.matches('visible'))
                  event.preventDefault()
              },
              onDismiss: (reason) => {
                if (state.matches('visible'))
                  send({ type: reason === 'escape-key' ? 'ESCAPE' : 'CLOSE' })
              },
            })
            defer(() => dismiss.dispose())
          }, { registry: config.layerRegistry, flush })
        },
      }),
    },
  },
})
