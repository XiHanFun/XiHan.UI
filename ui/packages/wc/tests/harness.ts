import type { AdapterEvent, AdapterHarness, Fixture, FixtureNode } from '@xihan-ui/testing'
import { defineXhElements } from '../src/define'

// jsdom 环境注册一次（惰性 define）
defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
}

// 对外语义事件（跨适配器一致的 CustomEvent），无关组件忽略
const PUBLIC_EVENTS = ['open-change']

// FixtureNode → Light-DOM 元素：part 节点打 data-xh-part，纯文本子节点建文本节点
function renderNode(node: FixtureNode, doc: Document): HTMLElement {
  const el = doc.createElement(node.tag ?? 'div')
  if (node.part)
    el.dataset.xhPart = node.part
  for (const [k, v] of Object.entries(node.attrs ?? {})) el.setAttribute(k, v)
  if (node.children?.length) {
    for (const c of node.children) {
      if (c.text != null && c.tag == null && c.part == null && c.children == null)
        el.appendChild(doc.createTextNode(c.text))
      else
        el.appendChild(renderNode(c, doc))
    }
  }
  else if (node.text != null) {
    el.textContent = node.text
  }
  return el
}

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)
}

// 标量 → 属性，对象/函数 → 属性(property)
function applyInputs(host: HTMLElement, props: Record<string, unknown>): void {
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null)
      continue
    if (typeof v === 'object' || typeof v === 'function') {
      (host as unknown as Record<string, unknown>)[k] = v
      continue
    }
    if (typeof v === 'boolean') {
      host.toggleAttribute(kebab(k), v)
      continue
    }
    host.setAttribute(kebab(k), String(v))
  }
}

export function createWcHarness(): AdapterHarness {
  let host: Updatable | null = null
  let events: AdapterEvent[] = []
  const onEvent = (e: Event): void => {
    events.push({ type: e.type, detail: (e as CustomEvent).detail })
  }

  return {
    adapterName: 'wc',
    async mount(fixture: Fixture) {
      const el = document.createElement(`xh-${fixture.component}`) as Updatable
      el.appendChild(renderNode(fixture.tree, document))
      applyInputs(el, fixture.props as Record<string, unknown>)
      for (const t of PUBLIC_EVENTS) el.addEventListener(t, onEvent)
      document.body.appendChild(el)
      await el.updateComplete
      host = el
      return { root: el }
    },
    async setProps(next) {
      applyInputs(host!, next as Record<string, unknown>)
      await host!.updateComplete
    },
    async flush() {
      await host?.updateComplete
    },
    drainEvents() {
      const e = events
      events = []
      return e
    },
    async unmount() {
      host?.remove()
      host = null
      events = []
    },
  }
}
