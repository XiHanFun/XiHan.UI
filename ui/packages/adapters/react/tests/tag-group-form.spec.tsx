// @vitest-environment jsdom
// TagGroup 的表单出口在 React 上的接线：选中值按逗号拼成一串随表单提交。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhTagGroupRoot } from '../src'

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

describe('tag-group name', () => {
  it('选中值按逗号拼成一串随表单提交', async () => {
    const form = await renderInForm(
      <XhTagGroupRoot
        name="stack"
        selectionMode="multiple"
        defaultValue={['vue', 'svelte']}
        collection={[{ value: 'vue' }, { value: 'react' }, { value: 'svelte' }]}
      />,
    )
    expect([...new FormData(form).entries()]).toEqual([['stack', 'vue,svelte']])
  })
})
