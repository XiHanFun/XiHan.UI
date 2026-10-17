// @vitest-environment jsdom
// tree-select 必填：没选值时表单出口补一份空值占位、带原生 required；选了值就只剩值的影子。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhTreeSelectHiddenInput, XhTreeSelectRoot } from '../src'

let unmount: (() => void) | null = null

afterEach(() => {
  unmount?.()
  unmount = null
  document.body.innerHTML = ''
})

async function mount(props: Record<string, unknown>): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(<XhTreeSelectRoot name="dir" collection={[{ value: 'src', label: 'src' }]} {...props}><XhTreeSelectHiddenInput /></XhTreeSelectRoot>)
  })
  unmount = () => act(() => root.unmount())
  return host
}

describe('tree-select 必填的占位影子（React）', () => {
  it('必填且没选值：一份空值的文本输入带 required', async () => {
    const inputs = [...(await mount({ required: true })).querySelectorAll('input')]
    expect(inputs.map(input => [input.type, input.value, input.required])).toEqual([['text', '', true]])
  })

  it('选了值：只剩值的影子，不带 required；不必填时没有占位', async () => {
    const filled = [...(await mount({ required: true, defaultValue: 'src' })).querySelectorAll('input')]
    expect(filled.map(input => [input.type, input.value, input.required])).toEqual([['hidden', 'src', false]])
    unmount?.()
    unmount = null
    document.body.innerHTML = ''
    expect((await mount({})).querySelectorAll('input')).toHaveLength(0)
  })
})
