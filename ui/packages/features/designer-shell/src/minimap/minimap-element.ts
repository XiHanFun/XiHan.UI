/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-minimap>：小地图。按比例画出设计器给的图形与当前视口的范围，按下或拖动时逐次派发 navigate，
// 由设计器把视口中心移过去。拖动期间比例与位置保持不变；没有图形时收起；整块 aria-hidden。

import type { Point, Rect, Size, Viewport } from '@xihan-ui/designer-kit'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import { fitRect, screenToWorld, unionRects, visibleWorldRect } from '@xihan-ui/designer-kit'
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'
import { BOOLEAN_CONVERTER, emitEvent, GEN_ATTR, SVG_NS, XhReactiveElement } from '@xihan-ui/web-components/authoring'

/** 小地图上的一个图形，世界坐标。 */
export type DesignerMinimapShape
  = | { readonly kind: 'rect', readonly rect: Rect, readonly tone?: 'default' | 'muted' }
    | { readonly kind: 'path', readonly d: string }

/** 小地图派发的事件。 */
export interface DesignerMinimapEventMap {
  navigate: CustomEvent<{ center: Point }>
}

/** 小地图四周留出的像素。 */
const PADDING = 6
/** 小地图能缩到的最小比例。 */
const MIN_ZOOM = 1e-4

export class XhDesignerMinimapElement extends XhReactiveElement {
  static override properties = {
    shapes: { attribute: false },
    bounds: { attribute: false },
    viewport: { attribute: false },
    canvasSize: { attribute: false },
    readonly: { converter: BOOLEAN_CONVERTER },
  }

  /** 要画的图形。 */
  declare shapes: readonly DesignerMinimapShape[] | undefined
  /** 内容范围（世界坐标），缺省取全部矩形图形的外包；路径伸出矩形之外时由设计器给出。 */
  declare bounds: Rect | undefined
  /** 画布当前的视口。 */
  declare viewport: Viewport | undefined
  /** 画布的屏幕尺寸，与 viewport 一起算出视口框；不给时不画视口框。 */
  declare canvasSize: Size | undefined
  /** 只读。小地图只做导航，只读时照常可用。 */
  declare readonly?: boolean

  #svg: SVGSVGElement | undefined
  #world: SVGGElement | undefined
  #frame: SVGRectElement | undefined
  #drawn: readonly DesignerMinimapShape[] | undefined
  #map: Viewport | undefined
  #dragging = false
  #session: { dispose: () => void } | undefined
  #resize: ResizeObserver | undefined

  constructor() {
    super()
    this.readonly = false
  }

  override connectedCallback(): void {
    super.connectedCallback()
    this.setAttribute('aria-hidden', 'true')
    this.addEventListener('pointerdown', this.#onPointerDown)
    if (typeof ResizeObserver === 'function') {
      this.#resize = new ResizeObserver(() => this.requestUpdate())
      this.#resize.observe(this)
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.removeEventListener('pointerdown', this.#onPointerDown)
    this.#resize?.disconnect()
    this.#resize = undefined
    this.#endDrag()
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const { svg, world, frame } = this.#ensureParts()
    const shapes = this.shapes ?? []
    const content = this.bounds ?? unionRects(shapes.flatMap(shape => shape.kind === 'rect' ? [shape.rect] : []))
    this.toggleAttribute('data-empty', shapes.length === 0 || !content)
    const size = { width: this.clientWidth, height: this.clientHeight }
    if (!content || size.width === 0 || size.height === 0)
      return
    const visible = this.viewport && this.canvasSize ? visibleWorldRect(this.viewport, this.canvasSize) : undefined
    if (!this.#dragging || !this.#map) {
      const fitted = unionRects(visible ? [content, visible] : [content])!
      this.#map = fitRect(fitted, size, { padding: PADDING, maxZoom: 1, limits: { min: MIN_ZOOM, max: 1 } })
    }
    const { x, y, zoom } = this.#map
    svg.setAttribute('viewBox', `0 0 ${size.width} ${size.height}`)
    world.setAttribute('transform', `translate(${x} ${y}) scale(${zoom})`)
    if (shapes !== this.#drawn) {
      this.#drawn = shapes
      this.#draw(world, shapes)
    }
    frame.style.display = visible ? '' : 'none'
    if (visible) {
      setRect(frame, {
        x: visible.x * zoom + x,
        y: visible.y * zoom + y,
        width: visible.width * zoom,
        height: visible.height * zoom,
      })
    }
  }

  #ensureParts(): { svg: SVGSVGElement, world: SVGGElement, frame: SVGRectElement } {
    if (this.#svg?.parentElement === this)
      return { svg: this.#svg, world: this.#world!, frame: this.#frame! }
    const doc = this.ownerDocument
    const svg = doc.createElementNS(SVG_NS, 'svg')
    const world = doc.createElementNS(SVG_NS, 'g')
    const frame = doc.createElementNS(SVG_NS, 'rect')
    svg.setAttribute(GEN_ATTR, '')
    svg.setAttribute('data-part', 'canvas')
    world.setAttribute('data-part', 'shapes')
    frame.setAttribute('data-part', 'frame')
    svg.append(frame, world)
    this.prepend(svg)
    this.#svg = svg
    this.#world = world
    this.#frame = frame
    this.#drawn = undefined
    return { svg, world, frame }
  }

  #draw(world: SVGGElement, shapes: readonly DesignerMinimapShape[]): void {
    const doc = this.ownerDocument
    world.replaceChildren(...shapes.map((shape) => {
      if (shape.kind === 'path') {
        const path = doc.createElementNS(SVG_NS, 'path')
        path.setAttribute('data-part', 'path')
        path.setAttribute('d', shape.d)
        return path
      }
      const rect = doc.createElementNS(SVG_NS, 'rect')
      rect.setAttribute('data-part', 'rect')
      if (shape.tone === 'muted')
        rect.setAttribute('data-tone', 'muted')
      setRect(rect, shape.rect)
      return rect
    }))
  }

  #worldAt(clientX: number, clientY: number): Point | undefined {
    if (!this.#map)
      return undefined
    const box = this.getBoundingClientRect()
    return screenToWorld(this.#map, { x: clientX - box.left, y: clientY - box.top })
  }

  #navigate(clientX: number, clientY: number): void {
    const center = this.#worldAt(clientX, clientY)
    if (center)
      emitEvent(this, 'navigate', { center })
  }

  #endDrag(): void {
    this.#session?.dispose()
    this.#session = undefined
    if (!this.#dragging)
      return
    this.#dragging = false
    this.requestUpdate()
  }

  readonly #onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || !this.#map)
      return
    event.preventDefault()
    this.#endDrag()
    this.#dragging = true
    this.#navigate(event.clientX, event.clientY)
    this.#session = createPointerSession({
      doc: resolveSessionDoc(this),
      pointerId: event.pointerId,
      onMove: ({ point }) => this.#navigate(point.clientX, point.clientY),
      onEnd: () => this.#endDrag(),
    })
  }
}

function setRect(element: SVGRectElement, rect: Rect): void {
  element.setAttribute('x', String(rect.x))
  element.setAttribute('y', String(rect.y))
  element.setAttribute('width', String(rect.width))
  element.setAttribute('height', String(rect.height))
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-minimap': XhDesignerMinimapElement
  }
}
