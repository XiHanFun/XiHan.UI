// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { CheckboxGroupNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface CheckboxGroupHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: CheckboxGroupNode[]
  label?: string
  value?: string[]
  name?: string
}

const COLLECTION: CheckboxGroupNode[] = [
  { value: 'read', label: '读' },
  { value: 'write', label: '写', description: '包含新建与修改' },
  { value: 'admin', label: '管理', disabled: true },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: CheckboxGroupHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<CheckboxGroupHost>, inner = ''): CheckboxGroupHost {
  const el = document.createElement('xh-checkbox-group') as CheckboxGroupHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="checkbox-group"][data-part="${name}"]`)
}

function partsOf(parent: Element): string[] {
  return Array.from(parent.children).map(node => node.getAttribute('data-part') ?? '')
}

describe('xh-checkbox-group 生成结构', () => {
  it('什么都不写：连 root 生成标题与条目，条目里表单影子、方框、文字与说明，不报缺少部件', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ collection: COLLECTION, label: '权限', name: 'perm', value: ['write'] })
    await settle(el)

    const root = part(el, 'root')!
    expect(root.getAttribute('data-xh-gen')).toBe('structure')
    expect(partsOf(root)).toEqual(['label', 'item', 'item', 'item'])
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-scope="checkbox-group"][data-part="item"]'))
    expect(items.map(partsOf)).toEqual([
      ['hidden-input', 'indicator', 'item-text'],
      ['hidden-input', 'indicator', 'item-text', 'item-description'],
      ['hidden-input', 'indicator', 'item-text'],
    ])
    expect(items.map(item => item.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false'])
    expect(root.getAttribute('aria-labelledby')).toBe(part(el, 'label')!.id)
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('slot 接管标题与条目文字', async () => {
    const el = mount({ collection: COLLECTION }, '<b slot="label">选权限</b><em slot="item:admin">管理（需审批）</em>')
    await settle(el)
    expect(part(el, 'label')!.innerHTML).toBe('<b slot="label">选权限</b>')
    const texts = Array.from(el.querySelectorAll('[data-scope="checkbox-group"][data-part="item-text"]'), node => node.innerHTML)
    expect(texts).toEqual(['读', '写', '<em slot="item:admin">管理（需审批）</em>'])
  })

  it('作者写了部件：撤掉生成的节点，结构归作者', async () => {
    const el = mount({ collection: COLLECTION }, [
      '<div data-xh-part="root"><div data-xh-part="item" value="read">',
      '<input data-xh-part="hidden-input"><span data-xh-part="indicator"></span><span data-xh-part="item-text">读</span>',
      '</div></div>',
    ].join(''))
    await settle(el)
    expect(el.querySelectorAll('[data-xh-gen="structure"]')).toHaveLength(0)
    expect(el.querySelectorAll('[data-scope="checkbox-group"][data-part="item"]')).toHaveLength(1)
  })
})
