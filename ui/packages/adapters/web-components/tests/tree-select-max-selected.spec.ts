// @vitest-environment jsdom
// 多选上限：判据在 Headless，这里核自定义元素这一侧——max-selected 属性进了机器，选满后的禁用面与拦截落在生成出来的节点上。
import type { TreeSelectNode } from '@xihan-ui/headless'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TreeSelectHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: TreeSelectNode[]
  defaultExpandedValue?: string[]
}

const COLLECTION: TreeSelectNode[] = [
  { value: 'src', label: '源码', children: [{ value: 'index', label: '入口' }, { value: 'utils', label: '工具' }] },
  { value: 'license', label: '许可' },
]

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: TreeSelectHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function node(part: 'item' | 'branch', value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="tree-select"][data-part="${part}"][data-value="${value}"]`)!
}

describe('xh-tree-select 的 max-selected', () => {
  it('写成属性：选满后没选中的节点转禁用面、点不进去；点掉一个已选的即腾出名额', async () => {
    const onChange = vi.fn()
    const el = document.createElement('xh-tree-select') as TreeSelectHost
    el.setAttribute('multiple', '')
    el.setAttribute('max-selected', '1')
    el.setAttribute('default-open', '')
    el.collection = COLLECTION
    el.defaultExpandedValue = ['src']
    el.addEventListener('value-change', onChange)
    document.body.append(el)
    await settle(el)

    node('item', 'index').click()
    await settle(el)
    expect((onChange.mock.lastCall![0] as CustomEvent).detail).toEqual({ value: ['index'] })
    expect(node('item', 'utils').getAttribute('aria-disabled')).toBe('true')
    expect(node('branch', 'src').getAttribute('aria-disabled')).toBe('true')
    expect(node('item', 'index').getAttribute('aria-disabled')).toBe('false')

    node('item', 'utils').click()
    await settle(el)
    expect(onChange).toHaveBeenCalledTimes(1)

    node('item', 'index').click()
    await settle(el)
    expect((onChange.mock.lastCall![0] as CustomEvent).detail).toEqual({ value: [] })
    expect(node('item', 'utils').getAttribute('aria-disabled')).toBe('false')
  })
})
