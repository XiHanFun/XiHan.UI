import type { PositionResult } from '@xihan-ui/core'
import type { Transition } from '@xihan-ui/machine'
import type { HoverCardSchema } from './hover-card.types'
import { createDismissLayer } from '@xihan-ui/behavior'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'

const { createMachine } = setup<HoverCardSchema>()

/** 悬停进入到展开的默认等待毫秒。 */
const OPEN_DELAY = 700
/** 指针移出到收起的默认等待毫秒。 */
const CLOSE_DELAY = 300

// 可见态收起：受控只发意图、停在原地等宿主写回；非受控直接落到 closed 并一并通知。
const CLOSE_FROM_OPEN: Array<Transition<HoverCardSchema>> = [
  { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
  { target: 'closed', actions: ['invokeOnClose'] },
]

// 收起等待态被打断：受控退回 visible.open（浮层保持可见、且不再挂着一个已经走完的计时器）
// 等宿主写回，非受控直接落到 closed。
const CLOSE_FROM_CLOSING: Array<Transition<HoverCardSchema>> = [
  { guard: 'isOpenControlled', target: 'visible.open', actions: ['invokeOnClose'] },
  { target: 'closed', actions: ['invokeOnClose'] },
]

// 失焦收起单列一份：BLUR 的字面意思就是「焦点已经离开卡片」，顺手把标记复位。
// 受控时这一路并不改状态，标记若留着，下一轮由宿主写回 open 打开的卡片会带着一个
// 过期的「焦点还在里面」——纯指针移出便再也收不起来。
const BLUR_FROM_OPEN: Array<Transition<HoverCardSchema>> = [
  { guard: 'isOpenControlled', actions: ['clearFocusHeld', 'invokeOnClose'] },
  { target: 'closed', actions: ['clearFocusHeld', 'invokeOnClose'] },
]

const BLUR_FROM_CLOSING: Array<Transition<HoverCardSchema>> = [
  { guard: 'isOpenControlled', target: 'visible.open', actions: ['clearFocusHeld', 'invokeOnClose'] },
  { target: 'closed', actions: ['clearFocusHeld', 'invokeOnClose'] },
]

/**
 * 立即展开（不走 openDelay）：disabled 落回 closed（顺带撤销正在跑的展开等待）；
 * 受控只发意图并落回 closed，等宿主写回 open；非受控直接落到 visible.open 并一并通知。
 *
 * 展开来源要记进 context：聚焦打开的卡片不该被一次纯鼠标移出收走。
 */
function openNow(mark: 'markFocusHeld' | 'clearFocusHeld'): Array<Transition<HoverCardSchema>> {
  return [
    { guard: 'isDisabled', target: 'closed' },
    { guard: 'isOpenControlled', target: 'closed', actions: [mark, 'invokeOnOpen'] },
    { target: 'visible.open', actions: [mark, 'invokeOnOpen'] },
  ]
}

const OPEN_FROM_FOCUS = openNow('markFocusHeld')
const OPEN_FROM_POINTER = openNow('clearFocusHeld')

// 受控与 popover/tooltip 同构：用户事件只发意图、不自改状态；宿主写回 open 后
// 由 watch 派发影子事件 CONTROLLED.* 无条件回写。
export const hoverCardMachine = createMachine({
  name: 'hover-card',
  context: ({ cell }) => ({
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
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
        // 悬停先进等待态，到点才展开：防的是指针路过一串头像就闪出一串卡片
        'POINTER.ENTER': [
          { guard: 'isDisabled' },
          { target: 'opening' },
        ],
        // 键盘可达优先于防误触：聚焦与命令式展开都不走延时
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
        // 等待期内的命令式展开同样不该被吞：与 closed 态一致立即展开
        'OPEN': OPEN_FROM_POINTER,
        // 等待期内离开/失焦/Escape/命令关闭只是撤销等待：对外从未展开过，不发通知
        'POINTER.LEAVE': { target: 'closed' },
        'BLUR': { target: 'closed', actions: ['clearFocusHeld'] },
        'ESCAPE': { target: 'closed' },
        'CLOSE': { target: 'closed' },
        'CONTROLLED.OPEN': { target: 'visible.open' },
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
    // 复合态：两个子态下浮层都可见。定位与消解层挂在这一层，
    // 指针在 trigger 与 content 之间来回穿行只在子态间跳，层与定位订阅原地不动。
    visible: {
      initial: 'open',
      effects: ['trackPosition', 'trackLayer'],
      on: {
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
      states: {
        open: {
          on: {
            // 移出先进收起等待态：指针要从 trigger 走到 content，两者之间往往隔着
            // 一段间隙（offset），途中两边都不在，全靠这段等待把卡片留住。
            // 焦点还停在卡片内时例外——鼠标恰好路过再移开不该把键盘用户正在读的内容收走，
            // 该由 BLUR 负责收起（无 target 即消费掉事件、原地不动）
            'POINTER.LEAVE': [
              { guard: 'isFocusHeld' },
              { target: 'visible.closing' },
            ],
            // 焦点在展开后才落进来（Tab 从 trigger 走进 content）：记住它，
            // 此后纯指针移出不再收起
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
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读。
      trackPosition: ({ refs, prop, context, flush }) => {
        const engine = refs.get('position')
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入可见态这一刻 content 还带着 hidden（高度为 0），
        // 此时算出的坐标会少掉浮层自身的尺寸——placement=top 会正好错位一个浮层高度。
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
            { placement: prop('placement'), offset: prop('offset') },
            result => context.set('position', result),
          )
        })

        return () => {
          disposed = true
          stop?.()
        }
      },
      /**
       * 层只在浮层可见期间入栈——消解层只让栈顶响应 Escape，若层在挂载期就注册、
       * 与开合无关地常驻栈里，同页后挂载的那个会永久占着栈顶，把它下面每一层的 Escape 都堵死。
       *
       * 这里只挂消解层，不建焦点域：卡片是悬停出来的，把焦点搬进去等于指针一扫就抢走焦点；
       * 也因此不需要归还焦点、更不锁滚动。内容仍然可聚焦——Tab 走得进去，
       * 走进去之后由 content 的焦点事件把 focusHeld 记上。
       */
      trackLayer: ({ refs, send }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()

        const dismiss = createDismissLayer({
          config,
          layer,
          // Escape 要能收起：指针悬停时焦点多半不在卡片里，keydown 落在文档上，
          // 只有消解层这条文档级通路收得到
          onDismiss: reason => send({
            type: 'CLOSE',
            src: reason === 'escape-key' ? 'esc' : 'interact-outside',
          }),
        })

        // 逆序拆：先撤消解层的订阅，最后才把层本身移出栈
        return () => {
          dismiss.dispose()
          disposeLayer()
        }
      },
    },
  },
})
