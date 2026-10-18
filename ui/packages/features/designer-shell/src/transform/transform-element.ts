/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-transform>：变换覆盖层。叠在画布上方，画选中框、控制柄、旋转柄、对齐线、框选框、悬停框与度量标签，
// 并跑移动、框选与控制柄的手势会话；命中判断归设计器。坐标只认 Viewport，覆盖层左上角就是视口的屏幕原点。
// 覆盖层本身不接指针，只有控制柄接；移动与框选由设计器命中后调 startMove / startMarquee 开始。
// 多选时控制柄画在整体包围框上，拖动按包围框等比缩放全部选中项。
// 写 slot="toolbar" 的子节点是上下文工具条：浮在选中框上方，贴顶放不下时翻到下方，手势中收起；
// focusToolbar() 把焦点交给它，在工具条里按 Esc 回到交之前的位置。画的框与控制柄都是 aria-hidden，工具条不是。

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
import { BOOLEAN_CONVERTER, createGeneratedElement, emitEvent, setText, XhReactiveElement } from '@xihan-ui/web-components/authoring'

/** 一个选中项与它能做的变换。 */
export interface DesignerTransformItem {
  readonly id: string
  /** 世界坐标，可带旋转角。 */
  readonly rect: Rect
  /** 缩放控制柄：true 为八向（缺省），false 为不能缩放，数组为只给这些方向；多选时每一项都是八向才出整体控制柄。 */
  readonly handles?: readonly ResizeHandle[] | boolean
  /** 显示旋转柄，缺省不显示。 */
  readonly rotatable?: boolean
  /** 缩放时总是保持宽高比；没开时按住 Shift 也保持。 */
  readonly keepAspect?: boolean
  /** 缩放的最小尺寸，世界单位；多选整体缩放时任一项缩到它即停。 */
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
/** 上下文工具条离选中框与覆盖层边缘的屏幕距离。 */
const TOOLBAR_GAP = 8
/** 工具条里先取 roving 的当前条目，再取第一个能聚焦的。 */
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

/** 出控制柄的框与可用的方向。 */
interface HandleTarget {
  readonly rect: Rect
  readonly allowed: ReadonlySet<ResizeHandle | 'rotate'>
}

interface Parts {
  readonly hover: HTMLElement
  readonly frames: HTMLElement
  readonly bounds: HTMLElement
  readonly guides: HTMLElement
  readonly marquee: HTMLElement
  readonly handles: ReadonlyMap<ResizeHandle | 'rotate', HTMLElement>
  readonly measure: HTMLElement
  readonly toolbar: HTMLElement
}

export class XhDesignerTransformElement extends XhReactiveElement {
  static override properties = {
    viewport: { attribute: false },
    items: { attribute: false },
    hover: { attribute: false },
    getSnap: { attribute: false },
    formatMeasure: { attribute: false },
    rotateStep: { type: Number, attribute: 'rotate-step' },
    readonly: { converter: BOOLEAN_CONVERTER },
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
  declare readonly?: boolean

  #parts: Parts | undefined
  #gesture: Gesture | undefined
  #childObserver: MutationObserver | undefined
  /** focusToolbar 之前焦点所在的元素，Esc 时还回去。 */
  #returnFocus: HTMLElement | undefined

  constructor() {
    super()
    this.readonly = false
  }

  override connectedCallback(): void {
    super.connectedCallback()
    // 后来放进来的工具条内容要挪进工具条部件
    this.#childObserver ??= new MutationObserver(() => this.requestUpdate())
    this.#childObserver.observe(this, { childList: true })
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.#childObserver?.disconnect()
    this.cancel()
  }

  /**
   * 把焦点交给上下文工具条，各款在画布的 Alt+F10 里调用：先交给工具条里 roving 的当前条目，没有就交给第一个能聚焦的。
   * 工具条没显示或里面没有能聚焦的时什么都不做。返回是否交了。在工具条里按 Esc，焦点回到交之前的位置。
   */
  focusToolbar(): boolean {
    const toolbar = this.#parts?.toolbar
    if (!toolbar || toolbar.hidden)
      return false
    const target = toolbar.querySelector<HTMLElement>('[tabindex="0"]') ?? toolbar.querySelector<HTMLElement>(FOCUSABLE)
    if (!target)
      return false
    const active = this.ownerDocument.activeElement
    this.#returnFocus = active instanceof HTMLElement && !toolbar.contains(active) ? active : undefined
    target.focus()
    return true
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
    const target = this.readonly ? undefined : handleTargetOf(items, rects)
    this.#placeHandles(parts.handles, target, viewport, gesture)
    this.#placeMeasure(parts.measure, gesture && gesture.kind !== 'marquee' ? unionRects(rects.map(rotatedBounds)) : undefined, viewport)
    this.#adoptToolbar(parts.toolbar)
    const toolbarFor = gesture || this.readonly || rects.length === 0 ? undefined : unionRects(rects.map(rotatedBounds))
    this.#placeToolbar(parts.toolbar, toolbarFor, viewport, target?.allowed.has('rotate') === true)
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
    for (const decorative of [hover, frames, bounds, guides, marquee, ...handles.values(), measure])
      decorative.setAttribute('aria-hidden', 'true')
    const toolbar = createGeneratedElement(doc, 'div', { 'data-part': 'toolbar', 'hidden': true })
    toolbar.addEventListener('keydown', this.#onToolbarKey)
    this.#adoptToolbar(toolbar)
    this.replaceChildren(hover, frames, bounds, guides, marquee, ...handles.values(), measure, toolbar)
    this.#parts = { hover, frames, bounds, guides, marquee, handles, measure, toolbar }
    return this.#parts
  }

  /** 把写 slot="toolbar" 的子节点挪进工具条部件。 */
  #adoptToolbar(toolbar: HTMLElement): void {
    for (const child of Array.from(this.children)) {
      if (child.getAttribute('slot') === 'toolbar')
        toolbar.append(child)
    }
  }

  /**
   * 上下文工具条：在选中框（整体包围框）上方居中，有旋转柄时让开它；上方放不下时翻到下方；左右夹在覆盖层里。
   * 没有选中、只读、手势中或没有内容时收起。落在哪一侧写在 data-placement 上。
   */
  #placeToolbar(element: HTMLElement, bounds: Rect | undefined, viewport: Viewport, rotate: boolean): void {
    const shown = bounds !== undefined && element.childElementCount > 0
    element.hidden = !shown
    if (!shown) {
      delete element.dataset.placement
      return
    }
    const start = worldToScreen(viewport, { x: bounds.x, y: bounds.y })
    const end = worldToScreen(viewport, { x: bounds.x + bounds.width, y: bounds.y + bounds.height })
    const box = element.getBoundingClientRect()
    const above = start.y - (rotate ? ROTATE_OFFSET : 0) - TOOLBAR_GAP - box.height
    const placement = above >= TOOLBAR_GAP ? 'top' : 'bottom'
    const y = placement === 'top' ? above : end.y + TOOLBAR_GAP
    const x = Math.min(Math.max((start.x + end.x - box.width) / 2, TOOLBAR_GAP), Math.max(TOOLBAR_GAP, this.clientWidth - box.width - TOOLBAR_GAP))
    element.dataset.placement = placement
    element.style.transform = `translate(${x}px, ${y}px)`
  }

  /** 工具条里按 Esc：焦点回到 focusToolbar 之前的位置。 */
  readonly #onToolbarKey = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || !this.#returnFocus?.isConnected)
      return
    event.preventDefault()
    event.stopPropagation()
    const back = this.#returnFocus
    this.#returnFocus = undefined
    back.focus()
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

  #placeHandles(handles: ReadonlyMap<ResizeHandle | 'rotate', HTMLElement>, target: HandleTarget | undefined, viewport: Viewport, gesture: Gesture | undefined): void {
    const points = target ? handlePoints(target.rect, ROTATE_OFFSET / viewport.zoom) : undefined
    const rotation = target?.rect.rotation ?? 0
    for (const [handle, element] of handles) {
      const shown = points !== undefined && target!.allowed.has(handle) && (!gesture || gesture.handle === handle || gesture.kind === 'move')
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

  /** 单选按该项缩放；多选按整体包围框等比缩放，再把每一项按同一比例换算。 */
  #stepResize(gesture: Gesture, world: Point): void {
    const starts = [...gesture.startRects]
    const group = starts.length > 1
    const [id, first] = starts[0]!
    const item = group ? undefined : (this.items ?? []).find(entry => entry.id === id)
    const start = group ? unionRects(starts.map(([, rect]) => rotatedBounds(rect)))! : first
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
    const floor = group ? scaleFloorOf(this.items ?? [], gesture.startRects) : 0
    const rect = resizeWithHandle(start, handle, pointer, group
      ? { keepAspect: true, fromCenter: gesture.alt, minWidth: start.width * floor, minHeight: start.height * floor }
      : { keepAspect: item?.keepAspect === true || gesture.shift, fromCenter: gesture.alt, minWidth: item?.minSize?.width, minHeight: item?.minSize?.height })
    gesture.rects = group ? scaleRects(gesture.startRects, start, rect) : new Map([[id, rect]])
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
    if (event.button !== 0 || !event.isPrimary || this.readonly || (this.items ?? []).length === 0)
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

/** 单选取该项的框与能力；多选在每一项都能八向缩放时取整体包围框的八个方向，不出旋转柄。 */
function handleTargetOf(items: readonly DesignerTransformItem[], rects: readonly Rect[]): HandleTarget | undefined {
  if (items.length === 1) {
    const allowed = new Set<ResizeHandle | 'rotate'>(resizeHandlesOf(items[0]!))
    if (items[0]!.rotatable)
      allowed.add('rotate')
    return { rect: rects[0]!, allowed }
  }
  const all = items.length > 1 && items.every(item => ALL_HANDLES.every(handle => resizeHandlesOf(item).includes(handle)))
  const bounds = all ? unionRects(rects.map(rotatedBounds)) : undefined
  return bounds && { rect: bounds, allowed: new Set(ALL_HANDLES) }
}

/** 多选整体缩放的最小比例：任一项缩到它的 minSize 即停。 */
function scaleFloorOf(items: readonly DesignerTransformItem[], rects: ReadonlyMap<string, Rect>): number {
  let floor = 0
  for (const item of items) {
    const rect = rects.get(item.id)
    if (!rect || !item.minSize)
      continue
    if (rect.width > 0)
      floor = Math.max(floor, item.minSize.width / rect.width)
    if (rect.height > 0)
      floor = Math.max(floor, item.minSize.height / rect.height)
  }
  return floor
}

/** 把每个矩形按 from → to 换算：相对 from 左上角的位置与尺寸乘同一比例，旋转角不变。 */
function scaleRects(rects: ReadonlyMap<string, Rect>, from: Rect, to: Rect): Map<string, Rect> {
  const sx = from.width > 0 ? to.width / from.width : 1
  const sy = from.height > 0 ? to.height / from.height : 1
  return new Map([...rects].map(([id, rect]) => [id, {
    ...rect,
    x: to.x + (rect.x - from.x) * sx,
    y: to.y + (rect.y - from.y) * sy,
    width: rect.width * sx,
    height: rect.height * sy,
  }]))
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
