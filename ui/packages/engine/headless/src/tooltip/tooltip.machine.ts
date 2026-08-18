import type { PositionResult } from '@xihan-ui/kernel'
import type { Transition } from '@xihan-ui/machine'
import type { TooltipSchema } from './tooltip.types'
import { createDismissLayer } from '@xihan-ui/behavior'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'
import { OVERLAY_ARROW_PADDING, OVERLAY_ARROW_SIZE } from '../shared/overlay'

const { createMachine } = setup<TooltipSchema>()

/** 悬停进入到展开的默认等待毫秒。 */
const OPEN_DELAY = 700
/** 悬停移出到收起的默认等待毫秒。 */
const CLOSE_DELAY = 300

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
    { guard: 'isOpenControlled', target: 'closed', actions: [mark, 'invokeOnOpen'] },
    { target: 'visible.open', actions: [mark, 'invokeOnOpen'] },
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
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'visible' : 'closed'),
  watch: ({ track, prop, action }) => track([() => prop('open')], () => action(['syncOpen'])),
  states: {
    closed: {
      on: {
        // 悬停先进等待态，到点才展开，避免指针路过就闪一堆提示
        'POINTER.ENTER': [
          { guard: 'isDisabled' },
          { target: 'opening' },
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
    // 复合态：两个子态下浮层都可见，定位与消解层挂在这一层，指针在两态间来回不重挂
    visible: {
      initial: 'open',
      effects: ['trackPosition', 'trackLayer'],
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
            'POINTER.ENTER': { target: 'visible.open' },
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
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制收起
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
      // 引擎经 refs 注入；缺引擎或缺元素时静默跳过，状态转移不受影响
      trackPosition: ({ refs, prop, context, flush }) => {
        const engine = refs.get('position')
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带 hidden、高度为 0，算出的坐标会错位。
        // flush 等的就是适配器把这一帧渲染出去。
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
        // 无 DOM 环境（纯逻辑测试 / SSR）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()

        const dismiss = createDismissLayer({
          config,
          layer,
          onDismiss: reason => send({ type: reason === 'escape-key' ? 'ESCAPE' : 'CLOSE' }),
        })

        return () => {
          dismiss.dispose()
          disposeLayer()
        }
      },
    },
  },
})
