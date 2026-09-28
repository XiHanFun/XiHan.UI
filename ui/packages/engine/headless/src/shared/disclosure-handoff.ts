/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 面级披露中途反向的接力：展开到一半点收起（或反过来）时，新一段关键帧从此刻的开合程度接着走。
//
// Accordion、Collapsible、Reasoning、ToolCall 的内容区用关键帧展开收起（行高 0fr ↔ 1fr，内缩同帧动），
// 关键帧不能中途打断：data-state 一翻，新一段从自己的起点重播，界面先跳到全开再收、或先塌成 0 再展。
// 这里在翻转那一刻（宿主提交之后、绘制之前）按上一段的缓动算出此刻开到几成，再把新一段拨到
// 按它自己的缓动恰好是这几成的那个时间点。只动 currentTime，时长与曲线仍是皮肤给的。

import type { EasingFunction } from '@xihan-ui/motion'
import { resolveEasing } from '@xihan-ui/motion'

/** 用面级披露关键帧的内容区所在的组件。 */
const DISCLOSURE_SCOPES = new Set(['accordion', 'collapsible', 'reasoning', 'tool-call'])
/** 面级披露的两段关键帧（family/motion.css）。 */
const DISCLOSURE_ANIMATIONS = new Set(['xh-disclosure-expand', 'xh-disclosure-collapse'])

/** 一段展开或收起：方向、起跑时刻、时长与曲线。 */
interface Run {
  readonly open: boolean
  readonly at: number
  readonly duration: number
  readonly easing: EasingFunction
}

const runs = new WeakMap<Element, Run>()
const installs = new WeakMap<Document, { count: number, stop: () => void }>()

function isDisclosureContent(el: Element): el is HTMLElement {
  const data = (el as HTMLElement).dataset
  return data?.part === 'content' && DISCLOSURE_SCOPES.has(data.scope ?? '')
}

function disclosureAnimation(el: HTMLElement): CSSAnimation | null {
  for (const animation of el.getAnimations()) {
    if ('animationName' in animation && DISCLOSURE_ANIMATIONS.has(String(animation.animationName)))
      return animation as CSSAnimation
  }
  return null
}

/** 逗号分隔的 CSS 列表取第一项：cubic-bezier(…) 里的逗号不算。 */
function firstListItem(list: string): string {
  let depth = 0
  for (let i = 0; i < list.length; i++) {
    const ch = list[i]
    if (ch === '(') {
      depth++
    }
    else if (ch === ')') {
      depth--
    }
    else if (ch === ',' && depth === 0) {
      return list.slice(0, i).trim()
    }
  }
  return list.trim()
}

/** 缓动的反函数：给定输出 y 求输入 t。缓动单调，二分到亚像素级即可。 */
function invert(easing: EasingFunction, y: number): number {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (easing(mid) < y)
      lo = mid
    else
      hi = mid
  }
  return (lo + hi) / 2
}

/** 读出正在播的那一段：没有（首帧、减弱档一步到位、节点还藏着）返回 null。 */
function readRun(el: HTMLElement, win: Window, open: boolean): Run | null {
  const animation = el.hasAttribute('data-instant') ? null : disclosureAnimation(el)
  const duration = Number(animation?.effect?.getComputedTiming().duration)
  if (!animation || !(duration > 0))
    return null
  const easing = resolveEasing(firstListItem(win.getComputedStyle(el).animationTimingFunction))
  const elapsed = Number(animation.currentTime) || 0
  return { open, at: win.performance.now() - elapsed, duration, easing }
}

function handoff(el: HTMLElement, win: Window): void {
  const open = el.getAttribute('data-state') === 'open'
  const previous = runs.get(el)
  const now = win.performance.now()
  // 读动画会逼出一次样式计算：新一段关键帧此刻已按 data-state 建好、还没画出来
  const run = readRun(el, win, open)
  if (!run) {
    // 展开那一刻内容区可能还藏着（宿主随后才撤掉 display），下一帧再读一次这一段
    runs.delete(el)
    win.requestAnimationFrame(() => {
      if (el.getAttribute('data-state') === (open ? 'open' : 'closed') && !runs.has(el)) {
        const late = readRun(el, win, open)
        if (late)
          runs.set(el, late)
      }
    })
    return
  }
  let t = 0
  if (previous && previous.open !== open) {
    const progress = (now - previous.at) / previous.duration
    if (progress < 1) {
      const eased = previous.easing(Math.max(0, progress))
      const openness = previous.open ? eased : 1 - eased
      t = invert(run.easing, open ? openness : 1 - openness)
      const animation = disclosureAnimation(el)!
      animation.currentTime = t * run.duration
    }
  }
  runs.set(el, { ...run, at: now - t * run.duration })
}

/**
 * 在一份文档上接上面级披露的接力，返回释放函数。多个组件共用一个观察者，按引用计数撤下。
 * 没有 MutationObserver 的宿主里什么都不做。
 */
export function retainDisclosureHandoff(doc: Document): () => void {
  let entry = installs.get(doc)
  if (!entry) {
    const win = doc.defaultView
    const Observer = win?.MutationObserver
    if (!win || typeof Observer !== 'function')
      return () => {}
    const observer = new Observer((records) => {
      for (const record of records) {
        if (isDisclosureContent(record.target as Element))
          handoff(record.target as HTMLElement, win)
      }
    })
    observer.observe(doc, { subtree: true, attributes: true, attributeFilter: ['data-state'] })
    const created = { count: 0, stop: () => observer.disconnect() }
    installs.set(doc, created)
    entry = created
  }
  const held = entry
  held.count++
  let released = false
  return () => {
    if (released)
      return
    released = true
    held.count--
    if (held.count === 0) {
      held.stop()
      installs.delete(doc)
    }
  }
}
