// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { TabsNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TabsHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: TabsNode[]
  defaultValue?: string
  closable?: boolean
  lazyMount?: boolean
}

const COLLECTION: TabsNode[] = [
  { value: 'one', label: '一' },
  { value: 'two', label: '二' },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: TabsHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<TabsHost>, inner = ''): TabsHost {
  const el = document.createElement('xh-tabs') as TabsHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function parts(el: Element, name: string): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(`[data-scope="tabs"][data-part="${name}"]`))
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-tabs 生成结构', () => {
  it('什么都不写：连 root 生成标签带与面板，点标签即切换，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION, defaultValue: 'one' })
    await settle(el)

    const [root] = parts(el, 'root')
    expect(partsOf(root!)).toEqual(['list', 'content', 'content'])
    expect(partsOf(parts(el, 'list')[0]!)).toEqual(['trigger', 'trigger'])
    expect(parts(el, 'trigger').map(trigger => trigger.textContent)).toEqual(['一', '二'])
    expect(parts(el, 'content').map(content => content.getAttribute('value'))).toEqual(['one', 'two'])

    parts(el, 'trigger')[1]!.click()
    await settle(el)
    expect(parts(el, 'trigger')[1]!.getAttribute('aria-selected')).toBe('true')
    expect(parts(el, 'content')[1]!.hidden).toBe(false)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('closable：每个标签后面紧跟它的关闭钮，关掉时撤掉', async () => {
    const el = mount({ collection: COLLECTION, closable: true })
    await settle(el)
    const list = parts(el, 'list')[0]!
    expect(partsOf(list)).toEqual(['trigger', 'close-trigger', 'trigger', 'close-trigger'])
    expect(parts(el, 'close-trigger').map(close => close.getAttribute('value'))).toEqual(['one', 'two'])

    el.closable = false
    await settle(el)
    expect(partsOf(list)).toEqual(['trigger', 'trigger'])
  })

  it('换数据：按值复用标签与面板，选中不丢', async () => {
    const el = mount({ collection: COLLECTION, defaultValue: 'two' })
    await settle(el)
    const kept = parts(el, 'trigger')[1]

    el.collection = [COLLECTION[1]!, { value: 'three', label: '三' }]
    await settle(el)
    expect(parts(el, 'trigger')[0]).toBe(kept)
    expect(parts(el, 'trigger').map(trigger => trigger.textContent)).toEqual(['二', '三'])
    expect(kept!.getAttribute('aria-selected')).toBe('true')
  })

  it('slot 接管面板内容；写成模板时按 lazy-mount 第一次选中才克隆进面板', async () => {
    const el = mount(
      { collection: COLLECTION, defaultValue: 'one', lazyMount: true },
      '<p slot="panel:one">一的面板</p><template slot="panel:two"><p>二的面板</p></template>',
    )
    await settle(el)
    const [first, second] = parts(el, 'content')
    expect(first!.innerHTML).toBe('<p slot="panel:one">一的面板</p>')
    expect(second!.querySelector('p')).toBeNull()

    parts(el, 'trigger')[1]!.click()
    await settle(el)
    expect(second!.querySelector('p')!.textContent).toBe('二的面板')
  })

  it('作者写了部件：撤掉生成的节点，结构归作者', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)
    expect(parts(el, 'trigger')).toHaveLength(2)

    el.innerHTML = [
      '<div data-xh-part="root"><div data-xh-part="list"><button data-xh-part="trigger" value="one">自己的标签</button></div>',
      '<div data-xh-part="content" value="one">自己的面板</div></div>',
    ].join('')
    await settle(el)
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
    expect(parts(el, 'trigger').map(trigger => trigger.textContent)).toEqual(['自己的标签'])
  })
})
