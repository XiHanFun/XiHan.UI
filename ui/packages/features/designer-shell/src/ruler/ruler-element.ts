/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-ruler>：标尺框。包住画布：上、左两条标尺，左上角角块，中间是作者内容，画布上方一层参考线。
// 从上标尺拖出横向参考线（y），从左标尺拖出竖向参考线（x）；拖动已有参考线挪动，拖回标尺即删除；
// 点参考线选中，Delete / Backspace 删除。参考线是受控的：零件只派发 guides-change，由设计器写回 guides。

import type { Rect, Viewport } from '@xihan-ui/designer-kit'
import type { PointerEndDetails, PointerSession, PointerSessionDetails } from '@xihan-ui/pointer'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { DesignerRulerTranslations } from '../translations'
import { rotatedBounds, rulerTicks } from '@xihan-ui/designer-kit'
import { createPointerSession, resolveSessionDoc, shouldActivate } from '@xihan-ui/pointer'
import { BOOLEAN_CONVERTER, createGeneratedElement, emitEvent, setText, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { adoptSlots } from '../internal/slots'

/** 参考线的方向：x 为竖线（x 等于定值），y 为横线。 */
export type DesignerGuideAxis = 'x' | 'y'

/** 两个方向的参考线位置，世界单位。 */
export interface DesignerGuides {
  readonly x: readonly number[]
  readonly y: readonly number[]
}

/** 本次参考线的变化；index 是在该方向数组里的下标，新增的在末尾。 */
export interface DesignerGuideChange {
  readonly type: 'add' | 'move' | 'remove'
  readonly axis: DesignerGuideAxis
  readonly index: number
}

/** 标尺框派发的事件。 */
export interface DesignerRulerEventMap {
  'guides-change': CustomEvent<{ guides: DesignerGuides, change: DesignerGuideChange }>
}

const DEFAULT_TRANSLATIONS: DesignerRulerTranslations = {
  horizontalGuide: value => `Horizontal guide at ${value}`,
  verticalGuide: value => `Vertical guide at ${value}`,
}

const TAG = 'xh-designer-ruler'
const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 }
const NO_GUIDES: DesignerGuides = { x: [], y: [] }

interface RulerParts {
  readonly element: HTMLElement
  readonly ticks: HTMLElement
  readonly highlight: HTMLElement
  readonly markers: HTMLElement
  readonly cursor: HTMLElement
}

interface Parts {
  readonly corner: HTMLElement
  readonly top: RulerParts
  readonly left: RulerParts
  readonly canvas: HTMLElement
  readonly layer: HTMLElement
  readonly lines: HTMLElement
  readonly preview: HTMLElement
  readonly label: HTMLElement
}

interface GuideDrag {
  readonly axis: DesignerGuideAxis
  /** 挪动的那条在该方向数组里的下标；新建时为 undefined。 */
  readonly index: number | undefined
  readonly session: PointerSession
  readonly start: { x: number, y: number }
  active: boolean
  value: number | undefined
  /** 指针所在：画布里、对应的标尺上，或别处。 */
  where: 'canvas' | 'ruler' | 'outside'
  client: { x: number, y: number }
}

export class XhDesignerRulerElement extends XhReactiveElement {
  static override properties = {
    viewport: { attribute: false },
    unitSize: { type: Number, attribute: 'unit-size' },
    guides: { attribute: false },
    highlight: { attribute: false },
    format: { attribute: false },
    snap: { attribute: false },
    readonly: { converter: BOOLEAN_CONVERTER },
    translations: { attribute: false },
  }

  /** 画布的视口。 */
  declare viewport: Viewport | undefined
  /** 一个刻度单位等于多少世界单位，只管刻度显示，缺省 1。 */
  declare unitSize: number | undefined
  /** 参考线，世界单位；受控，零件不自己改。 */
  declare guides: DesignerGuides | undefined
  /** 在两条标尺上画淡底的范围，世界坐标。 */
  declare highlight: Rect | undefined
  /** 刻度与参考线数值的文字，入参是刻度单位；缺省按主刻度间隔取整数或所需的小数位。 */
  declare format: ((value: number) => string) | undefined
  /** 拖动参考线时的吸附，入参与返回值都是世界单位。 */
  declare snap: ((axis: DesignerGuideAxis, value: number) => number) | undefined
  /** 只读：照常显示参考线，不能新建、挪动或删除。 */
  declare readonly?: boolean
  /** 元素自己的文案，压在全局配置之上。 */
  declare translations: Partial<DesignerRulerTranslations> | undefined

  readonly #config = new XhConfigController(this)
  #parts: Parts | undefined
  #releaseSlots: (() => void) | undefined
  #resize: ResizeObserver | undefined
  #size = { width: 0, height: 0 }
  #drag: GuideDrag | undefined
  #selected: { axis: DesignerGuideAxis, value: number } | undefined
  #pointer: { x: number, y: number } | undefined

  constructor() {
    super()
    this.readonly = false
  }

  override connectedCallback(): void {
    super.connectedCallback()
    const parts = this.#ensureParts()
    this.#releaseSlots ??= adoptSlots(this, { corner: parts.corner }, parts.canvas)
    this.addEventListener('pointermove', this.#onHover)
    this.addEventListener('pointerleave', this.#onLeave)
    if (typeof ResizeObserver === 'function') {
      this.#resize = new ResizeObserver(() => this.requestUpdate())
      this.#resize.observe(parts.canvas)
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.#releaseSlots?.()
    this.#releaseSlots = undefined
    this.#resize?.disconnect()
    this.#resize = undefined
    this.removeEventListener('pointermove', this.#onHover)
    this.removeEventListener('pointerleave', this.#onLeave)
    this.#endDrag()
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    this.toggleAttribute('data-readonly', this.readonly === true)
    this.#size = { width: parts.canvas.clientWidth, height: parts.canvas.clientHeight }
    const viewport = this.viewport ?? DEFAULT_VIEWPORT
    const unit = this.unitSize ?? 1
    this.#renderRuler(parts.top, 'x', viewport, unit)
    this.#renderRuler(parts.left, 'y', viewport, unit)
    this.#renderGuides(parts, viewport)
    this.#renderCursor(parts)
  }

  #ensureParts(): Parts {
    if (this.#parts?.canvas.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const ruler = (orientation: 'horizontal' | 'vertical'): RulerParts => {
      const ticks = createGeneratedElement(doc, 'div', { 'data-part': 'ticks' })
      const highlight = createGeneratedElement(doc, 'div', { 'data-part': 'highlight', 'hidden': true })
      const markers = createGeneratedElement(doc, 'div', { 'data-part': 'markers' })
      const cursor = createGeneratedElement(doc, 'div', { 'data-part': 'cursor', 'hidden': true })
      const element = createGeneratedElement(doc, 'div', { 'data-part': 'ruler', 'data-orientation': orientation, 'aria-hidden': 'true' }, [highlight, ticks, markers, cursor])
      element.addEventListener('pointerdown', this.#onRulerDown)
      return { element, ticks, highlight, markers, cursor }
    }
    const corner = createGeneratedElement(doc, 'div', { 'data-part': 'corner' })
    const top = ruler('horizontal')
    const left = ruler('vertical')
    const canvas = createGeneratedElement(doc, 'div', { 'data-part': 'canvas' })
    const lines = createGeneratedElement(doc, 'div', { 'data-part': 'guide-lines' })
    const preview = createGeneratedElement(doc, 'div', { 'data-part': 'guide-preview', 'hidden': true, 'aria-hidden': 'true' })
    const label = createGeneratedElement(doc, 'div', { 'data-part': 'guide-label', 'hidden': true, 'aria-hidden': 'true' })
    const layer = createGeneratedElement(doc, 'div', { 'data-part': 'guides' }, [lines, preview, label])
    lines.addEventListener('pointerdown', this.#onGuideDown)
    lines.addEventListener('keydown', this.#onGuideKey)
    lines.addEventListener('focusout', this.#onGuideBlur)
    this.prepend(corner, top.element, left.element, canvas, layer)
    this.#parts = { corner, top, left, canvas, layer, lines, preview, label }
    return this.#parts
  }

  /** 世界坐标在画布上的屏幕位置。 */
  #toScreen(axis: DesignerGuideAxis, value: number, viewport: Viewport): number {
    return value * viewport.zoom + (axis === 'x' ? viewport.x : viewport.y)
  }

  #formatter(step: number): (value: number) => string {
    if (this.format)
      return this.format
    const decimals = step >= 1 ? 0 : Math.max(0, -Math.floor(Math.log10(step)))
    return value => (Math.abs(value) < 1e-9 ? 0 : value).toFixed(decimals)
  }

  #renderRuler(ruler: RulerParts, axis: DesignerGuideAxis, viewport: Viewport, unit: number): void {
    const length = axis === 'x' ? this.#size.width : this.#size.height
    const origin = axis === 'x' ? viewport.x : viewport.y
    const doc = this.ownerDocument
    let ticks: ReturnType<typeof rulerTicks>['ticks'] = []
    let step = 1
    if (length > 0 && viewport.zoom > 0 && unit > 0) {
      const result = rulerTicks({ start: -origin / viewport.zoom / unit, end: (length - origin) / viewport.zoom / unit, pixelsPerUnit: viewport.zoom * unit })
      ticks = result.ticks
      step = result.step
    }
    const format = this.#formatter(step)
    const pool = ruler.ticks
    while (pool.children.length > ticks.length)
      pool.lastElementChild!.remove()
    while (pool.children.length < ticks.length)
      pool.append(createGeneratedElement(doc, 'div', { 'data-part': 'tick' }, [createGeneratedElement(doc, 'span', { 'data-part': 'tick-label' })]))
    ticks.forEach((tick, index) => {
      const element = pool.children[index] as HTMLElement
      element.toggleAttribute('data-major', tick.major)
      element.style.transform = axis === 'x' ? `translateX(${tick.offset}px)` : `translateY(${tick.offset}px)`
      setText(element.firstElementChild!, tick.major ? format(tick.value) : '')
    })

    const band = this.highlight ? rotatedBounds(this.highlight) : undefined
    ruler.highlight.hidden = band === undefined
    if (band) {
      const from = this.#toScreen(axis, axis === 'x' ? band.x : band.y, viewport)
      const size = (axis === 'x' ? band.width : band.height) * viewport.zoom
      ruler.highlight.style.transform = axis === 'x' ? `translateX(${from}px)` : `translateY(${from}px)`
      ruler.highlight.style[axis === 'x' ? 'inlineSize' : 'blockSize'] = `${size}px`
    }

    const values = (this.guides ?? NO_GUIDES)[axis]
    const markers = ruler.markers
    while (markers.children.length > values.length)
      markers.lastElementChild!.remove()
    while (markers.children.length < values.length)
      markers.append(createGeneratedElement(doc, 'div', { 'data-part': 'marker' }))
    values.forEach((value, index) => {
      const at = this.#toScreen(axis, value, viewport)
      ;(markers.children[index] as HTMLElement).style.transform = axis === 'x' ? `translateX(${at}px)` : `translateY(${at}px)`
    })
  }

  #renderGuides(parts: Parts, viewport: Viewport): void {
    const guides = this.guides ?? NO_GUIDES
    const t = this.#config.translations<DesignerRulerTranslations>(TAG, DEFAULT_TRANSLATIONS, this.translations)
    const unit = this.unitSize ?? 1
    const format = this.#formatter(this.#labelStep(viewport, unit))
    const doc = this.ownerDocument
    const entries = [...guides.x.map((value, index) => ({ axis: 'x' as const, value, index })), ...guides.y.map((value, index) => ({ axis: 'y' as const, value, index }))]
    if (this.#selected && !guides[this.#selected.axis].includes(this.#selected.value))
      this.#selected = undefined
    const pool = parts.lines
    while (pool.children.length > entries.length)
      pool.lastElementChild!.remove()
    while (pool.children.length < entries.length)
      pool.append(createGeneratedElement(doc, 'div', { 'data-part': 'guide', 'role': 'separator', 'tabindex': -1 }))
    const drag = this.#drag?.active ? this.#drag : undefined
    entries.forEach(({ axis, value, index }, position) => {
      const element = pool.children[position] as HTMLElement
      element.dataset.axis = axis
      element.dataset.index = String(index)
      element.setAttribute('aria-orientation', axis === 'x' ? 'vertical' : 'horizontal')
      const text = format(value / unit)
      element.setAttribute('aria-label', axis === 'x' ? t.verticalGuide(text) : t.horizontalGuide(text))
      element.toggleAttribute('data-selected', this.#selected?.axis === axis && this.#selected.value === value)
      element.toggleAttribute('data-dragging', drag?.axis === axis && drag.index === index)
      const at = this.#toScreen(axis, value, viewport)
      element.style.transform = axis === 'x' ? `translateX(${at}px)` : `translateY(${at}px)`
    })

    const showPreview = drag !== undefined && drag.where === 'canvas' && drag.value !== undefined
    parts.preview.hidden = !showPreview
    parts.label.hidden = !showPreview
    if (showPreview) {
      const at = this.#toScreen(drag.axis, drag.value!, viewport)
      parts.preview.dataset.axis = drag.axis
      parts.preview.style.transform = drag.axis === 'x' ? `translateX(${at}px)` : `translateY(${at}px)`
      setText(parts.label, format(drag.value! / unit))
      const box = parts.canvas.getBoundingClientRect()
      parts.label.style.transform = `translate(${drag.client.x - box.left}px, ${drag.client.y - box.top}px)`
    }
  }

  #labelStep(viewport: Viewport, unit: number): number {
    if (!(viewport.zoom > 0) || !(unit > 0))
      return 1
    return rulerTicks({ start: 0, end: 0, pixelsPerUnit: viewport.zoom * unit }).step
  }

  #renderCursor(parts: Parts): void {
    const pointer = this.#pointer
    const box = parts.canvas.getBoundingClientRect()
    const x = pointer ? pointer.x - box.left : -1
    const y = pointer ? pointer.y - box.top : -1
    parts.top.cursor.hidden = !pointer || x < 0 || x > this.#size.width
    parts.left.cursor.hidden = !pointer || y < 0 || y > this.#size.height
    parts.top.cursor.style.transform = `translateX(${x}px)`
    parts.left.cursor.style.transform = `translateY(${y}px)`
  }

  /** 指针所在的世界坐标与区域：axis 为 y 时指针在画布上方即在上标尺上，为 x 时在画布左边即在左标尺上。 */
  #locate(axis: DesignerGuideAxis, client: { x: number, y: number }): { value: number, where: GuideDrag['where'] } {
    const box = this.#parts!.canvas.getBoundingClientRect()
    const viewport = this.viewport ?? DEFAULT_VIEWPORT
    const local = axis === 'x' ? client.x - box.left : client.y - box.top
    const raw = (local - (axis === 'x' ? viewport.x : viewport.y)) / viewport.zoom
    const value = this.snap ? this.snap(axis, raw) : raw
    const inside = client.x >= box.left && client.x <= box.right && client.y >= box.top && client.y <= box.bottom
    const onRuler = axis === 'x' ? client.x < box.left : client.y < box.top
    return { value, where: inside ? 'canvas' : onRuler ? 'ruler' : 'outside' }
  }

  #startDrag(event: PointerEvent, axis: DesignerGuideAxis, index: number | undefined): void {
    this.#endDrag()
    const doc = resolveSessionDoc(this)
    const start = { x: event.clientX, y: event.clientY }
    const drag: GuideDrag = {
      axis,
      index,
      session: createPointerSession({ doc, pointerId: event.pointerId, onMove: this.#onDragMove, onEnd: this.#onDragEnd }),
      start,
      active: false,
      value: undefined,
      where: 'outside',
      client: start,
    }
    this.#drag = drag
    doc?.addEventListener('keydown', this.#onDragKey, true)
  }

  #endDrag(): void {
    const drag = this.#drag
    if (!drag)
      return
    drag.session.dispose()
    this.ownerDocument.removeEventListener('keydown', this.#onDragKey, true)
    this.#drag = undefined
    delete this.dataset.gesture
    this.requestUpdate()
  }

  #emit(guides: DesignerGuides, change: DesignerGuideChange): void {
    emitEvent(this, 'guides-change', { guides, change })
  }

  #remove(axis: DesignerGuideAxis, index: number): void {
    const current = this.guides ?? NO_GUIDES
    const next = current[axis].filter((_, at) => at !== index)
    this.#selected = undefined
    this.#emit({ ...current, [axis]: next }, { type: 'remove', axis, index })
  }

  readonly #onRulerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || !event.isPrimary || this.readonly)
      return
    const ruler = event.currentTarget as HTMLElement
    event.preventDefault()
    ruler.setPointerCapture?.(event.pointerId)
    this.#startDrag(event, ruler.dataset.orientation === 'horizontal' ? 'y' : 'x', undefined)
  }

  readonly #onGuideDown = (event: PointerEvent): void => {
    const element = (event.target as Element).closest<HTMLElement>('[data-part="guide"]')
    if (!element || event.button !== 0 || !event.isPrimary || this.readonly)
      return
    const axis = element.dataset.axis as DesignerGuideAxis
    const index = Number(element.dataset.index)
    event.preventDefault()
    event.stopPropagation()
    this.#selected = { axis, value: (this.guides ?? NO_GUIDES)[axis][index]! }
    element.focus({ preventScroll: true })
    element.setPointerCapture?.(event.pointerId)
    this.#startDrag(event, axis, index)
    this.requestUpdate()
  }

  readonly #onGuideKey = (event: KeyboardEvent): void => {
    const element = (event.target as Element).closest<HTMLElement>('[data-part="guide"]')
    if (!element || this.readonly)
      return
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      this.#remove(element.dataset.axis as DesignerGuideAxis, Number(element.dataset.index))
    }
    else if (event.key === 'Escape' && this.#selected) {
      event.preventDefault()
      this.#selected = undefined
      element.blur()
      this.requestUpdate()
    }
  }

  readonly #onGuideBlur = (): void => {
    if (this.#drag)
      return
    this.#selected = undefined
    this.requestUpdate()
  }

  readonly #onDragMove = ({ point }: PointerSessionDetails): void => {
    const drag = this.#drag
    if (!drag)
      return
    drag.client = { x: point.clientX, y: point.clientY }
    if (!drag.active) {
      if (!shouldActivate({ x: drag.client.x - drag.start.x, y: drag.client.y - drag.start.y }))
        return
      drag.active = true
      this.dataset.gesture = 'guide'
    }
    const { value, where } = this.#locate(drag.axis, drag.client)
    drag.value = value
    drag.where = where
    this.requestUpdate()
  }

  readonly #onDragEnd = ({ reason, point }: PointerEndDetails): void => {
    const drag = this.#drag
    if (!drag)
      return
    this.#endDrag()
    if (reason !== 'pointerup' || !drag.active)
      return
    const { value, where } = this.#locate(drag.axis, { x: point.clientX, y: point.clientY })
    const current = this.guides ?? NO_GUIDES
    const values = current[drag.axis]
    if (drag.index === undefined) {
      if (where !== 'canvas')
        return
      this.#emit({ ...current, [drag.axis]: [...values, value] }, { type: 'add', axis: drag.axis, index: values.length })
      return
    }
    if (where === 'ruler') {
      this.#remove(drag.axis, drag.index)
      return
    }
    if (where !== 'canvas' || values[drag.index] === value)
      return
    this.#selected = { axis: drag.axis, value }
    this.#emit({ ...current, [drag.axis]: values.map((entry, at) => (at === drag.index ? value : entry)) }, { type: 'move', axis: drag.axis, index: drag.index })
  }

  readonly #onDragKey = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || !this.#drag)
      return
    event.preventDefault()
    event.stopPropagation()
    this.#endDrag()
  }

  readonly #onHover = (event: PointerEvent): void => {
    this.#pointer = { x: event.clientX, y: event.clientY }
    if (this.#parts)
      this.#renderCursor(this.#parts)
  }

  readonly #onLeave = (): void => {
    this.#pointer = undefined
    if (this.#parts)
      this.#renderCursor(this.#parts)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-ruler': XhDesignerRulerElement
  }
}
