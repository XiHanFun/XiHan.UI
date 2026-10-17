// @vitest-environment jsdom
// combobox 必填：没选值时表单出口补一份空值占位、带原生 required；选了值就只剩值的影子。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhComboboxHiddenInput, XhComboboxRoot } from '../src'

let cleanup: (() => void) | null = null

afterEach(() => {
  cleanup?.()
  cleanup = null
  document.body.innerHTML = ''
})

async function mount(props: Record<string, unknown>): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({ render: () => h(XhComboboxRoot, { name: 'fruit', collection: [{ value: 'apple', label: '苹果' }], ...props }, () => [h(XhComboboxHiddenInput)]) })
  app.mount(host)
  cleanup = () => app.unmount()
  await nextTick()
  return host
}

describe('combobox 必填的占位影子（Vue）', () => {
  it('必填且没选值：一份空值的文本输入带 required', async () => {
    const inputs = [...(await mount({ required: true })).querySelectorAll('input')]
    expect(inputs.map(input => [input.type, input.value, input.required])).toEqual([['text', '', true]])
  })

  it('选了值：只剩值的影子，不带 required；不必填时没有占位', async () => {
    const filled = [...(await mount({ required: true, defaultValue: 'apple' })).querySelectorAll('input')]
    expect(filled.map(input => [input.type, input.value, input.required])).toEqual([['hidden', 'apple', false]])
    cleanup?.()
    document.body.innerHTML = ''
    expect((await mount({})).querySelectorAll('input')).toHaveLength(0)
  })
})
