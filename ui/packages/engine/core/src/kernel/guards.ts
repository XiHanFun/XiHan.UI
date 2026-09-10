// 类型守卫与环境探测。

export function isSSR(): boolean {
  return typeof document === 'undefined' || typeof window === 'undefined'
}

function isObject(v: unknown): v is object {
  return typeof v === 'object' && v !== null
}

type DomRealm = Partial<Pick<typeof globalThis, 'Node' | 'ShadowRoot' | 'HTMLElement'>>

/**
 * 从值能到达的 Document/Window 取得其所属 realm。
 * 这里只用于寻找原生 Web IDL getter；最终身份仍由 getter 的品牌检查决定。
 */
function ownerRealm(v: object): DomRealm | null {
  try {
    const candidate = v as {
      readonly defaultView?: DomRealm | null
      readonly document?: object & { readonly defaultView?: DomRealm | null }
      readonly ownerDocument?: { readonly defaultView?: DomRealm | null }
    }
    const doc = candidate.ownerDocument
      ?? (candidate.defaultView ? v : candidate.document)
    const view = (doc as { readonly defaultView?: DomRealm | null } | undefined)?.defaultView ?? null
    if (!doc || !view)
      return null
    const linked = view as DomRealm & { readonly document?: unknown, readonly window?: unknown }
    return linked.window === view && linked.document === doc ? view : null
  }
  catch {
    return null
  }
}

function nativeGetter(
  v: object,
  constructorName: keyof DomRealm,
  property: string,
): ((this: unknown) => unknown) | null {
  let constructor: unknown
  try {
    constructor = globalThis[constructorName]
  }
  catch {
    // globalThis 也可能由受限宿主代理提供；下方尝试节点所属 realm。
  }
  if (typeof constructor !== 'function')
    constructor = ownerRealm(v)?.[constructorName]
  if (typeof constructor !== 'function')
    return null
  try {
    return Object.getOwnPropertyDescriptor(constructor.prototype, property)?.get ?? null
  }
  catch {
    return null
  }
}

/** 用原生 Web IDL getter 做品牌检查；跨 realm 可用，伪造字段与原型对象会抛。 */
function nativeNodeType(v: unknown): number | null {
  if (!isObject(v))
    return null

  const getter = nativeGetter(v, 'Node', 'nodeType')
  if (!getter)
    return null
  try {
    return getter.call(v) as number
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
  if (nativeNodeType(v) !== 11 || !isObject(v))
    return false
  try {
    const getter = nativeGetter(v, 'ShadowRoot', 'host')
    return getter ? isElement(getter.call(v)) : false
  }
  catch {
    return false
  }
}

export function isHTMLElement(v: unknown): v is HTMLElement {
  if (nativeNodeType(v) !== 1 || !isObject(v))
    return false
  try {
    const getter = nativeGetter(v, 'HTMLElement', 'dataset')
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
