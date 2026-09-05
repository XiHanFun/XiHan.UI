import type { PositionStrategy } from '@xihan-ui/core'
import type { PositionBox, PositionEdges } from './compute'

/**
 * 与浏览器打交道的那一层：找包含块、量缩放、算裁剪区域、在坐标系之间换算。
 * 这里是自研定位引擎里唯一需要真实布局才能验证的部分。
 */

/** 包含块的坐标系。视口坐标除以 scale、减去 origin、加上滚动量，就落进它的布局坐标。 */
export interface PositionFrame {
  /** 包含块内边距盒左上角的视口坐标。 */
  originX: number
  originY: number
  /** 包含块被祖先缩放的比例。 */
  scaleX: number
  scaleY: number
  /** 包含块自身的滚动量。 */
  scrollX: number
  scrollY: number
}

export function getWindow(node: Node | null | undefined): Window & typeof globalThis {
  const doc = node?.ownerDocument ?? (node as Document | null)
  return (doc?.defaultView ?? window) as Window & typeof globalThis
}

export function isHtmlElement(value: unknown): value is HTMLElement {
  return value != null && typeof value === 'object' && (value as Node).nodeType === 1
}

function styleOf(el: Element): CSSStyleDeclaration {
  return getWindow(el).getComputedStyle(el)
}

/**
 * 元素被祖先缩放了多少。取视觉矩形与布局尺寸之比。
 * 尺寸为 0（量不出比例）或算出非有限值时按不缩放处理。旋转不在支持范围内。
 */
export function scaleOf(el: HTMLElement): { x: number, y: number } {
  const rect = el.getBoundingClientRect()
  const x = el.offsetWidth > 0 ? rect.width / el.offsetWidth : 1
  const y = el.offsetHeight > 0 ? rect.height / el.offsetHeight : 1
  return {
    x: Number.isFinite(x) && x > 0 ? x : 1,
    y: Number.isFinite(y) && y > 0 ? y : 1,
  }
}

/** 未设置的属性在部分无头 DOM 实现里回空串而不是 none，两者一并当没设。 */
function isNone(value: string): boolean {
  return !value || value === 'none'
}

/**
 * 这个元素会不会连固定定位后代的包含块也抢过去。
 * transform 与 translate / rotate / scale 三个独立属性、perspective、filter、backdrop-filter、
 * container-type、contain、will-change 对 fixed 与 absolute 一视同仁，
 * 只有 position 本身不算——fixed 不认祖先的 relative。
 */
function capturesFixed(style: CSSStyleDeclaration): boolean {
  if (!isNone(style.transform) || !isNone(style.translate) || !isNone(style.rotate) || !isNone(style.scale))
    return true
  if (!isNone(style.perspective) || !isNone(style.filter) || !isNone(style.backdropFilter))
    return true
  if (style.containerType && style.containerType !== 'normal')
    return true
  if (/paint|layout|strict|content/.test(style.contain))
    return true
  return /transform|translate|rotate|scale|perspective|backdrop-filter|filter|contain/.test(style.willChange)
}

/**
 * 这个元素会不会成为绝对定位后代的包含块。
 * 判据是 capturesFixed 再加一条任何非 static 的定位；其余属性对两种策略的效果一致。
 */
function establishesContainingBlock(style: CSSStyleDeclaration): boolean {
  return (style.position !== '' && style.position !== 'static') || capturesFixed(style)
}

/**
 * 浮层以谁为原点。返回 null 表示以初始包含块为准（absolute 是文档、fixed 是视口）。
 * @param el 浮层元素。
 * @param strategy 默认 absolute。
 */
export function getContainingBlock(el: HTMLElement, strategy: PositionStrategy = 'absolute'): HTMLElement | null {
  const captures = strategy === 'fixed' ? capturesFixed : establishesContainingBlock
  const root = el.ownerDocument.documentElement
  let node = el.parentElement
  while (node && node !== root) {
    if (captures(styleOf(node)))
      return node
    node = node.parentElement
  }
  return null
}

/**
 * 视口坐标系本身。fixed 且没有祖先劫持包含块时用它。
 * 与 frameOf(null, win) 的区别只在滚动量：那个叠了 win.scrollX/scrollY，是文档系。
 */
export const VIEWPORT_FRAME: PositionFrame = {
  originX: 0,
  originY: 0,
  scaleX: 1,
  scaleY: 1,
  scrollX: 0,
  scrollY: 0,
}

/** 由包含块推出坐标系。包含块缺席时用文档滚动量。 */
export function frameOf(block: HTMLElement | null, win: Window): PositionFrame {
  if (!block) {
    return { originX: 0, originY: 0, scaleX: 1, scaleY: 1, scrollX: win.scrollX, scrollY: win.scrollY }
  }
  const rect = block.getBoundingClientRect()
  const scale = scaleOf(block)
  // 绝对定位的原点是内边距盒，边框宽度按布局像素记，落到视觉上要乘缩放
  return {
    originX: rect.left + block.clientLeft * scale.x,
    originY: rect.top + block.clientTop * scale.y,
    scaleX: scale.x,
    scaleY: scale.y,
    scrollX: block.scrollLeft,
    scrollY: block.scrollTop,
  }
}

/** 视口矩形换算进包含块的布局坐标。 */
export function boxToFrame(rect: PositionBox, frame: PositionFrame): PositionBox {
  return {
    x: (rect.x - frame.originX) / frame.scaleX + frame.scrollX,
    y: (rect.y - frame.originY) / frame.scaleY + frame.scrollY,
    width: rect.width / frame.scaleX,
    height: rect.height / frame.scaleY,
  }
}

/** 视口区域换算进包含块的布局坐标。 */
export function edgesToFrame(edges: PositionEdges, frame: PositionFrame): PositionEdges {
  return {
    top: (edges.top - frame.originY) / frame.scaleY + frame.scrollY,
    bottom: (edges.bottom - frame.originY) / frame.scaleY + frame.scrollY,
    left: (edges.left - frame.originX) / frame.scaleX + frame.scrollX,
    right: (edges.right - frame.originX) / frame.scaleX + frame.scrollX,
  }
}

function isClippingOverflow(style: CSSStyleDeclaration): boolean {
  return /auto|scroll|overlay|hidden|clip/.test(`${style.overflow}${style.overflowX}${style.overflowY}`)
}

export function isScrollable(el: HTMLElement): boolean {
  const style = styleOf(el)
  return /auto|scroll|overlay/.test(`${style.overflow}${style.overflowX}${style.overflowY}`)
}

/**
 * 会把内容裁掉的祖先，从近到远。
 * @param el 起点元素。
 * @param stopAt 给定时走到它为止（含它自己）。fixed 只被劫持了它包含块的那个祖先及其内层裁，
 * 再往外的 overflow 对它无效——不截断的话浮层会躲一条已经不存在的边界。
 */
export function clippingAncestors(el: Element | null, stopAt?: HTMLElement): HTMLElement[] {
  const found: HTMLElement[] = []
  if (!el)
    return found
  const root = el.ownerDocument.documentElement
  let node = el.parentElement
  while (node && node !== root) {
    if (isClippingOverflow(styleOf(node)))
      found.push(node)
    if (node === stopAt)
      break
    node = node.parentElement
  }
  return found
}

/** 会滚动的祖先，从近到远。跟随更新要挂在它们身上。 */
export function scrollableAncestors(el: Element | null): HTMLElement[] {
  const found: HTMLElement[] = []
  if (!el)
    return found
  const root = el.ownerDocument.documentElement
  let node = el.parentElement
  while (node && node !== root) {
    if (isScrollable(node))
      found.push(node)
    node = node.parentElement
  }
  return found
}

/** 元素的内边距盒，视口坐标。裁剪判据用它，边框与滚动条不算进可用区域。 */
export function paddingEdgesOf(el: HTMLElement): PositionEdges {
  const rect = el.getBoundingClientRect()
  const scale = scaleOf(el)
  const left = rect.left + el.clientLeft * scale.x
  const top = rect.top + el.clientTop * scale.y
  return {
    left,
    top,
    right: left + el.clientWidth * scale.x,
    bottom: top + el.clientHeight * scale.y,
  }
}

/** 视口本身的可用区域。取 documentElement 的可视尺寸，滚动条不算在内。 */
export function viewportEdges(win: Window): PositionEdges {
  const root = win.document.documentElement
  return { top: 0, left: 0, right: root.clientWidth, bottom: root.clientHeight }
}
