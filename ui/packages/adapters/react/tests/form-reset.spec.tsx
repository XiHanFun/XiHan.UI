// @vitest-environment jsdom
//
// 值攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhSwitch } from '../src'

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
})
