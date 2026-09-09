import type { Anchor, Cleanup, DismissReason, Layer, PositionEnginePort, PositionOptions, PositionResult, RuntimeConfig } from '@xihan-ui/core'
import { createDismissLayer, createFocusScope } from '@xihan-ui/core'

// 「浮层 + 候选导航」这一族组件的外壳：进入展开态时定位、入层栈、挂消解层与焦点域，
// 退出时逆序拆。各家不同的那几处（锚点怎么解析、焦点落在哪、归还给谁）由调用方交回调进来。

/** 定位效应的入参。 */
export interface OverlayPositionOptions {
  /** 定位引擎。缺省即不定位——纯逻辑测试、无布局环境与 SSR 都走这一档。 */
  engine: PositionEnginePort | null
  /** 等 DOM 落定的排期，取机器的 flush。 */
  flush: (fn: () => void) => void
  /** 本轮的定位锚点：元素或虚拟锚点。返回 null 即这一轮不挂。 */
  getAnchor: () => Anchor | null
  /** 被定位的浮层容器。返回 null 即这一轮不挂。 */
  getFloating: () => HTMLElement | null
  /** 交给引擎的定位参数，每次挂之前现取。 */
  options: () => PositionOptions
  /** 引擎每次回报位置时调用。 */
  onResult: (result: PositionResult) => void
  /** 挂之前先把上一轮坐标清掉。不给即保留上一轮的坐标。 */
  clear?: () => void
  /**
   * 收下重挂句柄：换锚点的组件把它记进 refs，之后调一次就重挂一轮。
   * 效应拆除时会再调一次并交 null，让调用方把句柄销掉。
   */
  onSchedule?: (schedule: (() => void) | null) => void
}

/**
 * 定位效应的主体：清坐标 → 取引擎 → 等 DOM 落定 → 挂 → 拆。
 *
 * 必须等 DOM 落定再挂：进入展开态这一刻浮层还带着 hidden、尺寸为 0，此时量出的坐标会错位。
 * 同一拍里的多次请求合并成一次；重挂之前先撤旧订阅，否则引擎的自动跟随会两套坐标轮流写。
 */
export function trackOverlayPosition(o: OverlayPositionOptions): Cleanup | undefined {
  o.clear?.()
  const { engine } = o
  if (!engine)
    return undefined

  let stop: (() => void) | undefined
  let queued = false
  let disposed = false

  const attach = (): void => {
    queued = false
    if (disposed)
      return
    stop?.()
    stop = undefined
    const floating = o.getFloating()
    if (!floating)
      return
    const anchor = o.getAnchor()
    if (!anchor)
      return
    stop = engine.attach(anchor, floating, o.options(), o.onResult)
  }

  const schedule = (): void => {
    if (queued || disposed)
      return
    queued = true
    o.flush(attach)
  }

  o.onSchedule?.(schedule)
  schedule()

  return () => {
    disposed = true
    o.onSchedule?.(null)
    stop?.()
  }
}

/** 焦点域里各家不同的那几项；其余（不陷焦点、不回绕、容器每次现取）由外壳定死。 */
export interface OverlayFocusScopeSpec {
  /** 焦点域容器，每次求值现取，容器晚一拍就位也能命中。 */
  container: () => HTMLElement | null
  /** 展开时焦点落在哪；返回 null 则焦点域自行重试到 DOM 就位。 */
  initialFocus?: () => HTMLElement | null
  /** 拆除时是否归还焦点，缺省归还。 */
  restoreFocus?: () => boolean
  /** 归还焦点的落点，缺省回落到建域前的焦点持有者。 */
  restoreTarget?: () => HTMLElement | null
}

/** 层效应的入参。 */
export interface OverlayLayerOptions {
  /** 运行时配置。缺省即不挂副作用——无 DOM 环境走这一档，机器状态照常转移。 */
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄。缺省即不挂副作用。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 消解层的回报怎么翻成事件。 */
  onDismiss: (reason: DismissReason) => void
  /** 要焦点域就把各家不同的那几项交进来；不给即不挂，焦点留在组件原处。 */
  focusScope?: OverlayFocusScopeSpec | null
}

/**
 * 层效应的主体：入层栈 → 挂消解层 → 挂焦点域，拆时逆序。
 *
 * 层只在展开期间入栈，常驻会占死栈顶把它下面每一层的 Escape 堵死。
 * 消解层与焦点域绑在同一个效应里，三者生命周期必须一致。
 */
export function trackOverlayLayer(o: OverlayLayerOptions): Cleanup | undefined {
  const { config, registerLayer } = o
  if (!config || !registerLayer)
    return undefined

  const { layer, dispose: disposeLayer } = registerLayer()

  const dismiss = createDismissLayer({ config, layer, onDismiss: o.onDismiss })

  const spec = o.focusScope
  const focus = spec
    ? createFocusScope({
        config,
        layer,
        container: spec.container,
        // 列表族不陷焦点也不回绕：Tab 能走出去，走出去即由消解层判定是否关闭
        trapped: () => false,
        loop: false,
        initialFocus: spec.initialFocus,
        restoreFocus: spec.restoreFocus,
        restoreTarget: spec.restoreTarget,
      })
    : null

  // 逆序拆：先撤依赖层的两个订阅，最后才把层本身移出栈
  return () => {
    focus?.dispose()
    dismiss.dispose()
    disposeLayer()
  }
}

/** 消解层的标准映射：Escape 与层外交互都收起，只在关闭原因上分开。 */
export function overlayCloseOnDismiss(
  send: (event: { type: 'CLOSE', src: 'esc' | 'interact-outside' }) => void,
): (reason: DismissReason) => void {
  return reason => send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' })
}
