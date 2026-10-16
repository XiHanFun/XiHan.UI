/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 判断一段渲染出的内容能不能给节点提供名字或描述。

/** 后代元素带着其中任一条非空属性，就算能提供名字。 */
const NAMING_ATTRS = ['aria-label', 'aria-labelledby', 'alt', 'title'] as const

/** 带 aria-hidden="true" 或 hidden 属性的元素：整棵子树对读屏不可见。 */
function hiddenSubtree(el: Element): boolean {
  return el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('hidden')
}

/**
 * 节点的后代里有没有能提供名字或描述的内容：这个节点用内容取名、或被 aria-labelledby / aria-describedby 引用时，
 * 读屏能不能从它读出一句话。
 *
 * - 算文字：去掉首尾空白后非空的文本节点。
 * - 算带名字的节点：带非空 `aria-label`、`aria-labelledby`、`alt` 或 `title` 的后代元素。
 * - 不算：带 `aria-hidden="true"` 或 `hidden` 属性的后代元素，连同它的整棵子树；注释节点。
 * - 只看后代：节点自身的属性（包括它自己的 aria-label、aria-hidden、hidden）不参与判断。
 * - 只读属性，不读计算样式：靠样式表藏起的内容照样算。
 */
export function hasNamingContent(element: Element): boolean {
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: node => node.nodeType === Node.ELEMENT_NODE && hiddenSubtree(node as Element)
      ? NodeFilter.FILTER_REJECT
      : NodeFilter.FILTER_ACCEPT,
  })
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      if ((node.textContent ?? '').trim() !== '')
        return true
    }
    else if (NAMING_ATTRS.some(attr => ((node as Element).getAttribute(attr) ?? '').trim() !== '')) {
      return true
    }
  }
  return false
}
