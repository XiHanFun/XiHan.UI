/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// Portal 视觉桥：把逻辑来源所处的视觉环境投影到该 Portal 实例独占的壳上。
//
// 壳上承接三样东西，都取「来源 composed 祖先链上最近的显式声明」：
// - 七个视觉 DOM 轴（主题、品牌、密度、对比度、动效、透明度、方向）；
// - 语气 data-tone。它不是视觉轴，语气在来源那里是靠这个属性表达的（tone.css 把整族
//   --xh-tone-* 声明在 [data-tone] 上），所以带属性过去而不是带派生出来的槽；
// - CSS 自定义属性里，壳从自己的父节点继承不到、且属于「来源视觉环境」的那部分：
//   作者自定义属性（不以 --xh- 开头）照投；--xh- 命名空间只投根上有声明的名字——令牌层把
//   全部令牌声明在 :where(:root) 上，作者按三种粒度在 :root 写的组件槽覆盖也在根上；
//   皮肤写在组件 / 家族元素上的公开槽（--xh-<组件>-*、--xh-collection-* 等）、私有槽
//   --xh-_* 与 [data-tone] 上的 --xh-tone-* 根上没有，它们是组件内部级联，不跨 Portal。
//   否则斑马行改写的 --xh-collection-bg-rest 会顺着行内的触发器一路继承进菜单项。

import { isShadowRoot } from '../guards'

const VISUAL_AXES = [
  'data-theme',
  'data-brand',
  'data-density',
  'data-contrast',
  'data-motion',
  'data-transparency',
  'dir',
] as const

/**
 * 逐项复制到壳上的属性：七个视觉轴，外加语气 data-tone。语气不是视觉轴，只是它在来源
 * 那里靠属性表达、整族 --xh-tone-* 都挂在 [data-tone] 上，所以带属性而不是带派生槽。
 */
const VISUAL_ATTRIBUTES = [...VISUAL_AXES, 'data-tone'] as const

/** 库自己的命名空间：令牌、组件槽、家族槽、私有槽与语气族都以它开头。 */
const LIBRARY_NAMESPACE = '--xh-'

/**
 * 祖先链上值得重算环境的属性：七个视觉轴与语气、inline 样式、匹配样式表声明的 class，
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
 * 文档根上是否声明了这个名字。计算样式看到令牌层与作者在 :root 写的覆盖；jsdom 的
 * 计算样式不含 inline 声明，补看 documentElement.style。
 */
function declaredOnRoot(name: string, root: HTMLElement, rootComputed: CSSStyleDeclaration | null): boolean {
  return (rootComputed?.getPropertyValue(name) ?? '') !== '' || root.style.getPropertyValue(name) !== ''
}

/**
 * 只投影壳从自己的 composed 父节点继承不到、且属于来源视觉环境的那部分。
 *
 * - 来源与壳父节点计算值一致的名字（典型是 :root 上的令牌）靠级联继承即可，逐个写进壳
 *   只会在每个 Portal 上复制整张令牌表。
 * - --xh- 命名空间再看一眼文档根：根上有声明的是令牌或作者在 :root 写的组件槽覆盖，
 *   祖先链上的局部改写要带过去；根上没有的是皮肤写在组件 / 家族元素上的槽，
 *   属于组件内部级联，不投。不维护名单：判定只对通过差分的少数名字做，每次同步
 *   与来源、壳父节点两份计算样式同批读取，不建跨同步的缓存。
 *
 * 三份计算样式在同一批次读完再写壳，不夹杂写入触发的样式重算。
 */
function projectedCustomProperties(source: Element, shell: HTMLElement): Map<string, string> {
  const doc = source.ownerDocument
  const view = doc.defaultView
  const parent = composedParent(shell)
  const sourceComputed = view?.getComputedStyle(source) ?? null
  const parentComputed = view && parent ? view.getComputedStyle(parent) : null
  const root = doc.documentElement
  const rootComputed = view ? view.getComputedStyle(root) : null
  const resolved = resolvedCustomProperties(source, sourceComputed)
  const values = new Map<string, string>()
  for (const [name, value] of resolved) {
    if (parentComputed && parentComputed.getPropertyValue(name) === value)
      continue
    if (name.startsWith(LIBRARY_NAMESPACE) && !declaredOnRoot(name, root, rootComputed))
      continue
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
 * 观察当前 composed 祖先链：视觉轴、语气、inline 样式与 class 变化重算环境；childList 接住来源或
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
 * - 视觉轴、语气、class、slot 的属性变化一律算。
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
 * 桥接七个视觉 DOM 轴与语气 data-tone，以及来源祖先链上局部覆盖的 CSS 自定义属性：
 * 作者自定义属性照投；--xh- 命名空间只投文档根上有声明的名字（令牌与 :root 上的组件槽
 * 覆盖），皮肤写在组件 / 家族元素上的公开槽、私有槽与 --xh-tone-* 是组件内部级联，
 * 不跨 Portal。壳从自己的父节点继承得到的不复制，普通计算样式不会被复制。
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
