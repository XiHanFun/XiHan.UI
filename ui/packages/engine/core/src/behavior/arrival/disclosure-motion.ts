/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 密集展开的高度补间：树、侧导航内联子层这类子层里排着多行的展开与收起。
//
// 子层里是多行，Surface 级展开那套单行网格（0fr → 1fr）套不上，这里按实测高度补：展开时子层从 0 长到自己的高度、
// 同帧淡入；收起那一帧宿主已经把子层藏掉（hidden、data-state="closed"，或整个卸下），就在原处放一个它的替身，
// 从原高度缩到 0、同帧淡出，播完即移除。下面的行随高度一路挪过去，不跳。宿主的渲染写法不变，三端不必接退场闸门。
// 时长取 expand / collapse、曲线取 disclosure，都从元素现读：作者对槽的覆盖与容器上的 data-motion 一并生效，
// 减弱动效下直接到位。

import { animate, motionEasings, readMotion } from '@xihan-ui/motion'
import { GHOST_ATTR, markGhost } from './list-motion'
import { heightOf } from './size-tween'

/** 一批变更里翻动的子层超过这么多枝（整树展开、整树收起）就当场落定：一次铺开一大片，补间只会拖慢。 */
const BULK_CAP = 3

export interface TrackDisclosureMotionOptions {
  /** 子层的选择器（树的 branch-content）。容器里匹配它的元素按 hidden 与 data-state="closed" 认开合，卸下即收起。 */
  content: string
  /** 这一批变更补不补间（缺省补）：每批变更现问一次，返回 false 时当场落定。 */
  enabled?: () => boolean
  /**
   * 子层随着别的节点一起来去时（树形表格收起父行，子行连同它们展开着的详情行一起卸下），插入与卸下交给那边的列表动效：
   * 同一批里增删了匹配这个选择器的节点，这一批插入、卸下的子层都不补；翻 hidden / data-state 的照常补
   */
  alongside?: string
}

export interface DisclosureMotion {
  /** 接下来两帧之内的变更当场落定：搜索换枝、折叠换装这类一次翻一片的变化，在改状态之前调用。 */
  hold: () => void
  /** 停止盯梢：在播的替身立即移除，在播的展开当场到位。 */
  stop: () => void
}

interface Box {
  height: number
  padStart: number
  padEnd: number
  borderStart: number
  borderEnd: number
  marginStart: number
  spare: number
}

interface Ghost {
  el: HTMLElement
  dispose: () => void
}

/** 子层的开合只认这两条：作者与连接层写的 hidden、连接层发的 data-state="closed"。 */
function closedBy(hidden: boolean, state: string | null): boolean {
  return hidden || state === 'closed'
}

function isClosed(el: Element): boolean {
  return closedBy(el.hasAttribute('hidden'), el.getAttribute('data-state'))
}

/** 有没有盒：自己或祖先 display: none 时没有。 */
function rendered(el: Element | null): boolean {
  return !!el && el.getClientRects().length > 0
}

function px(value: string): number {
  return Number.parseFloat(value) || 0
}

/** 正在播的那一段脚本动画（不是 CSS 关键帧与过渡）此刻的进度，取曲线变换之后的值；没有在播的返回 1。 */
function progressOf(animation: Animation | undefined): number {
  if (!animation || animation.playState !== 'running')
    return 1
  const progress = animation.effect?.getComputedTiming().progress
  return typeof progress === 'number' ? progress : 1
}

/** 展开与收起取同一条 disclosure 曲线，从元素现读。 */
function easingOf(el: Element): string {
  return el.ownerDocument.defaultView?.getComputedStyle(el).getPropertyValue('--xh-motion-ease-disclosure').trim() || motionEasings.disclosure
}

/** 刚起播的那一段脚本动画：animate 之后取元素上最后一个既非 CSS 关键帧、也非 CSS 过渡的动画。 */
function lastScripted(el: HTMLElement): Animation | undefined {
  return el.getAnimations?.().filter(animation => !('animationName' in animation) && !('transitionProperty' in animation)).at(-1)
}

/**
 * 量子层的盒。spare 是它在父级里比自身高度多占的那一截（父级的行距、外边距）：父级此刻的高度减去没有它时的高度、
 * 再减去它自己；父级定了高（滚动容器）时量不出来，记 0
 */
function measure(el: HTMLElement, without: number): Box {
  const style = el.ownerDocument.defaultView!.getComputedStyle(el)
  const height = heightOf(el)
  const spare = Math.max(0, (el.parentElement ? heightOf(el.parentElement) : 0) - without - height)
  return {
    height,
    padStart: px(style.paddingBlockStart),
    padEnd: px(style.paddingBlockEnd),
    borderStart: px(style.borderBlockStartWidth),
    borderEnd: px(style.borderBlockEndWidth),
    marginStart: px(style.marginBlockStart),
    spare,
  }
}

/** 父级在没有这个子层时的高度：临时把它摘出排版量一次，再原样还回去。 */
function parentWithout(el: HTMLElement): number {
  const parent = el.parentElement
  if (!parent)
    return 0
  const display = el.style.getPropertyValue('display')
  const priority = el.style.getPropertyPriority('display')
  el.style.setProperty('display', 'none', 'important')
  const height = heightOf(parent)
  if (display)
    el.style.setProperty('display', display, priority)
  else el.style.removeProperty('display')
  return height
}

/**
 * 一帧关键帧：块尺寸、上下内缩、上下边框（行间分隔线）与透明度按比例收放；起始外边距同时让出 spare 那一截，0 高时子层在父级里一点不占，
 * 父级的行距不会在展开第一帧、收起最后一帧跳一下。overflow 与 box-sizing 两端相同、整段保持
 */
function frame(box: Box, ratio: number, height = box.height * ratio): Keyframe {
  return {
    blockSize: `${height}px`,
    paddingBlockStart: `${box.padStart * ratio}px`,
    paddingBlockEnd: `${box.padEnd * ratio}px`,
    borderBlockStartWidth: `${box.borderStart * ratio}px`,
    borderBlockEndWidth: `${box.borderEnd * ratio}px`,
    marginBlockStart: `${box.marginStart - box.spare * (1 - ratio)}px`,
    opacity: ratio,
    overflow: 'clip',
    boxSizing: 'border-box',
  }
}

/**
 * 一块刚露出来的内容按实测高度展开：块尺寸、内缩、边框与透明度从 from（缺省 0）补到原样，父级的行距随之让出，
 * 下面的内容一路挪下去。给自己掌握开合时机的部件用（Alert 重新显示），宿主提交、节点有了盒之后调用。
 * 返回这一段动画；量不到高度或减弱动效下返回 undefined
 */
export function expandIn(el: HTMLElement, from = 0): Animation | undefined {
  const box = measure(el, parentWithout(el))
  if (box.height <= 0)
    return undefined
  const ratio = Math.min(from / box.height, 1)
  animate(el, [frame(box, ratio, from), frame(box, 1)], {
    duration: readMotion(el).duration('expand'),
    easing: easingOf(el),
  })
  return lastScripted(el)
}

/**
 * 盯住容器里子层的展开与收起，按实测高度补间。返回控制柄：hold 让接下来的批量变化当场落定，stop 停止。
 *
 * - 展开：子层从藏着变成露出来（撤掉 hidden、data-state 翻成 open，或刚插进来），块尺寸从 0 补到实测高度，同帧淡入。
 *   上一段收起的替身还没播完时，从替身此刻的高度与透明度接着长，不先跳回 0。
 * - 收起：子层藏掉或被卸下时，在原位置放一个替身（摘掉 id、表单名与 `data-xh-part`，标上 `inert`、`aria-hidden`
 *   与 {@link GHOST_ATTR}），块尺寸从原高度补到 0、同帧淡出，播完即移除。展开中途收起时从此刻的进度往回走。
 * - 只补最外层：同一批里祖先也在翻的子层随祖先一起走；藏在没有盒的祖先里的（收着的浮层）不补。
 * - 一批里翻动的子层超过 {@link BULK_CAP} 枝、`enabled` 返回 false 或在 hold 窗口里，当场落定。
 */
export function trackDisclosureMotion(container: HTMLElement, options: TrackDisclosureMotionOptions): DisclosureMotion {
  const win = container.ownerDocument.defaultView
  const Observer = win?.MutationObserver
  if (!win || typeof Observer !== 'function')
    return { hold: () => {}, stop: () => {} }
  const { content } = options
  /** 每个父级上至多一个在播的收起替身：再展开时从它此刻的样子接着长。 */
  const ghosts = new Map<Node, Ghost>()
  /** 在播的展开：收起时取它此刻的进度。 */
  const opening = new Map<HTMLElement, Animation>()
  let held = false

  function expand(el: HTMLElement): void {
    const parent = el.parentNode
    const ghost = parent ? ghosts.get(parent) : undefined
    let from = 0
    if (ghost) {
      from = heightOf(ghost.el)
      ghost.dispose()
    }
    const animation = expandIn(el, from)
    if (!animation)
      return
    opening.set(el, animation)
    void animation.finished.catch(() => {}).then(() => {
      if (opening.get(el) === animation)
        opening.delete(el)
    })
  }

  function collapse(source: HTMLElement, parent: Node, next: Node | null): void {
    const progress = progressOf(opening.get(source))
    opening.get(source)?.cancel()
    opening.delete(source)
    ghosts.get(parent)?.dispose()

    const el = source.cloneNode(true) as HTMLElement
    // 替身按展开着的样子摆：收起态的 hidden / data-state 与宿主内联写的 display: none（Web Components 自管可见性）
    // 会让它一帧都不占位
    el.removeAttribute('hidden')
    if (el.getAttribute('data-state') === 'closed')
      el.setAttribute('data-state', 'open')
    if (el.style.display === 'none')
      el.style.removeProperty('display')
    markGhost(el)
    const without = parent instanceof HTMLElement ? heightOf(parent) : 0
    parent.insertBefore(el, next !== null && next.parentNode === parent ? next : null)
    // 克隆出来的节点重新得到盒，身上与子孙的露面淡入会从头播：替身是原样留在那儿的旧画面，直接落到终态
    for (const animation of el.getAnimations?.({ subtree: true }) ?? []) {
      if ('animationName' in animation) {
        try {
          animation.finish()
        }
        catch {
          // 循环动画没有终点，照常转着
        }
      }
    }

    const box = measure(el, without)
    const handle = animate(el, [frame(box, progress), frame(box, 0)], {
      duration: readMotion(el).duration('collapse'),
      easing: easingOf(el),
      fill: 'forwards',
    })
    const ghost: Ghost = {
      el,
      dispose: () => {
        if (ghosts.get(parent) === ghost)
          ghosts.delete(parent)
        handle.cancel()
        el.remove()
      },
    }
    ghosts.set(parent, ghost)
    void handle.finished.then(() => ghost.dispose())
  }

  const observer = new Observer((records) => {
    /** 每个子层在这一批之前的 hidden 与 data-state：取每条属性第一条记录的旧值。 */
    const before = new Map<HTMLElement, { hidden: boolean, state: string | null, seen: Set<string>, fresh: boolean }>()
    const inserted = new Set<HTMLElement>()
    /** 这一批插进来的全部元素：随祖先一起插进来的子层是首次铺开，不是展开。 */
    const added = new Set<Node>()
    const removed: Array<{ el: HTMLElement, parent: Node, next: Node | null }> = []
    let carried = false
    for (const record of records) {
      if (record.type === 'attributes') {
        const el = record.target as HTMLElement
        if (!el.matches(content) || el.closest(`[${GHOST_ATTR}]`))
          continue
        const prev = before.get(el) ?? { hidden: el.hasAttribute('hidden'), state: el.getAttribute('data-state'), seen: new Set<string>(), fresh: false }
        const name = record.attributeName!
        if (!prev.seen.has(name)) {
          prev.seen.add(name)
          if (name === 'hidden') {
            prev.hidden = record.oldValue !== null
          }
          else {
            prev.state = record.oldValue
            // data-state 从无到有：宿主刚把状态写上去（先插节点、后补属性的那一拍），是初始化不是开合
            prev.fresh = record.oldValue === null
          }
        }
        before.set(el, prev)
        continue
      }
      const touches = (node: Node): boolean => !!options.alongside && node.nodeType === 1 && !(node as Element).hasAttribute(GHOST_ATTR)
        && ((node as Element).matches(options.alongside) || (node as Element).querySelector(options.alongside) !== null)
      record.addedNodes.forEach((node) => {
        carried ||= touches(node)
        added.add(node)
        if (node.nodeType === 1 && !(node as Element).hasAttribute(GHOST_ATTR) && (node as Element).matches(content))
          inserted.add(node as HTMLElement)
      })
      record.removedNodes.forEach((node) => {
        carried ||= touches(node)
        if (node.nodeType === 1 && !(node as Element).hasAttribute(GHOST_ATTR) && (node as Element).matches(content))
          removed.push({ el: node as HTMLElement, parent: record.target, next: record.nextSibling })
      })
    }
    // 子层随别的节点一起来去：插入与卸下交给那边
    if (carried) {
      inserted.clear()
      removed.length = 0
    }

    /** 自己或祖先是这一批插进来的。 */
    const arrivedWith = (el: Element): boolean => {
      for (let node: Element | null = el; node && node !== container; node = node.parentElement) {
        if (added.has(node))
          return true
      }
      return false
    }

    const opened: HTMLElement[] = []
    const closed: Array<{ el: HTMLElement, parent: Node, next: Node | null }> = []
    for (const [el, prev] of before) {
      if (!el.isConnected || !container.contains(el) || !el.parentNode || prev.fresh || arrivedWith(el))
        continue
      const was = closedBy(prev.hidden, prev.state)
      const now = isClosed(el)
      if (was && !now)
        opened.push(el)
      else if (!was && now)
        closed.push({ el, parent: el.parentNode, next: el.nextSibling })
    }
    const moved = new Set(removed.map(entry => entry.el))
    for (const el of inserted) {
      if (!moved.has(el) && el.isConnected && container.contains(el) && !isClosed(el) && !(el.parentElement && arrivedWith(el.parentElement)))
        opened.push(el)
    }
    for (const entry of removed) {
      if (!inserted.has(entry.el) && !entry.el.isConnected && entry.parent.isConnected && container.contains(entry.parent) && !isClosed(entry.el))
        closed.push(entry)
    }

    // 只补最外层：祖先也在这一批里翻的，跟着祖先走；没有盒的祖先里（收着的浮层、收着的上一层）不补
    const outerOpened = opened.filter(el => !opened.some(other => other !== el && other.contains(el)) && rendered(el.parentElement))
    const outerClosed = closed.filter(({ el, parent }) =>
      !closed.some(other => other.el !== el && other.el.contains(el)) && parent instanceof Element && rendered(parent))
    if (outerOpened.length + outerClosed.length === 0)
      return
    if (held || options.enabled?.() === false || outerOpened.length + outerClosed.length > BULK_CAP) {
      // 当场落定：在播的展开到位，同一父级上的旧替身撤掉
      for (const el of outerOpened) {
        const parent = el.parentNode
        if (parent)
          ghosts.get(parent)?.dispose()
      }
      for (const { el } of outerClosed) {
        opening.get(el)?.finish()
        opening.delete(el)
      }
      return
    }
    for (const { el, parent, next } of outerClosed)
      collapse(el, parent, next)
    for (const el of outerOpened)
      expand(el)
  })
  observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'data-state'], attributeOldValue: true })

  let holdFrame = 0
  return {
    hold: () => {
      held = true
      win.cancelAnimationFrame(holdFrame)
      // 两帧：React 的调度可能把提交排到下一帧之后，一帧不够罩住那一批变更
      holdFrame = win.requestAnimationFrame(() => {
        holdFrame = win.requestAnimationFrame(() => {
          held = false
          holdFrame = 0
        })
      })
    },
    stop: () => {
      observer.disconnect()
      win.cancelAnimationFrame(holdFrame)
      for (const ghost of [...ghosts.values()])
        ghost.dispose()
      for (const animation of opening.values())
        animation.finish()
      opening.clear()
    },
  }
}
