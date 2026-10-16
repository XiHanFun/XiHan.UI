/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-transform>：变换覆盖层。叠在画布上方，画选中框、控制柄、旋转柄、对齐线、框选框、悬停框与度量标签，
// 并跑移动、框选与控制柄的手势会话；命中判断归设计器。坐标只认 Viewport，覆盖层左上角就是视口的屏幕原点。
// 覆盖层本身不接指针，只有控制柄接；移动与框选由设计器命中后调 startMove / startMarquee 开始。

import type { MarqueeMode, Point, Rect, ResizeHandle, Size, SnapGuide, SnapOptions, Viewport } from '@xihan-ui/designer-kit'
import type { PointerEndDetails, PointerSession, PointerSessionDetails } from '@xihan-ui/pointer'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { PanRequestDetail } from '../drag/drag'
import {
  handlePoints,
  marqueeModeFromDrag,
  marqueeRect,
  rectCenter,
  resizeWithHandle,
  rotatedBounds,
  rotateWithHandle,
  screenToWorld,
  snapRect,
  unionRects,
  worldToScreen,
} from '@xihan-ui/designer-kit'
import { createPointerSession, edgeScrollDelta, resolveSessionDoc, shouldActivate } from '@xihan-ui/pointer'
import { createGeneratedElement, emitEvent, setText, XhReactiveElement } from '@xihan-ui/web-components/authoring'

/** 一个选中项与它能做的变换。 */
export interface DesignerTransformItem {
  readonly id: string
  /** 世界坐标，可带旋转角。 */
  readonly rect: Rect
  /** 缩放控制柄：true 为八向（缺省），false 为不能缩放，数组为只给这些方向。 */
  readonly handles?: readonly ResizeHandle[] | boolean
  /** 显示旋转柄，缺省不显示。 */
  readonly rotatable?: boolean
  /** 缩放时总是保持宽高比；没开时按住 Shift 也保持。 */
  readonly keepAspect?: boolean
  /** 缩放的最小尺寸，世界单位。 */
  readonly minSize?: Size
}

/** 手势的种类。 */
export type DesignerTransformKind = 'move' | 'resize' | 'rotate'

/** 手势的阶段。 */
export type DesignerGesturePhase = 'start' | 'move' | 'end' | 'cancel'

/** 吸附选项；threshold 不给时取屏幕上的固定像素除以 zoom。 */
export type DesignerSnapOptions = Omit<SnapOptions, 'threshold'> & { readonly threshold?: number }

/** 变换覆盖层派发的事件。 */
export interface DesignerTransformEventMap {
  'transform': CustomEvent<{
    phase: DesignerGesturePhase
    kind: DesignerTransformKind
    rects: ReadonlyMap<string, Rect>
    guides: readonly SnapGuide[]
    copy?: boolean
  }>
  'marquee': CustomEvent<{ phase: DesignerGesturePhase, rect: Rect, mode: MarqueeMode, additive: boolean }>
  'pan-request': CustomEvent<PanRequestDetail>
}

const ALL_HANDLES: readonly ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
/** 各控制柄朝外的方向角（度），n 为 0、顺时针。 */
const HANDLE_ANGLES: Readonly<Record<ResizeHandle, number>> = { n: 0, ne: 45, e: 90, se: 135, s: 180, sw: 225, w: 270, nw: 315 }
/** 旋转柄离上边的屏幕距离。 */
const ROTATE_OFFSET = 24
/** 吸附的屏幕距离。 */
const SNAP_DISTANCE = 6
const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 }

interface Gesture {
  readonly kind: DesignerTransformKind | 'marquee'
  readonly session: PointerSession
  readonly pointerId: number
  readonly startClient: Point
  /** 起点的世界坐标，按开始时的视口算。 */
  readonly startWorld: Point
  readonly startRects: ReadonlyMap<string, Rect>
  readonly snap: SnapOptions | undefined
  readonly handle?: ResizeHandle | 'rotate'
  readonly additive?: boolean
  readonly forceCopy?: boolean
  active: boolean
  client: Point
  shift: boolean
  alt: boolean
  rects: ReadonlyMap<string, Rect>
  guides: readonly SnapGuide[]
  marquee?: Rect
  frame: number
}

interface Parts {
  readonly hover: HTMLElement
  readonly frames: HTMLElement
  readonly bounds: HTMLElement
  readonly guides: HTMLElement
  readonly marquee: HTMLElement
  readonly handles: ReadonlyMap<ResizeHandle | 'rotate', HTMLElement>
  readonly measure: HTMLElement
}

export class XhDesignerTransformElement extends XhReactiveElement {
  static override properties = {
    viewport: { attribute: false },
    items: { attribute: false },
    hover: { attribute: false },
    getSnap: { attribute: false },
    formatMeasure: { attribute: false },
    rotateStep: { type: Number, attribute: 'rotate-step' },
    readonly: { type: Boolean },
  }

  /** 画布的视口。 */
  declare viewport: Viewport | undefined
  /** 当前选中项。 */
  declare items: readonly DesignerTransformItem[] | undefined
  /** 悬停框，世界坐标。 */
  declare hover: Rect | undefined
  /** 每次手势开始时取一次吸附选项；返回 undefined 不吸附。 */
  declare getSnap: ((kind: 'move' | 'resize') => DesignerSnapOptions | undefined) | undefined
  /** 拖动中的尺寸与位置标签；不给不显示。 */
  declare formatMeasure: ((rect: Rect) => string) | undefined
  /** 按住 Shift 旋转时吸附的角度，缺省 15。 */
  declare rotateStep: number | undefined
  /** 只读：不画控制柄，startMove 不起作用；框选照常。 */
  declare readonly: boolean

  #parts: Parts | undefined
  #gesture: Gesture | undefined

  constructor() {
    super()
    this.readonly = false
  }

  override connectedCallback(): void {
    super.connectedCallback()
    this.setAttribute('aria-hidden', 'true')
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.cancel()
  }

  /** 设计器在选中项上按下后调用：越过激活距离开始移动全部选中项；按住 Alt 或 copy 为真时事件带 copy。 */
  startMove(event: PointerEvent, options: { readonly copy?: boolean } = {}): void {
    if (this.readonly || (this.items ?? []).length === 0)
      return
    this.#begin('move', event, { forceCopy: options.copy === true, snap: this.#snapOptions('move') })
  }

  /** 设计器在空白处按下后调用：越过激活距离开始框选；additive 原样带在 marquee 事件里。 */
  startMarquee(event: PointerEvent, options: { readonly additive?: boolean } = {}): void {
    this.#begin('marquee', event, { additive: options.additive === true })
  }

  /** 取消进行中的手势，派发 cancel。 */
  cancel(): void {
    const gesture = this.#gesture
    if (!gesture)
      return
    this.#end(gesture)
    if (!gesture.active)
      return
    if (gesture.kind === 'marquee')
      this.#emitMarquee(gesture, 'cancel')
    else
      this.#emitTransform(gesture, 'cancel', gesture.startRects, [])
    this.requestUpdate()
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    const viewport = this.viewport ?? DEFAULT_VIEWPORT
    const gesture = this.#gesture?.active ? this.#gesture : undefined
    if (gesture)
      this.dataset.gesture = gesture.kind
    else
      delete this.dataset.gesture

    const items = this.items ?? []
    const rects = gesture && gesture.kind !== 'marquee' ? items.map(item => gesture.rects.get(item.id) ?? item.rect) : items.map(item => item.rect)
    this.#placeBox(parts.hover, gesture ? undefined : this.hover, viewport)
    this.#placeFrames(parts.frames, rects, viewport)
    this.#placeBox(parts.bounds, rects.length > 1 ? unionRects(rects.map(rotatedBounds)) : undefined, viewport)
    this.#placeGuides(parts.guides, gesture?.guides ?? [], viewport)
    this.#placeBox(parts.marquee, gesture?.marquee, viewport)
    this.#placeHandles(parts.handles, items.length === 1 && !this.readonly ? items[0]! : undefined, rects[0], viewport, gesture)
    this.#placeMeasure(parts.measure, gesture && gesture.kind !== 'marquee' ? unionRects(rects.map(rotatedBounds)) : undefined, viewport)
  }

  #ensureParts(): Parts {
    if (this.#parts?.frames.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const hover = createGeneratedElement(doc, 'div', { 'data-part': 'hover', 'hidden': true })
    const frames = createGeneratedElement(doc, 'div', { 'data-part': 'frames' })
    const bounds = createGeneratedElement(doc, 'div', { 'data-part': 'bounds', 'hidden': true })
    const guides = createGeneratedElement(doc, 'div', { 'data-part': 'guides' })
    const marquee = createGeneratedElement(doc, 'div', { 'data-part': 'marquee', 'hidden': true })
    const handles = new Map<ResizeHandle | 'rotate', HTMLElement>()
    for (const handle of [...ALL_HANDLES, 'rotate'] as const) {
      const element = createGeneratedElement(doc, 'div', { 'data-part': 'handle', 'data-handle': handle, 'hidden': true })
      element.addEventListener('pointerdown', this.#onHandleDown)
      handles.set(handle, element)
    }
    const measure = createGeneratedElement(doc, 'div', { 'data-part': 'measure', 'hidden': true })
    this.replaceChildren(hover, frames, bounds, guides, marquee, ...handles.values(), measure)
    this.#parts = { hover, frames, bounds, guides, marquee, handles, measure }
    return this.#parts
  }

  /** 按世界矩形（可带旋转）摆放一块：尺寸按 zoom 换成屏幕像素，绕中心旋转。 */
  #placeBox(element: HTMLElement, rect: Rect | undefined, viewport: Viewport): void {
    element.hidden = rect === undefined
    if (!rect)
      return
    const width = rect.width * viewport.zoom
    const height = rect.height * viewport.zoom
    const center = worldToScreen(viewport, rectCenter(rect))
    element.style.inlineSize = `${width}px`
    element.style.blockSize = `${height}px`
    element.style.transform = `translate(${center.x - width / 2}px, ${center.y - height / 2}px) rotate(${rect.rotation ?? 0}deg)`
  }

  #placeFrames(container: HTMLElement, rects: readonly Rect[], viewport: Viewport): void {
    while (container.children.length > rects.length)
      container.lastElementChild!.remove()
    while (container.children.length < rects.length)
      container.append(createGeneratedElement(this.ownerDocument, 'div', { 'data-part': 'frame' }))
    rects.forEach((rect, index) => this.#placeBox(container.children[index] as HTMLElement, rect, viewport))
  }

  #placeGuides(container: HTMLElement, guides: readonly SnapGuide[], viewport: Viewport): void {
    while (container.children.length > guides.length)
      container.lastElementChild!.remove()
    while (container.children.length < guides.length)
      container.append(createGeneratedElement(this.ownerDocument, 'div', { 'data-part': 'guide' }))
    guides.forEach((guide, index) => {
      const element = container.children[index] as HTMLElement
      element.dataset.axis = guide.axis
      const start = worldToScreen(viewport, guide.axis === 'x' ? { x: guide.position, y: guide.from } : { x: guide.from, y: guide.position })
      const length = (guide.to - guide.from) * viewport.zoom
      element.style.inlineSize = guide.axis === 'x' ? '' : `${length}px`
      element.style.blockSize = guide.axis === 'x' ? `${length}px` : ''
      element.style.transform = `translate(${start.x}px, ${start.y}px)`
    })
  }

  #placeHandles(handles: ReadonlyMap<ResizeHandle | 'rotate', HTMLElement>, item: DesignerTransformItem | undefined, rect: Rect | undefined, viewport: Viewport, gesture: Gesture | undefined): void {
    const allowed = new Set<ResizeHandle | 'rotate'>(item ? resizeHandlesOf(item) : [])
    if (item?.rotatable)
      allowed.add('rotate')
    const points = item && rect ? handlePoints(rect, ROTATE_OFFSET / viewport.zoom) : undefined
    const rotation = rect?.rotation ?? 0
    for (const [handle, element] of handles) {
      const shown = points !== undefined && allowed.has(handle) && (!gesture || gesture.handle === handle || gesture.kind === 'move')
      element.hidden = !shown
      if (!shown)
        continue
      const at = worldToScreen(viewport, points[handle])
      element.style.transform = `translate(${at.x}px, ${at.y}px) translate(-50%, -50%) rotate(${rotation}deg)`
      if (handle !== 'rotate')
        element.dataset.cursor = cursorOf(HANDLE_ANGLES[handle] + rotation)
    }
  }

  #placeMeasure(element: HTMLElement, bounds: Rect | undefined, viewport: Viewport): void {
    const text = bounds && this.formatMeasure ? this.formatMeasure(bounds) : undefined
    element.hidden = text === undefined
    if (!bounds || text === undefined)
      return
    setText(element, text)
    const at = worldToScreen(viewport, { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height })
    element.style.transform = `translate(${at.x}px, ${at.y}px) translate(-50%, 0)`
  }

  #snapOptions(kind: 'move' | 'resize'): SnapOptions | undefined {
    const options = this.getSnap?.(kind)
    if (!options)
      return undefined
    return { ...options, threshold: options.threshold ?? SNAP_DISTANCE / (this.viewport ?? DEFAULT_VIEWPORT).zoom }
  }

  #local(client: Point): Point {
    const box = this.getBoundingClientRect()
    return { x: client.x - box.left, y: client.y - box.top }
  }

  #world(client: Point): Point {
    return screenToWorld(this.viewport ?? DEFAULT_VIEWPORT, this.#local(client))
  }

  #begin(kind: Gesture['kind'], event: PointerEvent, options: { snap?: SnapOptions, handle?: ResizeHandle | 'rotate', additive?: boolean, forceCopy?: boolean }): void {
    this.cancel()
    const doc = resolveSessionDoc(this)
    const client = { x: event.clientX, y: event.clientY }
    const startRects = new Map((this.items ?? []).map(item => [item.id, item.rect]))
    const gesture: Gesture = {
      kind,
      session: createPointerSession({ doc, pointerId: event.pointerId, onMove: this.#onMove, onEnd: this.#onEnd }),
      pointerId: event.pointerId,
      startClient: client,
      startWorld: this.#world(client),
      startRects,
      snap: options.snap,
      handle: options.handle,
      additive: options.additive,
      forceCopy: options.forceCopy,
      active: false,
      client,
      shift: event.shiftKey,
      alt: event.altKey,
      rects: startRects,
      guides: [],
      frame: 0,
    }
    this.#gesture = gesture
    doc?.addEventListener('keydown', this.#onKey, true)
    doc?.addEventListener('keyup', this.#onKey, true)
  }

  #end(gesture: Gesture): void {
    gesture.session.dispose()
    const view = this.ownerDocument.defaultView
    if (gesture.frame !== 0)
      view?.cancelAnimationFrame(gesture.frame)
    this.ownerDocument.removeEventListener('keydown', this.#onKey, true)
    this.ownerDocument.removeEventListener('keyup', this.#onKey, true)
    if (this.#gesture === gesture)
      this.#gesture = undefined
  }

  /** 按指针当前位置与修饰键算一帧，派发 move。 */
  #step(gesture: Gesture): void {
    const world = this.#world(gesture.client)
    if (gesture.kind === 'marquee') {
      gesture.marquee = marqueeRect(gesture.startWorld, world)
      this.#emitMarquee(gesture, 'move')
    }
    else if (gesture.kind === 'move') {
      this.#stepMove(gesture, world)
      this.#emitTransform(gesture, 'move', gesture.rects, gesture.guides)
    }
    else if (gesture.kind === 'rotate') {
      const [id, start] = [...gesture.startRects][0]!
      const rotation = rotateWithHandle(start, world, { step: gesture.shift ? (this.rotateStep ?? 15) : undefined })
      gesture.rects = new Map([[id, { ...start, rotation }]])
      this.#emitTransform(gesture, 'move', gesture.rects, [])
    }
    else {
      this.#stepResize(gesture, world)
      this.#emitTransform(gesture, 'move', gesture.rects, gesture.guides)
    }
    this.requestUpdate()
    this.#schedulePan(gesture)
  }

  #stepMove(gesture: Gesture, world: Point): void {
    let dx = world.x - gesture.startWorld.x
    let dy = world.y - gesture.startWorld.y
    if (gesture.shift) {
      if (Math.abs(dx) >= Math.abs(dy))
        dy = 0
      else
        dx = 0
    }
    let guides: readonly SnapGuide[] = []
    const bounds = unionRects([...gesture.startRects.values()].map(rotatedBounds))
    if (gesture.snap && bounds) {
      const snapped = snapRect({ ...bounds, x: bounds.x + dx, y: bounds.y + dy }, {
        ...gesture.snap,
        x: gesture.snap.x !== false && !(gesture.shift && dx === 0),
        y: gesture.snap.y !== false && !(gesture.shift && dy === 0),
      })
      dx += snapped.dx
      dy += snapped.dy
      guides = snapped.guides
    }
    gesture.rects = new Map([...gesture.startRects].map(([id, rect]) => [id, { ...rect, x: rect.x + dx, y: rect.y + dy }]))
    gesture.guides = guides
  }

  #stepResize(gesture: Gesture, world: Point): void {
    const [id, start] = [...gesture.startRects][0]!
    const item = (this.items ?? []).find(entry => entry.id === id)
    const handle = gesture.handle as ResizeHandle
    let pointer = world
    let guides: readonly SnapGuide[] = []
    if (gesture.snap && !(start.rotation ?? 0)) {
      const horizontal = handle.includes('e') || handle.includes('w')
      const vertical = handle.includes('n') || handle.includes('s')
      const snapped = snapRect({ x: pointer.x, y: pointer.y, width: 0, height: 0 }, {
        ...gesture.snap,
        x: gesture.snap.x !== false && horizontal,
        y: gesture.snap.y !== false && vertical,
      })
      pointer = { x: pointer.x + snapped.dx, y: pointer.y + snapped.dy }
      guides = snapped.guides
    }
    const rect = resizeWithHandle(start, handle, pointer, {
      keepAspect: item?.keepAspect === true || gesture.shift,
      fromCenter: gesture.alt,
      minWidth: item?.minSize?.width,
      minHeight: item?.minSize?.height,
    })
    gesture.rects = new Map([[id, rect]])
    gesture.guides = guides.map(guide => guide.axis === 'x'
      ? { ...guide, from: Math.min(guide.from, rect.y), to: Math.max(guide.to, rect.y + rect.height) }
      : { ...guide, from: Math.min(guide.from, rect.x), to: Math.max(guide.to, rect.x + rect.width) })
  }

  #schedulePan(gesture: Gesture): void {
    const view = this.ownerDocument.defaultView
    if (!view || gesture.frame !== 0 || !gesture.active)
      return
    const delta = this.#panDelta(gesture)
    if (delta.x === 0 && delta.y === 0)
      return
    gesture.frame = view.requestAnimationFrame(() => {
      gesture.frame = 0
      if (this.#gesture !== gesture || !gesture.active)
        return
      const next = this.#panDelta(gesture)
      if (next.x === 0 && next.y === 0)
        return
      emitEvent(this, 'pan-request', { dx: next.x, dy: next.y } satisfies PanRequestDetail)
      this.#step(gesture)
    })
  }

  #panDelta(gesture: Gesture): Point {
    const box = this.getBoundingClientRect()
    return edgeScrollDelta({ bounds: { x: box.left, y: box.top, width: box.width, height: box.height }, point: gesture.client })
  }

  #copyOf(gesture: Gesture): boolean | undefined {
    return gesture.kind === 'move' ? gesture.forceCopy === true || gesture.alt : undefined
  }

  #emitTransform(gesture: Gesture, phase: DesignerGesturePhase, rects: ReadonlyMap<string, Rect>, guides: readonly SnapGuide[]): void {
    const kind = gesture.kind as DesignerTransformKind
    const copy = this.#copyOf(gesture)
    emitEvent(this, 'transform', copy === undefined ? { phase, kind, rects, guides } : { phase, kind, rects, guides, copy })
  }

  #emitMarquee(gesture: Gesture, phase: DesignerGesturePhase): void {
    const current = this.#world(gesture.client)
    const rect = gesture.marquee ?? marqueeRect(gesture.startWorld, current)
    emitEvent(this, 'marquee', { phase, rect, mode: marqueeModeFromDrag(gesture.startWorld, current), additive: gesture.additive === true })
  }

  readonly #onHandleDown = (event: PointerEvent): void => {
    const element = event.currentTarget as HTMLElement
    const handle = element.dataset.handle as ResizeHandle | 'rotate'
    if (event.button !== 0 || !event.isPrimary || this.readonly || (this.items ?? []).length !== 1)
      return
    event.preventDefault()
    event.stopPropagation()
    element.setPointerCapture?.(event.pointerId)
    this.#begin(handle === 'rotate' ? 'rotate' : 'resize', event, { handle, snap: handle === 'rotate' ? undefined : this.#snapOptions('resize') })
  }

  readonly #onMove = ({ point, event }: PointerSessionDetails): void => {
    const gesture = this.#gesture
    if (!gesture)
      return
    gesture.client = { x: point.clientX, y: point.clientY }
    gesture.shift = event.shiftKey
    gesture.alt = event.altKey
    if (!gesture.active) {
      if (!shouldActivate({ x: gesture.client.x - gesture.startClient.x, y: gesture.client.y - gesture.startClient.y }))
        return
      gesture.active = true
      if (gesture.kind === 'marquee')
        this.#emitMarquee(gesture, 'start')
      else
        this.#emitTransform(gesture, 'start', gesture.startRects, [])
    }
    this.#step(gesture)
  }

  readonly #onEnd = ({ reason, point, event }: PointerEndDetails): void => {
    const gesture = this.#gesture
    if (!gesture)
      return
    if (reason !== 'pointerup' || !gesture.active) {
      this.cancel()
      return
    }
    gesture.client = { x: point.clientX, y: point.clientY }
    gesture.shift = event.shiftKey
    gesture.alt = event.altKey
    this.#step(gesture)
    this.#end(gesture)
    if (gesture.kind === 'marquee')
      this.#emitMarquee(gesture, 'end')
    else
      this.#emitTransform(gesture, 'end', gesture.rects, [])
    this.requestUpdate()
  }

  readonly #onKey = (event: KeyboardEvent): void => {
    const gesture = this.#gesture
    if (!gesture)
      return
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      this.cancel()
      return
    }
    if (event.key !== 'Shift' && event.key !== 'Alt')
      return
    gesture.shift = event.shiftKey
    gesture.alt = event.altKey
    if (event.key === 'Alt')
      event.preventDefault()
    if (gesture.active)
      this.#step(gesture)
  }
}

function resizeHandlesOf(item: DesignerTransformItem): readonly ResizeHandle[] {
  if (item.handles === false)
    return []
  return item.handles === undefined || item.handles === true ? ALL_HANDLES : item.handles
}

/** 控制柄朝外的方向角对应的缩放指针。 */
function cursorOf(degrees: number): 'ns' | 'nesw' | 'ew' | 'nwse' {
  const angle = ((degrees % 180) + 180) % 180
  if (angle < 22.5 || angle >= 157.5)
    return 'ns'
  if (angle < 67.5)
    return 'nesw'
  if (angle < 112.5)
    return 'ew'
  return 'nwse'
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-transform': XhDesignerTransformElement
  }
}
