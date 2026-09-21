/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 portal visual bridge 相关实现。

import { isShadowRoot } from '../guards'

const VISUAL_ATTRIBUTES = [
  'data-theme',
  'data-brand',
  'data-density',
  'data-contrast',
  'data-motion',
  'data-transparency',
  'dir',
] as const

/**
 * 祖先链上值得重算环境的属性：七个视觉轴、inline 样式、匹配样式表声明的 class，
 * 以及决定 composed 链走向的 slot。来源自身的 data-state / aria-* 状态翻转不在其列：
 * 触发器每开合一次都会改它们，而它们不改变来源所处的视觉环境。
 */
const OBSERVED_ATTRIBUTES: readonly string[] = [...VISUAL_ATTRIBUTES, 'style', 'class', 'slot']

type VisualAttribute = typeof VISUAL_ATTRIBUTES[number]
type AttributeSnapshot = ReadonlyMap<VisualAttribute, string | null>
type CustomPropertySnapshot = Readonly<{ value: string, priority: string }>
type CustomPropertySnapshots = ReadonlyMap<string, CustomPropertySnapshot>

export interface PortalVisualBridgeOptions {
  /** Portal 在逻辑组件树里的来源节点；逐轴从它向 composed 祖先查最近显式声明。 */
  source: Element
  /** 每个 Portal 实例独占的无盒壳；不得传共享 portal root。 */
  shell: HTMLElement
}

export interface PortalVisualBridge {
  /** 立即重新读取来源祖先链；视觉属性、自定义属性与换父由内建观察器自动调用。 */
  sync: () => void
  /** 停止观察并把壳上的视觉属性与自定义属性精确还原到接管前。 */
  dispose: () => void
}

interface Observation {
  node: Node
  options: MutationObserverInit
}

interface ObservationPlan {
  entries: Observation[]
  slots: HTMLSlotElement[]
  /** 链上全部被观察的节点；childList 记录只有摘掉或挂入其中之一时才算换父。 */
  chain: ReadonlySet<Node>
}

function snapshotAttributes(element: Element): Map<VisualAttribute, string | null> {
  return new Map(VISUAL_ATTRIBUTES.map(name => [name, element.getAttribute(name)]))
}

function applyAttributes(element: Element, values: AttributeSnapshot): void {
  for (const name of VISUAL_ATTRIBUTES) {
    const value = values.get(name) ?? null
    if (value === null) {
      if (element.hasAttribute(name))
        element.removeAttribute(name)
    }
    else if (element.getAttribute(name) !== value) {
      element.setAttribute(name, value)
    }
  }
}

function styleOf(element: Element): CSSStyleDeclaration | null {
  return 'style' in element ? (element as HTMLElement).style : null
}

function snapshotCustomProperties(element: Element, names: Iterable<string>): Map<string, CustomPropertySnapshot> {
  const style = styleOf(element)
  const values = new Map<string, CustomPropertySnapshot>()
  if (!style)
    return values
  for (const name of names) {
    values.set(name, {
      value: style.getPropertyValue(name),
      priority: style.getPropertyPriority(name),
    })
  }
  return values
}

function restoreCustomProperty(style: CSSStyleDeclaration, name: string, snapshot: CustomPropertySnapshot): void {
  if (snapshot.value)
    style.setProperty(name, snapshot.value, snapshot.priority)
  else
    style.removeProperty(name)
}

function restoreCustomProperties(element: Element, values: CustomPropertySnapshots): void {
  const style = styleOf(element)
  if (!style)
    return
  for (const [name, snapshot] of values)
    restoreCustomProperty(style, name, snapshot)
}

/** 穿过 ShadowRoot 回到 host；普通 Light DOM 直接取 parentElement。 */
function composedParent(element: Element): Element | null {
  if (element.assignedSlot)
    return element.assignedSlot
  if (element.parentElement)
    return element.parentElement
  const root = element.getRootNode()
  return isShadowRoot(root) ? root.host : null
}

function visualSnapshot(source: Element): Map<VisualAttribute, string | null> {
  const values = new Map<VisualAttribute, string | null>()
  for (let node: Element | null = source; node; node = composedParent(node)) {
    for (const name of VISUAL_ATTRIBUTES) {
      if (!values.has(name) && node.hasAttribute(name))
        values.set(name, node.getAttribute(name))
    }
  }
  for (const name of VISUAL_ATTRIBUTES) {
    if (!values.has(name))
      values.set(name, null)
  }
  return values
}

/**
 * 来源解析到的全部 CSS 自定义属性。计算样式列出规则里声明的名字；祖先的 inline 样式
 * 补给 jsdom 不枚举继承自定义属性的实现。普通计算样式绝不复制。
 */
function resolvedCustomProperties(source: Element, computed: CSSStyleDeclaration | null): Map<string, string> {
  const values = new Map<string, string>()
  if (computed) {
    for (let index = 0; index < computed.length; index++) {
      const name = computed.item(index)
      if (!name.startsWith('--'))
        continue
      const value = computed.getPropertyValue(name)
      if (value)
        values.set(name, value)
    }
  }

  for (let node: Element | null = source; node; node = composedParent(node)) {
    const style = styleOf(node)
    if (!style)
      continue
    for (let index = 0; index < style.length; index++) {
      const name = style.item(index)
      if (!name.startsWith('--'))
        continue
      if (values.has(name))
        continue
      const value = computed?.getPropertyValue(name) || style.getPropertyValue(name)
      if (value)
        values.set(name, value)
    }
  }
  return values
}

/**
 * 只投影壳从自己的 composed 父节点继承不到的那部分：来源与壳父节点计算值一致的名字
 * （典型是 :root 上的令牌）靠级联继承即可，逐个写进壳只会在每个 Portal 上复制整张令牌表。
 * 两份计算样式在同一批次读完再写壳，不夹杂写入触发的样式重算。
 */
function projectedCustomProperties(source: Element, shell: HTMLElement): Map<string, string> {
  const view = source.ownerDocument.defaultView
  const parent = composedParent(shell)
  const sourceComputed = view?.getComputedStyle(source) ?? null
  const parentComputed = view && parent ? view.getComputedStyle(parent) : null
  const resolved = resolvedCustomProperties(source, sourceComputed)
  if (!parentComputed)
    return resolved
  const values = new Map<string, string>()
  for (const [name, value] of resolved) {
    if (parentComputed.getPropertyValue(name) !== value)
      values.set(name, value)
  }
  return values
}

function applyCustomProperties(
  element: Element,
  values: ReadonlyMap<string, string>,
  initial: Map<string, CustomPropertySnapshot>,
  applied: Set<string>,
): void {
  const style = styleOf(element)
  if (!style)
    return
  for (const [name, value] of values) {
    const current = style.getPropertyValue(name)
    const priority = style.getPropertyPriority(name)
    if (!initial.has(name))
      initial.set(name, { value: current, priority })
    if (current !== value || priority)
      style.setProperty(name, value)
    applied.add(name)
  }
  const stale: string[] = []
  for (const name of applied) {
    if (!values.has(name))
      stale.push(name)
  }
  for (const name of stale) {
    restoreCustomProperty(style, name, initial.get(name)!)
    applied.delete(name)
  }
}

/**
 * 观察当前 composed 祖先链：视觉轴、inline 样式与 class 变化重算环境；childList 接住来源或
 * 任一祖先换父。ShadowRoot 本身也观察 childList，否则来源恰为 shadow 根直接子节点时，
 * 移出不会命中 host。
 */
function observationsFor(source: Element): ObservationPlan {
  const out: Observation[] = []
  const slots: HTMLSlotElement[] = []
  const seen = new Set<Node>()
  for (let node: Element | null = source; node; node = composedParent(node)) {
    if (node.localName === 'slot')
      slots.push(node as HTMLSlotElement)
    if (!seen.has(node)) {
      seen.add(node)
      out.push({
        node,
        options: { attributes: true, attributeFilter: [...OBSERVED_ATTRIBUTES], attributeOldValue: true, childList: true },
      })
    }
    const root = node.getRootNode()
    if (isShadowRoot(root) && !seen.has(root)) {
      seen.add(root)
      out.push({ node: root, options: { childList: true } })
    }
  }
  return { entries: out, slots, chain: seen }
}

function touchesChain(nodes: NodeList, chain: ReadonlySet<Node>): boolean {
  for (let index = 0; index < nodes.length; index++) {
    if (chain.has(nodes[index]!))
      return true
  }
  return false
}

/**
 * 一批变更记录里是否有会改变来源视觉环境的那种。
 *
 * - 视觉轴、class、slot 的属性变化一律算。
 * - inline 样式只在前后任一侧含自定义属性时才算：body 滚动锁定写的 overflow / padding、
 *   定位引擎写的 transform 都落在链上，但改不了任何自定义属性。
 * - childList 只在摘掉或挂入链上节点时才算换父：焦点护栏插进 body、触发器换文本都不是。
 */
function affectsVisualEnvironment(records: MutationRecord[], chain: ReadonlySet<Node>): boolean {
  for (const record of records) {
    if (record.type === 'childList') {
      if (touchesChain(record.removedNodes, chain) || touchesChain(record.addedNodes, chain))
        return true
      continue
    }
    if (record.attributeName !== 'style')
      return true
    const target = record.target as Element
    if ((record.oldValue ?? '').includes('--') || (target.getAttribute('style') ?? '').includes('--'))
      return true
  }
  return false
}

function collectedError(primary: unknown, rollback: unknown[], message: string): unknown {
  return rollback.length ? new AggregateError([primary, ...rollback], message, { cause: primary }) : primary
}

/**
 * 把逻辑来源最近显式声明的视觉环境投影到单个 Portal 壳。
 *
 * 桥接七个视觉 DOM 轴，以及来源祖先链上局部覆盖的 CSS 自定义属性；壳从自己的父节点
 * 继承得到的（:root 上的令牌）不复制，普通计算样式不会被复制。
 */
export function createPortalVisualBridge(options: PortalVisualBridgeOptions): PortalVisualBridge {
  const { source, shell } = options
  const doc = source.ownerDocument
  if (shell.ownerDocument !== doc)
    throw new Error('[xh] Portal 的来源与实例壳必须属于同一 Document')
  const Observer = doc.defaultView?.MutationObserver
  if (typeof Observer !== 'function')
    throw new Error('[xh] Portal 视觉环境需要来源 Document 的 MutationObserver')

  const initial = snapshotAttributes(shell)
  let initialCustom = new Map<string, CustomPropertySnapshot>()
  let appliedCustom = new Set<string>()
  let observed: ObservationPlan = { entries: [], slots: [], chain: new Set() }
  let attachedSlots: HTMLSlotElement[] = []
  let disposed = false
  let syncing = false
  let pending = false

  const observer = new Observer((records) => {
    if (affectsVisualEnvironment(records, observed.chain))
      sync()
  })
  const onSlotChange = (): void => sync()

  function observe(plan: ObservationPlan): void {
    observer.disconnect()
    for (const slot of attachedSlots)
      slot.removeEventListener('slotchange', onSlotChange)
    attachedSlots = []
    for (const entry of plan.entries)
      observer.observe(entry.node, entry.options)
    for (const slot of plan.slots) {
      slot.addEventListener('slotchange', onSlotChange)
      attachedSlots.push(slot)
    }
  }

  function syncOnce(): void {
    if (source.ownerDocument !== doc || shell.ownerDocument !== doc)
      throw new Error('[xh] Portal 视觉环境同步期间来源或实例壳切换了 Document')
    const before = snapshotAttributes(shell)
    const nextCustom = projectedCustomProperties(source, shell)
    const beforeCustom = snapshotCustomProperties(shell, new Set([...appliedCustom, ...nextCustom.keys()]))
    const initialCustomBefore = new Map(initialCustom)
    const appliedCustomBefore = new Set(appliedCustom)
    const nextObserved = observationsFor(source)
    try {
      applyAttributes(shell, visualSnapshot(source))
      applyCustomProperties(shell, nextCustom, initialCustom, appliedCustom)
      observe(nextObserved)
      observed = nextObserved
    }
    catch (error) {
      const rollbackErrors: unknown[] = []
      try {
        applyAttributes(shell, before)
      }
      catch (rollbackError) {
        rollbackErrors.push(rollbackError)
      }
      try {
        restoreCustomProperties(shell, beforeCustom)
        initialCustom = initialCustomBefore
        appliedCustom = appliedCustomBefore
      }
      catch (rollbackError) {
        rollbackErrors.push(rollbackError)
      }
      try {
        observe(observed)
      }
      catch (rollbackError) {
        rollbackErrors.push(rollbackError)
      }
      throw collectedError(error, rollbackErrors, '[xh] Portal 视觉环境同步与回滚同时失败')
    }
  }

  function sync(): void {
    if (disposed)
      return
    if (syncing) {
      pending = true
      return
    }
    syncing = true
    try {
      do {
        pending = false
        syncOnce()
      } while (pending)
    }
    finally {
      syncing = false
    }
  }

  try {
    sync()
  }
  catch (error) {
    disposed = true
    observer.disconnect()
    for (const slot of attachedSlots)
      slot.removeEventListener('slotchange', onSlotChange)
    attachedSlots = []
    const rollbackErrors: unknown[] = []
    try {
      applyAttributes(shell, initial)
    }
    catch (rollbackError) {
      rollbackErrors.push(rollbackError)
    }
    try {
      restoreCustomProperties(shell, initialCustom)
    }
    catch (rollbackError) {
      rollbackErrors.push(rollbackError)
    }
    throw collectedError(error, rollbackErrors, '[xh] Portal 视觉环境初始化与回滚同时失败')
  }

  return {
    sync,
    dispose() {
      if (disposed)
        return
      disposed = true
      observer.disconnect()
      for (const slot of attachedSlots)
        slot.removeEventListener('slotchange', onSlotChange)
      attachedSlots = []
      applyAttributes(shell, initial)
      restoreCustomProperties(shell, initialCustom)
    },
  }
}
