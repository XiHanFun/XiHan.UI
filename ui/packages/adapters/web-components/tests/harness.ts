import type { AdapterEvent, AdapterHarness, Fixture, FixtureNode } from '@xihan-ui/testing'
import { attachHost } from '@xihan-ui/testing'
import { defineXhElements } from '../src/define'

// jsdom 环境注册一次（惰性 define）
defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
}

// 对外语义事件（跨适配器一致的 CustomEvent），无关组件忽略
const PUBLIC_EVENTS = ['open-change', 'checked-change', 'clamp-toggle', 'column-preference-change', 'pressed-change', 'node-move', 'row-move', 'tab-move', 'value-change', 'select', 'sort', 'status-change', 'submit', 'stop', 'stick-change', 'download-complete', 'download-error', 'item-focus']

const SVG_NS = 'http://www.w3.org/2000/svg'

// FixtureNode → Light-DOM 元素：part 节点打 data-xh-part，纯文本子节点建文本节点。
// <svg> 连同它的子树建在 SVG 命名空间下：createElement('svg') 建出的是 XHTML 的 <svg>，
// 那上面的 viewBox 会被小写成 viewbox，挂进去的图元也不显示。
function renderNode(node: FixtureNode, doc: Document, ns?: string): HTMLElement | SVGElement {
  const tag = node.tag ?? 'div'
  const childNs = tag === 'svg' ? SVG_NS : ns
  const el = childNs ? doc.createElementNS(childNs, tag) as SVGElement : doc.createElement(tag)
  if (node.part)
    el.dataset.xhPart = node.part
  for (const [k, v] of Object.entries(node.attrs ?? {})) el.setAttribute(k, v)
  if (node.children?.length) {
    for (const c of node.children) {
      if (c.text != null && c.tag == null && c.part == null && c.children == null)
        el.appendChild(doc.createTextNode(c.text))
      else
        el.appendChild(renderNode(c, doc, childNs))
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

/** 这个属性是不是配了自定义转换器。Lit 定稿后把声明摊在类上的 elementProperties 里。 */
function hasCustomConverter(host: HTMLElement, key: string): boolean {
  const declared = (host.constructor as { elementProperties?: Map<string, { converter?: unknown }> }).elementProperties
  return typeof declared?.get(key)?.converter === 'object'
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
      const name = kebab(k)
      // 真值一律写成 name=""，不用 toggleAttribute：属性已经在场时
      // toggleAttribute(name, true) 按规范是空操作，于是 name="false" → true
      // 这一跳在标记那侧原地不动，property 不变、watch 不跳，受控开关永远推不开。
      if (v)
        host.setAttribute(name, '')
      // 假值分两种写法，取决于元素怎么声明这个属性：
      // · 声明了自定义转换器（本仓的三态转换器）的，写 name="false"——
      //   摘掉属性在三态语义里是"没指定"，会落回默认值，缺省为真的开关因此永远关不掉；
      // · 用 Lit 自带 Boolean 转换器的，只能摘掉属性——它判的是 v !== null，
      //   写 "false" 反而成了真。
      else if (hasCustomConverter(host, k))
        host.setAttribute(name, 'false')
      else
        host.removeAttribute(name)
      continue
    }
    host.setAttribute(kebab(k), String(v))
  }
}

/** settle 最多刷这么多轮；宿主一直自排新一轮时到此为止，不吊死。 */
const MAX_SETTLE_ROUNDS = 10

export function createWcHarness(): AdapterHarness {
  let host: Updatable | null = null
  let events: AdapterEvent[] = []
  const onEvent = (e: Event): void => {
    // 语义事件一律是 CustomEvent；同名的原生事件要挡掉。
    // 具体撞上的是 select：焦点域把焦点送进输入框时会连带 .select() 全选，
    // 那个原生 select 事件是冒泡的，会一路冒到宿主上冒充成组件的选中事件。
    if (!(e instanceof CustomEvent))
      return
    events.push({ type: e.type, detail: e.detail })
  }

  /**
   * 一路刷到 DOM 不再动为止。
   *
   * 单等一次 updateComplete 只覆盖当下排着的那一轮。机器的 flush 效应要等这一轮渲染完才跑，
   * 跑完写回 context 又排下一轮，需要几轮取决于组件。停在中间那一轮，快照就少了后面几轮
   * 才写上去的属性。
   *
   * 改成看 DOM 还动不动：动就再等一轮。观察 document.body 是为了连传送到宿主外面的浮层
   * 一起看住。上限只是防死循环用的保险。
   */
  const settle = async (): Promise<void> => {
    const el = host
    if (el === null)
      return
    const observer = new MutationObserver(() => {})
    observer.observe(document.body, { attributes: true, childList: true, subtree: true, characterData: true })
    try {
      for (let round = 0; round < MAX_SETTLE_ROUNDS; round++) {
        // 让出一次微任务，等这一拍派出去的效应先把新一轮更新排上队
        await null
        // resolve 成 false 表示更新途中又排了新一轮，接着等下一轮
        for (let self = 0; self < MAX_SETTLE_ROUNDS && !(await el.updateComplete); self++) { /* 等到不再自排新一轮 */ }
        await null
        if (observer.takeRecords().length === 0)
          return
      }
    }
    finally {
      observer.disconnect()
    }
  }

  return {
    adapterName: 'wc',
    async mount(fixture: Fixture) {
      const el = document.createElement(`xh-${fixture.component}`) as Updatable
      el.appendChild(renderNode(fixture.tree, document))
      applyInputs(el, fixture.props as Record<string, unknown>)
      for (const t of PUBLIC_EVENTS) el.addEventListener(t, onEvent)
      attachHost(el)
      await el.updateComplete
      host = el
      return { root: el }
    },
    async setProps(next) {
      applyInputs(host!, next as Record<string, unknown>)
      await settle()
    },
    async flush() {
      await settle()
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
