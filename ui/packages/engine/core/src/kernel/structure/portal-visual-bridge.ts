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

function restoreCustomProperties(element: Element, values: CustomPropertySnapshots): void {
  const style = styleOf(element)
  if (!style)
    return
  for (const [name, snapshot] of values) {
    if (snapshot.value)
      style.setProperty(name, snapshot.value, snapshot.priority)
    else
      style.removeProperty(name)
  }
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
 * CSS 自定义属性会随 Portal 断开普通级联。计算样式列出规则里声明的名字；祖先的
 * inline 样式补给 jsdom 不枚举继承自定义属性的实现。普通计算样式绝不复制。
 */
function visualCustomProperties(source: Element): Map<string, string> {
  const values = new Map<string, string>()
  const view = source.ownerDocument.defaultView
  const computed = view?.getComputedStyle(source)
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
      const value = computed?.getPropertyValue(name) || style.getPropertyValue(name)
      if (value)
        values.set(name, value)
    }
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
    if (!initial.has(name))
      initial.set(name, snapshotCustomProperties(element, [name]).get(name)!)
    if (style.getPropertyValue(name) !== value || style.getPropertyPriority(name))
      style.setProperty(name, value)
    applied.add(name)
  }
  for (const name of [...applied]) {
    if (values.has(name))
      continue
    restoreCustomProperties(element, new Map([[name, initial.get(name)!]]))
    applied.delete(name)
  }
}

/**
 * 观察当前 composed 祖先链：属性或自定义属性变化重算环境；childList 接住来源或任一祖先换父。
 * ShadowRoot 本身也观察 childList，否则来源恰为 shadow 根直接子节点时，移出不会命中 host。
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
        options: { attributes: true, childList: true },
      })
    }
    const root = node.getRootNode()
    if (isShadowRoot(root) && !seen.has(root)) {
      seen.add(root)
      out.push({ node: root, options: { childList: true } })
    }
  }
  return { entries: out, slots }
}

function collectedError(primary: unknown, rollback: unknown[], message: string): unknown {
  return rollback.length ? new AggregateError([primary, ...rollback], message, { cause: primary }) : primary
}

/**
 * 把逻辑来源最近显式声明的视觉环境投影到单个 Portal 壳。
 *
 * 桥接七个视觉 DOM 轴，以及来源解析出的 CSS 自定义属性；普通计算样式不会被复制。
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
  let observed: ObservationPlan = { entries: [], slots: [] }
  let attachedSlots: HTMLSlotElement[] = []
  let disposed = false
  let syncing = false
  let pending = false

  const observer = new Observer(() => sync())
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
    const nextCustom = visualCustomProperties(source)
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
