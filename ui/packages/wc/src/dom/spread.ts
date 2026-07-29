// 把 connect 产出的 prop 字典打到 Light-DOM 角色节点上；事件每帧移旧加新，不碰 class。

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

// 值相同则不写，避免多余的属性变更记录。
function setAttr(node: HTMLElement, key: string, value: string): void {
  if (node.getAttribute(key) !== value)
    node.setAttribute(key, value)
}

function removeAttr(node: HTMLElement, key: string): void {
  if (node.hasAttribute(key))
    node.removeAttribute(key)
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
      // style 传对象时逐条写内联样式。
      if (key === 'style' && value !== null && typeof value === 'object') {
        Object.assign(node.style, value as Record<string, string>)
        continue
      }
      if (value === undefined || value === null || value === false) {
        removeAttr(node, key)
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
      setAttr(node, key, String(value))
    }

    // 移除上一帧写过、这一帧不再写的属性与事件监听器。
    for (const key of s.attrs) {
      if (!nextAttrs.has(key))
        removeAttr(node, key)
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
