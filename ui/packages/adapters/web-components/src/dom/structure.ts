/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按组件的标准结构生成作者没写的部件节点：节点写成作者会写的样子（data-xh-part 与身份属性），
// 带生成标记（值为 structure，与元素别的生成节点分开）、按 key 复用，接线照常经部件发现。

import type { StructureNode, StructureSlot, StructureTag } from '@xihan-ui/headless'
import type { KeyedChildren } from './generated-nodes'
import { createGeneratedElement, GEN_ATTR, reconcile } from './generated-nodes'

/** 标准结构生成的节点在 data-xh-gen 上写的值。 */
export const STRUCTURE_MARK = 'structure'

/** 作者在宿主直接子节点上写的 slot 值：单例为插槽名，重复部件为 `名:键`。 */
export function slotAttrOf(slot: StructureSlot): string {
  return slot.key === undefined ? slot.name : `${slot.name}:${slot.key}`
}

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
 * 带 slot 的节点内容归作者，这里不碰，只把它记进 slots（slot 值 → 节点），由调用方把作者节点搬进去。
 */
export function placeStructure(parent: Element, nodes: readonly StructureNode[], keys: KeyedChildren, slots?: Map<string, Element>): void {
  const doc = parent.ownerDocument
  reconcile(parent, nodes, keys, node => node.key, (node, reuse) => {
    const el = reuse instanceof HTMLElement && reuse.localName === node.tag
      ? reuse
      : createGeneratedElement(doc, node.tag, { [GEN_ATTR]: STRUCTURE_MARK })
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
    if (node.slot)
      slots?.set(slotAttrOf(node.slot), el)
    else if (node.children)
      placeStructure(el, node.children, keys, slots)
    else if (node.text !== undefined && el.textContent !== node.text)
      el.textContent = node.text
    return el
  }, STRUCTURE_MARK)
}

/**
 * 宿主名下作者写的部件节点，按部件名归组：跳过生成的节点（连同其中搬进去的作者内容）、
 * 宿主直接子节点里待搬的 slot 节点，以及嵌套库内元素的内部（嵌套元素本身当部件时照算）。
 */
export function authoredParts(host: Element): Map<string, HTMLElement[]> {
  const out = new Map<string, HTMLElement[]>()
  const walk = (parent: Element, top: boolean): void => {
    for (const child of Array.from(parent.children)) {
      if (!(child instanceof HTMLElement) || child.hasAttribute(GEN_ATTR) || (top && child.hasAttribute('slot')))
        continue
      const part = child.getAttribute('data-xh-part')
      if (part) {
        const list = out.get(part)
        if (list)
          list.push(child)
        else
          out.set(part, [child])
      }
      if (!child.localName.startsWith('xh-'))
        walk(child, false)
    }
  }
  walk(host, true)
  return out
}

/** 元素的标准结构声明里与生成规则有关的部分。 */
export interface StructureSpec {
  /** 元素自己生成 root 时用的标签，缺省 div。 */
  readonly rootTag?: StructureTag
  /** 作者可以在 root 里单独写、其余仍照常生成的部件。 */
  readonly takeover?: readonly string[]
}

/** 一台宿主的生成状态：按 key 复用的节点表，以及搬进结构里的作者节点 → 它所在的部件。 */
export interface StructureState {
  readonly keys: KeyedChildren
  readonly adopted: Map<Element, Element>
}

export function createStructureState(): StructureState {
  return { keys: new WeakMap(), adopted: new Map() }
}

/**
 * 按规则同步宿主的标准结构：
 * 1. 作者没写部件（或只写了 root）时生成：没写 root 连 root 一起生成，写了就生成在它里面；
 * 2. 作者在 root 里写了可接管部件时，结构不再铺这些部件（build 收到它们的名字），其余照常生成；
 * 3. 作者写了别的部件，或没写 root 就写了可接管部件，就由作者全写，撤掉生成过的节点；
 * 4. 宿主直接子节点里写了 slot 的作者节点搬进结构里对应的部件；部件没了时搬回宿主。
 * build 返回 undefined（状态还算不出）时这一轮不动。挪动节点前后焦点所在的节点不变。
 */
export function syncStructure(
  host: HTMLElement,
  spec: StructureSpec,
  build: (taken: ReadonlySet<string>) => readonly StructureNode[] | undefined,
  state: StructureState,
): void {
  const doc = host.ownerDocument
  const active = doc.activeElement
  const authored = authoredParts(host)
  const root = authored.get('root')?.[0]
  const takeover = new Set(spec.takeover ?? [])
  const taken = new Set<string>()
  let owned = false
  for (const [part, nodes] of authored) {
    if (part === 'root')
      continue
    if (root && takeover.has(part) && nodes.every(node => root.contains(node)))
      taken.add(part)
    else
      owned = true
  }

  const slots = new Map<string, Element>()
  if (owned) {
    placeStructure(host, [], state.keys)
    if (root)
      placeStructure(root, [], state.keys)
  }
  else {
    const nodes = build(taken)
    if (!nodes)
      return
    if (root) {
      placeStructure(host, [], state.keys)
      placeStructure(root, nodes, state.keys, slots)
    }
    else {
      placeStructure(host, [{ key: 'root', part: 'root', tag: spec.rootTag ?? 'div', children: nodes }], state.keys, slots)
    }
  }

  // 部件随结构被摘掉时，里面的作者节点跟着离场：放回宿主，等下一个同名部件出现再搬；作者自己挪走的不管
  for (const [node, target] of state.adopted) {
    if (node.parentElement !== target) {
      state.adopted.delete(node)
    }
    else if (!host.contains(target)) {
      host.append(node)
      state.adopted.delete(node)
    }
  }
  for (const child of Array.from(host.children)) {
    const name = child.getAttribute('slot')
    if (name === null || child.hasAttribute(GEN_ATTR))
      continue
    const target = slots.get(name)
    if (!target)
      continue
    target.append(child)
    state.adopted.set(child, target)
  }

  if (active instanceof HTMLElement && active !== doc.activeElement && active.isConnected)
    active.focus({ preventScroll: true })
}
