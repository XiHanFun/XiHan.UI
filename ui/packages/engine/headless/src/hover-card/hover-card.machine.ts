import type { PositionResult } from '@xihan-ui/kernel'
import type { Transition } from '@xihan-ui/machine'
import type { HoverCardSchema } from './hover-card.types'
import { createDismissLayer } from '@xihan-ui/behavior'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'
import { OVERLAY_ARROW_PADDING, OVERLAY_ARROW_SIZE } from '../shared/overlay'

const { createMachine } = setup<HoverCardSchema>()

/** 悬停进入到展开的默认等待毫秒。 */
const OPEN_DELAY = 700
/** 指针移出到收起的默认等待毫秒。 */
const CLOSE_DELAY = 300

// 可见态收起：受控只发意图，非受控落到 closed。
const CLOSE_FROM_OPEN: Array<Transition<HoverCardSchema>> = [
  { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
  { target: 'closed', actions: ['invokeOnClose'] },
]

// 收起等待态被打断：受控退回 visible.open，非受控落到 closed。
const CLOSE_FROM_CLOSING: Array<Transition<HoverCardSchema>> = [
  { guard: 'isOpenControlled', target: 'visible.open', actions: ['invokeOnClose'] },
  { target: 'closed', actions: ['invokeOnClose'] },
]

// 失焦收起：同时复位 focusHeld 标记。
const BLUR_FROM_OPEN: Array<Transition<HoverCardSchema>> = [
  { guard: 'isOpenControlled', actions: ['clearFocusHeld', 'invokeOnClose'] },
  { target: 'closed', actions: ['clearFocusHeld', 'invokeOnClose'] },
]

const BLUR_FROM_CLOSING: Array<Transition<HoverCardSchema>> = [
  { guard: 'isOpenControlled', target: 'visible.open', actions: ['clearFocusHeld', 'invokeOnClose'] },
  { target: 'closed', actions: ['clearFocusHeld', 'invokeOnClose'] },
]

/** 立即展开（跳过 openDelay）的转移表；mark 记录展开来源。 */
function openNow(mark: 'markFocusHeld' | 'clearFocusHeld'): Array<Transition<HoverCardSchema>> {
  return [
    { guard: 'isDisabled', target: 'closed' },
    { guard: 'isOpenControlled', target: 'closed', actions: [mark, 'invokeOnOpen'] },
    { target: 'visible.open', actions: [mark, 'invokeOnOpen'] },
  ]
}

const OPEN_FROM_FOCUS = openNow('markFocusHeld')
const OPEN_FROM_POINTER = openNow('clearFocusHeld')

// 受控下用户事件只发意图，宿主写回 open 后由 watch 派发 CONTROLLED.*。
export const hoverCardMachine = createMachine({
  name: 'hover-card',
  context: ({ cell }) => ({
    // 位置结果由 trackPosition 回填
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    focusHeld: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'visible' : 'closed'),
  watch: ({ track, prop, action }) => track([() => prop('open')], () => action(['syncOpen'])),
  states: {
    closed: {
      on: {
        // 悬停先进等待态，到点才展开
        'POINTER.ENTER': [
          { guard: 'isDisabled' },
          { target: 'opening' },
        ],
        // 聚焦与命令式展开不走延时
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
        // 等待期内的命令式展开立即生效
        'OPEN': OPEN_FROM_POINTER,
        // 等待期内离开/失焦/Escape/命令关闭只撤销等待，不发通知
        'POINTER.LEAVE': { target: 'closed' },
        'BLUR': { target: 'closed', actions: ['clearFocusHeld'] },
        'ESCAPE': { target: 'closed' },
        'CLOSE': { target: 'closed' },
        'CONTROLLED.OPEN': { target: 'visible.open' },
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
    // 复合态：两个子态下浮层都可见，定位与消解层挂在这一层。
    visible: {
      initial: 'open',
      effects: ['trackPosition', 'trackLayer'],
      on: {
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
      states: {
        open: {
          on: {
            // 移出先进收起等待态；焦点仍在卡片内时消费掉事件，改由 BLUR 收起
            'POINTER.LEAVE': [
              { guard: 'isFocusHeld' },
              { target: 'visible.closing' },
            ],
            'FOCUS': { actions: ['markFocusHeld'] },
            'BLUR': BLUR_FROM_OPEN,
            'ESCAPE': CLOSE_FROM_OPEN,
            'CLOSE': CLOSE_FROM_OPEN,
          },
        },
        closing: {
          effects: ['waitForCloseDelay'],
          on: {
            'after.closeDelay': CLOSE_FROM_CLOSING,
            // 等待期内指针落到 trigger 或 content 上即撤销收起
            'POINTER.ENTER': { target: 'visible.open' },
            'FOCUS': { target: 'visible.open', actions: ['markFocusHeld'] },
            'BLUR': BLUR_FROM_CLOSING,
            'ESCAPE': CLOSE_FROM_CLOSING,
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
      isFocusHeld: ({ context }) => context.get('focusHeld'),
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),
      markFocusHeld: ({ context }) => context.set('focusHeld', true),
      clearFocusHeld: ({ context }) => context.set('focusHeld', false),
      // 仅受控时回写
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
    },
    effects: {
      waitForOpenDelay: ({ prop, send }) =>
        setTimeoutEffect(() => send({ type: 'after.openDelay' }), prop('openDelay') ?? OPEN_DELAY),
      waitForCloseDelay: ({ prop, send }) =>
        setTimeoutEffect(() => send({ type: 'after.closeDelay' }), prop('closeDelay') ?? CLOSE_DELAY),
      // 位置结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => {
        const engine = refs.get('position')
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 等 DOM 落定再挂
        flush(() => {
          if (disposed)
            return
          const anchor = refs.get('getAnchorEl')()
          const floating = refs.get('getFloatingEl')()
          if (!anchor || !floating)
            return
          stop = engine.attach(
            anchor,
            floating,
            {
              placement: prop('placement'),
              offset: prop('offset'),
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
              // start / end 是逻辑对齐，RTL 下行内轴要翻过来
              dir: prop('dir'),
              // 引擎量不到箭头，尺寸与让开圆角的余量由这里交进去
              arrow: { size: OVERLAY_ARROW_SIZE, padding: OVERLAY_ARROW_PADDING },
              // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高
              size: true,
            },
            result => context.set('position', result),
          )
        })

        return () => {
          disposed = true
          stop?.()
        }
      },
      /** 浮层可见期间把层压入消解栈，不建焦点域、不锁滚动。 */
      trackLayer: ({ refs, send }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()

        const dismiss = createDismissLayer({
          config,
          layer,
          onDismiss: reason => send({
            type: 'CLOSE',
            src: reason === 'escape-key' ? 'esc' : 'interact-outside',
          }),
        })

        return () => {
          dismiss.dispose()
          disposeLayer()
        }
      },
    },
  },
})
