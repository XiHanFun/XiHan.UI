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
// - CSS 自定义属性里，壳自己解析不出来、且属于「来源视觉环境」的那部分：
//   作者自定义属性（不以 --xh- 开头）照投；--xh- 命名空间只投根上有声明的名字——令牌层把
//   全部令牌声明在 :where(:root) 上，作者按三种粒度在 :root 写的组件槽覆盖也在根上；
//   皮肤写在组件 / 家族元素上的公开槽（--xh-<组件>-*、--xh-collection-* 等）、私有槽
//   --xh-_* 与 [data-tone] 上的 --xh-tone-* 根上没有，它们是组件内部级联，不跨 Portal。
//   否则斑马行改写的 --xh-collection-bg-rest 会顺着行内的触发器一路继承进菜单项。
//
// 「壳自己解析不出来」由两层判据收窄，见 portal-visual-index：只由文档根或桥复制过去的那些
// 属性选中的规则（令牌层的 :where(:root) 与 :where([data-density='compact']) 之类），壳带着
// 同样的属性会把同一条规则再命中一次，不必逐名字复制；只有别处声明的名字才需要读与比对。

import type { PortalVisualIndex } from './portal-visual-index'
import { isShadowRoot } from '../guards'
import { collectReferences, portalVisualIndex } from './portal-visual-index'

const VISUAL_AXES = [
  'data-theme',
  'data-brand',
  'data-density',
  'data-contrast',
  'data-motion',
  'data-transparency',
  'data-material',
  'dir',
] as const

/**
 * 逐项复制到壳上的属性：八个视觉轴，外加语气 data-tone。语气不是视觉轴，只是它在来源
 * 那里靠属性表达、整族 --xh-tone-* 都挂在 [data-tone] 上，所以带属性而不是带派生槽。
 * 材质轴（standard / liquid）写在根或容器上，浮层里的导航层部件按它换材质，同样带属性。
 */
const VISUAL_ATTRIBUTES = [...VISUAL_AXES, 'data-tone'] as const

/** 库自己的命名空间：令牌、组件槽、家族槽、私有槽与语气族都以它开头。 */
const LIBRARY_NAMESPACE = '--xh-'

/**
 * 祖先链上值得重算环境的属性：八个视觉轴与语气、inline 样式、匹配样式表声明的 class，
 * 以及决定 composed 链走向的 slot。来源自身的 data-state / aria-* 状态翻转不在其列：
 * 触发器每开合一次都会改它们，而它们不改变来源所处的视觉环境。
 */
const OBSERVED_ATTRIBUTES: readonly string[] = [...VISUAL_ATTRIBUTES, 'style', 'class', 'slot']

/** 文档索引的入参：壳带得走的属性就是「规则能在壳上再命中一次」的全部条件。 */
const INDEX_INPUT = { reproduced: new Set<string>(VISUAL_ATTRIBUTES) } as const

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

interface AncestorChain {
  /** 来源在前、文档根在后的 composed 祖先链。 */
  readonly elements: readonly Element[]
  readonly slots: readonly HTMLSlotElement[]
  readonly observations: readonly Observation[]
  /** 链上全部被观察的节点；childList 记录只有摘掉或挂入其中之一时才算换父。 */
  readonly nodes: ReadonlySet<Node>
  /** 链穿过 ShadowRoot：文档索引看不到影子树里的样式表，这台桥停用索引收窄。 */
  readonly crossesShadowRoot: boolean
}

/**
 * 一次同步（或一批同步）里共享的读取结果。
 *
 * 文档根的声明判定与壳父节点的取值，对同一批次里的每台桥都是同一个答案：页面根上加一个
 * class 会让链下每台桥各同步一次，逐台重读就是「浮层数 × 自定义属性数」。批次边界是一个
 * 微任务检查点，MutationObserver 的全部回调都在其中跑完，期间没有别的脚本插进来改样式。
 * 显式 sync() 不走批次，每次都是全新读取。
 */
interface SyncContext {
  readonly doc: Document
  readonly view: (Window & typeof globalThis) | null
  readonly root: HTMLElement
  readonly rootComputed: CSSStyleDeclaration | null
  readonly declared: Map<string, boolean>
  readonly parents: Map<Element, { computed: CSSStyleDeclaration, values: Map<string, string> }>
  index: PortalVisualIndex | null
  candidates: readonly string[] | null
  candidatesReady: boolean
}

const batches = new Map<Document, SyncContext>()

function createContext(doc: Document): SyncContext {
  const view = doc.defaultView
  const root = doc.documentElement
  return {
    doc,
    view,
    root,
    rootComputed: view ? view.getComputedStyle(root) : null,
    declared: new Map(),
    parents: new Map(),
    index: null,
    candidates: null,
    candidatesReady: false,
  }
}

/** 取当前微任务检查点的共享上下文；没有就开一个，并在检查点末尾丢弃。 */
function openBatch(doc: Document): SyncContext {
  const existing = batches.get(doc)
  if (existing)
    return existing
  const batch = createContext(doc)
  batches.set(doc, batch)
  queueMicrotask(() => {
    if (batches.get(doc) === batch)
      batches.delete(doc)
  })
  return batch
}

function indexOf(context: SyncContext): PortalVisualIndex {
  context.index ??= portalVisualIndex(context.doc, INDEX_INPUT)
  return context.index
}

function snapshotAttributes(element: Element): Map<VisualAttribute, string | null> {
  return new Map(VISUAL_ATTRIBUTES.map(name => [name, element.getAttribute(name)]))
}

function applyAttributes(element: Element, values: AttributeSnapshot): boolean {
  let changed = false
  for (const name of VISUAL_ATTRIBUTES) {
    const value = values.get(name) ?? null
    if (value === null) {
      if (element.hasAttribute(name)) {
        element.removeAttribute(name)
        changed = true
      }
    }
    else if (element.getAttribute(name) !== value) {
      element.setAttribute(name, value)
      changed = true
    }
  }
  return changed
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

/**
 * 走一遍 composed 祖先链，同时产出视觉快照、inline 声明与观察计划三者共用的事实。
 * ShadowRoot 本身也观察 childList，否则来源恰为 shadow 根直接子节点时，移出不会命中 host。
 */
function chainOf(source: Element): AncestorChain {
  const elements: Element[] = []
  const slots: HTMLSlotElement[] = []
  const observations: Observation[] = []
  const nodes = new Set<Node>()
  let crossesShadowRoot = false
  for (let node: Element | null = source; node; node = composedParent(node)) {
    if (node.localName === 'slot')
      slots.push(node as HTMLSlotElement)
    if (!nodes.has(node)) {
      nodes.add(node)
      elements.push(node)
      observations.push({
        node,
        options: { attributes: true, attributeFilter: [...OBSERVED_ATTRIBUTES], attributeOldValue: true, childList: true },
      })
    }
    const root = node.getRootNode()
    if (isShadowRoot(root)) {
      crossesShadowRoot = true
      if (!nodes.has(root)) {
        nodes.add(root)
        observations.push({ node: root, options: { childList: true } })
      }
    }
  }
  return { elements, slots, observations, nodes, crossesShadowRoot }
}

function visualSnapshot(chain: AncestorChain): Map<VisualAttribute, string | null> {
  const values = new Map<VisualAttribute, string | null>()
  for (const node of chain.elements) {
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
 * 文档根上是否声明了这个名字。计算样式看到令牌层与作者在 :root 写的覆盖；jsdom 的
 * 计算样式不含 inline 声明，补看 documentElement.style。
 */
function declaredOnRoot(context: SyncContext, name: string): boolean {
  const known = context.declared.get(name)
  if (known !== undefined)
    return known
  const declared = (context.rootComputed?.getPropertyValue(name) ?? '') !== ''
    || context.root.style.getPropertyValue(name) !== ''
  context.declared.set(name, declared)
  return declared
}

/**
 * 本文档里值得逐个读一遍的自定义属性名：样式表里声明在「壳复现不出来的位置」的那些，
 * 再去掉根上没有声明的 --xh- 名字（组件槽、家族槽、私有槽与语气族，本来就不跨 Portal）。
 * null 表示样式表读不全，调用方枚举来源的整张计算样式表。
 */
function candidatesOf(context: SyncContext): readonly string[] | null {
  if (context.candidatesReady)
    return context.candidates
  const names = indexOf(context).names
  context.candidates = names
    ? [...names].filter(name => !name.startsWith(LIBRARY_NAMESPACE) || declaredOnRoot(context, name))
    : null
  context.candidatesReady = true
  return context.candidates
}

function parentValue(context: SyncContext, view: Window & typeof globalThis, parent: Element, name: string): string {
  // 同一批次里多数壳共用同一个 portal 落点，计算样式与逐名取值都只做一次。
  let memo = context.parents.get(parent)
  if (!memo) {
    memo = { computed: view.getComputedStyle(parent), values: new Map() }
    context.parents.set(parent, memo)
  }
  const known = memo.values.get(name)
  if (known !== undefined)
    return known
  const value = memo.computed.getPropertyValue(name)
  memo.values.set(name, value)
  return value
}

/** 壳上写过东西之后，落在它里面的父节点取值全部作废（嵌套 Portal 的目标就在壳里）。 */
function invalidateParents(context: SyncContext, shell: HTMLElement): void {
  for (const parent of context.parents.keys()) {
    if (parent === shell || shell.contains(parent))
      context.parents.delete(parent)
  }
}

/**
 * 来源解析到的 CSS 自定义属性。候选名可用时只读这几十个，否则枚举整张计算样式表；
 * 祖先的 inline 样式无论如何都补一遍，既接住作者的局部改写，也补给 jsdom 不枚举
 * 继承自定义属性的实现。普通计算样式绝不复制。
 */
function resolvedCustomProperties(
  chain: AncestorChain,
  computed: CSSStyleDeclaration | null,
  candidates: readonly string[] | null,
): Map<string, string> {
  const values = new Map<string, string>()
  if (computed && candidates) {
    for (const name of candidates) {
      const value = computed.getPropertyValue(name)
      if (value)
        values.set(name, value)
    }
  }
  else if (computed) {
    for (let index = 0; index < computed.length; index++) {
      const name = computed.item(index)
      if (!name.startsWith('--'))
        continue
      const value = computed.getPropertyValue(name)
      if (value)
        values.set(name, value)
    }
  }

  for (const node of chain.elements) {
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
 * 只投影壳自己解析不出来、且属于来源视觉环境的那部分。
 *
 * - 只由文档根或桥复制过去的属性选中的声明（令牌层的 :where(:root) 与
 *   :where([data-density='compact']) 之类），壳带着同样的属性会把同一条规则再命中一次，
 *   不进候选；来源没有显式声明该轴时壳也不写该属性，按既有语义继续继承业务显式目标。
 * - 剩下的名字仍要与壳父节点比对：计算值一致的靠级联继承即可，逐个写进壳只会复制一遍。
 * - --xh- 命名空间再看一眼文档根：根上有声明的是令牌或作者在 :root 写的组件槽覆盖，
 *   祖先链上的局部改写要带过去；根上没有的是皮肤写在组件 / 家族元素上的槽，
 *   属于组件内部级联，不投。
 *
 * 三份计算样式在同一批次读完再写壳，不夹杂写入触发的样式重算。
 */
function projectedCustomProperties(chain: AncestorChain, shell: HTMLElement, context: SyncContext): Map<string, string> {
  const source = chain.elements[0]!
  const parent = composedParent(shell)
  const view = context.view
  const sourceComputed = view ? view.getComputedStyle(source) : null
  const candidates = chain.crossesShadowRoot ? null : candidatesOf(context)
  const resolved = resolvedCustomProperties(chain, sourceComputed, candidates)
  const values = new Map<string, string>()
  for (const [name, value] of resolved) {
    if (view && parent && parentValue(context, view, parent, name) === value)
      continue
    if (name.startsWith(LIBRARY_NAMESPACE) && !declaredOnRoot(context, name))
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
): boolean {
  const style = styleOf(element)
  if (!style)
    return false
  let changed = false
  for (const [name, value] of values) {
    const current = style.getPropertyValue(name)
    const priority = style.getPropertyPriority(name)
    if (!initial.has(name))
      initial.set(name, { value: current, priority })
    if (current !== value || priority) {
      style.setProperty(name, value)
      changed = true
    }
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
    changed = true
  }
  return changed
}

function touchesChain(nodes: NodeList, chain: ReadonlySet<Node>): boolean {
  for (let index = 0; index < nodes.length; index++) {
    if (chain.has(nodes[index]!))
      return true
  }
  return false
}

function classTokens(value: string | null): Set<string> {
  const tokens = new Set<string>()
  if (!value)
    return tokens
  for (const token of value.split(/\s+/)) {
    if (token)
      tokens.add(token)
  }
  return tokens
}

const scratches = new WeakMap<Document, CSSStyleDeclaration>()

/** inline 样式串的解析借一张不挂进文档的声明表，不自己切字符串；按文档各留一张反复用。 */
function scratchStyle(doc: Document): CSSStyleDeclaration {
  let style = scratches.get(doc)
  if (!style) {
    style = doc.createElement('div').style
    scratches.set(doc, style)
  }
  return style
}

/** 一段 inline 样式串里的自定义属性：名字 → 值连同优先级。 */
function inlineCustomProperties(doc: Document, text: string | null): Map<string, string> {
  const values = new Map<string, string>()
  if (!text || !text.includes('--'))
    return values
  const style = scratchStyle(doc)
  style.cssText = text
  for (let index = 0; index < style.length; index++) {
    const name = style.item(index)
    if (name.startsWith('--'))
      values.set(name, `${style.getPropertyValue(name)}!${style.getPropertyPriority(name)}`)
  }
  style.cssText = ''
  return values
}

/** 一次 style 变更前后，值或优先级变了的自定义属性名；只改了普通属性时为空。 */
function changedCustomProperties(doc: Document, record: MutationRecord): string[] {
  const before = inlineCustomProperties(doc, record.oldValue)
  const after = inlineCustomProperties(doc, (record.target as Element).getAttribute('style'))
  const changed: string[] = []
  for (const [name, value] of after) {
    if (before.get(name) !== value)
      changed.push(name)
  }
  for (const name of before.keys()) {
    if (!after.has(name))
      changed.push(name)
  }
  return changed
}

/**
 * 链上公共祖先以下（来源一侧独有）那几层 inline 声明的、以及经 var() 引用的自定义属性名。
 * 祖先链从来源往上走，碰到第一个也包着壳的节点，往上就全是公共祖先了。
 */
function sourceSideInlineNames(chain: AncestorChain, shell: Element): Set<string> {
  const names = new Set<string>()
  for (const element of chain.elements) {
    if (element.contains(shell))
      break
    const style = styleOf(element)
    if (!style)
      continue
    for (let index = 0; index < style.length; index++) {
      const name = style.item(index)
      if (!name.startsWith('--'))
        continue
      names.add(name)
      collectReferences(style.getPropertyValue(name), names)
    }
  }
  return names
}

interface ChangeScope {
  readonly doc: Document
  readonly chain: AncestorChain
  readonly shell: Element
  /** 链穿过 ShadowRoot 时为 null：文档索引看不到影子树里的样式表。 */
  readonly index: PortalVisualIndex | null
  /** 见 sourceSideInlineNames。 */
  readonly sourceSide: ReadonlySet<string>
}

/**
 * 改动落在壳也继承得到的公共祖先上（文档根、body 之类）时，被改的名字来源与壳各自继承到
 * 同一个新值，两侧不会分叉，不必重算。三种名字例外：样式表在壳复现不出来的位置声明过的
 * （来源那侧被就近声明盖住、壳那侧却跟着变）、这些声明经 var() 引用的（派生值只在来源那侧
 * 重算）、来源一侧独有的那几层 inline 声明或引用的。样式表读不全或链穿过影子根时判不准，照旧重算。
 */
function inheritedAlike(target: Node, changed: readonly string[], scope: ChangeScope): boolean {
  const { index } = scope
  if (!index?.names || !index.references || !target.contains(scope.shell))
    return false
  const { names, references } = index
  return changed.every(name => !names.has(name) && !references.has(name) && !scope.sourceSide.has(name))
}

/** 这次 class 变更增删的名字里，有没有出现在声明了自定义属性的选择器里的。 */
function changedClassDeclares(record: MutationRecord, classes: ReadonlySet<string>): boolean {
  const before = classTokens(record.oldValue)
  const after = classTokens((record.target as Element).getAttribute('class'))
  for (const token of after) {
    if (!before.has(token) && classes.has(token))
      return true
  }
  for (const token of before) {
    if (!after.has(token) && classes.has(token))
      return true
  }
  return false
}

/**
 * 一批变更记录里是否有会改变来源视觉环境的那种。
 *
 * - 视觉轴、语气与 slot 的属性变化一律算。
 * - inline 样式只在有自定义属性的值或优先级真的变了时才算：body 滚动锁定写的 overflow / padding、
 *   定位引擎写的 transform 都落在链上，但改不了任何自定义属性；文档根上早就挂着一串应用主题变量时，
 *   旁的属性改动也不该把它们当成变化。变了的若落在公共祖先上且两侧各自继承得到，同样不算
 *   （见 inheritedAlike）：滚动锁定往文档根写的 --xh-scroll-lock-gutter 就是这种。
 * - class 只在增删的名字出现在「声明了自定义属性的选择器」里时才算：页面级过渡类、
 *   展开态与加载态每帧都在链上增删 class，它们与自定义属性无关。判不准时照旧重算。
 * - childList 只在摘掉或挂入链上节点时才算换父：焦点护栏插进 body、触发器换文本都不是。
 */
function affectsVisualEnvironment(records: MutationRecord[], scope: ChangeScope): boolean {
  const classes = scope.index ? scope.index.classes : null
  for (const record of records) {
    if (record.type === 'childList') {
      if (touchesChain(record.removedNodes, scope.chain.nodes) || touchesChain(record.addedNodes, scope.chain.nodes))
        return true
      continue
    }
    if (record.attributeName === 'style') {
      const changed = changedCustomProperties(scope.doc, record)
      if (changed.length && !inheritedAlike(record.target, changed, scope))
        return true
      continue
    }
    if (record.attributeName === 'class') {
      if (!classes || changedClassDeclares(record, classes))
        return true
      continue
    }
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
 * 不跨 Portal。壳靠自己的属性就能命中同一条规则的不复制，普通计算样式不会被复制。
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
  let observed: AncestorChain = { elements: [], slots: [], observations: [], nodes: new Set(), crossesShadowRoot: true }
  let sourceSide = new Set<string>()
  let attachedSlots: HTMLSlotElement[] = []
  let disposed = false
  let syncing = false
  let pending = false

  const observer = new Observer((records) => {
    if (disposed)
      return
    const batch = openBatch(doc)
    const index = observed.crossesShadowRoot ? null : indexOf(batch)
    if (affectsVisualEnvironment(records, { doc, chain: observed, shell, index, sourceSide }))
      runSync(batch)
  })
  const onSlotChange = (): void => runSync(openBatch(doc))

  function observe(chain: AncestorChain): void {
    observer.disconnect()
    for (const slot of attachedSlots)
      slot.removeEventListener('slotchange', onSlotChange)
    attachedSlots = []
    for (const entry of chain.observations)
      observer.observe(entry.node, entry.options)
    for (const slot of chain.slots) {
      slot.addEventListener('slotchange', onSlotChange)
      attachedSlots.push(slot)
    }
  }

  function syncOnce(context: SyncContext): void {
    if (source.ownerDocument !== doc || shell.ownerDocument !== doc)
      throw new Error('[xh] Portal 视觉环境同步期间来源或实例壳切换了 Document')
    // 来源被摘下文档（缓存页离开时整块搬进缓存容器、整段节点暂时移走）：计算样式读不到东西，
    // 照算只会把壳上的环境清空、挂回来再整套写回，缓存页一进一出就是页内每台桥各算两遍。
    // 这里只把观察挪到摘下后的那条链上，壳原样不动；挂回文档时链顶那次换父记录触发正常重算
    if (!source.isConnected) {
      const detached = chainOf(source)
      observe(detached)
      observed = detached
      return
    }
    const before = snapshotAttributes(shell)
    const chain = chainOf(source)
    const nextCustom = projectedCustomProperties(chain, shell, context)
    const beforeCustom = snapshotCustomProperties(shell, new Set([...appliedCustom, ...nextCustom.keys()]))
    const initialCustomBefore = new Map(initialCustom)
    const appliedCustomBefore = new Set(appliedCustom)
    try {
      const attributesChanged = applyAttributes(shell, visualSnapshot(chain))
      const propertiesChanged = applyCustomProperties(shell, nextCustom, initialCustom, appliedCustom)
      if (attributesChanged || propertiesChanged)
        invalidateParents(context, shell)
      observe(chain)
      observed = chain
      sourceSide = sourceSideInlineNames(chain, shell)
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

  function runSync(batch: SyncContext | null): void {
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
        syncOnce(batch ?? createContext(doc))
      } while (pending)
    }
    finally {
      syncing = false
    }
  }

  function sync(): void {
    runSync(null)
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
