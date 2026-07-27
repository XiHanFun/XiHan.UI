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

// 写属性前先比一次：setAttribute 即便值没变也会触发 attributeChangedCallback 与变更记录。
// 角色节点若本身是个会在属性变化时改写自己子节点的自定义元素，无条件写就会
// 经由"宿主观察子节点变动 → 重新接线 → 又写属性"闭成死循环。
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
      // style 传对象时逐条写内联样式。整体 setAttribute 会写成 "[object Object]"，
      // 而浮层定位、进度条宽度这类产出本来就是对象形态。
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
        // toggleAttribute 在值无变化时本就不产生变更记录
        node.toggleAttribute(key, Boolean(value))
        continue
      }
      setAttr(node, key, String(value))
    }

    // 移除上一帧本机器写过、这一帧不再写的属性与事件监听器（与属性对称，防泄漏）
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
