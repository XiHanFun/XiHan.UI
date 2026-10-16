/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按组件的标准结构生成作者没写的部件节点：节点写成作者会写的样子（data-xh-part 与身份属性），
// 带生成标记、按 key 复用，接线照常经部件发现。

import type { StructureNode } from '@xihan-ui/headless'
import type { KeyedChildren } from './generated-nodes'
import { createGeneratedElement, reconcile } from './generated-nodes'

/** 每个生成节点上一轮写过哪些身份属性：这一轮没有的要删掉。 */
const writtenAttrs = new WeakMap<Element, readonly string[]>()

/** 写一个属性；值没变不写。 */
function setAttr(el: Element, name: string, value: string): void {
  if (el.getAttribute(name) !== value)
    el.setAttribute(name, value)
}

/**
 * 把一组结构节点按 key 排进父节点：已有的复用、缺的新建、多的移除，作者写的节点不动、排在前面。
 * 节点上逐个写作者会写的身份属性，上一轮写过、这一轮没有的删掉。
 */
export function placeStructure(parent: Element, nodes: readonly StructureNode[], keys: KeyedChildren): void {
  const doc = parent.ownerDocument
  reconcile(parent, nodes, keys, node => node.key, (node, reuse) => {
    const el = reuse instanceof HTMLElement && reuse.localName === node.tag
      ? reuse
      : createGeneratedElement(doc, node.tag)
    setAttr(el, 'data-xh-part', node.part)
    const attrs = node.attrs ?? {}
    const names = Object.keys(attrs)
    for (const name of writtenAttrs.get(el) ?? []) {
      if (!(name in attrs))
        el.removeAttribute(name)
    }
    for (const name of names)
      setAttr(el, name, attrs[name]!)
    writtenAttrs.set(el, names)
    if (node.children)
      placeStructure(el, node.children, keys)
    else if (node.text !== undefined && el.textContent !== node.text)
      el.textContent = node.text
    return el
  })
}
