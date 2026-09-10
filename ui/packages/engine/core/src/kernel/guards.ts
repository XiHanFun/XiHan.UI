// 类型守卫与环境探测。

export function isSSR(): boolean {
  return typeof document === 'undefined' || typeof window === 'undefined'
}

function isObject(v: unknown): v is object {
  return typeof v === 'object' && v !== null
}

/** 用原生 Web IDL getter 做品牌检查；跨 realm 可用，伪造字段与原型对象会抛。 */
function nativeNodeType(v: unknown): number | null {
  if (!isObject(v) || typeof Node === 'undefined')
    return null
  try {
    const getter = Object.getOwnPropertyDescriptor(Node.prototype, 'nodeType')?.get
    return getter ? getter.call(v) as number : null
  }
  catch {
    return null
  }
}

export function isDocument(v: unknown): v is Document {
  return nativeNodeType(v) === 9
}

export function isWindow(v: unknown): v is Window {
  if (!isObject(v))
    return false
  try {
    const candidate = v as Window
    return candidate.window === v
      && isDocument(candidate.document)
      && candidate.document.defaultView === v
  }
  catch {
    return false
  }
}

export function isShadowRoot(v: unknown): v is ShadowRoot {
  if (nativeNodeType(v) !== 11 || typeof ShadowRoot === 'undefined')
    return false
  try {
    const getter = Object.getOwnPropertyDescriptor(ShadowRoot.prototype, 'host')?.get
    return getter ? isElement(getter.call(v)) : false
  }
  catch {
    return false
  }
}

export function isHTMLElement(v: unknown): v is HTMLElement {
  if (nativeNodeType(v) !== 1 || typeof HTMLElement === 'undefined')
    return false
  try {
    const getter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'dataset')?.get
    return getter ? getter.call(v) != null : false
  }
  catch {
    return false
  }
}

export function isElement(v: unknown): v is Element {
  return nativeNodeType(v) === 1
}

/** node 是否包含 target（不跨 shadow 边界）。 */
export function contains(node: Node | null | undefined, target: Node | null | undefined): boolean {
  if (!node || !target)
    return false
  return node === target || node.contains(target)
}

export function isFunction(v: unknown): v is (...args: never[]) => unknown {
  return typeof v === 'function'
}
