/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 宿主写在设计器元素上的作者内容转交给设计器内部的外框：写了 slot="<名>" 的直接子元素搬进外框，后来加的跟着搬。

/**
 * 把 host 上 slot 写在 names 里的直接子元素搬进 frame，外框再按 slot 领进对应的区或段；后来加到 host 上的跟着搬。
 * 设计器用它让宿主往内部外框里放内容，如菜单栏右边一段的 menubar-end。返回停止转交的函数，已经搬过去的不搬回来。
 */
export function forwardFrameSlots(host: HTMLElement, frame: HTMLElement, names: readonly string[]): () => void {
  const wanted = new Set(names)
  const move = (): void => {
    for (const child of Array.from(host.children)) {
      const slot = child.getAttribute('slot')
      if (child !== frame && slot !== null && wanted.has(slot))
        frame.append(child)
    }
  }
  move()
  const Observer = host.ownerDocument.defaultView?.MutationObserver
  if (!Observer)
    return () => {}
  const observer = new Observer(move)
  observer.observe(host, { childList: true })
  return () => observer.disconnect()
}
