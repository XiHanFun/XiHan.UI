// Scope：宿主 DOM 环境抽象，core 对 document/window 的访问统一经此。
import type { IdGenerator } from './id-generator'
import { isDocument } from './guards'

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
  getActiveElement: () => HTMLElement | null
  /** 取计算样式，绑定到本 scope 所在的 window。 */
  getComputedStyle: (el: Element, pseudo?: string) => CSSStyleDeclaration
  /** shadow root 内为 true。 */
  isShadow: () => boolean
}

/** 跨 shadow root 深挖真正聚焦的元素。 */
export function getActiveElementDeep(root: Document | ShadowRoot): HTMLElement | null {
  let active = root.activeElement as HTMLElement | null
  while (active?.shadowRoot?.activeElement)
    active = active.shadowRoot.activeElement as HTMLElement
  return active
}

/** 创建 scope。node 为空时回退到全局 document。 */
export function createScope(node: Element | null | undefined, idGenerator: IdGenerator): Scope {
  const id = idGenerator.scopeId()

  const getRootNode = (): Document | ShadowRoot => {
    const root = node?.getRootNode?.()
    if (root && (isDocument(root) || root instanceof ShadowRoot))
      return root as Document | ShadowRoot
    return document
  }

  const getDoc = (): Document => {
    const root = getRootNode()
    return isDocument(root) ? root : root.ownerDocument
  }

  const getWin = (): Window & typeof globalThis =>
    (getDoc().defaultView as Window & typeof globalThis) ?? window

  return {
    id,
    getRootNode,
    getDoc,
    getWin,
    getById: <T extends Element = HTMLElement>(elId: string): T | null =>
      getRootNode().querySelector<T>(`[id="${CSS.escape(elId)}"]`),
    partId: (component, part) => idGenerator.partId(component, id, part),
    ids: <K extends string>(component: string, ...parts: K[]) => {
      const out = {} as Record<K, string>
      for (const part of parts) out[part] = idGenerator.partId(component, id, part)
      return out
    },
    getActiveElement: () => getActiveElementDeep(getRootNode()),
    getComputedStyle: (el, pseudo) => getWin().getComputedStyle(el, pseudo),
    isShadow: () => getRootNode() instanceof ShadowRoot,
  }
}
