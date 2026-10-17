/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按组件的标准结构生成作者没写的部件节点：节点写成作者会写的样子（data-xh-part 与身份属性），
// 带生成标记（值为 structure，与元素别的生成节点分开）、按 key 复用，接线照常经部件发现。

import type { StructureChild, StructureInstanceNode, StructureSlot, StructureTag, StructureTakeoverPosition } from '@xihan-ui/headless'
import type { KeyedChildren } from './generated-nodes'
import { DIAGNOSTIC_CODES, isDev, reportDiagnostic } from '@xihan-ui/core'
import { isStructureInstance } from '@xihan-ui/headless'
import { createGeneratedElement, GEN_ATTR, generatedChildren, reconcile } from './generated-nodes'

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
export function placeStructure(parent: Element, nodes: readonly StructureChild[], keys: KeyedChildren, slots?: Map<string, Element>): void {
  const doc = parent.ownerDocument
  reconcile(parent, nodes, keys, node => node.key, (node, reuse) => {
    if (isStructureInstance(node))
      return placeInstance(doc, node, reuse)
    const el = reuse instanceof HTMLElement && reuse.localName === node.tag
      ? reuse
      : createStructureElement(doc, node.tag)
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

/** 建一个结构节点；结构里组合进来的库内元素还没注册时，开发期告警：它不会升级，那一块是空的。 */
function createStructureElement(doc: Document, tag: StructureTag | `xh-${string}`): HTMLElement {
  const el = createGeneratedElement(doc, tag, { [GEN_ATTR]: STRUCTURE_MARK })
  if (tag.startsWith('xh-') && isDev() && typeof customElements !== 'undefined' && !customElements.get(tag)) {
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.wcUnregisteredElement,
      level: 'warn',
      message: `标准结构生成了 <${tag}>，它还没注册：在宿主元素类的 static dependencies 里声明它，按需注册宿主时会连带注册`,
      node: el,
      detail: { tag },
    })
  }
  return el
}

/** 组合节点上一轮赋过的属性、各事件这一轮的回调，以及已经挂了监听的事件。 */
interface InstanceState {
  props: Readonly<Record<string, unknown>>
  readonly handlers: Map<string, (detail: unknown) => void>
  readonly listening: Set<string>
}

const instanceStates = new WeakMap<Element, InstanceState>()

/** `onValueChange` → `value-change`；不是回调名时为 undefined。 */
function eventOf(key: string): string | undefined {
  return /^on[A-Z]/.test(key) ? key.slice(2).replace(/[A-Z]/g, c => `-${c.toLowerCase()}`).slice(1) : undefined
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object')
    return false
  const proto = Object.getPrototypeOf(value) as unknown
  return proto === Object.prototype || proto === null
}

/** 属性值相等：函数比引用，数组与普通对象逐项比，其余比引用。 */
function sameProp(a: unknown, b: unknown): boolean {
  if (Object.is(a, b))
    return true
  if (Array.isArray(a))
    return Array.isArray(b) && a.length === b.length && a.every((item, index) => sameProp(item, b[index]))
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a)
    return keys.length === Object.keys(b).length && keys.every(key => key in b && sameProp(a[key], b[key]))
  }
  return false
}

/**
 * 放一个组合节点：生成（或复用）`<xh-${instance}>`，props 里的数据按 property 赋值，与上一轮相等就不写，免得重设数组
 * 打断内层的输入；上一轮有、这一轮没了的设回 undefined。`onXxx` 回调换成 `xxx` 事件的监听，每个事件只挂一个，
 * 监听里调这一轮最新的回调、传事件的 detail，并且不让事件冒出外层宿主。
 */
function placeInstance(doc: Document, node: StructureInstanceNode, reuse: Element | undefined): Element {
  const tag = `xh-${node.instance}` as const
  const el = reuse instanceof HTMLElement && reuse.localName === tag ? reuse : createStructureElement(doc, tag)
  let state = instanceStates.get(el)
  if (!state) {
    state = { props: {}, handlers: new Map(), listening: new Set() }
    instanceStates.set(el, state)
  }
  const target = el as unknown as Record<string, unknown>
  const data: Record<string, unknown> = {}
  const events = new Set<string>()
  for (const [key, value] of Object.entries(node.props ?? {})) {
    const event = eventOf(key)
    if (event === undefined) {
      data[key] = value
      continue
    }
    if (typeof value !== 'function')
      continue
    events.add(event)
    state.handlers.set(event, value as (detail: unknown) => void)
    if (!state.listening.has(event)) {
      state.listening.add(event)
      const handlers = state.handlers
      el.addEventListener(event, (e) => {
        const handler = handlers.get(event)
        if (!handler)
          return
        e.stopPropagation()
        handler((e as CustomEvent).detail)
      })
    }
  }
  for (const event of [...state.handlers.keys()]) {
    if (!events.has(event))
      state.handlers.delete(event)
  }
  for (const key of Object.keys(state.props)) {
    if (!(key in data))
      target[key] = undefined
  }
  for (const [key, value] of Object.entries(data)) {
    if (!(key in state.props) || !sameProp(state.props[key], value))
      target[key] = value
  }
  state.props = data
  return el
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
  /** 作者可以在 root 里单独写、其余仍照常生成的部件及其位置，trailing 的按 root 末尾的先后排列。 */
  readonly takeover?: Readonly<Record<string, StructureTakeoverPosition>>
}

/**
 * 开发期核对：排在末尾的可接管部件必须在 root 子节点的最后、按登记的先后排列；不然作者接管它时，
 * 作者节点与生成节点的先后会和缺省结构不一致，DOM 序与 Tab 序跟着错。经 portal 的部件不受限。
 */
function checkTakeoverOrder(host: Element, nodes: readonly StructureChild[], takeover: ReadonlyMap<string, StructureTakeoverPosition>): void {
  if (takeover.size === 0 || !isDev())
    return
  const order = [...takeover].filter(([, position]) => position === 'trailing').map(([part]) => part)
  let rank = -1
  let last: string | undefined
  for (const node of nodes) {
    const part = isStructureInstance(node) ? undefined : node.part
    const position = part === undefined ? undefined : takeover.get(part)
    if (position === 'portal')
      continue
    const next = position === 'trailing' ? order.indexOf(part!) : -1
    // 末尾部件后面又出现了普通部件，错的是那个末尾部件；末尾部件之间先后不对，错的是排到前面的这一个
    const misplaced = position === undefined ? (rank >= 0 ? last : undefined) : (next < rank ? part : undefined)
    if (misplaced !== undefined) {
      reportDiagnostic({
        code: DIAGNOSTIC_CODES.wcStructureTakeoverOrder,
        level: 'error',
        message: `标准结构里可接管的部件 ${misplaced} 没有排在 root 末尾、或没按登记的先后排列`,
        part: misplaced,
        node: host,
        detail: { tag: host.localName, order },
      })
      return
    }
    if (position === 'trailing') {
      rank = next
      last = part
    }
  }
}

/** 作者接管了末尾部件时，把末尾那一段按登记的先后排好：接管的用作者节点，其余用生成节点；已在位的不动。 */
function placeTrailing(root: Element, takeover: ReadonlyMap<string, StructureTakeoverPosition>, taken: ReadonlySet<string>, authored: ReadonlyMap<string, HTMLElement[]>): void {
  const tail: Element[] = []
  for (const [part, position] of takeover) {
    if (position !== 'trailing')
      continue
    if (taken.has(part))
      tail.push(...(authored.get(part) ?? []).filter(node => node.parentElement === root))
    else
      tail.push(...generatedChildren(root, STRUCTURE_MARK).filter(node => node.getAttribute('data-xh-part') === part))
  }
  const children = Array.from(root.children)
  const start = children.length - tail.length
  if (!tail.every((node, index) => children[start + index] === node)) {
    for (const node of tail)
      root.append(node)
  }
}

/** 一台宿主的生成状态：按 key 复用的节点表，以及搬进结构里的作者节点 → 它所在的部件。 */
export interface StructureState {
  readonly keys: KeyedChildren
  readonly adopted: Map<Element, Element>
}

export function createStructureState(): StructureState {
  return { keys: new WeakMap(), adopted: new Map() }
}

/** 作者有没有给这个插槽（slot 属性值）写内容：宿主直接子节点里待搬的，或已经搬进结构、还在原处的。 */
export function hasSlotContent(host: Element, state: StructureState, slot: string): boolean {
  for (const child of Array.from(host.children)) {
    if (child.getAttribute('slot') === slot && !child.hasAttribute(GEN_ATTR))
      return true
  }
  for (const [node, target] of state.adopted) {
    if (node.parentElement === target && node.getAttribute('slot') === slot)
      return true
  }
  return false
}

/**
 * 按规则同步宿主的标准结构：
 * 1. 作者没写部件（或只写了 root）时生成：没写 root 连 root 一起生成，写了就生成在它里面；
 * 2. 作者在 root 里写了可接管部件时，结构不再铺这些部件（build 收到它们的名字），其余照常生成；
 *    排在末尾的可接管部件按登记的先后放回 root 的末尾，作者节点与生成节点交错时次序照缺省结构；
 * 3. 作者写了别的部件，或没写 root 就写了可接管部件，就由作者全写，撤掉生成过的节点；
 * 4. 宿主直接子节点里写了 slot 的作者节点搬进结构里对应的部件；部件没了时搬回宿主。
 * build 返回 undefined（状态还算不出）时这一轮不动。挪动节点前后焦点所在的节点不变。
 */
export function syncStructure(
  host: HTMLElement,
  spec: StructureSpec,
  build: (taken: ReadonlySet<string>) => readonly StructureChild[] | undefined,
  state: StructureState,
): void {
  const doc = host.ownerDocument
  const active = doc.activeElement
  const authored = authoredParts(host)
  const root = authored.get('root')?.[0]
  const takeover = new Map(Object.entries(spec.takeover ?? {}))
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
    checkTakeoverOrder(host, nodes, takeover)
    if (root) {
      placeStructure(host, [], state.keys)
      placeStructure(root, nodes, state.keys, slots)
      if (taken.size > 0)
        placeTrailing(root, takeover, taken, authored)
    }
    else {
      placeStructure(host, [{ key: 'root', part: 'root', tag: spec.rootTag ?? 'div', children: nodes }], state.keys, slots)
    }
  }

  // 部件随结构被摘掉时，里面的作者节点跟着离场：放回宿主，等下一个同名部件出现再搬；作者自己挪走的不管。
  // 部件跟着浮层搬进 portal 落点时仍在文档里，不算摘掉
  for (const [node, target] of state.adopted) {
    if (node.parentElement !== target) {
      state.adopted.delete(node)
    }
    else if (!target.isConnected) {
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
