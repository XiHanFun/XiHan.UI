// Scope：宿主 DOM 环境抽象，core 对 document/window 的访问统一经此。
import type { IdGenerator } from './id-generator'
import type { FocusableElement } from './types'
import { isDocument, isElement, isShadowRoot, isWindow } from './guards'

export interface Scope {
  /** 本 scope 的实例级唯一 id，构造时求值一次。 */
  readonly id: string
  getRootNode: () => Document | ShadowRoot
  getDoc: () => Document
  getWin: () => Window & typeof globalThis
  /** 在所属 root 内按 id 查找。 */
  getById: <T extends Element = HTMLElement>(id: string) => T | null
  /** 由 scope.id 派生 part id。 */
  partId: (component: string, part: string) => string
  /** 一次性派生一组 part id 只读表。 */
  ids: <K extends string>(component: string, ...parts: K[]) => Readonly<Record<K, string>>
  /** 递归穿透 shadow root，返回真正被聚焦的元素。 */
  getActiveElement: () => FocusableElement | null
  /** 取计算样式，绑定到本 scope 所在的 window。 */
  getComputedStyle: (el: Element, pseudo?: string) => CSSStyleDeclaration
  /** shadow root 内为 true。 */
  isShadow: () => boolean
}

/** 跨 shadow root 深挖真正聚焦的元素。 */
export function getActiveElementDeep(root: Document | ShadowRoot): FocusableElement | null {
  let active = root.activeElement as FocusableElement | null
  while (active?.shadowRoot?.activeElement)
    active = active.shadowRoot.activeElement as FocusableElement
  return active
}

/**
 * 创建 scope。静态空锚点保留既有语义，回退到全局 document；节点 getter 用于框架 setup
 * 早于真实 DOM 就位的场景，返回空时明确失败，不借 ambient realm 猜宿主。
 */
export function createScope(node: Element | null | undefined, idGenerator: IdGenerator): Scope
export function createScope(getNode: () => Element | null | undefined, idGenerator: IdGenerator): Scope
export function createScope(
  source: Element | null | undefined | (() => Element | null | undefined),
  idGenerator: IdGenerator,
): Scope {
  const id = idGenerator.scopeId()
  const dynamic = typeof source === 'function'

  /** 每次操作只读一次 getter，避免同一次 realm 推导混入两个节点快照。 */
  const readNode = (): Element | null | undefined => {
    if (!dynamic)
      return source as Element | null | undefined
    const node = (source as () => Element | null | undefined)()
    if (node == null)
      throw new Error('[xh] Scope 的动态锚点尚未就绪')
    if (!isElement(node))
      throw new TypeError('[xh] Scope 的动态锚点必须返回 Element')
    return node
  }

  const getAmbientDocument = (): Document => {
    if (typeof document === 'undefined' || !isDocument(document))
      throw new Error('[xh] Scope 没有锚点，且宿主未提供有效的全局 Document')
    return document
  }

  const rootNodeOf = (node: Element | null | undefined): Document | ShadowRoot => {
    const root = node?.getRootNode?.()
    if (root && (isDocument(root) || isShadowRoot(root)))
      return root as Document | ShadowRoot
    return node?.ownerDocument ?? getAmbientDocument()
  }

  const getRootNode = (): Document | ShadowRoot => rootNodeOf(readNode())

  const getDoc = (): Document => {
    const node = readNode()
    const root = rootNodeOf(node)
    const ownerDocument = node?.ownerDocument
    if (ownerDocument && root === ownerDocument)
      return ownerDocument
    return isDocument(root) ? root : root.ownerDocument
  }

  const getWin = (): Window & typeof globalThis => {
    const doc = getDoc()
    const win = doc.defaultView
    if (!isWindow(win) || win.document !== doc)
      throw new Error('[xh] Scope 的 Document 没有活动 Window')
    return win as Window & typeof globalThis
  }

  return {
    id,
    getRootNode,
    getDoc,
    getWin,
    // 走 getElementById 而不是拼选择器：Document 与 ShadowRoot 都实现了它，
    // 既不需要转义，也不依赖 CSS 这个全局（无头 DOM 环境里它常常缺席）。
    getById: <T extends Element = HTMLElement>(elId: string): T | null =>
      getRootNode().getElementById(elId) as T | null,
    partId: (component, part) => idGenerator.partId(component, id, part),
    ids: <K extends string>(component: string, ...parts: K[]) => {
      const out = {} as Record<K, string>
      for (const part of parts) out[part] = idGenerator.partId(component, id, part)
      return out
    },
    getActiveElement: () => getActiveElementDeep(getRootNode()),
    getComputedStyle: (el, pseudo) => getWin().getComputedStyle(el, pseudo),
    isShadow: () => isShadowRoot(getRootNode()),
  }
}
