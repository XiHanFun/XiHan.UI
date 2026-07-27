import type { Placement, PositionResult, VirtualAnchor } from '@xihan-ui/core'
import type { ContextMenuFocusIntent, ContextMenuPoint, ContextMenuSchema } from './context-menu.types'
import { createDismissLayer, createFocusScope, createTypeahead, itemValue, navigateItems, queryItems } from '@xihan-ui/behavior'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'
import { contextMenuItemQuery } from './context-menu.anatomy'

const { createMachine } = setup<ContextMenuSchema>()

/** 未指定 placement 时的落位：菜单自光标处向右下展开。定位引擎与 connect 共用这一个缺省。 */
export const CONTEXT_MENU_DEFAULT_PLACEMENT: Placement = 'bottom-start'
/**
 * 锚点是光标那一点，浮层要贴着它。
 * 不能把 offset 留空交给引擎：引擎缺省是 8px（那是给"贴着一个触发按钮"准备的），
 * 落到零尺寸锚点上就成了菜单与光标之间平白空出一段。
 */
export const CONTEXT_MENU_DEFAULT_OFFSET = 0
/** 触摸端长按多久算触发。 */
export const CONTEXT_MENU_LONG_PRESS_DELAY = 700
/**
 * 长按期间允许的手指抖动像素。
 * 不写成"动一下就取消"：触摸屏上手指按住不动也会有几像素漂移，零容差等于长按永远触发不了。
 */
export const CONTEXT_MENU_MOVE_TOLERANCE = 10

/** 坐标按分量比。默认的 Object.is 比引用，同一坐标重复写入也会被判成变了，定位便会白重挂一次。 */
function samePoint(a: ContextMenuPoint | null, b: ContextMenuPoint | null | undefined): boolean {
  if (a === b)
    return true
  if (!a || !b)
    return false
  return a.x === b.x && a.y === b.y
}

export const contextMenuMachine = createMachine({
  name: 'context-menu',
  context: ({ cell }) => ({
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    point: cell<ContextMenuPoint | null>(() => ({ defaultValue: null, isEqual: samePoint })),
    pressPoint: cell<ContextMenuPoint | null>(() => ({ defaultValue: null, isEqual: samePoint })),
    // 焦点锚点：不受控、不对外通知，只服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    focusIntent: cell<ContextMenuFocusIntent>(() => ({ defaultValue: 'first' })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    typeahead: createTypeahead(),
    reanchor: null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  watch: ({ track, prop, context, action }) => {
    // 受控（open prop 给定）时，用户事件只发意图回调、不自改状态；宿主写回 open 后
    // 由这条 track 追踪 open 变化，派发影子事件 CONTROLLED.* 无条件回写状态。
    track([() => prop('open')], () => action(['syncOpen']))
    // 展开期间坐标还会变（在别处再右键）：定位跟着坐标重挂，而层与焦点域原地不动。
    track([context.dep('point')], () => action(['reanchor']))
  },
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知。
        // 坐标、落焦端与焦点归还策略三条都先记进 context：受控时状态要等宿主写回 open 才转移，
        // 那一拍走的是 CONTROLLED.OPEN，读不到当初那个指针事件。
        'CONTEXT.MENU': [
          { guard: 'isOpenControlled', actions: ['setPoint', 'setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setPoint', 'setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['setPoint', 'setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setPoint', 'setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        // 长按只是"开始计时"，此刻还什么都没发生：不发回调、不动坐标
        'PRESS.START': { target: 'pressing', actions: ['setPressPoint'] },
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    // 触摸端的长按计时窗口。手指抬起、滑走或计时被打断都退回 closed，一个回调也不发。
    pressing: {
      effects: ['trackLongPress'],
      on: {
        'after.longPressDelay': [
          { guard: 'isOpenControlled', actions: ['setPointFromPress', 'setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setPointFromPress', 'setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        // 容差之内的抖动不算滑走：不匹配守卫就没有转移，计时继续
        'PRESS.MOVE': { guard: 'movedBeyondTolerance', target: 'closed' },
        'PRESS.END': { target: 'closed' },
        // 带鼠标的触摸设备上右键仍可直达，不必等长按走完
        'CONTEXT.MENU': [
          { guard: 'isOpenControlled', actions: ['setPoint', 'setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setPoint', 'setFocusIntent', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
    open: {
      // 键盘入口的锚点在进入展开态时就位：条目常挂（收起时只是 hidden），此刻查到的顺序即最终顺序。
      // 锚点定了才有条目认领 tabindex=0，焦点域随后按 Tab 序列把焦点交给它。
      entry: ['setInitialFocusedValue'],
      exit: ['clearFocusedValue', 'clearTypeahead'],
      // 进入 open：定位 → 消解 → 焦点。退出 open 时按同序清理，焦点归还发生在消解层撤销之后。
      effects: ['trackPosition', 'trackLayer'],
      on: {
        // 已经展开时在别处再右键：只把锚点挪过去，不先关再开——
        // 后者要多发一对开合回调，浮层还会闪一下、焦点被归还又抢回。
        // 定位由 watch 追着坐标重挂，层与焦点域全程不动。
        'CONTEXT.MENU': { actions: ['setPoint'] },
        'OPEN': { actions: ['setPoint'] },
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['setReturnFocus', 'invokeOnClose'] },
        ],
        // 选中即关闭：先发选中详情，再走与 CLOSE 相同的收口
        'ITEM.SELECT': [
          { guard: 'isOpenControlled', actions: ['invokeOnSelect', 'setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnSelect', 'setReturnFocus', 'invokeOnClose'] },
        ],
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        // 焦点条目被移出 DOM：锚点已悬空，就地按当前活条目重挑一个，
        // 否则没有条目认领 tabindex=0、方向键也失去起点
        'ITEM.LOST': { actions: ['clearFocusedValue', 'setInitialFocusedValue'] },
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      movedBeyondTolerance: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.MOVE')
          return false
        const from = context.get('pressPoint')
        // 起点丢了就当作已经滑走：宁可不弹菜单，也不要在一个不知道哪儿的坐标上弹
        if (!from)
          return true
        return Math.abs(e.x - from.x) > CONTEXT_MENU_MOVE_TOLERANCE
          || Math.abs(e.y - from.y) > CONTEXT_MENU_MOVE_TOLERANCE
      },
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),
      invokeOnSelect: ({ prop, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.SELECT')
          prop('onSelect')?.({ value: e.value })
      },
      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },
      // 展开期外坐标也照记：受控时状态要等宿主写回 open 才转移，届时读的就是这里存下的这一份
      reanchor: ({ refs }) => refs.get('reanchor')?.(),
      setPoint: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'CONTEXT.MENU' || e.type === 'OPEN')
          context.set('point', { x: e.x, y: e.y })
      },
      // 长按走完时手指还停在起点上：锚点取按下那一刻的坐标，不取计时到点时的
      setPointFromPress: ({ context }) => {
        const from = context.get('pressPoint')
        if (from)
          context.set('point', { x: from.x, y: from.y })
      },
      setPressPoint: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressPoint', { x: e.x, y: e.y })
      },
      setFocusIntent: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'CONTEXT.MENU' || e.type === 'OPEN')
          context.set('focusIntent', e.focus ?? 'first')
        else
          context.set('focusIntent', 'first')
      },
      // 每次开合都重算：Tab 关闭要把焦点让给 Tab 序列的下一个元素，其余出口一律归还触发区。
      // 只有「用户主动收起」才把焦点还回去：Escape、选中条目。
      // Tab 是要去下一个控件，层外指针交互是用户已经点中了别的东西——这两种情况下抢回焦点，
      // 会把光标从他刚点的输入框里拽走、后续敲的第一个字符直接丢掉。
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside')
        context.set('returnFocus', !handedOff)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.FOCUS')
          context.set('focusedValue', e.value)
      },
      setInitialFocusedValue: ({ refs, context, state, flush }) => {
        const pick = (): void => {
          const intent = context.get('focusIntent')
          // 命令式入口可以要求不预先落焦：锚点留空，焦点由焦点域兜底落到 content 上，
          // 之后第一下 ArrowDown/ArrowUp 从空锚点起步，正好落到首/末个可用条目。
          if (intent === 'none')
            return
          const content = refs.get('getContentEl')()
          // 无 DOM 环境（纯逻辑测试）：锚点留空，状态转移不受影响
          if (!content)
            return
          const items = queryItems(content, contextMenuItemQuery)
          // first/last 都从边界起步找第一个可停留条目，禁用项自动跳过，与 loop 无关
          context.set('focusedValue', itemValue(navigateItems(items, null, intent)))
        }
        pick()
        // 初始即展开时，WC 侧条目的身份标记要等首次 wire() 才写上，这一刻查不到任何条目、
        // 锚点会落空（Vue 侧首帧就带这些属性，不补这一手两个适配器就分叉）。
        // 已经挑到就不再挑；挑的过程中若菜单已收起也不补。
        flush(() => {
          if (state.get() === 'open' && context.get('focusedValue') == null)
            pick()
        })
      },
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
      // 菜单收起也得丢缓冲：否则下次打开第一个字母会被拼进上一轮的查询串
      clearTypeahead: ({ refs }) => refs.get('typeahead').clear(),
    },
    effects: {
      // 长按计时。手指抬起/滑走会离开 pressing，效应随之撤掉，定时器一并清掉。
      trackLongPress: ({ send, prop }) =>
        setTimeoutEffect(
          () => send({ type: 'after.longPressDelay' }),
          prop('longPressDelay') ?? CONTEXT_MENU_LONG_PRESS_DELAY,
        ),
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读。
      trackPosition: ({ refs, prop, context, flush }) => {
        const engine = refs.get('position')
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let queued = false
        let disposed = false

        const attach = (): void => {
          queued = false
          if (disposed)
            return
          // 换锚点先撤旧订阅：引擎的 autoUpdate 会一直跟着旧坐标算，留着就是两套位置轮流写
          stop?.()
          stop = undefined
          const floating = refs.get('getFloatingEl')()
          const point = context.get('point')
          if (!floating || !point)
            return
          // 虚拟锚点：右键菜单钉在光标那一点上，没有可测量的锚点元素。
          // 零尺寸矩形 + offset 0 即"菜单角贴着光标"。
          const anchor: VirtualAnchor = {
            getBoundingClientRect: () => ({ x: point.x, y: point.y, width: 0, height: 0 }),
          }
          stop = engine.attach(
            anchor,
            floating,
            {
              placement: prop('placement') ?? CONTEXT_MENU_DEFAULT_PLACEMENT,
              offset: prop('offset') ?? CONTEXT_MENU_DEFAULT_OFFSET,
            },
            result => context.set('position', result),
          )
        }

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带着 hidden（高度为 0），
        // 此时算出的坐标会少掉浮层自身的尺寸——placement=top 会正好错位一个浮层高度。
        // 同一拍里的多次请求合并成一次：展开那一下坐标与状态是一起变的，否则要白挂两回。
        const schedule = (): void => {
          if (queued || disposed)
            return
          queued = true
          flush(attach)
        }

        refs.set('reanchor', schedule)
        schedule()

        return () => {
          disposed = true
          refs.set('reanchor', null)
          stop?.()
        }
      },
      // 层的入栈出栈与消解层、焦点域绑在同一个效应里：三者生命周期必须完全一致。
      // 层只在展开期间入栈——消解层只让栈顶响应 Escape，若层在挂载期就注册、与开合无关地
      // 常驻栈里，同页后挂载的那个会永久占着栈顶，把它下面每一层的 Escape 都堵死。
      trackLayer: ({ refs, context, send }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()

        const dismiss = createDismissLayer({
          config,
          layer,
          onDismiss: reason =>
            send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
        })

        const focus = createFocusScope({
          config,
          layer,
          // 每次读最新 ref，容器晚一拍就位也能命中
          container: () => refs.get('getContentEl')(),
          // 菜单不陷焦点也不回绕：Tab 能走出去，走出去即由消解层判定是否关闭
          trapped: () => false,
          loop: false,
          // 显式指定落焦点为锚点条目，不交给 Tab 序列探测：探测走的是
          // focusFirst(removeLinks(...))，条目写成 <a> 时会被整体过滤掉，
          // 落焦就会掉到 content 容器上而不是首个条目。
          // 这里每次求值都现查，content 仍带 hidden 的那一帧返回 null，焦点域会自行重试到 DOM 就位。
          initialFocus: () => {
            const content = refs.get('getContentEl')()
            const anchor = context.get('focusedValue')
            if (!content || anchor == null)
              return null
            return queryItems(content, contextMenuItemQuery).find(el => itemValue(el) === anchor) ?? null
          },
          restoreFocus: () => context.get('returnFocus'),
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
