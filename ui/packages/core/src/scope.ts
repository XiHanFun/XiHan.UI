// Scope：宿主 DOM 环境抽象（§4.2.2）。
// core 里禁止直接写 document/window/getComputedStyle；一切经 Scope。
import type { IdGenerator } from './id-generator'
import { isDocument } from './guards'

export interface Scope {
  /** 本 scope 的实例级唯一 id（构造时求值一次并缓存，SSR/CSR 一致）。 */
  readonly id: string
  getRootNode: () => Document | ShadowRoot
  getDoc: () => Document
  getWin: () => Window & typeof globalThis
  /** 在正确的 root 内按 id 查找，而非全局 document.getElementById。 */
  getById: <T extends Element = HTMLElement>(id: string) => T | null
  /** 由 scope.id 派生 part id（§4.2.4 转发）。 */
  partId: (component: string, part: string) => string
  /** 一次性派生一组 part id 只读表。 */
  ids: <K extends string>(component: string, ...parts: K[]) => Readonly<Record<K, string>>
  /** 递归穿透 shadow root，返回真正被聚焦的元素。 */
  getActiveElement: () => HTMLElement | null
  /** 必须经此取，不得用全局 getComputedStyle（跨 iframe 解析不同）。 */
  getComputedStyle: (el: Element, pseudo?: string) => CSSStyleDeclaration
  /** shadow root 内为 true。 */
  isShadow: () => boolean
}

/** 跨 shadow 深挖真正聚焦的元素（document.activeElement 在 shadow 场景返回 host）。 */
export function getActiveElementDeep(root: Document | ShadowRoot): HTMLElement | null {
  let active = root.activeElement as HTMLElement | null
  while (active?.shadowRoot?.activeElement)
    active = active.shadowRoot.activeElement as HTMLElement
  return active
}

/**
 * 创建 scope。node 为空时回退到全局 document（仅 CSR；SSR 期不应实例化，见 §4.5.3）。
 */
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
