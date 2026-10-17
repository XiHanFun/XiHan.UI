// @vitest-environment jsdom
// 标准结构的基类钩子：作者没写结构时元素按结构生成，按 key 复用，可接管部件让位并按缺省结构排在末尾，
// 作者写了结构就全归作者；宿主里写了 slot 的作者节点搬进对应部件，部件没了搬回宿主；挪动前后焦点不丢。
// 组合节点：内层元素经 static dependencies 随宿主注册，props 按 property 赋值、回调接事件；没注册就生成时告警。

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { StructureNode } from '@xihan-ui/headless'
import type { ElementStructure } from '../src/element-base'
import { DIAGNOSTIC_CODES, onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElement } from '../src/define'
import { XhElement } from '../src/element-base'

interface ProbeItem {
  readonly value: string
  readonly label: string
}

class XhStructureProbeElement extends XhElement {
  static override properties = {
    items: { attribute: false },
    ready: { type: Boolean },
  }

  static override structure: ElementStructure<XhStructureProbeElement> = {
    rootTag: 'fieldset',
    takeover: { footer: 'trailing' },
    build: (host, taken) => host.nodes(taken),
  }

  declare items: readonly ProbeItem[]
  declare ready: boolean

  constructor() {
    super()
    this.items = []
    this.ready = true
  }

  nodes(taken: ReadonlySet<string>): StructureNode[] | undefined {
    if (!this.ready)
      return undefined
    return [
      {
        key: 'list',
        tag: 'div',
        part: 'list',
        children: this.items.map(item => ({ key: `item:${item.value}`, tag: 'button', part: 'item', attrs: { value: item.value, type: 'button' }, text: item.label })),
      },
      ...this.items.map((item): StructureNode => ({ key: `panel:${item.value}`, tag: 'div', part: 'panel', attrs: { value: item.value }, slot: { name: 'panel', key: item.value } })),
      ...(taken.has('footer') ? [] : [{ key: 'footer', tag: 'div', part: 'footer', text: 'generated' } satisfies StructureNode]),
    ]
  }

  protected wire(): void {}
}

customElements.define('xh-structure-probe', XhStructureProbeElement)

/** 可接管部件没排在末尾的结构：生成时报 wc.structure-takeover-order。 */
class XhStructureMisorderedElement extends XhElement {
  static override structure: ElementStructure<XhStructureMisorderedElement> = {
    takeover: { header: 'trailing' },
    build: () => [{ key: 'header', tag: 'div', part: 'header' }, { key: 'body', tag: 'div', part: 'body' }],
  }

  protected wire(): void {}
}

customElements.define('xh-structure-misordered', XhStructureMisorderedElement)

/** 组合进来的内层元素：记下 items 被赋值的次数。 */
class XhStructureChildElement extends XhElement {
  sets = 0
  #items: unknown

  get items(): unknown {
    return this.#items
  }

  set items(value: unknown) {
    this.sets++
    this.#items = value
  }

  protected wire(): void {}
}

/** 结构里组合了另一个库内元素：一个声明为依赖，一个没声明也没注册（stray 打开时才生成）。 */
class XhStructureParentElement extends XhElement {
  static override properties = {
    items: { attribute: false },
    stray: { type: Boolean },
  }

  static override dependencies = { 'xh-structure-child': XhStructureChildElement }

  static override structure: ElementStructure<XhStructureParentElement> = {
    build: host => [
      {
        key: 'box',
        tag: 'div',
        part: 'box',
        children: [{ key: 'child', instance: 'structure-child', props: { items: [...host.items], onPing: (detail: unknown) => host.pinged.push(detail) } }],
      },
      ...(host.stray ? [{ key: 'stray', instance: 'structure-stray' }] : []),
    ],
  }

  declare items: readonly string[]
  declare stray: boolean
  readonly pinged: unknown[] = []

  constructor() {
    super()
    this.items = []
    this.stray = false
  }

  protected wire(): void {}
}

let diagnostics: DiagnosticRecord[] = []

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  setDiagnosticsDedupe(false)
  diagnostics = []
  onDiagnostic(record => void diagnostics.push(record))
})

const A = { value: 'a', label: 'A' }
const B = { value: 'b', label: 'B' }
const C = { value: 'c', label: 'C' }

afterEach(() => {
  document.body.replaceChildren()
  resetDiagnostics()
})

async function settle(el: { readonly updateComplete: Promise<unknown> }): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await el.updateComplete
    await Promise.resolve()
  }
}

async function mount(inner = '', items: readonly ProbeItem[] = [A, B]): Promise<XhStructureProbeElement> {
  const el = document.createElement('xh-structure-probe') as XhStructureProbeElement
  el.innerHTML = inner
  el.items = items
  document.body.append(el)
  await settle(el)
  return el
}

function parts(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-xh-part') ?? `<${node.localName}>`)
}

function item(el: Element, value: string): HTMLButtonElement {
  return el.querySelector<HTMLButtonElement>(`[data-xh-part="item"][value="${value}"]`)!
}

describe('标准结构的基类钩子', () => {
  it('不写结构：连 root 一起生成整棵子树，root 用声明的标签，生成节点带 structure 标记', async () => {
    const el = await mount()
    const root = el.querySelector(':scope > [data-xh-part="root"]')!
    expect([root.localName, root.getAttribute('data-xh-gen')]).toEqual(['fieldset', 'structure'])
    expect(parts(root)).toEqual(['list', 'panel', 'panel', 'footer'])
    expect(Array.from(root.querySelectorAll('[data-xh-part="item"]'), node => [node.localName, node.getAttribute('type'), node.textContent])).toEqual([['button', 'button', 'A'], ['button', 'button', 'B']])
  })

  it('只写 root：生成在作者的 root 里；先生成后补写 root 时撤掉生成的 root', async () => {
    const el = await mount('<div data-xh-part="root"></div>')
    const root = el.querySelector(':scope > [data-xh-part="root"]')!
    expect([root.hasAttribute('data-xh-gen'), parts(root)]).toEqual([false, ['list', 'panel', 'panel', 'footer']])

    const later = await mount()
    const authored = document.createElement('div')
    authored.setAttribute('data-xh-part', 'root')
    later.prepend(authored)
    await settle(later)
    expect(parts(later)).toEqual(['root'])
    expect(later.firstElementChild).toBe(authored)
    expect(parts(authored)).toEqual(['list', 'panel', 'panel', 'footer'])
  })

  it('数据变化按 key 复用节点，换序时焦点所在的节点照旧有焦点', async () => {
    const el = await mount('', [A, B, C])
    const [a, b] = [item(el, 'a'), item(el, 'b')]
    b.focus()
    el.items = [{ ...B, label: 'B2' }, A]
    await settle(el)
    expect(item(el, 'b')).toBe(b)
    expect(item(el, 'a')).toBe(a)
    expect(item(el, 'c')).toBeNull()
    expect(b.textContent).toBe('B2')
    expect(Array.from(el.querySelectorAll('[data-xh-part="item"]'), node => node.getAttribute('value'))).toEqual(['b', 'a'])
    expect(document.activeElement).toBe(b)
  })

  it('可接管部件：作者在 root 里写了 footer，结构不再铺它，作者的 footer 按缺省结构排到末尾；没写 root 就写 footer 时全归作者', async () => {
    const el = await mount('<div data-xh-part="root"><div data-xh-part="footer">mine</div></div>')
    const root = el.querySelector('[data-xh-part="root"]')!
    expect(parts(root)).toEqual(['list', 'panel', 'panel', 'footer'])
    expect(root.lastElementChild!.hasAttribute('data-xh-gen')).toBe(false)
    expect(root.querySelector('[data-xh-part="footer"]')!.textContent).toBe('mine')

    const bare = await mount('<div data-xh-part="footer">mine</div>')
    expect(bare.querySelector('[data-xh-gen]')).toBeNull()
  })

  it('作者写了别的部件就全归作者：撤掉生成过的节点；删掉后又恢复生成', async () => {
    const el = await mount('<div data-xh-part="root"></div>')
    const root = el.querySelector('[data-xh-part="root"]')!
    const list = document.createElement('div')
    list.setAttribute('data-xh-part', 'list')
    root.append(list)
    await settle(el)
    expect(parts(root)).toEqual(['list'])
    expect(root.querySelector('[data-xh-gen]')).toBeNull()
    list.remove()
    await settle(el)
    expect(parts(root)).toEqual(['list', 'panel', 'panel', 'footer'])
  })

  it('slot 节点搬进对应部件；后加的照样搬；部件没了搬回宿主，作者自己挪走的不再管', async () => {
    const el = await mount('<p slot="panel:a">content a</p><p slot="panel:z">no target</p>')
    const panel = (value: string) => el.querySelector(`[data-xh-part="panel"][value="${value}"]`)
    const a = el.querySelector('[slot="panel:a"]')!
    expect(a.parentElement).toBe(panel('a'))
    expect(el.querySelector('[slot="panel:z"]')!.parentElement).toBe(el)

    const b = document.createElement('p')
    b.setAttribute('slot', 'panel:b')
    el.append(b)
    await settle(el)
    expect(b.parentElement).toBe(panel('b'))

    el.items = [B]
    await settle(el)
    expect([a.parentElement, b.parentElement]).toEqual([el, panel('b')])

    b.remove()
    el.items = []
    await settle(el)
    expect(b.isConnected).toBe(false)
  })

  it('可接管部件没排在 root 末尾的结构报 wc.structure-takeover-order；排对了的不报', async () => {
    await mount()
    expect(diagnostics.filter(record => record.code === DIAGNOSTIC_CODES.wcStructureTakeoverOrder)).toEqual([])
    const el = document.createElement('xh-structure-misordered') as XhStructureMisorderedElement
    document.body.append(el)
    await el.updateComplete
    expect(diagnostics.filter(record => record.code === DIAGNOSTIC_CODES.wcStructureTakeoverOrder).map(record => record.part)).toEqual(['header'])
  })

  it('组合节点：按需注册宿主时连带注册内层元素；数据按 property 赋值，相等不重设；回调收到 detail，事件不冒出宿主', async () => {
    defineXhElement('xh-structure-parent' as never, XhStructureParentElement as never)
    expect(customElements.get('xh-structure-child')).toBe(XhStructureChildElement)
    const el = document.createElement('xh-structure-parent') as XhStructureParentElement
    el.items = ['a']
    document.body.append(el)
    await settle(el)
    const child = el.querySelector('[data-xh-part="box"] > xh-structure-child') as XhStructureChildElement
    expect(child).toBeInstanceOf(XhStructureChildElement)
    expect([child.items, child.sets, child.hasAttribute('items'), child.getAttribute('data-xh-gen')]).toEqual([['a'], 1, false, 'structure'])

    el.items = ['a']
    await settle(el)
    expect(child.sets).toBe(1)
    el.items = ['a', 'b']
    await settle(el)
    expect([el.querySelector('xh-structure-child'), child.items, child.sets]).toEqual([child, ['a', 'b'], 2])

    const leaked: Event[] = []
    el.addEventListener('ping', event => leaked.push(event))
    child.dispatchEvent(new CustomEvent('ping', { detail: 7, bubbles: true }))
    expect([el.pinged, leaked]).toEqual([[7], []])
  })

  it('生成了没注册的库内元素时告警', async () => {
    defineXhElement('xh-structure-parent' as never, XhStructureParentElement as never)
    const el = document.createElement('xh-structure-parent') as XhStructureParentElement
    el.stray = true
    document.body.append(el)
    await el.updateComplete
    expect(diagnostics.filter(record => record.code === DIAGNOSTIC_CODES.wcUnregisteredElement).map(record => record.detail?.tag)).toEqual(['xh-structure-stray'])
  })

  it('build 返回 undefined 时不动现有节点', async () => {
    const el = await mount()
    const root = el.querySelector('[data-xh-part="root"]')!
    el.ready = false
    el.items = [C]
    await settle(el)
    expect(el.querySelector('[data-xh-part="root"]')).toBe(root)
    expect(Array.from(root.querySelectorAll('[data-xh-part="item"]'), node => node.getAttribute('value'))).toEqual(['a', 'b'])
  })
})
