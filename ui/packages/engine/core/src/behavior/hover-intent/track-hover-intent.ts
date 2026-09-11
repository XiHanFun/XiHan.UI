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
  let polygon: HoverPoint[] | null = null
  let travelOrigin: HoverPoint | null = null
  let travelCleanup: (() => void) | null = null
  let content: HTMLElement | null = null
  let contentCleanup: (() => void) | null = null
  let disposed = false

  const releaseContent = (): void => {
    const cleanup = contentCleanup
    contentCleanup = null
    content = null
    cleanup?.()
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
    polygon = null
    travelOrigin = null
    stopTravel()
  }

  const scheduleClose = (): void => {
    clearCloseTimer()
    try {
      closeTimer = win.setTimeout(() => {
        closeTimer = null
        polygon = null
        travelOrigin = null
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

  /** 浮层节点每次现取；换代时先验证新节点，再原子替换旧监听。 */
  const syncContent = (): void => {
    const next = readContent()
    if (disposed)
      return
    if (next === content)
      return

    let nextPolygon: HoverPoint[] | null = null
    if (travelOrigin && next) {
      const rect = next.getBoundingClientRect()
      nextPolygon = safeTriangle(
        travelOrigin,
        { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        buffer,
      )
    }

    let nextCleanup: (() => void) | null = null
    if (next) {
      next.addEventListener('pointerenter', onContentEnter)
      try {
        next.addEventListener('pointerleave', onContentLeave)
      }
      catch (error) {
        next.removeEventListener('pointerenter', onContentEnter)
        throw error
      }
      nextCleanup = () => {
        next.removeEventListener('pointerenter', onContentEnter)
        next.removeEventListener('pointerleave', onContentLeave)
      }
    }

    contentCleanup?.()
    content = next
    contentCleanup = nextCleanup
    if (travelOrigin)
      polygon = nextPolygon
  }

  function onContentEnter(event: PointerEvent): void {
    assertTriggerDocument()
    syncContent()
    if (disposed || event.currentTarget !== content)
      return
    cancelCloseSession()
    clearOpenTimer()
  }

  function onContentLeave(event: PointerEvent): void {
    assertTriggerDocument()
    syncContent()
    if (disposed || event.currentTarget !== content)
      return
    if (isElement(event.relatedTarget) && trigger.contains(event.relatedTarget)) {
      cancelCloseSession()
      return
    }
    travelOrigin = null
    polygon = null
    stopTravel()
    scheduleClose()
  }

  /** 离开后盯全文档的指针：在三角里就续命，出了三角立即报关。 */
  const watchTravel = (): void => {
    stopTravel()
    const onMove = (event: PointerEvent): void => {
      assertTriggerDocument()
      syncContent()
      if (disposed || !polygon)
        return
      const point = { x: event.clientX, y: event.clientY }
      const path = event.composedPath()
      // 到站（进浮层或回触发器）。
      if ((content && path.includes(content)) || path.includes(trigger)) {
        cancelCloseSession()
        return
      }
      if (pointInPolygon(point, polygon)) {
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
    syncContent()
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
    syncContent()
    if (disposed)
      return
    clearOpenTimer()
    // 直接进了浮层：交给浮层的 enter 收口，路径上有它就不折腾三角
    if (content && isElement(event.relatedTarget) && content.contains(event.relatedTarget)) {
      cancelCloseSession()
      return
    }
    if (!content) {
      travelOrigin = null
      polygon = null
      stopTravel()
      scheduleClose()
      return
    }
    const rect = content.getBoundingClientRect()
    travelOrigin = { x: event.clientX, y: event.clientY }
    polygon = safeTriangle(travelOrigin, { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, buffer)
    watchTravel()
    scheduleClose()
  }

  // 先验证并绑定初始 content；任何初始化错误都不能留下半组监听。
  syncContent()
  try {
    trigger.addEventListener('pointerenter', onTriggerEnter)
    trigger.addEventListener('pointerleave', onTriggerLeave)
  }
  catch (error) {
    trigger.removeEventListener('pointerenter', onTriggerEnter)
    trigger.removeEventListener('pointerleave', onTriggerLeave)
    releaseContent()
    throw error
  }

  return () => {
    if (disposed)
      return
    disposed = true
    trigger.removeEventListener('pointerenter', onTriggerEnter)
    trigger.removeEventListener('pointerleave', onTriggerLeave)
    releaseContent()
    clearOpenTimer()
    cancelCloseSession()
  }
}
