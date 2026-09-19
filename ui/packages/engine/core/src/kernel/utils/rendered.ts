/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 rendered 相关实现。

import { isHTMLElement } from '../guards'

/**
 * 元素处于渲染树里且自身可见：祖先链上没有 hidden 或 display: none，自身的 visibility
 * 不是 hidden / collapse。visibility 会继承、也能被后代改回 visible，只看自身的计算值；
 * display: none 让整棵子树退出渲染树，后代的计算值仍是自己的声明，要沿祖先链查。
 * 浏览器只让处于渲染树里的可见元素接住 focus()；jsdom 不做排版，把这条判据显式补上，
 * 两处运行时对「能不能聚焦」才有同一个答案。
 */
export function isRendered(el: Element): boolean {
  const win = el.ownerDocument.defaultView
  const own = win?.getComputedStyle(el)
  if (own && (own.visibility === 'hidden' || own.visibility === 'collapse'))
    return false
  let node: Element | null = el
  while (node) {
    if (isHTMLElement(node) && node.hidden)
      return false
    if (win?.getComputedStyle(node).display === 'none')
      return false
    node = node.parentElement
  }
  return true
}
