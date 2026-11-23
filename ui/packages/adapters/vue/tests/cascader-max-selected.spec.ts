// @vitest-environment jsdom
// 多选上限：判据在 Headless，这里核 Vue 这一侧把 maxSelected 透传到了机器，选满后的禁用面与拦截落在渲染出来的条目上。
import type { CascaderNode } from '@xihan-ui/headless'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhCascaderRoot } from '../src'

const COLLECTION: CascaderNode[] = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '樱桃' },
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

function item(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="cascader"][data-part="item"][data-value="${value}"]`)!
}

describe('xhCascader 的 maxSelected', () => {
  it('选满后没选中的叶子转禁用、点不进去；点掉一个已选的即腾出名额', async () => {
    const onChange = vi.fn()
    const host = document.createElement('div')
    document.body.appendChild(host)
    const app = createApp({
      setup: () => () => h(XhCascaderRoot, {
        collection: COLLECTION,
        multiple: true,
        maxSelected: 2,
        defaultOpen: true,
        onValueChange: onChange,
      }),
    })
    app.mount(host)
    cleanup.push(() => app.unmount())
    await tick()

    item('apple').click()
    await tick()
    item('banana').click()
    await tick()
    expect(onChange).toHaveBeenLastCalledWith({ value: [['apple'], ['banana']] })
    expect(item('cherry').getAttribute('aria-disabled')).toBe('true')
    expect(item('apple').getAttribute('aria-disabled')).toBe('false')

    item('cherry').click()
    await tick()
    expect(onChange).toHaveBeenCalledTimes(2)

    item('apple').click()
    await tick()
    expect(onChange).toHaveBeenLastCalledWith({ value: [['banana']] })
    expect(item('cherry').getAttribute('aria-disabled')).toBe('false')
  })
})
