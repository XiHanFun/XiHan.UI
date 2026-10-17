/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 元素自己生成进作者外壳里的节点：图表的图元、图例项、提示框的缺省内容。
// 作者写的节点不带标记，重画时只动自己生成的那些。

import { GHOST_ATTR } from '@xihan-ui/core'

/** 本元素生成的节点的标记。 */
export const GEN_ATTR = 'data-xh-gen'

export const SVG_NS = 'http://www.w3.org/2000/svg'

/** 生成节点按 key 复用：父节点 → (key → 节点)。 */
export type KeyedChildren = WeakMap<Element, Map<string, Element>>

/** 父节点里本元素生成的直接子节点，按文档序；给了 mark 时只取生成标记等于它的那些。列表动效放的离场替身不算。 */
export function generatedChildren(parent: Element, mark?: string): Element[] {
  return Array.from(parent.children).filter(node => node.hasAttribute(GEN_ATTR) && !node.hasAttribute(GHOST_ATTR) && (mark === undefined || node.getAttribute(GEN_ATTR) === mark))
}

/** 属性表：值为 false 或 undefined 的项删除该属性，true 写成空串，其余转成字符串。 */
export type ElementAttributes = Readonly<Record<string, string | number | boolean | undefined>>

/** 按属性表写入属性：值没变的不写，false 或 undefined 删除。 */
export function setAttributes(element: Element, attributes: ElementAttributes): void {
  for (const [name, value] of Object.entries(attributes)) {
    if (value === undefined || value === false) {
      if (element.hasAttribute(name))
        element.removeAttribute(name)
      continue
    }
    const text = value === true ? '' : String(value)
    if (element.getAttribute(name) !== text)
      element.setAttribute(name, text)
  }
}

/** 文本不同时才改写，相同时不产生子树变更。 */
export function setText(element: Element, text: string): void {
  if (element.textContent !== text)
    element.textContent = text
}

/**
 * 建一个不带生成标记的 HTML 节点，写成作者会写的样子：按属性表写上属性，依次放入子节点（字符串作为文本）。
 * 用代码搭库内元素的 Light DOM 结构（data-xh-part 角色节点）时用它，带生成标记的子节点会被宿主当作自己生成的节点收走。
 */
export function createAuthoredElement<K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K, attributes?: ElementAttributes, children?: readonly (Node | string)[]): HTMLElementTagNameMap[K]
export function createAuthoredElement(doc: Document, tag: string, attributes?: ElementAttributes, children?: readonly (Node | string)[]): HTMLElement
export function createAuthoredElement(doc: Document, tag: string, attributes: ElementAttributes = {}, children: readonly (Node | string)[] = []): HTMLElement {
  const node = doc.createElement(tag)
  setAttributes(node, attributes)
  node.append(...children)
  return node
}

/** 建一个带生成标记的 HTML 节点；属性表与子节点同 createAuthoredElement。 */
export function createGeneratedElement<K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K, attributes?: ElementAttributes, children?: readonly (Node | string)[]): HTMLElementTagNameMap[K]
export function createGeneratedElement(doc: Document, tag: string, attributes?: ElementAttributes, children?: readonly (Node | string)[]): HTMLElement
export function createGeneratedElement(doc: Document, tag: string, attributes: ElementAttributes = {}, children: readonly (Node | string)[] = []): HTMLElement {
  const node = doc.createElement(tag)
  node.setAttribute(GEN_ATTR, '')
  setAttributes(node, attributes)
  node.append(...children)
  return node
}

/** 节点里有没有作者自己写的内容：有就归作者，元素不往里写缺省内容。 */
export function hasAuthorContent(host: Element): boolean {
  return Array.from(host.childNodes).some(node => !(node instanceof Element && node.hasAttribute(GEN_ATTR)) && Boolean(node.textContent?.trim()))
}

/**
 * 按 key 把一组节点排进父节点：已有的复用、缺的新建、多的移除，次序与输入一致。
 * 作者写在父节点里的节点不动，生成的节点排在它们之后。给了 mark 时只认、只摘生成标记等于它的节点，
 * 同一父节点里别的生成节点（另一套生成逻辑写的）不动，夹在这些节点之间的作者节点也不动：只排它们之间的先后。
 * 先摘掉多出的再排次序：挪动一个已在文档里的节点会让它里面的焦点丢掉，
 * 前景层的标记收起时若先排后摘，其后的节点都得挪一遍，聚焦的图元随之失焦。
 * 复用的节点被搬到了别处、仍在文档里（浮层搬进 portal 落点）时留在原处，不拉回来：搬走它的一方会把它放回原位。
 */
export function reconcile<T>(
  parent: Element,
  items: readonly T[],
  keys: KeyedChildren,
  keyOf: (item: T) => string,
  make: (item: T, reuse: Element | undefined) => Element,
  mark?: string,
): void {
  const known = keys.get(parent) ?? new Map<string, Element>()
  const next = new Map<string, Element>()
  for (const item of items) {
    const key = keyOf(item)
    next.set(key, make(item, known.get(key)))
  }
  const kept = new Set(next.values())
  for (const node of generatedChildren(parent, mark)) {
    if (!kept.has(node))
      node.remove()
  }
  // 排位时跳过离场替身与别的生成标记的节点
  const passes = (sibling: Element): boolean => sibling.hasAttribute(GHOST_ATTR) || (mark !== undefined && sibling.getAttribute(GEN_ATTR) !== mark)
  const after = (node: Element): Element | null => {
    let sibling = node.nextElementSibling
    while (sibling && passes(sibling))
      sibling = sibling.nextElementSibling
    return sibling
  }
  let cursor: Element | null = generatedChildren(parent, mark)[0] ?? null
  for (const [key, node] of next) {
    if (node.parentNode !== parent && node.isConnected && known.get(key) === node)
      continue
    if (node === cursor)
      cursor = after(cursor)
    else
      parent.insertBefore(node, cursor)
  }
  keys.set(parent, next)
}
