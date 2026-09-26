/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 元素自己生成进作者外壳里的节点：图表的图元、图例项、提示框的缺省内容。
// 作者写的节点不带标记，重画时只动自己生成的那些。

/** 本元素生成的节点的标记。 */
export const GEN_ATTR = 'data-xh-gen'

export const SVG_NS = 'http://www.w3.org/2000/svg'

/** 生成节点按 key 复用：父节点 → (key → 节点)。 */
export type KeyedChildren = WeakMap<Element, Map<string, Element>>

/** 父节点里本元素生成的直接子节点，按文档序。 */
export function generated(parent: Element): Element[] {
  return Array.from(parent.children).filter(node => node.hasAttribute(GEN_ATTR))
}

/** 建一个带生成标记的 HTML 节点。 */
export function makeGen<K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K): HTMLElementTagNameMap[K] {
  const node = doc.createElement(tag)
  node.setAttribute(GEN_ATTR, '')
  return node
}

/** 节点里有没有作者自己写的内容：有就归作者，元素不往里写缺省内容。 */
export function hasAuthorContent(host: Element): boolean {
  return Array.from(host.childNodes).some(node => !(node instanceof Element && node.hasAttribute(GEN_ATTR)) && Boolean(node.textContent?.trim()))
}

/**
 * 按 key 把一组节点排进父节点：已有的复用、缺的新建、多的移除，次序与输入一致。
 * 作者写在父节点里的节点不动，生成的节点排在它们之后。
 * 先摘掉多出的再排次序：挪动一个已在文档里的节点会让它里面的焦点丢掉，
 * 前景层的标记收起时若先排后摘，其后的节点都得挪一遍，聚焦的图元随之失焦。
 */
export function reconcile<T>(
  parent: Element,
  items: readonly T[],
  keys: KeyedChildren,
  keyOf: (item: T) => string,
  make: (item: T, reuse: Element | undefined) => Element,
): void {
  const known = keys.get(parent) ?? new Map<string, Element>()
  const next = new Map<string, Element>()
  for (const item of items) {
    const key = keyOf(item)
    next.set(key, make(item, known.get(key)))
  }
  const kept = new Set(next.values())
  for (const node of generated(parent)) {
    if (!kept.has(node))
      node.remove()
  }
  let cursor: Element | null = generated(parent)[0] ?? null
  for (const node of next.values()) {
    if (node === cursor)
      cursor = cursor.nextElementSibling
    else
      parent.insertBefore(node, cursor)
  }
  keys.set(parent, next)
}
