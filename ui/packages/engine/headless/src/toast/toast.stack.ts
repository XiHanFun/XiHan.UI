/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 Toast 堆叠测量与交互展开控制。

import type { ToastPlacement } from './toast.types'

export interface ToastStackControllerOptions {
  group: HTMLElement
  gap: number
  placement: ToastPlacement
  onInteractionChange?: (active: boolean) => void
}

export interface ToastStackController {
  update: () => void
  dispose: () => void
}

/**
 * HeroUI/Sonner 式堆叠：最新一条在最前，后层按固定偏移与比例收拢。
 * 这里只写层深（私有槽 --xh-_toast-depth），缩放比例由皮肤按 --xh-motion-scale-stack 逐层算：
 * 减弱动效下那支令牌为 1，后层不缩放。
 */
export function createToastStackController(options: ToastStackControllerOptions): ToastStackController {
  const { group, gap, placement, onInteractionChange } = options
  const heights = new WeakMap<HTMLElement, number>()
  let expanded = false
  let pointerWithin = false

  const roots = (): HTMLElement[] => [...group.querySelectorAll<HTMLElement>(
    '[data-scope="toast"][data-part="root"]',
  )].filter(root => !root.hidden)

  const measure = (root: HTMLElement): number => {
    const style = root.ownerDocument.defaultView?.getComputedStyle(root)
    const borders = style
      ? Number.parseFloat(style.borderBlockStartWidth) + Number.parseFloat(style.borderBlockEndWidth)
      : 0
    return Math.max(root.getBoundingClientRect().height, root.scrollHeight + borders)
  }

  const update = (): void => {
    const items = roots()
    const front = items.at(-1)
    if (!front)
      return
    for (const item of items) {
      if (!heights.has(item) || expanded)
        heights.set(item, measure(item))
    }
    const frontHeight = heights.get(front) ?? measure(front)
    let expandedOffset = 0
    for (let index = items.length - 1; index >= 0; index -= 1) {
      const item = items[index]!
      const depth = items.length - 1 - index
      item.toggleAttribute('data-frontmost', depth === 0)
      item.toggleAttribute('data-expanded', expanded && items.length > 1)
      item.dataset.stackIndex = String(depth)
      item.dataset.placement = placement
      item.style.setProperty('--xh-toast-offset-collapsed', `${depth * gap}px`)
      item.style.setProperty('--xh-toast-offset-expanded', `${expandedOffset}px`)
      item.style.setProperty('--xh-_toast-depth', String(depth))
      item.style.setProperty('--xh-toast-front-height', `${frontHeight}px`)
      item.style.setProperty('--xh-toast-height', `${heights.get(item) ?? frontHeight}px`)
      expandedOffset += (heights.get(item) ?? frontHeight) + gap
      item.style.zIndex = String(items.length - depth)
    }
    group.toggleAttribute('data-expanded', expanded && items.length > 1)
  }

  const setInteraction = (active: boolean): void => {
    if (expanded === active)
      return
    expanded = active
    onInteractionChange?.(active)
    update()
  }

  const collapseIfOutside = (): void => {
    if (!pointerWithin && !group.contains(group.ownerDocument.activeElement))
      setInteraction(false)
  }
  const onPointerEnter = (event: PointerEvent): void => {
    if (event.pointerType === 'touch')
      return
    pointerWithin = true
    setInteraction(true)
  }
  const onPointerLeave = (event: PointerEvent): void => {
    if (event.pointerType === 'touch')
      return
    pointerWithin = false
    collapseIfOutside()
  }
  const onFocusIn = (): void => setInteraction(true)
  const onFocusOut = (event: FocusEvent): void => {
    const NodeCtor = group.ownerDocument.defaultView?.Node
    if (NodeCtor && event.relatedTarget instanceof NodeCtor && group.contains(event.relatedTarget))
      return
    collapseIfOutside()
  }
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape')
      return
    pointerWithin = false
    ;(group.ownerDocument.activeElement as HTMLElement | null)?.blur()
    setInteraction(false)
  }
  const onDocumentPointerOver = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' || group.contains(event.target as Node))
      return
    pointerWithin = false
    collapseIfOutside()
  }

  const mutation = new MutationObserver(update)
  mutation.observe(group, { childList: true, characterData: true, subtree: true })
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
  resize?.observe(group)
  group.addEventListener('pointerenter', onPointerEnter)
  group.addEventListener('pointermove', onPointerEnter)
  group.addEventListener('pointerleave', onPointerLeave)
  group.addEventListener('focusin', onFocusIn)
  group.addEventListener('focusout', onFocusOut)
  group.addEventListener('keydown', onKeyDown)
  group.ownerDocument.addEventListener('pointerover', onDocumentPointerOver, true)
  queueMicrotask(update)

  return {
    update,
    dispose: () => {
      mutation.disconnect()
      resize?.disconnect()
      group.removeEventListener('pointerenter', onPointerEnter)
      group.removeEventListener('pointermove', onPointerEnter)
      group.removeEventListener('pointerleave', onPointerLeave)
      group.removeEventListener('focusin', onFocusIn)
      group.removeEventListener('focusout', onFocusOut)
      group.removeEventListener('keydown', onKeyDown)
      group.ownerDocument.removeEventListener('pointerover', onDocumentPointerOver, true)
      if (expanded)
        onInteractionChange?.(false)
    },
  }
}
