// @vitest-environment jsdom
// 多选上限：判据在 Headless，这里核 Vue 这一侧把 maxSelected 透传到了机器，选满后的禁用面与拦截落在渲染出来的节点上。
import type { TreeSelectNode } from '@xihan-ui/headless'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTreeSelectRoot } from '../src'

const COLLECTION: TreeSelectNode[] = [
  { value: 'src', label: '源码', children: [{ value: 'index', label: '入口' }, { value: 'utils', label: '工具' }] },
  { value: 'license', label: '许可' },
]

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

function node(part: 'item' | 'branch', value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="tree-select"][data-part="${part}"][data-value="${value}"]`)!
}

describe('xhTreeSelect 的 maxSelected', () => {
  it('选满后没选中的节点转禁用面、点不进去；点掉一个已选的即腾出名额', async () => {
    const onChange = vi.fn()
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp({
      setup: () => () => h(XhTreeSelectRoot, {
        collection: COLLECTION,
        multiple: true,
        maxSelected: 1,
        defaultOpen: true,
        defaultExpandedValue: ['src'],
        onValueChange: onChange,
      }),
    })
    app.mount(host)
    cleanup.push(() => app.unmount())
    await tick()

    node('item', 'index').click()
    await tick()
    expect(onChange).toHaveBeenLastCalledWith({ value: ['index'] })
    expect(node('item', 'utils').getAttribute('aria-disabled')).toBe('true')
    expect(node('branch', 'src').getAttribute('aria-disabled')).toBe('true')
    expect(node('item', 'index').getAttribute('aria-disabled')).toBe('false')

    node('item', 'utils').click()
    await tick()
    expect(onChange).toHaveBeenCalledTimes(1)

    node('item', 'index').click()
    await tick()
    expect(onChange).toHaveBeenLastCalledWith({ value: [] })
    expect(node('item', 'utils').getAttribute('aria-disabled')).toBe('false')
  })
})
