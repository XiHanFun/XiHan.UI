// 悬停意图跟踪：进触发器延时报开、离开后看指针是否经安全三角赶往浮层，
// 赶路不收、走岔或停滞才报关。只报意图，开与关由机器决定。
import type { HoverPoint } from './safe-polygon'
import { pointInPolygon, safeTriangle } from './safe-polygon'

export interface HoverIntentOptions {
  /** 悬停触发的宿主，通常是子菜单的触发条目。 */
  getTriggerEl: () => HTMLElement | null
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
 * 挂上悬停意图跟踪，返回拆除函数。触发器与浮层任一在场即工作，
 * 浮层元素换代（重开）无需重挂：每次判定都现取。
 */
export function trackHoverIntent(options: HoverIntentOptions): () => void {
  const openDelay = options.openDelay ?? 100
  const closeDelay = options.closeDelay ?? 300
  const buffer = options.buffer ?? 6

  let openTimer: ReturnType<typeof setTimeout> | null = null
  let closeTimer: ReturnType<typeof setTimeout> | null = null
  let polygon: HoverPoint[] | null = null
  let moveCleanup: (() => void) | null = null
  let disposed = false

  const clearOpen = (): void => {
    if (openTimer) {
      clearTimeout(openTimer)
      openTimer = null
    }
  }
  const clearClose = (): void => {
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
    polygon = null
    moveCleanup?.()
    moveCleanup = null
  }

  const scheduleClose = (): void => {
    if (closeTimer)
      clearTimeout(closeTimer)
    closeTimer = setTimeout(() => {
      closeTimer = null
      clearClose()
      if (!disposed)
        options.onCloseIntent()
    }, closeDelay)
  }

  const onContentEnter = (): void => {
    clearClose()
    clearOpen()
  }

  const onContentLeave = (event: PointerEvent): void => {
    const trigger = options.getTriggerEl()
    if (trigger && event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget))
      return
    scheduleClose()
  }

  // 监听挂在元素上；元素此刻可能还没就位，逐个能挂多少挂多少，浮层的监听在它出现后补挂
  const listeners: Array<() => void> = []
  const attach = (el: HTMLElement | null, type: string, fn: (e: PointerEvent) => void): void => {
    if (!el)
      return
    el.addEventListener(type, fn as EventListener)
    listeners.push(() => el.removeEventListener(type, fn as EventListener))
  }

  let attachedContent: HTMLElement | null = null
  const ensureContentListeners = (): void => {
    const content = options.getContentEl()
    if (content === attachedContent)
      return
    attachedContent = content
    attach(content, 'pointerenter', onContentEnter)
    attach(content, 'pointerleave', onContentLeave)
  }
  /** 离开后盯全文档的指针：在三角里就续命，出了三角立即报关。 */
  const watchTravel = (doc: Document): void => {
    const onMove = (event: PointerEvent): void => {
      if (!polygon)
        return
      const point = { x: event.clientX, y: event.clientY }
      const content = options.getContentEl()
      const trigger = options.getTriggerEl()
      const path = event.composedPath()
      // 到站（进浮层或回触发器）：浮层是开合后才出现的节点，顺带把它的监听补挂上
      if ((content && path.includes(content)) || (trigger && path.includes(trigger))) {
        ensureContentListeners()
        clearClose()
        return
      }
      if (pointInPolygon(point, polygon)) {
        scheduleClose()
        return
      }
      clearClose()
      if (!disposed)
        options.onCloseIntent()
    }
    doc.addEventListener('pointermove', onMove, { passive: true })
    moveCleanup = () => doc.removeEventListener('pointermove', onMove)
  }

  const onTriggerEnter = (): void => {
    clearClose()
    clearOpen()
    openTimer = setTimeout(() => {
      openTimer = null
      if (!disposed)
        options.onOpenIntent()
    }, openDelay)
  }

  const onTriggerLeave = (event: PointerEvent): void => {
    clearOpen()
    const content = options.getContentEl()
    // 直接进了浮层：交给浮层的 enter 收口，路径上有它就不折腾三角
    if (content && event.relatedTarget instanceof Node && content.contains(event.relatedTarget))
      return
    if (!content) {
      scheduleClose()
      return
    }
    const rect = content.getBoundingClientRect()
    polygon = safeTriangle({ x: event.clientX, y: event.clientY }, { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, buffer)
    scheduleClose()
    watchTravel(event.currentTarget instanceof Element ? event.currentTarget.ownerDocument : document)
  }

  attach(options.getTriggerEl(), 'pointerenter', onTriggerEnter)
  attach(options.getTriggerEl(), 'pointerleave', onTriggerLeave)

  // 浮层是开合后才出现的节点：借触发器的 enter 顺带补挂一次
  attach(options.getTriggerEl(), 'pointerenter', ensureContentListeners)
  attach(options.getTriggerEl(), 'pointerleave', ensureContentListeners)

  return () => {
    disposed = true
    clearOpen()
    clearClose()
    for (const off of listeners) off()
  }
}
