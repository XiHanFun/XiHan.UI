/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 overlay shell 相关实现。

import type { Anchor, Cleanup, Dep, DismissReason, FocusScopeHandle, Layer, LayerRegistry, PositionEnginePort, PositionOptions, PositionResult, RuntimeConfig } from '@xihan-ui/core'
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
  /** 行为层建立时给出实例，清理时归还 null；多层退出可据此保持严格栈序。 */
  onLayer?: (layer: Layer | null) => void
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
  /** 按最新 enabled 值取得或释放模态资源；关闭时撤下的背景失活在这里补回。 */
  sync: () => void
  /**
   * 关闭时撤下背景失活，滚动锁留到退场结束；撤下之后执行 then（归还焦点：背景还是 inert 时
   * focus() 是空操作，所以总在撤下之后）。背景确实被失活了才推迟到退场第一帧上屏之后再交接——
   * 撤 inert 同样要把整棵背景子树的样式重算一遍，放在关闭那一拍里同步做，退场动画的第一帧就被拖住；
   * 背景没被失活（非模态、或推迟的失活还没施加）就当场执行 then。交接前重开或资源释放即作废：
   * 重开时背景失活原样留着、焦点也不动，释放时背景失活随资源撤下、焦点由焦点域卸载归还。
   */
  reveal: (then?: () => void) => void
  dispose: Cleanup
}

/**
 * 等下一帧画出来之后再执行：两层 requestAnimationFrame。第一层回调排在下一帧的绘制之前，
 * 在它里面再排一层，第二层执行时上一帧已经上屏。返回的撤销句柄在任一层之前调用都能拦下。
 *
 * 只推迟一层不够：rAF 回调与它之后的样式、布局、绘制同属一帧，回调里做的重活照样拖住这一帧。
 */
export function afterNextPaint(win: Window, task: () => void): Cleanup {
  let inner = 0
  const outer = win.requestAnimationFrame(() => {
    inner = win.requestAnimationFrame(() => {
      inner = 0
      task()
    })
  })
  return () => {
    win.cancelAnimationFrame(outer)
    if (inner)
      win.cancelAnimationFrame(inner)
  }
}

/**
 * 管理一层可动态切换的模态资源：滚动锁与背景失活同进同退，只有关闭那一刻背景先解除失活。
 * 层登记、消解层与焦点域仍由调用方持有，不因 modal 改值而重建。
 *
 * 背景失活等浮层第一帧画出来之后才施加。失活打的是 inert：浏览器要把被罩住的整棵子树
 * （通常是整个应用根）的样式重算一遍，几千个节点的页面上百毫秒；放在展开那一拍里同步做，
 * 面板的第一帧就被拖住这么久，点下去要等一会儿才有反应。推迟的这一两帧里焦点已由焦点域
 * 收进浮层、指针由遮罩拦下，背景只是晚一两帧才对读屏与查找消失（Zag 的 ariaHidden 缺省
 * 同样推迟到下一帧）。
 */
export function createModalLayerResources(o: ModalLayerResourcesOptions): ModalLayerResources {
  let disposed = false
  let release: Cleanup | undefined
  // 当前这一份背景失活：撤下时置空，补回时重建
  let hidden: Cleanup | undefined
  let revealed = false
  // 已排期、还没执行的背景失活
  let pendingHide: Cleanup | undefined
  // 已排期、还没执行的「撤下背景失活并交接」
  let pendingReveal: Cleanup | undefined

  const cancelPendingReveal = (): void => {
    const cancel = pendingReveal
    pendingReveal = undefined
    cancel?.()
  }

  const hideBackground = (): void => {
    o.run(() => {
      const targets = o.targets()
      if (targets.length)
        hidden = hideOutside(o.targets, o.config)
    })
  }

  const cancelPendingHide = (): void => {
    const cancel = pendingHide
    pendingHide = undefined
    cancel?.()
  }

  /** 第一帧上屏后再失活背景；到点时仍要失活（没被关、没被撤、没切成非模态）才施加 */
  const scheduleHide = (stillWanted: () => boolean): void => {
    cancelPendingHide()
    pendingHide = afterNextPaint(o.config.scope.getWin(), () => {
      pendingHide = undefined
      if (stillWanted())
        hideBackground()
    })
  }

  const acquire = (): void => {
    const lock = o.run(() => acquireScrollLock({ config: o.config }))
    revealed = false
    let alive = true
    const cleanup = (): void => {
      if (!alive)
        return
      alive = false
      cancelPendingHide()
      cancelPendingReveal()
      const errors: unknown[] = []
      try {
        const restore = hidden
        hidden = undefined
        restore?.()
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

    const stillWanted = (): boolean => !disposed && alive && release === cleanup && o.enabled() && !revealed && !hidden
    o.flush(() => {
      if (stillWanted())
        scheduleHide(stillWanted)
    })
  }

  const sync = (): void => {
    if (disposed)
      return
    if (o.enabled()) {
      if (!release) {
        acquire()
      }
      else if (revealed) {
        revealed = false
        // 关上又在交接之前重开：背景失活原样留着（hidden 还在），交接作废
        cancelPendingReveal()
        const current = release
        const stillWanted = (): boolean => !disposed && release === current && !revealed && !hidden && o.enabled()
        o.flush(() => {
          if (stillWanted())
            scheduleHide(stillWanted)
        })
      }
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
    reveal(then) {
      if (disposed || !release || revealed) {
        then?.()
        return
      }
      revealed = true
      cancelPendingHide()
      if (!hidden) {
        then?.()
        return
      }
      cancelPendingReveal()
      pendingReveal = afterNextPaint(o.config.scope.getWin(), () => {
        pendingReveal = undefined
        if (disposed || !revealed)
          return
        const restore = hidden
        hidden = undefined
        restore?.()
        then?.()
      })
    },
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
/**
 * 行为资源的释放函数，可顺带交出「立即归还焦点」：退场期间资源仍保留，
 * 关闭那一刻内容已经 inert，焦点要在那时就交回触发器，不能等资源释放。
 */
export type OverlayRelease = Cleanup & { returnFocus?: () => void }

export interface PresenceResourceOptions {
  /** 视觉 Presence；缺省（SSR/纯逻辑宿主）时逻辑关闭立即释放。 */
  presence: PresenceHandle | null | (() => PresenceHandle | null)
  /** 当前逻辑展开态，也是机器 tracker 的依赖。 */
  open: Dep
  /** 注册机器 tracker。 */
  track: (deps: Dep[], fn: () => void) => void
  /**
   * 获取本轮 Layer、DismissableLayer 与可选 FocusScope 等行为资源。
   * 返回的释放函数带 returnFocus 时，逻辑关闭那一刻即调用它归还焦点。
   */
  acquire: () => OverlayRelease | undefined
  /** 退场尚未完成便重开时调用；用于恢复被失活的焦点域。 */
  onReopen?: () => void
  /** 退出完成后是否可以立即释放；多层菜单用它等待本层重新成为栈顶。 */
  canRelease?: () => boolean
  /** canRelease 为 false 时订阅释放条件变化。 */
  onReleaseReady?: (retry: () => void) => Cleanup
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
  let release: OverlayRelease | undefined
  let lastOpen = false
  let presence: PresenceHandle | null = null
  let offExit: Cleanup | undefined
  let offReleaseReady: Cleanup | undefined

  const finish = (): void => {
    if (disposed || o.open() || !release)
      return
    if (o.canRelease && !o.canRelease()) {
      offReleaseReady ??= o.onReleaseReady?.(finish)
      return
    }
    const stopWaiting = offReleaseReady
    offReleaseReady = undefined
    stopWaiting?.()
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
    const closing = !open && lastOpen
    lastOpen = open
    if (open) {
      const stopWaiting = offReleaseReady
      offReleaseReady = undefined
      stopWaiting?.()
      currentPresence?.update(true)
      release ??= o.acquire()
      if (reopening)
        o.onReopen?.()
      return
    }
    // 关闭那一刻归还焦点：资源要留到退场播完，焦点不能跟着等
    if (closing)
      release?.returnFocus?.()
    if (!currentPresence || !currentPresence.rendered)
      finish()
  }
  const disposeRelease = (): void => {
    const cleanup = release
    release = undefined
    if (!cleanup)
      return
    if (!o.canRelease || o.canRelease() || !o.onReleaseReady) {
      cleanup()
      return
    }
    let released = false
    let stop: Cleanup | undefined
    const retry = (): void => {
      if (released || !o.canRelease?.())
        return
      released = true
      stop?.()
      cleanup()
    }
    stop = o.onReleaseReady(retry)
    retry()
  }

  try {
    o.track([o.open], sync)
    sync()
  }
  catch (error) {
    disposed = true
    offExit?.()
    offReleaseReady?.()
    disposeRelease()
    throw error
  }

  return () => {
    if (disposed)
      return
    disposed = true
    offExit?.()
    offReleaseReady?.()
    disposeRelease()
  }
}

/**
 * 层效应的主体：入层栈 → 挂消解层 → 挂焦点域，拆时逆序。
 *
 * 层只在展开期间入栈，常驻会占死栈顶把它下面每一层的 Escape 堵死。
 * 消解层与焦点域绑在同一个效应里，三者生命周期必须一致。
 */
export function trackOverlayLayer(o: OverlayLayerOptions): OverlayRelease | undefined {
  const { config, registerLayer } = o
  if (!config || !registerLayer)
    return undefined

  let focusScope: FocusScopeHandle | null = null
  const cleanup = setupLayerTransaction(registerLayer, (layer, defer) => {
    o.onLayer?.(layer)
    defer(() => o.onLayer?.(null))
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
        flush: o.flush,
        container: spec.container,
        trapped: spec.trapped ?? (() => false),
        loop: spec.loop ?? false,
        initialFocus: spec.initialFocus,
        restoreFocus: spec.restoreFocus,
        restoreTarget: spec.restoreTarget,
      })
      spec.onReactivate?.(focus.reactivate)
      focusScope = focus
      defer(() => {
        spec.onReactivate?.(null)
        if (focusScope === focus)
          focusScope = null
        focus.dispose()
      })
    }
  }, { registry: config.layerRegistry, flush: o.flush ?? (task => task()) })
  if (!cleanup)
    return undefined
  return Object.assign(() => cleanup(), { returnFocus: () => focusScope?.returnFocus() })
}

/** 消解层的标准映射：Escape 与层外交互都收起，只在关闭原因上分开。 */
export function overlayCloseOnDismiss(
  send: (event: { type: 'CLOSE', src: 'esc' | 'interact-outside' }) => void,
): (reason: DismissReason) => void {
  return reason => send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' })
}
