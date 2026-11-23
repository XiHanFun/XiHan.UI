// @vitest-environment jsdom
// 多选上限：判据在 Headless，这里核 React 这一侧把 maxSelected 透传到了机器，选满后的禁用面与拦截落在渲染出来的节点上。
import type { TreeSelectNode } from '@xihan-ui/headless'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhTreeSelectRoot } from '../src'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const COLLECTION: TreeSelectNode[] = [
  { value: 'src', label: '源码', children: [{ value: 'index', label: '入口' }, { value: 'utils', label: '工具' }] },
  { value: 'license', label: '许可' },
]

let host: HTMLElement | null = null
let root: Root | null = null

afterEach(async () => {
  if (root)
    await act(async () => root!.unmount())
  host?.remove()
  document.body.innerHTML = ''
  root = null
  host = null
})

function node(part: 'item' | 'branch', value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="tree-select"][data-part="${part}"][data-value="${value}"]`)!
}

describe('xhTreeSelect 的 maxSelected', () => {
  it('选满后没选中的节点转禁用面、点不进去；点掉一个已选的即腾出名额', async () => {
    const onChange = vi.fn()
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await act(async () => root!.render(
      <XhTreeSelectRoot
        collection={COLLECTION}
        multiple
        maxSelected={1}
        defaultOpen
        defaultExpandedValue={['src']}
        onValueChange={onChange}
      />,
    ))

    await act(async () => node('item', 'index').click())
    expect(onChange).toHaveBeenLastCalledWith({ value: ['index'] })
    expect(node('item', 'utils').getAttribute('aria-disabled')).toBe('true')
    expect(node('branch', 'src').getAttribute('aria-disabled')).toBe('true')
    expect(node('item', 'index').getAttribute('aria-disabled')).toBe('false')

    await act(async () => node('item', 'utils').click())
    expect(onChange).toHaveBeenCalledTimes(1)

    await act(async () => node('item', 'index').click())
    expect(onChange).toHaveBeenLastCalledWith({ value: [] })
    expect(node('item', 'utils').getAttribute('aria-disabled')).toBe('false')
  })
})
