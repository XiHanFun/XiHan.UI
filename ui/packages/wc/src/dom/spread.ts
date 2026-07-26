// 把 connect 产出的 prop 字典命令式地打到一个 Light-DOM 角色节点上（无 lit-html 指令）。
// 事件用 addEventListener（每帧移旧加新，避免重复）；class 不碰（Light DOM 归用户）。

const BOOLEAN_ATTRS = new Set(['disabled', 'hidden', 'inert', 'readonly', 'required', 'checked', 'selected', 'open', 'multiple'])
const PROP_KEYS = new Set(['value', 'checked', 'selected'])

interface NodeState {
  listeners: Map<string, EventListener>
  attrs: Set<string>
}

function eventName(key: string): string | null {
  if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z')
    return key.slice(2).toLowerCase()
  return null
}

export interface Spreader {
  spread: (node: HTMLElement, props: Record<string, unknown>) => void
  release: (node: HTMLElement) => void
}

export function createSpreader(): Spreader {
  const state = new WeakMap<Element, NodeState>()

  function spread(node: HTMLElement, props: Record<string, unknown>): void {
    let s = state.get(node)
    if (!s) {
      s = { listeners: new Map(), attrs: new Set() }
      state.set(node, s)
    }
    const nextAttrs = new Set<string>()
    const nextEvents = new Set<string>()

    for (const [key, value] of Object.entries(props)) {
      const ev = eventName(key)
      if (ev) {
        nextEvents.add(ev)
        const prev = s.listeners.get(ev)
        if (prev)
          node.removeEventListener(ev, prev)
        if (typeof value === 'function') {
          node.addEventListener(ev, value as EventListener)
          s.listeners.set(ev, value as EventListener)
        }
        else {
          s.listeners.delete(ev)
        }
        continue
      }
      if (value === undefined || value === null || value === false) {
        node.removeAttribute(key)
        continue
      }
      nextAttrs.add(key)
      if (PROP_KEYS.has(key)) {
        (node as unknown as Record<string, unknown>)[key] = value
        continue
      }
      if (BOOLEAN_ATTRS.has(key)) {
        node.toggleAttribute(key, Boolean(value))
        continue
      }
      node.setAttribute(key, String(value))
    }

    // 移除上一帧本机器写过、这一帧不再写的属性与事件监听器（与属性对称，防泄漏）
    for (const key of s.attrs) {
      if (!nextAttrs.has(key))
        node.removeAttribute(key)
    }
    for (const [ev, fn] of [...s.listeners]) {
      if (!nextEvents.has(ev)) {
        node.removeEventListener(ev, fn)
        s.listeners.delete(ev)
      }
    }
    s.attrs = nextAttrs
  }

  function release(node: HTMLElement): void {
    const s = state.get(node)
    if (!s)
      return
    for (const [ev, fn] of s.listeners) node.removeEventListener(ev, fn)
    for (const key of s.attrs) node.removeAttribute(key)
    state.delete(node)
  }

  return { spread, release }
}
