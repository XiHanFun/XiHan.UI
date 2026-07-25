// 类型守卫与环境探测。

export function isSSR(): boolean {
  return typeof document === 'undefined' || typeof window === 'undefined'
}

export function isDocument(v: unknown): v is Document {
  return typeof Document !== 'undefined' && v instanceof Document
}

export function isWindow(v: unknown): v is Window {
  return typeof Window !== 'undefined' && v instanceof Window
}

export function isShadowRoot(v: unknown): v is ShadowRoot {
  return typeof ShadowRoot !== 'undefined' && v instanceof ShadowRoot
}

export function isHTMLElement(v: unknown): v is HTMLElement {
  return typeof HTMLElement !== 'undefined' && v instanceof HTMLElement
}

export function isElement(v: unknown): v is Element {
  return typeof Element !== 'undefined' && v instanceof Element
}

/** node 是否包含 target（含 shadow 边界的 composed 语义由调用方另行处理）。 */
export function contains(node: Node | null | undefined, target: Node | null | undefined): boolean {
  if (!node || !target)
    return false
  return node === target || node.contains(target)
}

export function isFunction(v: unknown): v is (...args: never[]) => unknown {
  return typeof v === 'function'
}
