/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供通知叠摞的测量与交互展开。

import type { NotificationPlacement } from './notification.types'

export interface NotificationStacksOptions {
  /** 摞内间距（px）；每次重排现取，间距改了不必重接。 */
  gap: () => number
  /** 某一摞被指针或焦点展开、或收起。 */
  onInteractionChange: (placement: NotificationPlacement, active: boolean) => void
}

interface StackController {
  update: () => void
  dispose: () => void
}

const STACKED_GROUP = '[data-scope="notification"][data-part="group"][data-stacked]'
const ITEM = '[data-scope="notification"][data-part="item"]'

/**
 * 一摞的测量与展开：最新一条在最前，后层按固定偏移收拢。
 * 这里只写层深、偏移与高度（私有槽），收拢比例由皮肤按 --xh-motion-scale-stack 逐层算：
 * 减弱动效下那支令牌为 1，后层不缩放。
 */
function createStackController(
  group: HTMLElement,
  gap: () => number,
  onInteractionChange: (active: boolean) => void,
): StackController {
  const heights = new WeakMap<HTMLElement, number>()
  let expanded = false
  let pointerWithin = false

  // 卡片可能包在作者的节点里（Web Components 的卡片元素），只认本摞里、且不属于更深一摞的那些
  const items = (): HTMLElement[] => [...group.querySelectorAll<HTMLElement>(ITEM)]
    .filter(item => !item.hidden && item.closest(STACKED_GROUP) === group)

  const measure = (item: HTMLElement): number => {
    const style = item.ownerDocument.defaultView?.getComputedStyle(item)
    const borders = style
      ? Number.parseFloat(style.borderBlockStartWidth) + Number.parseFloat(style.borderBlockEndWidth)
      : 0
    return Math.max(item.getBoundingClientRect().height, item.scrollHeight + borders)
  }

  const update = (): void => {
    const list = items()
    const front = list.at(-1)
    if (!front)
      return
    for (const item of list) {
      if (!heights.has(item) || expanded)
        heights.set(item, measure(item))
    }
    const step = gap()
    const frontHeight = heights.get(front) ?? measure(front)
    let expandedOffset = 0
    for (let index = list.length - 1; index >= 0; index -= 1) {
      const item = list[index]!
      const depth = list.length - 1 - index
      item.toggleAttribute('data-frontmost', depth === 0)
      item.toggleAttribute('data-expanded', expanded && list.length > 1)
      item.dataset.stackIndex = String(depth)
      item.style.setProperty('--xh-_notification-depth', String(depth))
      item.style.setProperty('--xh-_notification-offset', `${depth * step}px`)
      item.style.setProperty('--xh-_notification-offset-expanded', `${expandedOffset}px`)
      item.style.setProperty('--xh-_notification-front-height', `${frontHeight}px`)
      item.style.setProperty('--xh-_notification-height', `${heights.get(item) ?? frontHeight}px`)
      expandedOffset += (heights.get(item) ?? frontHeight) + step
      item.style.zIndex = String(list.length - depth)
    }
  }

  const setInteraction = (active: boolean): void => {
    if (expanded === active)
      return
    expanded = active
    onInteractionChange(active)
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
  // Escape 收起展开的一摞，焦点随之离开：条目不是层，不抢焦点也不归还
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

  const win = group.ownerDocument.defaultView
  const Mutation = win?.MutationObserver
  const mutation = typeof Mutation === 'function' ? new Mutation(update) : null
  mutation?.observe(group, { childList: true, characterData: true, subtree: true })
  const Resize = win?.ResizeObserver
  const resize = typeof Resize === 'function' ? new Resize(update) : null
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
      mutation?.disconnect()
      resize?.disconnect()
      group.removeEventListener('pointerenter', onPointerEnter)
      group.removeEventListener('pointermove', onPointerEnter)
      group.removeEventListener('pointerleave', onPointerLeave)
      group.removeEventListener('focusin', onFocusIn)
      group.removeEventListener('focusout', onFocusOut)
      group.removeEventListener('keydown', onKeyDown)
      group.ownerDocument.removeEventListener('pointerover', onDocumentPointerOver, true)
      if (expanded)
        onInteractionChange(false)
    },
  }
}

/**
 * 盯住作用域里所有叠放的摞：带 data-stacked 的 group 出现就接上测量与展开，
 * 撤走或不再叠放就收掉。摞由作者按落位增删，这里不假设它们一直都在。
 */
export function trackNotificationStacks(root: HTMLElement, options: NotificationStacksOptions): () => void {
  const controllers = new Map<HTMLElement, StackController>()

  const sync = (): void => {
    const groups = new Set(root.querySelectorAll<HTMLElement>(STACKED_GROUP))
    for (const [group, controller] of controllers) {
      if (groups.has(group))
        continue
      controllers.delete(group)
      controller.dispose()
    }
    for (const group of groups) {
      if (controllers.has(group))
        continue
      controllers.set(group, createStackController(
        group,
        options.gap,
        active => options.onInteractionChange(group.dataset.placement as NotificationPlacement, active),
      ))
    }
  }

  const Mutation = root.ownerDocument.defaultView?.MutationObserver
  const observer = typeof Mutation === 'function' ? new Mutation(sync) : null
  observer?.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-stacked'] })
  sync()

  return () => {
    observer?.disconnect()
    for (const controller of controllers.values())
      controller.dispose()
    controllers.clear()
  }
}
