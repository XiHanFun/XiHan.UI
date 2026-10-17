// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { ToggleGroupNode } from '@xihan-ui/headless'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface ToggleGroupHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: ToggleGroupNode[]
}

const COLLECTION: ToggleGroupNode[] = [
  { value: 'left', label: '左对齐' },
  { value: 'center', label: '居中' },
  { value: 'right', label: '右对齐' },
]

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: ToggleGroupHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(collection: ToggleGroupNode[], inner = ''): ToggleGroupHost {
  const el = document.createElement('xh-toggle-group') as ToggleGroupHost
  el.collection = collection
  el.innerHTML = inner
  document.body.append(el)
  return el
}

/** root 的子节点：部件写部件名，自动分隔线写 |。 */
function layout(el: ToggleGroupHost): string[] {
  const root = el.querySelector('[data-part="root"]')!
  return Array.from(root.children).map(node => node.hasAttribute('data-xh-toggle-group-separator') ? '|' : `${node.getAttribute('data-part')}:${node.getAttribute('value') ?? ''}`)
}

describe('xh-toggle-group 生成结构', () => {
  it('什么都不写：连 root 生成条目按钮与末尾的表单影子，相邻条目间照常补分隔线', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount(COLLECTION)
    await settle(el)

    expect(layout(el)).toEqual(['item:left', '|', 'item:center', '|', 'item:right', 'hidden-input:'])
    const items = [...el.querySelectorAll<HTMLButtonElement>('[data-part="item"]')]
    expect(items.map(item => [item.localName, item.textContent])).toEqual([['button', '左对齐'], ['button', '居中'], ['button', '右对齐']])
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('collection 增删：条目按值复用，分隔线跟着重排', async () => {
    const el = mount(COLLECTION)
    await settle(el)
    const right = el.querySelector('[data-part="item"][value="right"]')

    el.collection = [COLLECTION[2]!, { value: 'justify', label: '两端' }]
    await settle(el)
    expect(layout(el)).toEqual(['item:right', '|', 'item:justify', 'hidden-input:'])
    expect(el.querySelector('[data-part="item"][value="right"]')).toBe(right)
  })

  it('slot="item:<值>" 接管那一条的内容，其余照数据铺', async () => {
    const el = mount(COLLECTION, '<b slot="item:center">中</b>')
    await settle(el)

    const items = [...el.querySelectorAll('[data-part="item"]')]
    expect(items.map(item => item.innerHTML)).toEqual(['左对齐', '<b slot="item:center">中</b>', '右对齐'])
  })
})
