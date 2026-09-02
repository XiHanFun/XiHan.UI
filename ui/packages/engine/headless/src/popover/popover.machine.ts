import type { PositionResult } from '@xihan-ui/kernel'
import type { PopoverSchema } from './popover.types'
import { createDismissLayer, createFocusScope } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { closeReasonOf } from '../shared/close-reason'
import { OVERLAY_ARROW_PADDING, OVERLAY_ARROW_SIZE, OVERLAY_OFFSET, OVERLAY_PLACEMENT_ANCHORED } from '../shared/overlay'

/** 没传 placement 时浮层交给定位引擎的落点。 */
export const POPOVER_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_ANCHORED

const { createMachine } = setup<PopoverSchema>()

export const popoverMachine = createMachine({
  name: 'popover',
  context: ({ cell }) => ({
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    // 关闭时是否把焦点归还触发器；Tab 与层外交互关闭时让出，其余出口归还
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    getInitialFocusEl: () => null,
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
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setReturnFocus', 'invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setReturnFocus', 'invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 进入 open：定位 → 消解 → 焦点。退出 open 时按同序清理，焦点归还发生在消解层撤销之后。
      effects: ['trackPosition', 'trackLayer'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['setReturnFocus', 'invokeOnClose'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['setReturnFocus', 'invokeOnClose'] },
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
      // 关闭原因在事件里现成：消解层回报的 src，没有 src 的走 programmatic
      invokeOnClose: ({ prop, event }) => {
        const e = event.current()
        prop('onOpenChange')?.({ open: false, reason: closeReasonOf(e) })
      },
      // Tab 与层外交互是「焦点已经去别处了」，再抢回触发器会把用户拽回来；其余出口一律归还
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside')
        context.set('returnFocus', !handedOff)
      },
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读。
      trackPosition: ({ refs, prop, context, flush }) => {
        // 进入展开态先清上一次的坐标：引擎量完之前不算落位，皮肤据此藏着。
        // 不清的话重开会按上次的位置判「已落位」——页面滚过就在旧位置闪一帧
        context.set('position', null)
        const engine = refs.get('position')
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 仍带 hidden，量到的浮层尺寸为 0。
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
              placement: prop('placement') ?? POPOVER_DEFAULT_PLACEMENT,
              offset: prop('offset') ?? OVERLAY_OFFSET,
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
              // start / end 是逻辑对齐，RTL 下行内轴要翻过来
              dir: prop('dir'),
              // 引擎量不到箭头，尺寸与让开圆角的余量由这里交进去
              arrow: { size: OVERLAY_ARROW_SIZE, padding: OVERLAY_ARROW_PADDING },
              // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高。
              // 这台机器由 popconfirm 与 popselect 共用，落不落槽各自的 connect 说了算
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
      // 层与消解层、焦点域同生命周期；层只在展开期间入栈，常驻栈会占死栈顶、堵掉下层 Escape。
      trackLayer: ({ refs, prop, send, context }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()

        const dismiss = createDismissLayer({
          config,
          layer,
          // 关不关在这里判定：两个开关都现读 prop，开合中途改也立刻生效
          onDismiss: (reason) => {
            const escape = reason === 'escape-key'
            const allowed = escape
              ? (prop('closeOnEscape') ?? true)
              : (prop('closeOnInteractOutside') ?? true)
            if (!allowed)
              return
            send({ type: 'CLOSE', src: escape ? 'esc' : 'interact-outside' })
          },
        })

        const focus = createFocusScope({
          config,
          layer,
          // 每次读最新 ref，容器晚一拍就位也能命中
          container: () => refs.get('getContentEl')(),
          // 非模态浮层不陷焦点也不回绕：Tab 能走出去，走出去即由消解层判定是否关闭
          trapped: () => prop('modal') ?? false,
          loop: prop('modal') ?? false,
          // 缺省返回 null，落点仍由焦点域的 Tab 序列探测决定；
          // 浮层里排着集合的组合件填这一条把落点收口（见 getInitialFocusEl）。
          // 每次求值都现查，content 仍带 hidden 的那一帧返回 null，焦点域会自行重试到 DOM 就位
          initialFocus: () => refs.get('getInitialFocusEl')(),
          restoreFocus: () => context.get('returnFocus'),
          // 归还落点显式给锚点：指针打开那一刻焦点未必真在它身上（Safari 点按不给按钮焦点），
          // 靠焦点域的创建前快照会把 Escape 之后的 Tab 起点丢到 body 上
          restoreTarget: () => refs.get('getAnchorEl')(),
        })

        // 逆序拆：先撤依赖层的两个订阅，最后才把层本身移出栈
        return () => {
          focus.dispose()
          dismiss.dispose()
          disposeLayer()
        }
      },
    },
  },
})
