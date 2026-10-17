// @vitest-environment jsdom
// 不给 children 时，multiline 让标准结构的输入框铺成 textarea；标题的 for 照样指向它。
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

async function render(node: React.ReactNode): Promise<void> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(node)
  })
}

function input(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="text-field"][data-part="input"]')!
}

describe('text-field 标准结构的 multiline', () => {
  it('开了 multiline 铺 textarea，不带 type；不开时是单行 input', async () => {
    await render(<XhTextFieldRoot label="备注" multiline />)
    expect([input().localName, input().hasAttribute('type')]).toEqual(['textarea', false])
    expect(document.querySelector('[data-scope="text-field"][data-part="label"]')!.getAttribute('for')).toBe(input().id)
    act(() => root?.unmount())
    document.body.innerHTML = ''
    await render(<XhTextFieldRoot label="昵称" />)
    expect(input().localName).toBe('input')
  })
})
