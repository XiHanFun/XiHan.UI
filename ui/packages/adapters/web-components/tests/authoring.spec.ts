// @vitest-environment jsdom

// 第三方编写元素的入口：基类的属性声明与批量更新、按 key 复用生成节点、建节点与写属性文本、事件派发、注册的幂等与冲突、
// 配置控制器的文案优先级与随配置重渲、子树作用域与断开后退订。
import type { KeyedChildren, PropertyValues } from '../src/authoring'
import { GHOST_ATTR } from '@xihan-ui/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createAuthoredElement,
  createGeneratedElement,
  emitEvent,
  GEN_ATTR,
  generatedChildren,
  reconcile,
  registerElement,
  setAttributes,
  setText,
  SVG_NS,
  XhConfigController,
  XhReactiveElement,
} from '../src/authoring'
import { notifyXhConfigChange, setXhConfig } from '../src/config'

interface Item {
  readonly id: string
  readonly label: string
}

interface ViewerTexts {
  empty: string
  more: string
}

class TestViewer extends XhReactiveElement {
  static override properties = {
    items: { attribute: false },
    heading: { type: String },
    limit: { type: Number },
  }

  declare items: readonly Item[] | undefined
  declare heading: string | null | undefined
  declare limit: number | null | undefined
  texts: Partial<ViewerTexts> | undefined

  readonly config = new XhConfigController(this)
  readonly keys: KeyedChildren = new WeakMap()
  renders = 0

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    this.renders++
    const t = this.config.translations<ViewerTexts>('test-viewer', { empty: 'No items', more: 'More' }, this.texts)
    this.dataset.empty = t.empty
    this.dataset.more = t.more
    reconcile(this, this.items ?? [], this.keys, item => item.id, (item, reuse) => {
      const node = reuse ?? createGeneratedElement(this.ownerDocument, 'span')
      node.textContent = item.label
      return node
    })
  }
}

registerElement('test-authoring-viewer', TestViewer)

const mounted: Element[] = []

function mount(parent: Element = document.body): TestViewer {
  const element = document.createElement('test-authoring-viewer') as TestViewer
  parent.appendChild(element)
  mounted.push(element)
  return element
}

afterEach(() => {
  for (const element of mounted.splice(0)) element.remove()
  setXhConfig({})
})

describe('registerElement', () => {
  it('同一构造器重复注册不报错，标签被别的构造器占用时抛错', () => {
    expect(customElements.get('test-authoring-viewer')).toBe(TestViewer)
    expect(() => registerElement('test-authoring-viewer', TestViewer)).not.toThrow()
    class Other extends XhReactiveElement {}
    expect(() => registerElement('test-authoring-viewer', Other)).toThrow(/test-authoring-viewer/)
  })
})

describe('响应式元素基类', () => {
  it('同一拍里的多次写入合并成一轮更新', async () => {
    const element = mount()
    await element.updateComplete
    const before = element.renders
    element.items = [{ id: 'a', label: 'A' }]
    element.heading = 'x'
    await element.updateComplete
    expect(element.renders).toBe(before + 1)
  })

  it('属性按声明的类型转成字段，不回写属性', async () => {
    const element = mount()
    element.setAttribute('heading', '标题')
    element.setAttribute('limit', '3')
    await element.updateComplete
    expect([element.heading, element.limit]).toEqual(['标题', 3])
    element.limit = 9
    await element.updateComplete
    expect(element.getAttribute('limit')).toBe('3')
  })
})

describe('reconcile 与生成节点', () => {
  it('按 key 复用节点，作者写的节点不动，生成节点排在其后', async () => {
    const element = mount()
    const authored = document.createElement('p')
    element.appendChild(authored)
    element.items = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }]
    await element.updateComplete
    const [a, b] = generatedChildren(element)
    expect([a!.textContent, b!.textContent]).toEqual(['A', 'B'])
    expect(a!.hasAttribute(GEN_ATTR)).toBe(true)
    expect(authored.hasAttribute(GEN_ATTR)).toBe(false)

    element.items = [{ id: 'b', label: 'B2' }, { id: 'c', label: 'C' }]
    await element.updateComplete
    const next = generatedChildren(element)
    expect(next.map(node => node.textContent)).toEqual(['B2', 'C'])
    expect(next[0]).toBe(b)
    expect(a!.isConnected).toBe(false)
    expect(element.firstElementChild).toBe(authored)
  })

  it('列表动效放的离场替身不算生成节点：对账不摘它、不按它排位', async () => {
    const element = mount()
    element.items = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }]
    await element.updateComplete
    const [a] = generatedChildren(element)
    const ghost = a!.cloneNode(true) as Element
    ghost.setAttribute(GHOST_ATTR, '')
    element.insertBefore(ghost, a!)
    expect(generatedChildren(element)).toHaveLength(2)

    element.items = [{ id: 'b', label: 'B' }, { id: 'c', label: 'C' }]
    await element.updateComplete
    expect(ghost.isConnected).toBe(true)
    expect(generatedChildren(element).map(node => node.textContent)).toEqual(['B', 'C'])
  })

  it('生成节点带标记，SVG 命名空间常量可直接用于 createElementNS', () => {
    const node = createGeneratedElement(document, 'div')
    expect(node.getAttribute(GEN_ATTR)).toBe('')
    expect(document.createElementNS(SVG_NS, 'path').namespaceURI).toBe('http://www.w3.org/2000/svg')
  })

  it('建节点时可同时写属性表与子节点：false 与 undefined 不写，true 写成空串，字符串子节点作为文本；作者形态的节点不带生成标记', () => {
    const item = createGeneratedElement(document, 'button', { 'data-xh-part': 'item', 'value': 'undo', 'disabled': false, 'hidden': undefined, 'aria-pressed': true, 'tabindex': 0 }, ['撤销'])
    const root = createGeneratedElement(document, 'xh-unknown-group', { 'data-xh-part': 'root' }, [item, ' '])
    expect(root.localName).toBe('xh-unknown-group')
    expect(root.childNodes).toHaveLength(2)
    const authored = createAuthoredElement(document, 'div', { 'data-xh-part': 'group' }, [createAuthoredElement(document, 'span')])
    expect(authored.hasAttribute(GEN_ATTR)).toBe(false)
    expect(authored.firstElementChild!.hasAttribute(GEN_ATTR)).toBe(false)
    expect(Array.from(item.attributes, attribute => [attribute.name, attribute.value])).toEqual([
      [GEN_ATTR, ''],
      ['data-xh-part', 'item'],
      ['value', 'undo'],
      ['aria-pressed', ''],
      ['tabindex', '0'],
    ])
    expect(item.textContent).toBe('撤销')
  })

  it('setAttributes 与 setText：值没变时不产生变更记录，false 与 undefined 删除属性', async () => {
    const node = createGeneratedElement(document, 'div', { 'title': 'a', 'aria-disabled': 'true' }, ['x'])
    const records: MutationRecord[] = []
    const observer = new MutationObserver(list => records.push(...list))
    observer.observe(node, { attributes: true, childList: true, characterData: true, subtree: true })
    setAttributes(node, { 'title': 'a', 'hidden': false, 'data-gone': undefined })
    setText(node, 'x')
    await Promise.resolve()
    expect(observer.takeRecords().length + records.length).toBe(0)
    setAttributes(node, { 'title': 'b', 'aria-disabled': undefined, 'hidden': true })
    setText(node, 'y')
    expect(observer.takeRecords().map(record => record.attributeName ?? record.type)).toEqual(['title', 'aria-disabled', 'hidden', 'childList'])
    expect([node.getAttribute('title'), node.hasAttribute('aria-disabled'), node.getAttribute('hidden'), node.textContent]).toEqual(['b', false, '', 'y'])
    observer.disconnect()
  })
})

describe('emitEvent', () => {
  it('冒泡、带出 detail，被 preventDefault 时返回 false', () => {
    const element = mount()
    const seen = vi.fn((event: Event) => {
      const custom = event as CustomEvent<{ ids: string[] }>
      expect([custom.bubbles, custom.composed, custom.detail]).toEqual([true, true, { ids: ['a'] }])
    })
    document.body.addEventListener('selection-change', seen)
    expect(emitEvent(element, 'selection-change', { ids: ['a'] })).toBe(true)
    expect(seen).toHaveBeenCalledTimes(1)
    document.body.removeEventListener('selection-change', seen)

    element.addEventListener('before-delete', event => event.preventDefault(), { once: true })
    expect(emitEvent(element, 'before-delete', null, { cancelable: true })).toBe(false)
    element.addEventListener('after-delete', event => event.preventDefault(), { once: true })
    expect(emitEvent(element, 'after-delete', null)).toBe(true)
  })
})

describe('配置控制器', () => {
  it('文案按 defaults < 配置那一桶 < 元素自己的顺序叠加，值为 undefined 的键视为没给', async () => {
    const element = mount()
    await element.updateComplete
    expect(element.dataset.empty).toBe('No items')
    setXhConfig({ locale: 'zh-CN', translations: { 'test-viewer': { empty: '暂无数据', more: undefined } } as never })
    await element.updateComplete
    expect([element.dataset.empty, element.dataset.more, element.config.locale]).toEqual(['暂无数据', 'More', 'zh-CN'])
    element.texts = { more: '更多' }
    element.requestUpdate()
    await element.updateComplete
    expect([element.dataset.empty, element.dataset.more]).toEqual(['暂无数据', '更多'])
  })

  it('子树作用域的配置变化只叫醒子树里的元素', async () => {
    const scope = document.createElement('div') as HTMLDivElement & { xhConfig: object }
    scope.xhConfig = { translations: { 'test-viewer': { empty: '子树' } } }
    document.body.appendChild(scope)
    const inside = mount(scope)
    const outside = mount()
    await inside.updateComplete
    await outside.updateComplete
    expect([inside.dataset.empty, outside.dataset.empty]).toEqual(['子树', 'No items'])

    const outsideRenders = outside.renders
    scope.xhConfig = { translations: { 'test-viewer': { empty: '换了' } } }
    notifyXhConfigChange(scope)
    await inside.updateComplete
    await outside.updateComplete
    expect(inside.dataset.empty).toBe('换了')
    expect(outside.renders).toBe(outsideRenders)
    scope.remove()
  })

  it('断开后不再随配置重渲，重新连上后恢复', async () => {
    const element = mount()
    await element.updateComplete
    element.remove()
    const renders = element.renders
    setXhConfig({ translations: { 'test-viewer': { empty: '离线' } } as never })
    await Promise.resolve()
    expect(element.renders).toBe(renders)
    document.body.appendChild(element)
    setXhConfig({ translations: { 'test-viewer': { empty: '回来了' } } as never })
    await element.updateComplete
    expect(element.dataset.empty).toBe('回来了')
  })

  it('断开期间配置变了，重新连上就按新配置重渲', async () => {
    const element = mount()
    await element.updateComplete
    expect(element.dataset.empty).toBe('No items')
    element.remove()
    setXhConfig({ locale: 'zh-CN', translations: { 'test-viewer': { empty: '暂无数据' } } as never })
    document.body.appendChild(element)
    await element.updateComplete
    expect([element.dataset.empty, element.config.locale]).toEqual(['暂无数据', 'zh-CN'])
  })

  it('断开后挪进另一个配置作用域，连上就按那里的配置重渲', async () => {
    const scope = document.createElement('div') as HTMLDivElement & { xhConfig: object }
    scope.xhConfig = { translations: { 'test-viewer': { empty: '子树' } } }
    document.body.appendChild(scope)
    const element = mount()
    await element.updateComplete
    expect(element.dataset.empty).toBe('No items')
    scope.appendChild(element)
    await element.updateComplete
    expect(element.dataset.empty).toBe('子树')
    scope.remove()
  })
})
