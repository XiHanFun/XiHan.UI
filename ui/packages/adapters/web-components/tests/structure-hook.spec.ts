// @vitest-environment jsdom
// 标准结构的基类钩子：作者没写结构时元素按结构生成，按 key 复用，可接管部件让位，作者写了结构就全归作者；
// 宿主里写了 slot 的作者节点搬进对应部件，部件没了搬回宿主；挪动前后焦点不丢。

import type { StructureNode } from '@xihan-ui/headless'
import type { ElementStructure } from '../src/element-base'
import { afterEach, describe, expect, it } from 'vitest'
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
    rootTag: 'section',
    takeover: ['footer'],
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

const A = { value: 'a', label: 'A' }
const B = { value: 'b', label: 'B' }
const C = { value: 'c', label: 'C' }

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: XhStructureProbeElement): Promise<void> {
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
    expect([root.localName, root.getAttribute('data-xh-gen')]).toEqual(['section', 'structure'])
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

  it('可接管部件：作者在 root 里写了 footer，结构不再铺它；没写 root 就写 footer 时全归作者', async () => {
    const el = await mount('<div data-xh-part="root"><div data-xh-part="footer">mine</div></div>')
    const root = el.querySelector('[data-xh-part="root"]')!
    expect(parts(root)).toEqual(['footer', 'list', 'panel', 'panel'])
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
