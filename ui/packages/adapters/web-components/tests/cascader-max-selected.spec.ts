// @vitest-environment jsdom
// 多选上限：判据在 Headless，这里核自定义元素这一侧——max-selected 属性进了机器，选满后的禁用面与拦截落在生成出来的条目上。
import type { CascaderNode } from '@xihan-ui/headless'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface CascaderHost extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: CascaderNode[]
}

const COLLECTION: CascaderNode[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: CascaderHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function item(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="cascader"][data-part="item"][data-value="${value}"]`)!
}

describe('xh-cascader 的 max-selected', () => {
  it('写成属性：选满后没选中的叶子转禁用、点不进去；点掉一个已选的即腾出名额', async () => {
    const onChange = vi.fn()
    const el = document.createElement('xh-cascader') as CascaderHost
    el.setAttribute('multiple', '')
    el.setAttribute('max-selected', '2')
    el.setAttribute('default-open', '')
    el.collection = COLLECTION
    el.addEventListener('value-change', onChange)
    document.body.append(el)
    await settle(el)

    item('apple').click()
    await settle(el)
    item('banana').click()
    await settle(el)
    expect((onChange.mock.lastCall![0] as CustomEvent).detail).toEqual({ value: [['apple'], ['banana']] })
    expect(item('cherry').getAttribute('aria-disabled')).toBe('true')
    expect(item('apple').getAttribute('aria-disabled')).toBe('false')

    item('cherry').click()
    await settle(el)
    expect(onChange).toHaveBeenCalledTimes(2)

    item('apple').click()
    await settle(el)
    expect((onChange.mock.lastCall![0] as CustomEvent).detail).toEqual({ value: [['banana']] })
    expect(item('cherry').getAttribute('aria-disabled')).toBe('false')
  })
})
