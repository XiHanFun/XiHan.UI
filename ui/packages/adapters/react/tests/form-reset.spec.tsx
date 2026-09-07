// @vitest-environment jsdom
//
// 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhCheckbox, XhSwitch } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
})

function mount(node: React.ReactNode): HTMLFormElement {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(<form>{node}</form>))
  return host.querySelector('form')!
}

const track = (): HTMLButtonElement => host!.querySelector<HTMLButtonElement>('[data-scope="switch"][data-part="root"]')!

describe('原生表单重置', () => {
  it('非受控：重置回到 defaultChecked', () => {
    const form = mount(<XhSwitch name="notify" defaultChecked={false} />)
    act(() => track().click())
    expect(track().getAttribute('aria-checked')).toBe('true')
    act(() => form.reset())
    expect(track().getAttribute('aria-checked')).toBe('false')
  })

  it('宿主没写 defaultChecked 时不把它抹成兜底空值以外的东西', () => {
    const form = mount(<XhSwitch name="notify" defaultChecked />)
    act(() => track().click())
    expect(track().getAttribute('aria-checked')).toBe('false')
    act(() => form.reset())
    expect(track().getAttribute('aria-checked')).toBe('true')
  })

  it('复选框：重置回到 defaultChecked，锚点在带文字时的 <label> 上也接得住', () => {
    const box = (): HTMLButtonElement => host!.querySelector<HTMLButtonElement>('[data-scope="checkbox"][data-part="root"]')!
    const form = mount(<XhCheckbox name="agree" defaultChecked={false}>同意条款</XhCheckbox>)
    act(() => box().click())
    expect(box().getAttribute('aria-checked')).toBe('true')
    act(() => form.reset())
    expect(box().getAttribute('aria-checked')).toBe('false')
  })

  it('复选框：半选也由重置还原', () => {
    const box = (): HTMLButtonElement => host!.querySelector<HTMLButtonElement>('[data-scope="checkbox"][data-part="root"]')!
    const form = mount(<XhCheckbox name="agree" defaultChecked="indeterminate" />)
    act(() => box().click())
    expect(box().getAttribute('aria-checked')).toBe('true')
    act(() => form.reset())
    expect(box().getAttribute('aria-checked')).toBe('mixed')
  })
})
