/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 通用拖放：从任意元素开始一次拖动会话，跟随指针显示预览，按指针下的放置目标询问能否放下、松手时放下。
// 鼠标与笔移动过激活距离才开始拖；触屏长按开始拖，长按前先移动即视为滚动、放弃这次拖动。
// 拖到接受的目标边缘时逐帧在目标上派发 pan-request。Esc、指针离开窗口、在不接受处松手即取消。

import type { Point } from '@xihan-ui/designer-kit'
import type { PointerEndDetails, PointerSession, PointerSessionDetails } from '@xihan-ui/pointer'
import { createPointerSession, edgeScrollDelta, resolveSessionDoc, shouldActivate } from '@xihan-ui/pointer'
import { emitEvent, GEN_ATTR } from '@xihan-ui/web-components/authoring'

/** 放置目标对指针所在位置的答复。 */
export interface DropOver {
  /** 能否在这里放下。 */
  readonly accept: boolean
  /** hide：隐藏跟随指针的预览，由目标自己画落点。 */
  readonly ghost?: 'hide'
}

/** 放置目标的回调；point 为浏览器视口坐标。 */
export interface DropTargetHandlers<P = unknown> {
  /** 指针移到目标上或在目标上移动、目标平移了视口之后调用。 */
  readonly over: (point: Point, payload: P) => DropOver
  /** 在接受的位置松手。 */
  readonly drop: (point: Point, payload: P) => void
  /** 指针离开目标、拖动取消或在目标上不接受处松手。 */
  readonly leave?: () => void
}

/** 一次拖动的选项。 */
export interface DragOptions<P = unknown> {
  /** 交给放置目标的数据。 */
  readonly payload: P
  /** 拖动源，缺省取事件的 currentTarget，没有再取 target。 */
  readonly source?: Element
  /** 跟随指针的预览，左上角落在指针处；缺省为拖动源的缩小副本，按下处保持在指针下；给 null 不显示预览。 */
  readonly preview?: Element | null
  /** 会话结束：dragged 为拖动是否开始过，dropped 为是否放到了接受的目标上。 */
  readonly onEnd?: (result: { readonly dragged: boolean, readonly dropped: boolean }) => void
}

/** 进行中的拖动会话。 */
export interface DragSession {
  /** 拖动已经开始（越过激活距离或长按到时）。 */
  readonly active: boolean
  /** 取消这次拖动；已结束时什么都不做。 */
  readonly cancel: () => void
}

/** pan-request 的 detail：视口朝哪个方向看过去多少屏幕像素，贴右边缘时 dx 为正。 */
export interface PanRequestDetail {
  readonly dx: number
  readonly dy: number
}

/** 触屏长按多久开始拖动，毫秒。 */
const LONG_PRESS_DELAY = 500
/** 缺省预览相对拖动源的比例。 */
const PREVIEW_SCALE = 0.8
/** 预览元素上的标记，样式按它选取。 */
const PREVIEW_ATTR = 'data-xh-designer-drag-preview'

const targets = new WeakMap<Element, DropTargetHandlers<never>>()

/** 把元素登记为放置目标，返回取消登记的函数；同一元素再次登记时换成新的回调。 */
export function registerDropTarget<P>(element: Element, handlers: DropTargetHandlers<P>): () => void {
  targets.set(element, handlers as DropTargetHandlers<never>)
  return () => {
    if (targets.get(element) === handlers)
      targets.delete(element)
  }
}

interface Hovered {
  readonly element: Element
  readonly handlers: DropTargetHandlers<unknown>
  readonly over: DropOver
}

/** 指针下最内层的放置目标；跨过 shadow 边界往外找。 */
function targetAt(doc: Document, point: Point): Omit<Hovered, 'over'> | undefined {
  let node: Node | null = doc.elementFromPoint?.(point.x, point.y) ?? null
  while (node) {
    if (node instanceof Element) {
      const handlers = targets.get(node)
      if (handlers)
        return { element: node, handlers: handlers as DropTargetHandlers<unknown> }
    }
    node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null)
  }
  return undefined
}

/** 一次拖动：pending 等激活，active 跟随指针，done 已结束。 */
class DragRun<P> {
  readonly #options: DragOptions<P>
  readonly #source: Element
  readonly #doc: Document
  readonly #view: Window
  readonly #start: Point
  readonly #grab: Point
  readonly #width: number
  readonly #touch: boolean
  readonly #pointerId: number
  readonly #session: PointerSession
  #state: 'pending' | 'active' | 'done' = 'pending'
  #point: Point
  #preview: HTMLElement | undefined
  #hovered: Hovered | undefined
  #frame = 0
  #timer = 0

  constructor(event: PointerEvent, options: DragOptions<P>) {
    this.#options = options
    this.#source = options.source ?? (event.currentTarget instanceof Element ? event.currentTarget : event.target as Element)
    this.#doc = resolveSessionDoc(this.#source)!
    this.#view = this.#doc.defaultView!
    this.#start = { x: event.clientX, y: event.clientY }
    this.#point = this.#start
    const box = this.#source.getBoundingClientRect()
    this.#grab = { x: this.#start.x - box.left, y: this.#start.y - box.top }
    this.#width = box.width
    this.#touch = event.pointerType === 'touch'
    this.#pointerId = event.pointerId
    this.#session = createPointerSession({ doc: this.#doc, pointerId: event.pointerId, onMove: this.#onMove, onEnd: this.#onEnd })
    this.#doc.addEventListener('keydown', this.#onKeyDown, true)
    this.#doc.addEventListener('pointerout', this.#onPointerOut)
    this.#doc.addEventListener('selectstart', this.#onSelectStart)
    this.#doc.addEventListener('touchmove', this.#onTouchMove, { passive: false })
    this.#doc.addEventListener('contextmenu', this.#onContextMenu, true)
    if (this.#touch)
      this.#timer = this.#view.setTimeout(this.#activate, LONG_PRESS_DELAY)
  }

  get active(): boolean {
    return this.#state === 'active'
  }

  cancel(): void {
    this.#hovered?.handlers.leave?.()
    this.#hovered = undefined
    this.#finish(false)
  }

  readonly #activate = (): void => {
    if (this.#state !== 'pending')
      return
    this.#state = 'active'
    this.#view.clearTimeout(this.#timer)
    const shown = this.#options.preview === undefined ? this.#source.cloneNode(true) as Element : this.#options.preview
    if (shown) {
      const preview = this.#doc.createElement('div')
      preview.setAttribute(GEN_ATTR, '')
      preview.setAttribute(PREVIEW_ATTR, '')
      preview.setAttribute('aria-hidden', 'true')
      if (this.#options.preview === undefined)
        preview.style.inlineSize = `${this.#width}px`
      preview.append(shown)
      this.#doc.body.append(preview)
      this.#preview = preview
    }
    this.#ask()
  }

  /** 问指针下的目标能否放下，更新预览，并按需要开始边缘平移。 */
  #ask(): void {
    const hit = targetAt(this.#doc, this.#point)
    if (this.#hovered && this.#hovered.element !== hit?.element) {
      this.#hovered.handlers.leave?.()
      this.#hovered = undefined
    }
    if (hit)
      this.#hovered = { ...hit, over: hit.handlers.over(this.#point, this.#options.payload) }
    this.#placePreview()
    this.#schedulePan()
  }

  #placePreview(): void {
    const preview = this.#preview
    if (!preview)
      return
    const { x, y } = this.#point
    preview.style.transform = this.#options.preview === undefined
      ? `translate(${x - this.#grab.x * PREVIEW_SCALE}px, ${y - this.#grab.y * PREVIEW_SCALE}px) scale(${PREVIEW_SCALE})`
      : `translate(${x}px, ${y}px)`
    preview.hidden = this.#hovered?.over.accept === true && this.#hovered.over.ghost === 'hide'
  }

  #panDelta(): Point {
    if (!this.#hovered?.over.accept)
      return { x: 0, y: 0 }
    const rect = this.#hovered.element.getBoundingClientRect()
    return edgeScrollDelta({ bounds: { x: rect.left, y: rect.top, width: rect.width, height: rect.height }, point: this.#point })
  }

  #schedulePan(): void {
    if (this.#frame !== 0 || this.#state !== 'active')
      return
    const delta = this.#panDelta()
    if (delta.x === 0 && delta.y === 0)
      return
    this.#frame = this.#view.requestAnimationFrame(() => {
      this.#frame = 0
      const next = this.#panDelta()
      if (this.#state !== 'active' || !this.#hovered || (next.x === 0 && next.y === 0))
        return
      emitEvent(this.#hovered.element, 'pan-request', { dx: next.x, dy: next.y } satisfies PanRequestDetail)
      this.#ask()
    })
  }

  #finish(dropped: boolean): void {
    if (this.#state === 'done')
      return
    const dragged = this.#state === 'active'
    this.#state = 'done'
    this.#session.dispose()
    this.#view.clearTimeout(this.#timer)
    if (this.#frame !== 0)
      this.#view.cancelAnimationFrame(this.#frame)
    this.#doc.removeEventListener('keydown', this.#onKeyDown, true)
    this.#doc.removeEventListener('pointerout', this.#onPointerOut)
    this.#doc.removeEventListener('selectstart', this.#onSelectStart)
    this.#doc.removeEventListener('touchmove', this.#onTouchMove)
    this.#doc.removeEventListener('contextmenu', this.#onContextMenu, true)
    this.#preview?.remove()
    this.#options.onEnd?.({ dragged, dropped })
  }

  readonly #onMove = ({ point }: PointerSessionDetails): void => {
    this.#point = { x: point.clientX, y: point.clientY }
    if (this.#state === 'pending') {
      if (!shouldActivate({ x: this.#point.x - this.#start.x, y: this.#point.y - this.#start.y }))
        return
      if (this.#touch)
        this.#finish(false)
      else
        this.#activate()
      return
    }
    if (this.#state === 'active')
      this.#ask()
  }

  readonly #onEnd = ({ reason, point }: PointerEndDetails): void => {
    this.#point = { x: point.clientX, y: point.clientY }
    if (this.#state !== 'active' || reason !== 'pointerup') {
      this.cancel()
      return
    }
    this.#ask()
    const hovered = this.#hovered
    if (!hovered?.over.accept) {
      this.cancel()
      return
    }
    this.#hovered = undefined
    hovered.handlers.drop(this.#point, this.#options.payload)
    this.#finish(true)
  }

  readonly #onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || this.#state !== 'active')
      return
    event.preventDefault()
    event.stopPropagation()
    this.cancel()
  }

  readonly #onPointerOut = (event: PointerEvent): void => {
    if (event.relatedTarget === null && event.pointerId === this.#pointerId && this.#state === 'active')
      this.cancel()
  }

  readonly #onSelectStart = (event: Event): void => {
    if (this.#state === 'active')
      event.preventDefault()
  }

  readonly #onTouchMove = (event: TouchEvent): void => {
    if (this.#state === 'active' && event.cancelable)
      event.preventDefault()
  }

  readonly #onContextMenu = (event: Event): void => {
    if (this.#touch)
      event.preventDefault()
  }
}

/** 从一次指针按下开始拖动会话。 */
export function startDrag<P>(event: PointerEvent, options: DragOptions<P>): DragSession {
  const run = new DragRun(event, options)
  return {
    get active() {
      return run.active
    },
    cancel: () => run.cancel(),
  }
}
