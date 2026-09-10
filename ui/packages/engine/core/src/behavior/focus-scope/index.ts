import type { Disposable, FocusableElement, Layer, RuntimeConfig } from '../../kernel'
import {
  contains,
  createPerDocumentRegistry,
  EV_MOUNT_AUTO_FOCUS,
  EV_UNMOUNT_AUTO_FOCUS,
  getActiveElementDeep,
  isElement,
  isShadowRoot,
} from '../../kernel'
import { acquireFocusGuards } from './focus-guards'
import { focusFirst, focusSafely, getTabbables, removeLinks } from './tabbable'

export interface FocusScopeOptions {
  config: RuntimeConfig
  layer: Layer
  container: () => HTMLElement | null
  /** Tab 到边界回绕；与 trapped 正交。 */
  loop?: boolean
  /** 焦点不能通过键盘/指针/程序方式逃逸；可在生命周期内变化。 */
  trapped: () => boolean
  branches?: () => Element[]
  onMountAutoFocus?: (e: CustomEvent) => void
  onUnmountAutoFocus?: (e: CustomEvent) => void
  initialFocus?: () => FocusableElement | null
  /** 卸载时是否归还焦点；默认 true。 */
  restoreFocus?: () => boolean
  /**
   * 归还焦点的落点。返回 null（或那个元素已离场）才回落到创建前的焦点持有者。
   *
   * 指针入口下「创建前的持有者」取决于点按那一刻浏览器把焦点放在哪，各平台不一致
   * （Safari 点按不给按钮焦点），落到 body 上时 Escape 之后 Tab 得从头开始。
   * 契约里承诺焦点归还触发器的层，把触发器显式交到这里。
   */
  restoreTarget?: () => FocusableElement | null
}

interface FocusScopeDocumentState {
  sequence: number
  live: Set<number>
  ownershipListeners: Set<() => void>
}

// 焦点归还只和同一 Document 中更晚建立的域竞争；其他窗口有自己的焦点生命周期。
const focusScopesByDocument = createPerDocumentRegistry<FocusScopeDocumentState>(() => ({
  sequence: 0,
  live: new Set<number>(),
  ownershipListeners: new Set<() => void>(),
}))

/** 有比 seq 更晚建立、且此刻仍在场的焦点域吗。 */
function hasNewerScope(state: FocusScopeDocumentState, seq: number): boolean {
  for (const live of state.live) {
    if (live > seq)
      return true
  }
  return false
}

function dispatchAutoFocus(
  win: Window & typeof globalThis,
  target: EventTarget,
  type: string,
  callback: ((event: CustomEvent) => void) | undefined,
): boolean {
  const event = new win.CustomEvent(type, { bubbles: false, cancelable: true, detail: {} })
  target.dispatchEvent(event)
  callback?.(event)
  return !event.defaultPrevented
}

export function createFocusScope(o: FocusScopeOptions): Disposable {
  const { config, layer, container } = o
  const scope = config.scope
  const doc = scope.getDoc()
  const win = scope.getWin()
  const registry = config.layerRegistry

  const documentScopes = focusScopesByDocument.get(doc)
  const mountSeq = ++documentScopes.sequence
  let disposed = false
  let resourcesReleased = false
  let paused = registry.top() !== layer
  const previouslyFocused = scope.getActiveElement()
  let lastFocused: FocusableElement | null = null
  let unsubscribe: () => void = () => {}
  let mutationObserver: MutationObserver | null = null
  let recoveryFrame: number | null = null
  let pendingRemovedFocus: FocusableElement | null = null
  let trackedFocusPath = new Set<Node>()
  let trackedShadowHosts = new Set<Element>()

  const guardsCleanup = acquireFocusGuards(doc)
  documentScopes.live.add(mountSeq)
  documentScopes.ownershipListeners.add(schedulePendingRecovery)

  function isInScope(el: Element | null): boolean {
    if (!el || el.ownerDocument !== doc)
      return false
    const el2 = container()
    if (contains(el2, el))
      return true
    return (o.branches?.() ?? []).some(b => contains(b, el))
  }

  function cancelRecovery(): void {
    pendingRemovedFocus = null
    if (recoveryFrame === null)
      return
    win.cancelAnimationFrame(recoveryFrame)
    recoveryFrame = null
  }

  function schedulePendingRecovery(): void {
    if (disposed
      || paused
      || !pendingRemovedFocus
      || recoveryFrame !== null
      || hasNewerScope(documentScopes, mountSeq)) {
      return
    }
    recoveryFrame = win.requestAnimationFrame(recoverRemovedFocus)
  }

  function clearFocusTracking(target: FocusableElement): void {
    if (lastFocused !== target)
      return
    lastFocused = null
    trackedFocusPath = new Set<Node>()
    trackedShadowHosts = new Set<Element>()
    mutationObserver?.disconnect()
    cancelRecovery()
  }

  // 只观察最后焦点到所属 Document 的祖先链：能捕获自身、祖先与 Shadow host 被移除，
  // 又不会让页面其他子树的普通更新唤醒每一个 FocusScope。
  function rememberFocus(target: FocusableElement): void {
    const path = new Set<Node>()
    const observerTargets = new Set<Node>()
    const shadowHosts = new Set<Element>()
    let current: Node | null = target
    while (current && current !== doc) {
      path.add(current)
      if (isShadowRoot(current)) {
        shadowHosts.add(current.host)
        current = current.host
      }
      else {
        const parentNode: Node | null = current.parentNode
        if (!parentNode)
          return
        observerTargets.add(parentNode)
        current = parentNode
      }
    }
    if (current !== doc)
      return
    path.add(doc)

    cancelRecovery()
    mutationObserver?.disconnect()
    for (const targetNode of observerTargets)
      mutationObserver?.observe(targetNode, { childList: true })
    lastFocused = target
    trackedFocusPath = path
    trackedShadowHosts = shadowHosts
  }

  function removedTrackedPath(records: MutationRecord[]): boolean {
    return records.some(record =>
      Array.from(record.removedNodes).some(node => trackedFocusPath.has(node)),
    )
  }

  function recoverRemovedFocus(): void {
    recoveryFrame = null
    const pending = pendingRemovedFocus
    pendingRemovedFocus = null
    if (!pending || disposed || lastFocused !== pending)
      return
    const trapped = o.trapped()
    if (disposed || lastFocused !== pending)
      return
    if (!trapped) {
      clearFocusTracking(pending)
      return
    }
    if (paused || hasNewerScope(documentScopes, mountSeq)) {
      pendingRemovedFocus = pending
      return
    }

    const activeInScope = activeFocusWithinScope()
    if (disposed || lastFocused !== pending)
      return
    if (activeInScope) {
      rememberFocus(activeInScope)
      return
    }
    const active = getActiveElementDeep(doc)
    const fellBackToShadowHost = active !== null && trackedShadowHosts.has(active)
    const fellBackToDocument = active === doc.body || active === doc.documentElement
    // MutationObserver 不接管业务已经完成的域外焦点交接；普通逃逸仍由 focusin 处理。
    if (!fellBackToShadowHost && !fellBackToDocument && active && active !== pending) {
      clearFocusTracking(pending)
      return
    }
    const stillTrapped = o.trapped()
    if (disposed || lastFocused !== pending)
      return
    if (!stillTrapped) {
      clearFocusTracking(pending)
      return
    }
    if (paused || hasNewerScope(documentScopes, mountSeq)) {
      pendingRemovedFocus = pending
      return
    }
    pullBackRemovedFocus(pending)
  }

  function onMutations(records: MutationRecord[]): void {
    const candidate = lastFocused
    if (disposed || !candidate || !removedTrackedPath(records))
      return
    const trapped = o.trapped()
    if (disposed || lastFocused !== candidate)
      return
    if (!trapped) {
      clearFocusTracking(candidate)
      return
    }
    pendingRemovedFocus = candidate
    schedulePendingRecovery()
  }

  // —— 挂载自动聚焦 ——
  // 容器可能晚一拍才就位，按 initialFocus → 首个可聚焦元素 → 容器 的顺序取焦点，
  // 容器兜底只在最后一帧使用。
  let focusSettled = false
  let mountEventDispatched = false
  let mountFocusAllowed = true
  let boundContainer: HTMLElement | null = null
  function tryMountFocus(lastChance: boolean): void {
    if (focusSettled || disposed)
      return
    const el = container()
    if (!el)
      return // 容器还没就位，留待重试
    boundContainer ??= el
    const active = scope.getActiveElement()
    // 焦点已落在容器后代则视为完成，落在容器本身不算
    if (active && isInScope(active) && active !== el) {
      rememberFocus(active)
      focusSettled = true
      return
    }
    if (!mountEventDispatched) {
      mountEventDispatched = true
      // DOM 监听器与选项回调对同一枚事件表决，任一 preventDefault 都接管默认聚焦。
      mountFocusAllowed = dispatchAutoFocus(win, el, EV_MOUNT_AUTO_FOCUS, o.onMountAutoFocus)
      // 回调可能同步打开更新层。旧层不再于后续帧补抢初始焦点。
      if (disposed || paused) {
        focusSettled = true
        return
      }
    }
    if (!mountFocusAllowed) {
      focusSettled = true
      return
    }
    const target = o.initialFocus?.() ?? null
    if (target) {
      focusSafely(target, { select: true })
      // 目标还没显形（hidden / display:none / visibility:hidden）时 focus() 是空操作，
      // 焦点没真落上就不算安排好，留给后续帧重试
      if (scope.getActiveElement() === target)
        focusSettled = true
      if (focusSettled || !lastChance)
        return
    }
    if (focusFirst(removeLinks(getTabbables(el)), { select: true })) {
      focusSettled = true
      return
    }
    // 无可聚焦元素时，仅在最后一帧兜底聚焦容器
    if (lastChance) {
      focusSafely(el)
      focusSettled = true
    }
  }
  function scheduleFocus(remaining: number): void {
    win.requestAnimationFrame(() => {
      if (focusSettled || disposed)
        return
      try {
        tryMountFocus(remaining <= 1)
      }
      catch (error) {
        disposed = true
        releaseResources()
        throw error
      }
      if (!focusSettled && remaining > 1)
        scheduleFocus(remaining - 1)
    })
  }
  // —— 逃逸抢回 ——
  /**
   * 把焦点拉回域内。lastFocused 可能已经离场（那一条被删掉了），或者压根没被记过，
   * 此时退到域内第一个可聚焦元素——「抓不回来就放它走」等于陷阱漏了。
   */
  function pullBack(): void {
    if (lastFocused?.isConnected && isInScope(lastFocused)) {
      focusSafely(lastFocused)
      return
    }
    const el = container()
    if (el && !focusFirst(removeLinks(getTabbables(el)), { select: true }))
      focusSafely(el)
  }

  function isFocusableElement(value: unknown): value is FocusableElement {
    return isElement(value)
      && typeof (value as Element & { focus?: unknown }).focus === 'function'
  }

  function activeFocusWithinScope(): FocusableElement | null {
    const roots = new Set<Document | ShadowRoot>()
    const addRoot = (node: Node | null): void => {
      if (!node)
        return
      const root = node.getRootNode()
      if (root === doc) {
        roots.add(doc)
        return
      }
      if (isShadowRoot(root) && root.ownerDocument === doc)
        roots.add(root)
    }
    addRoot(container())
    for (const branch of o.branches?.() ?? []) {
      if (branch.ownerDocument === doc)
        addRoot(branch)
    }
    addRoot(scope.getRootNode())

    for (const root of roots) {
      const active = getActiveElementDeep(root)
      if (isFocusableElement(active) && active.isConnected && isInScope(active))
        return active
    }
    return null
  }

  function isScopeShadowHost(target: Element): boolean {
    const roots = [container(), ...(o.branches?.() ?? [])]
    for (const node of roots) {
      if (!node || node.ownerDocument !== doc)
        continue
      let root: Node = node.getRootNode()
      while (isShadowRoot(root)) {
        if (root.host === target)
          return true
        root = root.host.getRootNode()
      }
    }
    return false
  }

  function ensureRecoveryOwnership(expected: FocusableElement): boolean {
    if (disposed || lastFocused !== expected)
      return false
    const trapped = o.trapped()
    if (disposed || lastFocused !== expected)
      return false
    if (!trapped) {
      clearFocusTracking(expected)
      return false
    }
    if (paused || hasNewerScope(documentScopes, mountSeq)) {
      pendingRemovedFocus = expected
      return false
    }
    return true
  }

  /** 尝试一次焦点写入后，true 表示已有有效接管者、不得继续碰后续候选。 */
  function focusAttemptSettled(expected: FocusableElement): boolean {
    if (!ensureRecoveryOwnership(expected))
      return true
    const activeInScope = activeFocusWithinScope()
    if (!ensureRecoveryOwnership(expected))
      return true
    if (activeInScope) {
      rememberFocus(activeInScope)
      return true
    }
    const active = getActiveElementDeep(doc)
    const browserFallback = active === null
      || active === doc.body
      || active === doc.documentElement
      || trackedShadowHosts.has(active)
    if (!active || active === expected || browserFallback)
      return false
    clearFocusTracking(expected)
    return true
  }

  function pullBackRemovedFocus(expected: FocusableElement): void {
    if (!ensureRecoveryOwnership(expected))
      return
    if (expected.isConnected) {
      const expectedInScope = isInScope(expected)
      if (!ensureRecoveryOwnership(expected))
        return
      if (expectedInScope) {
        focusSafely(expected)
        if (focusAttemptSettled(expected))
          return
      }
    }

    const el = container()
    if (!el)
      return
    if (el.ownerDocument !== doc)
      throw new Error('[xh] FocusScope container 必须属于 config.scope 的 Document')
    if (!ensureRecoveryOwnership(expected))
      return
    for (const candidate of removeLinks(getTabbables(el))) {
      if (!ensureRecoveryOwnership(expected))
        return
      focusSafely(candidate, { select: true })
      if (focusAttemptSettled(expected))
        return
    }

    if (!ensureRecoveryOwnership(expected))
      return
    focusSafely(el)
    focusAttemptSettled(expected)
  }

  function onFocusIn(e: FocusEvent): void {
    if (disposed)
      return
    const scopedActive = activeFocusWithinScope()
    const originalTarget = e.composedPath()[0]
    let target: FocusableElement | null = null
    if (scopedActive)
      target = scopedActive
    else if (isFocusableElement(originalTarget))
      target = originalTarget
    else if (isFocusableElement(e.target))
      target = e.target
    // 记账不看 trapped：它可以在生命周期内打开，那一刻要有个新鲜的落点可回
    if (target && isInScope(target)) {
      rememberFocus(target)
      return
    }
    if (paused || !o.trapped())
      return
    pullBack()
  }
  function onFocusOut(e: FocusEvent): void {
    if (disposed || paused || !o.trapped())
      return
    const related = e.relatedTarget as Element | null
    // relatedTarget 为 null 先让浏览器完成窗口切换或节点移除；后者由精确路径观察器延迟复核。
    if (related === null)
      return
    if (isInScope(related) || isScopeShadowHost(related))
      return
    // closed shadow 会把 relatedTarget 重定向成 host；优先核对 Scope/branch 的真实活动元素。
    const activeInScope = activeFocusWithinScope()
    if (activeInScope) {
      rememberFocus(activeInScope)
      return
    }
    pullBack()
  }

  // —— Tab 边界回绕 ——
  function onKeyDown(e: KeyboardEvent): void {
    if (disposed || paused || !o.loop || e.key !== 'Tab')
      return
    const el2 = container()
    if (!el2)
      return
    const tabbables = getTabbables(el2)
    if (tabbables.length === 0)
      return
    const first = tabbables[0]!
    const last = tabbables[tabbables.length - 1]!
    const active = scope.getActiveElement()
    if (!e.shiftKey && active === last) {
      e.preventDefault()
      focusSafely(first)
    }
    else if (e.shiftKey && active === first) {
      e.preventDefault()
      focusSafely(last)
    }
  }

  function releaseResources(): void {
    if (resourcesReleased)
      return
    resourcesReleased = true
    documentScopes.ownershipListeners.delete(schedulePendingRecovery)
    documentScopes.live.delete(mountSeq)
    for (const listener of [...documentScopes.ownershipListeners]) listener()
    mutationObserver?.disconnect()
    mutationObserver = null
    trackedFocusPath.clear()
    trackedShadowHosts.clear()
    cancelRecovery()
    doc.removeEventListener('focusin', onFocusIn, { capture: true })
    doc.removeEventListener('focusout', onFocusOut, { capture: true })
    doc.removeEventListener('keydown', onKeyDown, { capture: true })
    unsubscribe()
    guardsCleanup()
  }

  // 监听必须先于挂载聚焦装上：那一次聚焦同样要记进 lastFocused，
  // 否则首次逃逸时手里只有创建前的旧值（通常是 body），一拉就拉了个空。
  doc.addEventListener('focusin', onFocusIn, { capture: true })
  doc.addEventListener('focusout', onFocusOut, { capture: true })
  doc.addEventListener('keydown', onKeyDown, { capture: true })

  try {
    mutationObserver = new win.MutationObserver(onMutations)
    unsubscribe = registry.subscribe((layers) => {
      const nextPaused = layers[layers.length - 1] !== layer
      const resumed = paused && !nextPaused
      paused = nextPaused
      if (resumed)
        schedulePendingRecovery()
    })
    tryMountFocus(false)
    if (!focusSettled)
      scheduleFocus(3)
  }
  catch (error) {
    disposed = true
    releaseResources()
    throw error
  }

  return {
    dispose() {
      if (disposed)
        return
      disposed = true
      const autoFocusEventTarget = boundContainer
      releaseResources()
      // 焦点返还延后一帧
      win.requestAnimationFrame(() => {
        const proceed = autoFocusEventTarget
          ? dispatchAutoFocus(win, autoFocusEventTarget, EV_UNMOUNT_AUTO_FOCUS, o.onUnmountAutoFocus)
          : true
        // 回调可能同步打开更新层；生命周期通知照发，旧层不从新层手里抢焦点。
        if (!proceed || !(o.restoreFocus?.() ?? true) || hasNewerScope(documentScopes, mountSeq))
          return
        // 显式落点优先于创建前的快照：快照是「点按那一刻焦点在哪」，指针入口下它常是 body
        const explicit = o.restoreTarget?.() ?? null
        // restoreTarget 是用户代码，也可能同步建立并聚焦更新域；写焦点前必须重新表决。
        if (hasNewerScope(documentScopes, mountSeq))
          return
        const back = explicit?.isConnected ? explicit : previouslyFocused
        if (back?.isConnected) {
          focusSafely(back, { select: true })
          return
        }
        // 原持有者已离场。不能靠 body.focus()——body 不在各引擎一致的可聚焦集合里，
        // 那样焦点会留在这个已经关掉的层里（WC 侧节点常驻，尤其明显）。显式松手。
        const active = scope.getActiveElement()
        if (active && isInScope(active))
          active.blur()
      })
    },
  }
}
