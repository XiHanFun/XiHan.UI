// @vitest-environment jsdom
// 默认全部展开与全部展开 / 收起：判据在 Headless，这里核自定义元素这一侧的接线——
// default-expand-all 属性、连接后才赋的 collection（HTML 里写元素、脚本后赋数据的常见写法）与两个方法。
import type { TreeNode } from '@xihan-ui/headless'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TreeHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: TreeNode[]
  expandAll: () => void
  collapseAll: () => void
}

const COLLECTION: TreeNode[] = [
  { value: 'src', label: '源码', children: [{ value: 'utils', label: '工具', children: [{ value: 'dom', label: 'dom' }] }] },
  { value: 'docs', label: '文档', children: [{ value: 'guide', label: '指南' }] },
  { value: 'license', label: '许可' },
]

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: TreeHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

/** 各分支此刻的展开态，按文档次序。 */
function expanded(scope: string): Array<[string, string | null]> {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="branch"]`)]
    .map(el => [el.getAttribute('data-value')!, el.getAttribute('aria-expanded')])
}

describe('xh-tree 的全部展开', () => {
  it('default-expand-all 写成属性：挂上即逐层展开，不发变更事件', async () => {
    const onChange = vi.fn()
    const el = document.createElement('xh-tree') as TreeHost
    el.setAttribute('default-expand-all', '')
    el.collection = COLLECTION
    el.addEventListener('expanded-value-change', onChange)
    document.body.append(el)
    await settle(el)

    expect(expanded('tree')).toEqual([['src', 'true'], ['utils', 'true'], ['docs', 'true']])
    expect(onChange).not.toHaveBeenCalled()
  })

  it('连接后才赋 collection：数据到了才展开，并发一次变更事件', async () => {
    const onChange = vi.fn()
    document.body.innerHTML = '<xh-tree default-expand-all></xh-tree>'
    const el = document.querySelector('xh-tree') as TreeHost
    el.addEventListener('expanded-value-change', onChange)
    await settle(el)
    expect(expanded('tree')).toEqual([])

    el.collection = COLLECTION
    await settle(el)
    expect(expanded('tree')).toEqual([['src', 'true'], ['utils', 'true'], ['docs', 'true']])
    expect(onChange).toHaveBeenCalledTimes(1)
    expect((onChange.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: ['src', 'utils', 'docs'] })
  })

  it('expandAll() / collapseAll() 两个方法', async () => {
    const el = document.createElement('xh-tree') as TreeHost
    el.collection = COLLECTION
    document.body.append(el)
    await settle(el)
    expect(expanded('tree')).toEqual([['src', 'false'], ['utils', 'false'], ['docs', 'false']])

    el.expandAll()
    await settle(el)
    expect(expanded('tree')).toEqual([['src', 'true'], ['utils', 'true'], ['docs', 'true']])

    el.collapseAll()
    await settle(el)
    expect(expanded('tree')).toEqual([['src', 'false'], ['utils', 'false'], ['docs', 'false']])
  })
})

describe('xh-tree-select 的全部展开', () => {
  it('default-expand-all：浮层一开，树里的分支都是展开的；两个方法照常收展', async () => {
    const el = document.createElement('xh-tree-select') as TreeHost
    el.setAttribute('default-expand-all', '')
    el.setAttribute('default-open', '')
    el.collection = COLLECTION
    document.body.append(el)
    await settle(el)
    expect(expanded('tree-select')).toEqual([['src', 'true'], ['utils', 'true'], ['docs', 'true']])

    el.collapseAll()
    await settle(el)
    expect(expanded('tree-select')).toEqual([['src', 'false'], ['utils', 'false'], ['docs', 'false']])

    el.expandAll()
    await settle(el)
    expect(expanded('tree-select')).toEqual([['src', 'true'], ['utils', 'true'], ['docs', 'true']])
  })
})
