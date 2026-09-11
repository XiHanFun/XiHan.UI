// 悬停意图跟踪：进触发器延时报开、离开后看指针是否经安全三角赶往浮层，
// 赶路不收、走岔或停滞才报关。只报意图，开与关由机器决定。
import type { HoverPoint } from './safe-polygon'
import { isElement, isHTMLElement, isWindow } from '../../kernel/guards'
import { pointInPolygon, safeTriangle } from './safe-polygon'

export interface HoverIntentOptions {
  /** 创建跟踪器时已经在场的悬停宿主；订阅期间不得跨 Document 移动。 */
  trigger: HTMLElement
  /** 浮层内容；关着时返回 null，此时离开触发器直接按关意图处理。 */
  getContentEl: () => HTMLElement | null
  /**
   * 逻辑上属于同一悬停树、但经 Portal 搬到内容节点之外的后代区域。
   * 每次跨区时现读；只能登记同一 Document 的原生 HTMLElement。
   */
  getHoverBranches?: () => readonly HTMLElement[]
  /** 进触发器到报开的延时（ms），默认 100。 */
  openDelay?: number
  /** 离开到报关的延时（ms），也是安全三角里的停滞上限，默认 300。 */
  closeDelay?: number
  /** 安全三角沿浮层近边外扩的余量（px），默认 6。 */
  buffer?: number
  onOpenIntent: () => void
  onCloseIntent: () => void
}

/**
 * 挂上悬停意图跟踪，返回拆除函数。触发器是创建快照；浮层元素换代（重开）
 * 无需重挂，每次交互都会现取并同步其监听。
 */
export function trackHoverIntent(options: HoverIntentOptions): () => void {
  const trigger = options.trigger
  if (!isHTMLElement(trigger))
    throw new Error('[xh] trackHoverIntent 的 trigger 必须是原生 HTMLElement')
  const doc = trigger.ownerDocument
  const win = doc.defaultView
  if (!isWindow(win) || win.document !== doc)
    throw new Error('[xh] trackHoverIntent 的 trigger 所属 Document 没有活动 Window')

  const numberOption = (name: 'openDelay' | 'closeDelay' | 'buffer', value: number | undefined, fallback: number): number => {
    const resolved = value ?? fallback
    if (!Number.isFinite(resolved) || resolved < 0)
      throw new Error(`[xh] trackHoverIntent 的 ${name} 必须是非负有限数`)
    return resolved
  }
  const openDelay = numberOption('openDelay', options.openDelay, 100)
  const closeDelay = numberOption('closeDelay', options.closeDelay, 300)
  const buffer = numberOption('buffer', options.buffer, 6)

  let openTimer: number | null = null
  let closeTimer: number | null = null
  let polygons: readonly HoverPoint[][] = []
  let travelOrigin: HoverPoint | null = null
  let travelSource: HTMLElement | null = null
  let travelCleanup: (() => void) | null = null
  let regionCleanups = new Map<HTMLElement, () => void>()
  let disposed = false

  const releaseRegions = (): void => {
    const cleanups = [...regionCleanups.values()].reverse()
    regionCleanups = new Map()
    for (const cleanup of cleanups)
      cleanup()
  }

  const assertTriggerDocument = (): void => {
    if (trigger.ownerDocument !== doc)
      throw new Error('[xh] trackHoverIntent 的 trigger 已更换所属 Document，请先 dispose 后重建')
  }

  const readContent = (): HTMLElement | null => {
    const next = options.getContentEl()
    if (disposed)
      return null
    if (next === null)
      return null
    if (!isHTMLElement(next) || next.ownerDocument !== doc)
      throw new Error('[xh] trackHoverIntent 的 content 必须是同一 Document 中的原生 HTMLElement')
    return next
  }

  const clearOpenTimer = (): void => {
    if (openTimer === null)
      return
    win.clearTimeout(openTimer)
    openTimer = null
  }

  const clearCloseTimer = (): void => {
    if (closeTimer === null)
      return
    win.clearTimeout(closeTimer)
    closeTimer = null
  }

  const stopTravel = (): void => {
    travelCleanup?.()
    travelCleanup = null
  }

  const cancelCloseSession = (): void => {
    clearCloseTimer()
    polygons = []
    travelOrigin = null
    travelSource = null
    stopTravel()
  }

  const scheduleClose = (): void => {
    clearCloseTimer()
    try {
      closeTimer = win.setTimeout(() => {
        closeTimer = null
        polygons = []
        travelOrigin = null
        travelSource = null
        stopTravel()
        if (disposed)
          return
        assertTriggerDocument()
        options.onCloseIntent()
      }, closeDelay)
    }
    catch (error) {
      cancelCloseSession()
      throw error
    }
  }

  const emitClose = (): void => {
    cancelCloseSession()
    if (!disposed)
      options.onCloseIntent()
  }

  const readBranches = (nextContent: HTMLElement | null): readonly HTMLElement[] => {
    const read = options.getHoverBranches
    const raw = read === undefined ? [] : read()
    if (disposed)
      return Object.freeze([])
    if (!Array.isArray(raw))
      throw new TypeError('[xh] trackHoverIntent 的 getHoverBranches 必须返回只读数组')
    const unique: HTMLElement[] = []
    const seen = new Set<HTMLElement>()
    for (const branch of raw) {
      if (!isHTMLElement(branch) || branch.ownerDocument !== doc)
        throw new Error('[xh] trackHoverIntent 的 hover branch 必须是同一 Document 中的原生 HTMLElement')
      if (branch === trigger || branch === nextContent || seen.has(branch))
        continue
      seen.add(branch)
      unique.push(branch)
    }
    return Object.freeze(unique)
  }

  const bindRegion = (region: HTMLElement): (() => void) => {
    let active = true
    const cleanup = (): void => {
      if (!active)
        return
      active = false
      region.removeEventListener('pointerleave', onRegionLeave)
      region.removeEventListener('pointerenter', onRegionEnter)
    }
    try {
      region.addEventListener('pointerenter', onRegionEnter)
      region.addEventListener('pointerleave', onRegionLeave)
      return cleanup
    }
    catch (error) {
      try {
        cleanup()
      }
      catch (cleanupError) {
        throw new AggregateError([error, cleanupError], '[xh] trackHoverIntent 区域监听初始化与回滚同时失败', { cause: error })
      }
      throw error
    }
  }

  const recomputePolygons = (): void => {
    if (!travelOrigin) {
      polygons = []
      return
    }
    const targets = [trigger, ...regionCleanups.keys()].filter(node => node !== travelSource)
    polygons = targets.map((target) => {
      const rect = target.getBoundingClientRect()
      return safeTriangle(
        travelOrigin!,
        { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        buffer,
      )
    })
  }

  /** 主内容与 Portal 分支每次现取；新增监听全部成功后才替换旧快照。 */
  const syncRegions = (): void => {
    const nextContent = readContent()
    if (disposed)
      return
    const nextBranches = readBranches(nextContent)
    if (disposed)
      return
    const desired = new Set<HTMLElement>()
    if (nextContent)
      desired.add(nextContent)
    for (const branch of nextBranches)
      desired.add(branch)

    const pending = new Map<HTMLElement, () => void>()
    try {
      for (const region of desired) {
        if (!regionCleanups.has(region))
          pending.set(region, bindRegion(region))
      }
    }
    catch (error) {
      const cleanupErrors: unknown[] = []
      for (const cleanup of [...pending.values()].reverse()) {
        try {
          cleanup()
        }
        catch (cleanupError) {
          cleanupErrors.push(cleanupError)
        }
      }
      if (cleanupErrors.length)
        throw new AggregateError([error, ...cleanupErrors], '[xh] trackHoverIntent 区域换代与回滚同时失败', { cause: error })
      throw error
    }
    if (disposed) {
      for (const cleanup of [...pending.values()].reverse())
        cleanup()
      return
    }

    const nextCleanups = new Map<HTMLElement, () => void>()
    for (const region of desired)
      nextCleanups.set(region, regionCleanups.get(region) ?? pending.get(region)!)
    for (const [region, cleanup] of [...regionCleanups].reverse()) {
      if (!desired.has(region))
        cleanup()
    }
    regionCleanups = nextCleanups
    recomputePolygons()
  }

  const containsRegion = (target: EventTarget | null): boolean => {
    if (!isElement(target))
      return false
    if (trigger.contains(target))
      return true
    for (const region of regionCleanups.keys()) {
      if (region.contains(target))
        return true
    }
    return false
  }

  function onRegionEnter(event: PointerEvent): void {
    assertTriggerDocument()
    syncRegions()
    if (disposed || !isHTMLElement(event.currentTarget) || !regionCleanups.has(event.currentTarget))
      return
    cancelCloseSession()
    clearOpenTimer()
  }

  function onRegionLeave(event: PointerEvent): void {
    assertTriggerDocument()
    syncRegions()
    if (disposed || !isHTMLElement(event.currentTarget) || !regionCleanups.has(event.currentTarget))
      return
    if (containsRegion(event.relatedTarget)) {
      cancelCloseSession()
      return
    }
    travelOrigin = { x: event.clientX, y: event.clientY }
    travelSource = event.currentTarget
    recomputePolygons()
    watchTravel()
    scheduleClose()
  }

  /** 离开后盯全文档的指针：在三角里就续命，出了三角立即报关。 */
  function watchTravel(): void {
    stopTravel()
    const onMove = (event: PointerEvent): void => {
      assertTriggerDocument()
      syncRegions()
      if (disposed || !travelOrigin)
        return
      // 目标正处于换代空窗时保留既有停滞计时；下一次移动会现读重新出现的区域。
      if (polygons.length === 0)
        return
      const point = { x: event.clientX, y: event.clientY }
      const path = event.composedPath()
      // 到站（进主内容、任一显式 Portal 分支或回触发器）。
      if (path.some(target => containsRegion(target))) {
        cancelCloseSession()
        return
      }
      if (polygons.some(polygon => pointInPolygon(point, polygon))) {
        scheduleClose()
        return
      }
      emitClose()
    }
    doc.addEventListener('pointermove', onMove, { passive: true })
    travelCleanup = () => doc.removeEventListener('pointermove', onMove)
  }

  const onTriggerEnter = (): void => {
    assertTriggerDocument()
    syncRegions()
    if (disposed)
      return
    cancelCloseSession()
    clearOpenTimer()
    openTimer = win.setTimeout(() => {
      openTimer = null
      if (disposed)
        return
      assertTriggerDocument()
      options.onOpenIntent()
    }, openDelay)
  }

  const onTriggerLeave = (event: PointerEvent): void => {
    assertTriggerDocument()
    syncRegions()
    if (disposed)
      return
    clearOpenTimer()
    // 直接进了浮层：交给浮层的 enter 收口，路径上有它就不折腾三角
    if (containsRegion(event.relatedTarget)) {
      cancelCloseSession()
      return
    }
    if (regionCleanups.size === 0) {
      travelOrigin = null
      travelSource = null
      polygons = []
      stopTravel()
      scheduleClose()
      return
    }
    travelOrigin = { x: event.clientX, y: event.clientY }
    travelSource = trigger
    recomputePolygons()
    watchTravel()
    scheduleClose()
  }

  // 先验证并绑定初始 content/branches；任何初始化错误都不能留下半组监听。
  try {
    syncRegions()
  }
  catch (error) {
    try {
      releaseRegions()
    }
    catch (cleanupError) {
      throw new AggregateError([error, cleanupError], '[xh] trackHoverIntent 初始化与回滚同时失败', { cause: error })
    }
    throw error
  }
  try {
    trigger.addEventListener('pointerenter', onTriggerEnter)
    trigger.addEventListener('pointerleave', onTriggerLeave)
  }
  catch (error) {
    trigger.removeEventListener('pointerenter', onTriggerEnter)
    trigger.removeEventListener('pointerleave', onTriggerLeave)
    releaseRegions()
    throw error
  }

  return () => {
    if (disposed)
      return
    disposed = true
    trigger.removeEventListener('pointerenter', onTriggerEnter)
    trigger.removeEventListener('pointerleave', onTriggerLeave)
    releaseRegions()
    clearOpenTimer()
    cancelCloseSession()
  }
}
