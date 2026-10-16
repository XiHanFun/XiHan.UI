/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按顺序摆放子节点：已在原位的不动，不打断其中的焦点。

/** 让 parent 的子节点依次是 children：已在原位的不动（不打断焦点），其余移到位置上，多出来的移除。 */
export function placeChildren(parent: Element, children: readonly Element[]): void {
  children.forEach((child, index) => {
    const current = parent.children[index]
    if (current !== child)
      parent.insertBefore(child, current ?? null)
  })
  while (parent.children.length > children.length)
    parent.lastElementChild!.remove()
}
