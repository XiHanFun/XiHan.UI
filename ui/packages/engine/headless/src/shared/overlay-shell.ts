import type { Anchor, Cleanup, Dep, DismissReason, Layer, LayerRegistry, PositionEnginePort, PositionOptions, PositionResult, RuntimeConfig } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import { acquireScrollLock, bindLayerVisual, createDismissLayer, createFocusScope, hideOutside } from '@xihan-ui/core'

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

/** 焦点域里各家不同的那几项；容器每次现取，其他策略缺省为非陷阱、不回绕。 */
export interface OverlayFocusScopeSpec {
  /** 焦点域容器，每次求值现取，容器晚一拍就位也能命中。 */
  container: () => HTMLElement | null
  /** 展开时焦点落在哪；返回 null 则焦点域自行重试到 DOM 就位。 */
  initialFocus?: () => HTMLElement | null
  /** 是否把焦点约束在域内，缺省 false。 */
  trapped?: () => boolean
  /** Tab 走到边界是否回绕，缺省 false。 */
  loop?: boolean
  /** 拆除时是否归还焦点，缺省归还。 */
  restoreFocus?: () => boolean
  /** 归还焦点的落点，缺省回落到建域前的焦点持有者。 */
  restoreTarget?: () => HTMLElement | null
  /** 资源保留期间逻辑重开时使用；建立焦点域时给句柄，释放时归还 null。 */
  onReactivate?: (reactivate: (() => void) | null) => void
}

/** 层效应的入参。 */
export interface OverlayLayerOptions {
  /** 运行时配置。缺省即不挂副作用——无 DOM 环境走这一档，机器状态照常转移。 */
  config: RuntimeConfig | null
  /** 注册本层并返回撤销句柄。缺省即不挂副作用。 */
  registerLayer: (() => { layer: Layer, dispose: Cleanup }) | null
  /** 等宿主提交浮层节点后写入 Registry 派生的视觉层级。 */
  flush?: (fn: () => void) => void
  /** 消解层的回报怎么翻成事件。 */
  onDismiss: (reason: DismissReason) => void
  /** 逻辑层是否仍打开；退场期间为 false 时只占栈顶屏蔽下层，不再重复发关闭意图。 */
  active?: () => boolean
  /** 要焦点域就把各家不同的那几项交进来；不给即不挂，焦点留在组件原处。 */
  focusScope?: OverlayFocusScopeSpec | null
}

type DeferOverlayCleanup = (cleanup: Cleanup) => void
type RunOverlaySetup = <T>(setup: () => T) => T

export interface LayerTransactionVisualOptions {
  registry: LayerRegistry
  flush: (fn: () => void) => void
}

export interface ModalLayerResourcesOptions {
  config: RuntimeConfig
  /** 当前层；用于保留位于本层之上的嵌套浮层。 */
  layer: Layer
  /** 当前是否采用模态策略，可在展开生命周期内变化。 */
  enabled: () => boolean
  /** 背景失活时保留的当前层节点、分支和嵌套层。 */
  targets: () => Element[]
  /** 等宿主把浮层节点提交到 DOM 后再建立背景失活。 */
  flush: (fn: () => void) => void
  /** 复用外层事务的失败回滚边界。 */
  run: RunOverlaySetup
}

export interface ModalLayerResources {
  /** 按最新 enabled 值取得或释放模态资源。 */
  sync: () => void
  dispose: Cleanup
}

/**
 * 管理一层可动态切换的模态资源：滚动锁与背景失活必须同进同退。
 * 层登记、消解层与焦点域仍由调用方持有，不因 modal 改值而重建。
 */
export function createModalLayerResources(o: ModalLayerResourcesOptions): ModalLayerResources {
  let disposed = false
  let release: Cleanup | undefined

  const acquire = (): void => {
    const lock = o.run(() => acquireScrollLock({ config: o.config }))
    let hidden: Cleanup | undefined
    let alive = true
    const cleanup = (): void => {
      if (!alive)
        return
      alive = false
      const errors: unknown[] = []
      try {
        hidden?.()
      }
      catch (error) {
        errors.push(error)
      }
      try {
        lock.dispose()
      }
      catch (error) {
        errors.push(error)
      }
      if (errors.length === 1)
        throw errors[0]
      if (errors.length > 1)
        throw new AggregateError(errors, '[xh] 模态浮层资源清理出现多个异常', { cause: errors[0] })
    }
    release = cleanup

    o.flush(() => {
      if (disposed || !alive || release !== cleanup || !o.enabled())
        return
      o.run(() => {
        const targets = o.targets()
        if (targets.length)
          hidden = hideOutside(o.targets, o.config)
      })
    })
  }

  const sync = (): void => {
    if (disposed)
      return
    if (o.enabled()) {
      if (!release)
        acquire()
    }
    else {
      const cleanup = release
      release = undefined
      cleanup?.()
    }
    // 模态资源与视觉 lane 读取同一份 enabled/isModal 事实；适配器无需另写回层对象。
    o.config.layerRegistry.sync(o.layer)
  }

  return {
    sync,
    dispose() {
      if (disposed)
        return
      disposed = true
      const cleanup = release
      release = undefined
      cleanup?.()
    },
  }
}

/**
 * 以 layer 登记为第一项资源执行同步初始化。setup 抛错时立即逆序回滚；成功时返回同一份
 * 幂等逆序 cleanup。这样 effect 尚未把 cleanup 交给机器前也不会留下半初始化层。
 */
export function setupLayerTransaction(
  registerLayer: () => { layer: Layer, dispose: Cleanup },
  setup: (layer: Layer, defer: DeferOverlayCleanup, run: RunOverlaySetup) => void,
  visual?: LayerTransactionVisualOptions,
): Cleanup {
  const registration = registerLayer()
  const cleanups: Cleanup[] = [registration.dispose]
  let accepting = true
  let disposed = false

  const dispose = (): void => {
    if (disposed)
      return
    disposed = true
    const errors: unknown[] = []
    while (cleanups.length) {
      try {
        cleanups.pop()!()
      }
      catch (error) {
        errors.push(error)
      }
    }
    if (errors.length === 1)
      throw errors[0]
    if (errors.length > 1)
      throw new AggregateError(errors, '[xh] 浮层资源清理出现多个异常')
  }

  const defer: DeferOverlayCleanup = (cleanup) => {
    if (!accepting)
      throw new Error('[xh] 浮层初始化完成后不能再登记 cleanup')
    cleanups.push(cleanup)
  }

  const rollback = (setupError: unknown): never => {
    try {
      dispose()
    }
    catch (rollbackError) {
      throw new AggregateError([setupError, rollbackError], '[xh] 浮层初始化与回滚同时失败')
    }
    throw setupError
  }

  const run: RunOverlaySetup = (task) => {
    if (disposed)
      throw new Error('[xh] 浮层资源已释放，不能继续初始化')
    try {
      return task()
    }
    catch (setupError) {
      return rollback(setupError)
    }
  }

  try {
    if (visual) {
      defer(bindLayerVisual({
        registry: visual.registry,
        layer: registration.layer,
        flush: task => visual.flush(() => {
          if (!disposed)
            run(task)
        }),
      }))
    }
    setup(registration.layer, defer, run)
    accepting = false
    return dispose
  }
  catch (setupError) {
    accepting = false
    return rollback(setupError)
  }
}

/** Presence 与行为资源共享生命周期时的输入。 */
export interface PresenceResourceOptions {
  /** 视觉 Presence；缺省（SSR/纯逻辑宿主）时逻辑关闭立即释放。 */
  presence: PresenceHandle | null | (() => PresenceHandle | null)
  /** 当前逻辑展开态，也是机器 tracker 的依赖。 */
  open: Dep
  /** 注册机器 tracker。 */
  track: (deps: Dep[], fn: () => void) => void
  /** 获取本轮 Layer、DismissableLayer 与可选 FocusScope 等行为资源。 */
  acquire: () => Cleanup | undefined
  /** 退场尚未完成便重开时调用；用于恢复被失活的焦点域。 */
  onReopen?: () => void
}

/**
 * 让浮层行为资源跟 Presence 的真实退场共享一份租约：
 * - 展开时至多 acquire 一次；
 * - 逻辑关闭但 Presence 仍 rendered 时继续持有；
 * - 退出完成后释放；
 * - 中途重开复用原资源，并通知调用方恢复需重新激活的能力。
 */
export function trackPresenceResources(o: PresenceResourceOptions): Cleanup {
  let disposed = false
  let release: Cleanup | undefined
  let lastOpen = false
  let presence: PresenceHandle | null = null
  let offExit: Cleanup | undefined

  const finish = (): void => {
    if (disposed || o.open() || !release)
      return
    const cleanup = release
    release = undefined
    cleanup()
  }
  const syncPresence = (): PresenceHandle | null => {
    const next = typeof o.presence === 'function' ? o.presence() : o.presence
    if (next === presence)
      return presence
    offExit?.()
    presence = next
    offExit = presence?.onExitComplete(finish)
    return presence
  }
  const sync = (): void => {
    if (disposed)
      return
    const open = Boolean(o.open())
    const currentPresence = syncPresence()
    const reopening = open && !lastOpen && release !== undefined
    lastOpen = open
    if (open) {
      currentPresence?.update(true)
      release ??= o.acquire()
      if (reopening)
        o.onReopen?.()
      return
    }
    if (!currentPresence || !currentPresence.rendered)
      finish()
  }

  try {
    o.track([o.open], sync)
    sync()
  }
  catch (error) {
    disposed = true
    offExit?.()
    const cleanup = release
    release = undefined
    cleanup?.()
    throw error
  }

  return () => {
    if (disposed)
      return
    disposed = true
    offExit?.()
    const cleanup = release
    release = undefined
    cleanup?.()
  }
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

  return setupLayerTransaction(registerLayer, (layer, defer) => {
    const dismiss = createDismissLayer({
      config,
      layer,
      onEscapeKeyDown: (event) => {
        if (o.active && !o.active())
          event.preventDefault()
      },
      onInteractOutside: (event) => {
        if (o.active && !o.active())
          event.preventDefault()
      },
      onDismiss: (reason) => {
        if (!o.active || o.active())
          o.onDismiss(reason)
      },
    })
    defer(() => dismiss.dispose())

    const spec = o.focusScope
    if (spec) {
      const focus = createFocusScope({
        config,
        layer,
        container: spec.container,
        trapped: spec.trapped ?? (() => false),
        loop: spec.loop ?? false,
        initialFocus: spec.initialFocus,
        restoreFocus: spec.restoreFocus,
        restoreTarget: spec.restoreTarget,
      })
      spec.onReactivate?.(focus.reactivate)
      defer(() => {
        spec.onReactivate?.(null)
        focus.dispose()
      })
    }
  }, { registry: config.layerRegistry, flush: o.flush ?? (task => task()) })
}

/** 消解层的标准映射：Escape 与层外交互都收起，只在关闭原因上分开。 */
export function overlayCloseOnDismiss(
  send: (event: { type: 'CLOSE', src: 'esc' | 'interact-outside' }) => void,
): (reason: DismissReason) => void {
  return reason => send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' })
}
