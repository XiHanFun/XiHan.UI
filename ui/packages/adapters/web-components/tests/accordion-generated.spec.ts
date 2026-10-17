// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { AccordionNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface AccordionHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: AccordionNode[]
  value?: string[]
  defaultValue?: string[]
  lazyMount?: boolean
  unmountOnExit?: boolean
  collapsible?: boolean
}

const COLLECTION: AccordionNode[] = [
  { value: 'one', label: '第一项', content: '一的内容' },
  { value: 'two', label: '第二项', content: '二的内容' },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: AccordionHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<AccordionHost>, inner = ''): AccordionHost {
  const el = document.createElement('xh-accordion') as AccordionHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function parts(el: Element, name: string): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(`[data-scope="accordion"][data-part="${name}"]`))
}

describe('xh-accordion 生成结构', () => {
  it('什么都不写：连 root 生成条目、标题按钮与正文，点标题即展开，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION })
    await settle(el)

    const [root] = parts(el, 'root')
    expect(root!.hasAttribute('data-xh-gen')).toBe(true)
    expect(parts(el, 'item').map(item => item.getAttribute('value'))).toEqual(['one', 'two'])
    expect(parts(el, 'header').map(header => header.localName)).toEqual(['h3', 'h3'])
    expect(parts(el, 'trigger').map(trigger => trigger.textContent)).toEqual(['第一项', '第二项'])
    expect(parts(el, 'content').map(content => content.textContent)).toEqual(['一的内容', '二的内容'])

    parts(el, 'trigger')[1]!.click()
    await settle(el)
    expect(parts(el, 'trigger')[1]!.getAttribute('aria-expanded')).toBe('true')
    expect(parts(el, 'content')[1]!.hidden).toBe(false)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('换数据：按值复用条目，留下的条目还是原来的节点，展开状态不丢', async () => {
    const el = mount({ collection: COLLECTION, defaultValue: ['two'] })
    await settle(el)
    const kept = parts(el, 'item')[1]

    el.collection = [COLLECTION[1]!, { value: 'three', label: '第三项', content: '三的内容' }]
    await settle(el)
    expect(parts(el, 'item').map(item => item.getAttribute('value'))).toEqual(['two', 'three'])
    expect(parts(el, 'item')[0]).toBe(kept)
    expect(parts(el, 'trigger')[0]!.getAttribute('aria-expanded')).toBe('true')
    expect(parts(el, 'trigger')[1]!.textContent).toBe('第三项')
  })

  it('slot 接管某一条的正文：作者节点搬进那一条的正文，别的条目照数据铺', async () => {
    const el = mount({ collection: COLLECTION }, '<p slot="content:two">自己写的<b>正文</b></p>')
    await settle(el)

    const [first, second] = parts(el, 'content')
    expect(first!.textContent).toBe('一的内容')
    expect(second!.innerHTML).toBe('<p slot="content:two">自己写的<b>正文</b></p>')
  })

  it('lazyMount 与 unmountOnExit：正文第一次展开才填，收起落定后清空，再展开又填上', async () => {
    const el = mount({ collection: COLLECTION, lazyMount: true, unmountOnExit: true, collapsible: true })
    await settle(el)
    const trigger = parts(el, 'trigger')[0]!
    expect(parts(el, 'content')[0]!.textContent).toBe('')

    trigger.click()
    await settle(el)
    expect(parts(el, 'content')[0]!.textContent).toBe('一的内容')

    trigger.click()
    await settle(el)
    expect(parts(el, 'content')[0]!.textContent).toBe('')

    trigger.click()
    await settle(el)
    expect(parts(el, 'content')[0]!.textContent).toBe('一的内容')
  })

  it('lazyMount 下 slot 接管的正文写成模板：第一次展开才克隆进正文，作者节点一直在正文里', async () => {
    const el = mount({ collection: COLLECTION, lazyMount: true }, '<template slot="content:one"><p>自己写的正文</p></template><p slot="content:two">常驻</p>')
    await settle(el)
    const [first, second] = parts(el, 'content')
    expect(first!.querySelector('p')).toBeNull()
    expect(first!.querySelector('template')).not.toBeNull()
    expect(second!.textContent).toBe('常驻')

    parts(el, 'trigger')[0]!.click()
    await settle(el)
    expect(first!.querySelector('p')!.textContent).toBe('自己写的正文')
  })

  it('作者写了部件：撤掉生成的节点，结构归作者', async () => {
    const el = mount({ collection: COLLECTION })
    await settle(el)
    expect(parts(el, 'item')).toHaveLength(2)

    el.innerHTML = [
      '<div data-xh-part="root">',
      '<div data-xh-part="item" value="one"><h3 data-xh-part="header"><button data-xh-part="trigger">自己的标题</button></h3>',
      '<div data-xh-part="content">自己的正文</div></div>',
      '</div>',
    ].join('')
    await settle(el)
    expect(el.querySelectorAll('[data-xh-gen]')).toHaveLength(0)
    expect(parts(el, 'trigger').map(trigger => trigger.textContent)).toEqual(['自己的标题'])
  })
})
