/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 建 DOM 节点的小工具：属性值为 false 或 undefined 时不写，true 写成空串。

/** 属性表：值为 false 或 undefined 的项不写，true 写成空串。 */
export type Attributes = Readonly<Record<string, string | number | boolean | undefined>>

/** 建一个元素，写上属性并依次放入子节点；字符串子节点作为文本。 */
export function h<K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K, attributes?: Attributes, children?: readonly (Node | string)[]): HTMLElementTagNameMap[K]
export function h(doc: Document, tag: string, attributes?: Attributes, children?: readonly (Node | string)[]): HTMLElement
export function h(doc: Document, tag: string, attributes: Attributes = {}, children: readonly (Node | string)[] = []): HTMLElement {
  const element = doc.createElement(tag)
  setAttributes(element, attributes)
  element.append(...children)
  return element
}

/** 写入一组属性：false 或 undefined 删除该属性，true 写成空串。 */
export function setAttributes(element: Element, attributes: Attributes): void {
  for (const [name, value] of Object.entries(attributes)) {
    if (value === undefined || value === false)
      element.removeAttribute(name)
    else
      element.setAttribute(name, value === true ? '' : String(value))
  }
}

/** 文本不同时才改写，避免无谓地触发观察者。 */
export function setText(element: Element, text: string): void {
  if (element.textContent !== text)
    element.textContent = text
}

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
