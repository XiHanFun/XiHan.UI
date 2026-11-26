// @vitest-environment jsdom
// NumberField 的 formatOptions 在 React 上的接线：格式化显示下表单提交的是原值。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhNumberFieldRoot } from '../src'

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

describe('number-field formatOptions', () => {
  it('失焦显示格式化文字，表单提交的是原值', async () => {
    const form = await renderInForm(<XhNumberFieldRoot name="price" defaultValue="1234.5" locale="en-US" formatOptions={{ style: 'currency', currency: 'USD' }} />)
    expect(form.querySelector<HTMLInputElement>('[role="spinbutton"]')!.value).toBe('$1,234.50')
    expect([...new FormData(form).entries()]).toEqual([['price', '1234.5']])
  })

  it('没给 formatOptions 时提交照旧走输入框，precision 补齐位数', async () => {
    const form = await renderInForm(<XhNumberFieldRoot name="qty" defaultValue="3" precision={2} />)
    expect([...new FormData(form).entries()]).toEqual([['qty', '3.00']])
  })
})
