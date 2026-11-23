// @vitest-environment jsdom
// 多选上限：判据在 Headless，这里核 React 这一侧把 maxSelected 透传到了机器，选满后的禁用面与拦截落在渲染出来的条目上。
import type { CascaderNode } from '@xihan-ui/headless'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhCascaderRoot } from '../src'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const COLLECTION: CascaderNode[] = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '樱桃' },
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

function item(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="cascader"][data-part="item"][data-value="${value}"]`)!
}

describe('xhCascader 的 maxSelected', () => {
  it('选满后没选中的叶子转禁用、点不进去；点掉一个已选的即腾出名额', async () => {
    const onChange = vi.fn()
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await act(async () => root!.render(
      <XhCascaderRoot collection={COLLECTION} multiple maxSelected={2} defaultOpen onValueChange={onChange} />,
    ))

    await act(async () => item('apple').click())
    await act(async () => item('banana').click())
    expect(onChange).toHaveBeenLastCalledWith({ value: [['apple'], ['banana']] })
    expect(item('cherry').getAttribute('aria-disabled')).toBe('true')
    expect(item('apple').getAttribute('aria-disabled')).toBe('false')

    await act(async () => item('cherry').click())
    expect(onChange).toHaveBeenCalledTimes(2)

    await act(async () => item('apple').click())
    expect(onChange).toHaveBeenLastCalledWith({ value: [['banana']] })
    expect(item('cherry').getAttribute('aria-disabled')).toBe('false')
  })
})
