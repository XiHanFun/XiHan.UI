// @vitest-environment jsdom
// TextField 的回车提交在 React 上的接线：回车调 onValueCommit，输入法组合期间不调。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhTextFieldRoot } from '../src'

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

async function renderInForm(node: ReactNode): Promise<HTMLFormElement> {
  const form = document.createElement('form')
  document.body.appendChild(form)
  root = createRoot(form)
  await act(async () => {
    root!.render(node)
  })
  return form
}

describe('text-field 回车提交', () => {
  it('回车调 onValueCommit，带当前值；输入法组合期间的回车不调', async () => {
    const commits: unknown[] = []
    const form = await renderInForm(<XhTextFieldRoot defaultValue="曦寒" onValueCommit={d => commits.push(d)} />)
    const input = form.querySelector<HTMLInputElement>('[data-scope="text-field"][data-part="input"]')!
    // 表单里的回车会触发隐式提交：组件不拦，这里由测试自己挡掉，免得 jsdom 报未实现的导航
    form.addEventListener('submit', event => event.preventDefault())
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, isComposing: true, keyCode: 229 }))
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })
    expect(commits).toEqual([{ value: '曦寒' }])
  })
})
