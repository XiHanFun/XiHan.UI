import type { Placement, PositionResult, VirtualAnchor } from '@xihan-ui/kernel'
import type { ContextMenuFocusIntent, ContextMenuPoint, ContextMenuSchema } from './context-menu.types'
import { createDismissLayer, createFocusScope, createTypeahead, itemValue, navigateItems, queryItems } from '@xihan-ui/behavior'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'
import { OVERLAY_ARROW_PADDING, OVERLAY_ARROW_SIZE } from '../shared/overlay'
import { contextMenuItemQuery } from './context-menu.anatomy'

const { createMachine } = setup<ContextMenuSchema>()

/** 未指定 placement 时的落位；定位引擎与 connect 共用这一个缺省。 */
export const CONTEXT_MENU_DEFAULT_PLACEMENT: Placement = 'bottom-start'
/** 菜单贴着光标。offset 不能留空交给引擎，引擎缺省是 8px。 */
export const CONTEXT_MENU_DEFAULT_OFFSET = 0
/** 触摸端长按多久算触发。 */
export const CONTEXT_MENU_LONG_PRESS_DELAY = 700
/** 长按期间允许的手指抖动像素；触摸屏上按住不动也有几像素漂移，零容差长按永远触发不了。 */
export const CONTEXT_MENU_MOVE_TOLERANCE = 10

/** 坐标按分量比；按引用比会把同一坐标的重复写入判成变了，定位白重挂一次。 */
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
    focusIntent: cell<ContextMenuFocusIntent>(() => ({ defaultValue: 'none' })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getFloatingEl: () => null,
    getTriggerEl: () => null,
    getContentEl: () => null,
    typeahead: createTypeahead(),
    reanchor: null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  watch: ({ track, prop, context, action }) => {
    // 受控（open 给定）时用户事件只发意图、不自改状态，由这条 track 派发 CONTROLLED.* 回写
    track([() => prop('open')], () => action(['syncOpen']))
    // 展开期间坐标还会变（在别处再右键）：定位跟着坐标重挂，而层与焦点域原地不动。
    track([context.dep('point')], () => action(['reanchor']))
  },
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知。
        // 坐标、落焦端、焦点归还策略先记进 context：受控时转移那一拍走 CONTROLLED.OPEN，读不到原事件
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
      // 锚点在进入展开态时就位（条目常挂，收起时只是 hidden）；锚点定了才有条目认领 tabindex=0
      entry: ['setInitialFocusedValue'],
      exit: ['clearFocusedValue', 'clearTypeahead'],
      // 进入 open：定位 → 消解 → 焦点。退出 open 时按同序清理，焦点归还发生在消解层撤销之后。
      effects: ['trackPosition', 'trackLayer'],
      on: {
        // 已展开时在别处再右键：只挪锚点，不先关再开。
        // 定位由 watch 追着坐标重挂，层与焦点域全程不动
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
        'FOCUS.CLEAR': { actions: ['clearFocusedValue'] },
        // 焦点条目被移出 DOM 时锚点悬空，重挑一个，否则没有条目认领 tabindex=0、方向键也没有起点
        'ITEM.LOST': { actions: ['setInitialFocusedValue'] },
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
        // 起点丢了当作已经滑走
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
      // 长按走完（else 分支）与右键同属指针入口，一律不预落锚点；
      // 要落点的键盘入口自带 first/last 意图
      setFocusIntent: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'CONTEXT.MENU' || e.type === 'OPEN')
          context.set('focusIntent', e.focus ?? 'none')
        else
          context.set('focusIntent', 'none')
      },
      // Tab 与层外交互关闭时不归还焦点（用户已经去了别处），其余出口一律归还触发区
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
      setInitialFocusedValue: ({ refs, context, state, event, flush }) => {
        // 锚点条目离场后的重挑：只在此前真有过锚点时补，判据取自机器自己的状态而不是事件类型——
        // 适配器误报时凭空补一个，会点亮一个本轮不该高亮的条目并把 Tab 位从容器上摘走
        const repick = event.current().type === 'ITEM.LOST'
        if (repick) {
          if (context.get('focusedValue') == null)
            return
          context.set('focusedValue', null)
        }
        const pick = (): void => {
          const intent = context.get('focusIntent')
          // intent 为 none 时锚点留空，焦点由焦点域兜底落到 content 上
          if (intent === 'none' && !repick)
            return
          const content = refs.get('getContentEl')()
          // 无 DOM 环境时锚点留空，状态转移不受影响
          if (!content)
            return
          const items = queryItems(content, contextMenuItemQuery)
          // first/last 都从边界起步找第一个可停留条目，禁用项自动跳过，与 loop 无关；
          // 重挑时本次展开的意图可能是 none，落点退回首个可停留条目
          context.set('focusedValue', itemValue(navigateItems(items, null, intent === 'none' ? 'first' : intent)))
        }
        pick()
        // 初始即展开时 WC 侧条目的身份标记要等首次 wire() 才写上，这一刻查不到条目，推迟一拍再挑一次
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
        // 无引擎时不定位，其余照常
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
          // 虚拟锚点：菜单钉在光标那一点上，零尺寸矩形 + offset 0 即菜单角贴着光标
          const anchor: VirtualAnchor = {
            getBoundingClientRect: () => ({ x: point.x, y: point.y, width: 0, height: 0 }),
          }
          stop = engine.attach(
            anchor,
            floating,
            {
              placement: prop('placement') ?? CONTEXT_MENU_DEFAULT_PLACEMENT,
              offset: prop('offset') ?? CONTEXT_MENU_DEFAULT_OFFSET,
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
              // start / end 是逻辑对齐，RTL 下行内轴要翻过来
              dir: prop('dir'),
              // 引擎量不到箭头，尺寸与让开圆角的余量由这里交进去
              arrow: { size: OVERLAY_ARROW_SIZE, padding: OVERLAY_ARROW_PADDING },
            },
            result => context.set('position', result),
          )
        }

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带着 hidden，此时量出的浮层尺寸为 0。
        // 同一拍里的多次请求合并成一次
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
      // 层与消解层、焦点域绑在同一个效应里，三者生命周期必须一致。
      // 层只在展开期间入栈；常驻栈会让后挂载的层永久占着栈顶，堵死它下面每一层的 Escape
      trackLayer: ({ refs, context, send }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境不挂副作用，状态机照常转移
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
          // 显式指定落焦点，两种落点都不交给 Tab 序列探测：探测走 focusFirst(removeLinks(...))，
          // 条目写成 <a> 会被整体过滤掉，且容器自身从来不是候选——只靠它焦点要等到最后一帧才落位。
          // 每次求值都现查，content 仍带 hidden 的那一帧返回 null，焦点域会自行重试到 DOM 就位
          initialFocus: () => {
            const content = refs.get('getContentEl')()
            if (!content)
              return null
            const anchor = context.get('focusedValue')
            if (anchor != null)
              return queryItems(content, contextMenuItemQuery).find(el => itemValue(el) === anchor) ?? null
            // 本轮该有锚点却还没挑出来（WC 侧条目身份标记要等首次 wire()）：返回 null 让焦点域重试，
            // 别滑到容器上定死——落焦一旦成功就不再重试
            if (context.get('focusIntent') !== 'none')
              return null
            // 确实不该有锚点（指针打开）：焦点歇在菜单容器上，它此刻正认领着 Tab 位
            return content
          },
          restoreFocus: () => context.get('returnFocus'),
          // 归还落点显式给触发区：右键那一下浏览器未必把焦点放在它身上（各平台不一致），
          // 靠焦点域的创建前快照会把 Escape 之后的 Tab 起点丢到 body 上
          restoreTarget: () => refs.get('getTriggerEl')(),
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
