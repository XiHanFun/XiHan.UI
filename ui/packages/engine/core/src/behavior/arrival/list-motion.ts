/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 列表动效：条目的到达、离场与换位。
//
// 条目由宿主增删（框架的列表渲染、作者脚本），库不拥有它们的卸载时机。离场时在原处放一个它的替身：
// 绝对定位在原来的排布位上、不占位、不可交互，身上的退场动画播完再移除——宿主照常删节点，
// 不必为退场改渲染。同一批变更里留下来、排布位变了的条目，先按旧位置反向补偿，再交给皮肤的 translate
// 过渡回到新位置。到达的规则与 trackArrivals 相同：首帧就在的不播进场，之后同一批新到的按到达顺序错开。
//
// 时长与曲线全部在皮肤里：进场、退场是关键帧，换位是 translate 过渡；减弱动效由令牌收敛，这里不读时间。

import type { TrackArrivalsOptions } from './track-arrivals'
import { attachCssExit, createPresence } from '../presence'
import { INSTANT_ATTR, STAGGER_CAP, STAGGER_INDEX_PROPERTY } from './track-arrivals'

/** 离场替身的状态：皮肤把退场关键帧写在它的 `[data-state='closed']` 下。 */
const DEPARTING_STATE = 'closed'

/** 离场替身身上要摘掉的属性：id 与表单名会和留下来的条目撞车，data-xh-part 会让作者脚本与元素把它当成在场的部件。 */
const DETACHED_ATTRS = ['id', 'name', 'data-xh-part'] as const

/** 条目的排布位：相对 offsetParent，不受祖先缩放、自身位移与滚动影响。 */
interface Slot {
  left: number
  top: number
  width: number
  height: number
  parent: Element | null
}

function slotOf(el: HTMLElement): Slot {
  return { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight, parent: el.offsetParent }
}

/** 计算样式里正在生效的 translate（上一段换位的过渡还没走完时不为零）。 */
function currentTranslate(el: HTMLElement, win: Window): [number, number] {
  const value = win.getComputedStyle(el).translate
  if (!value || value === 'none')
    return [0, 0]
  const [x = '0', y = '0'] = value.split(/\s+/)
  return [Number.parseFloat(x) || 0, Number.parseFloat(y) || 0]
}

/**
 * 反向补偿一段位移再交给过渡：先把条目按 (dx, dy) 推回旧位置并关掉过渡，提交这一帧样式后撤掉，
 * 皮肤里条目的 translate 过渡把它带回新位置；上一段没走完时从当前位置接着走。正在播关键帧的条目不补偿。
 */
function shift(el: HTMLElement, dx: number, dy: number, win: Window): void {
  if (dx === 0 && dy === 0)
    return
  const running = el.getAnimations?.().some(animation => 'animationName' in animation && animation.playState === 'running')
  if (running)
    return
  const [cx, cy] = currentTranslate(el, win)
  const translate = el.style.getPropertyValue('translate')
  const transition = el.style.getPropertyValue('transition')
  el.style.setProperty('transition', 'none')
  el.style.setProperty('translate', `${dx + cx}px ${dy + cy}px`)
  // 读一次计算样式，让反向补偿这一帧先生效，撤掉之后的变化才会走过渡
  void win.getComputedStyle(el).translate
  if (translate)
    el.style.setProperty('translate', translate)
  else el.style.removeProperty('translate')
  if (transition)
    el.style.setProperty('transition', transition)
  else el.style.removeProperty('transition')
}

function byDocumentOrder(a: Element, b: Element): number {
  return a.compareDocumentPosition(b) & 4 /* DOCUMENT_POSITION_FOLLOWING */ ? -1 : 1
}

/**
 * 离场条目的替身：同样的结构与属性，表单控件带上此刻的值（cloneNode 只复制 attribute）。
 * 放回去的是替身而不是原节点：原节点仍归宿主处置——Web Components 会在下一轮接线时撤掉它身上库写的属性，
 * 框架也可能在别处复用它；替身谁都不认识，退场播到结束不会被中途改写。
 */
function standIn(source: HTMLElement): HTMLElement {
  const copy = source.cloneNode(true) as HTMLElement
  const from = source.querySelectorAll('input, textarea, select')
  const to = copy.querySelectorAll('input, textarea, select')
  from.forEach((control, index) => {
    const target = to[index]
    if (target instanceof HTMLSelectElement && control instanceof HTMLSelectElement) {
      target.selectedIndex = control.selectedIndex
    }
    else if (target && 'value' in target && 'value' in control) {
      ;(target as HTMLInputElement).value = (control as HTMLInputElement).value
      ;(target as HTMLInputElement).checked = (control as HTMLInputElement).checked
    }
  })
  return copy
}

/** 一批到达：按给定顺序排号，撤掉首帧标记。 */
function arrive(batch: readonly Element[]): void {
  batch.forEach((el, index) => {
    el.removeAttribute(INSTANT_ATTR)
    ;(el as HTMLElement).style.setProperty(STAGGER_INDEX_PROPERTY, String(Math.min(index, STAGGER_CAP)))
  })
}

/**
 * 盯住容器里条目的到达、离场与换位，返回停止的函数（停止时还在播退场的节点立即移除）。
 *
 * - 到达：同 {@link trackArrivals}。同一批里被删掉又插回来的已知条目是换位，不算到达。
 * - 离场：条目被移出文档时，在原父级的原位置放一个它的替身：摘掉 id、表单名与 `data-xh-part`，标上 `inert`、
 *   `aria-hidden` 与 `data-state="closed"`，绝对定位在原来的排布位；身上实际起播的退场动画播完即移除，
 *   没有就当场移除。容器本身被卸下时不放。
 * - 换位：留下来的条目排布位变了，先写反向的 translate 并关掉过渡，提交这一帧样式后撤掉，
 *   皮肤里条目的 translate 过渡把它带回新位置；上一段没走完时从当前位置接着走。正在播关键帧的条目不补偿。
 *
 * 排布位在每批变更之后、以及容器或任一条目尺寸变化时重量一次。离场节点按原来的 offsetParent 定位，
 * 容器应是定位元素。
 */
export interface TrackListMotionOptions extends TrackArrivalsOptions {
  /**
   * 离场时放不放替身（缺省放）。条目自己带退场、播完才由宿主移除的集合（通知卡片）传 false：
   * 此时只做到达与换位，被移除的条目直接离开，留下来的条目从旧排布位过渡到新排布位。
   */
  depart?: boolean
}

export function trackListMotion(container: Element, options: TrackListMotionOptions): () => void {
  const { item } = options
  const placeholders = options.depart ?? true
  const win = container.ownerDocument.defaultView
  const departing = new WeakSet<Element>()
  const ghosts = new Set<() => void>()
  let slots = new Map<HTMLElement, Slot>()

  const items = (): HTMLElement[] => [...container.querySelectorAll<HTMLElement>(item)].filter(el => !departing.has(el))

  const Resize = win?.ResizeObserver
  const resizer = typeof Resize === 'function' ? new Resize(() => measure()) : null
  resizer?.observe(container)

  /** 重量排布位；藏起来的条目不记，重新露出来时算到达。 */
  function measure(): void {
    const next = new Map<HTMLElement, Slot>()
    for (const el of items()) {
      if (el.offsetParent === null)
        continue
      next.set(el, slotOf(el))
      if (!slots.has(el))
        resizer?.observe(el)
    }
    for (const el of slots.keys()) {
      if (!next.has(el))
        resizer?.unobserve(el)
    }
    slots = next
  }

  const present = items()
  if (options.initial === 'arrive')
    arrive(present)
  else present.forEach(el => el.setAttribute(INSTANT_ATTR, ''))
  measure()

  const Observer = win?.MutationObserver
  if (!win || typeof Observer !== 'function')
    return () => resizer?.disconnect()

  /** 换位：从旧排布位（加上在途的补偿）过渡到新排布位。 */
  function reflow(el: HTMLElement, from: Slot): void {
    const to = slotOf(el)
    if (to.parent !== from.parent)
      return
    shift(el, from.left - to.left, from.top - to.top, win!)
  }

  /** 离场：替身放回原处，播完退场再移除。 */
  function depart(source: HTMLElement, parent: Node, next: Node | null, slot: Slot): void {
    const el = standIn(source)
    departing.add(el)
    for (const node of [el, ...el.querySelectorAll('*')]) {
      for (const name of DETACHED_ATTRS)
        node.removeAttribute(name)
    }
    el.removeAttribute(INSTANT_ATTR)
    el.setAttribute('inert', '')
    el.setAttribute('aria-hidden', 'true')
    el.setAttribute('data-state', DEPARTING_STATE)
    el.style.setProperty('position', 'absolute')
    el.style.setProperty('left', `${slot.left}px`)
    el.style.setProperty('top', `${slot.top}px`)
    el.style.setProperty('width', `${slot.width}px`)
    el.style.setProperty('height', `${slot.height}px`)
    el.style.setProperty('margin', '0')
    el.style.setProperty('box-sizing', 'border-box')
    el.style.setProperty('pointer-events', 'none')
    parent.insertBefore(el, next !== null && next.parentNode === parent ? next : null)

    let finish = (): void => {}
    const presence = createPresence({
      open: true,
      onRenderedChange: (rendered) => {
        if (!rendered)
          finish()
      },
    })
    const detach = attachCssExit(el, presence, { win: win! })
    finish = () => {
      ghosts.delete(finish)
      detach()
      presence.dispose()
      el.remove()
    }
    ghosts.add(finish)
    presence.update(false)
  }

  const observer = new Observer((records) => {
    const added = new Set<HTMLElement>()
    const revealed = new Set<HTMLElement>()
    const removed: Array<{ el: HTMLElement, parent: Node, next: Node | null }> = []
    const collect = (node: Node, into: Set<HTMLElement>): void => {
      if (node.nodeType !== 1)
        return
      const el = node as HTMLElement
      if (departing.has(el))
        return
      if (el.matches(item))
        into.add(el)
      for (const inner of el.querySelectorAll<HTMLElement>(item))
        into.add(inner)
    }
    for (const record of records) {
      if (record.type === 'childList') {
        record.addedNodes.forEach(node => collect(node, added))
        record.removedNodes.forEach((node) => {
          if (node.nodeType === 1 && !departing.has(node as Element) && (node as Element).matches(item))
            removed.push({ el: node as HTMLElement, parent: record.target, next: record.nextSibling })
        })
      }
      else if (record.oldValue !== null && !(record.target as Element).hasAttribute('hidden')) {
        collect(record.target, revealed)
      }
    }

    // 到达：新插进来的（换位的已知条目除外）与重新露出来的
    const fresh = [...added].filter(el => !slots.has(el))
    arrive([...new Set([...fresh, ...revealed])]
      .filter(el => el.isConnected && container.contains(el) && !el.closest('[hidden]'))
      .sort(byDocumentOrder))

    // 换位：留下来的已知条目
    for (const [el, from] of slots) {
      if (el.isConnected && !departing.has(el) && container.contains(el))
        reflow(el, from)
    }

    // 离场：回调时已不在文档里的已知条目；同一批里被挪了位置的还在文档里，算换位
    if (placeholders && container.isConnected) {
      for (const { el, parent, next } of removed) {
        const slot = slots.get(el)
        if (slot && !el.isConnected && parent.isConnected && container.contains(parent))
          depart(el, parent, next, slot)
      }
    }

    measure()
  })
  observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'], attributeOldValue: true })

  return () => {
    observer.disconnect()
    resizer?.disconnect()
    for (const finish of ghosts)
      finish()
  }
}

export interface TrackReorderOptions {
  /** 条目选择器：容器里匹配它的元素算一个条目，可以不是直接子节点，也可以隔着几层嵌套。 */
  item: string
  /**
   * 条目的身份。宿主换位时可能重建节点（框架把换了父的节点卸掉再挂一个新的），按身份才认得回同一个条目；
   * 缺省按元素本身认。
   */
  key?: (el: HTMLElement) => string | null
}

/** 条目相对容器的排布位：沿 offsetParent 链累加到容器（或容器之外的第一个定位祖先）为止。 */
interface LayoutPoint {
  x: number
  y: number
  ref: Element | null
}

function layoutPoint(el: HTMLElement, container: Element): LayoutPoint {
  let x = el.offsetLeft
  let y = el.offsetTop
  let ref = el.offsetParent
  while (ref instanceof HTMLElement && ref !== container && container.contains(ref)) {
    x += ref.offsetLeft
    y += ref.offsetTop
    ref = ref.offsetParent
  }
  return { x, y, ref }
}

/**
 * 盯住下一次换位：先记下条目此刻的排布位，等宿主下一批增删了条目的 DOM 变更，按身份把排布位变了的条目
 * 反向补偿、交给皮肤的 translate 过渡带回新位置，随即停止。只管换位，不播到达与离场。
 *
 * 用在「一次提交之后由宿主重排」的集合上（树与表格的拖放落下）：库只发换位意图，写回归宿主，
 * 宿主什么时候重渲库不知道，于是盯住容器等那一批变更。排布位沿 offsetParent 链累加到容器，
 * 条目换了父（嵌套的层级之间）也量得出位移；不在同一参照系里的条目不补偿。
 * 返回停止的函数：宿主没有写回时，由调用方在下一次提交前或卸载时停掉。
 */
export function trackReorder(container: Element, options: TrackReorderOptions): () => void {
  const win = container.ownerDocument.defaultView
  const Observer = win?.MutationObserver
  if (!win || typeof Observer !== 'function')
    return () => {}
  const identity = options.key
  const items = (): HTMLElement[] => [...container.querySelectorAll<HTMLElement>(options.item)].filter(el => el.offsetParent !== null)
  const keyOf = (el: HTMLElement): unknown => (identity ? identity(el) : el)

  const before = new Map<unknown, LayoutPoint>()
  for (const el of items()) {
    const key = keyOf(el)
    if (key != null)
      before.set(key, layoutPoint(el, container))
  }

  const touchesItems = (nodes: NodeList): boolean => [...nodes].some(node =>
    node.nodeType === 1 && ((node as Element).matches(options.item) || (node as Element).querySelector(options.item) != null))

  const observer = new Observer((records) => {
    if (!records.some(record => record.type === 'childList' && (touchesItems(record.addedNodes) || touchesItems(record.removedNodes))))
      return
    observer.disconnect()
    for (const el of items()) {
      const from = before.get(keyOf(el))
      if (!from)
        continue
      const to = layoutPoint(el, container)
      if (to.ref === from.ref)
        shift(el, from.x - to.x, from.y - to.y, win)
    }
  })
  observer.observe(container, { childList: true, subtree: true })
  return () => observer.disconnect()
}
