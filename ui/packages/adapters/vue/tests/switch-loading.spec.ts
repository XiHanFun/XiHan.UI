// @vitest-environment jsdom
// switch loading：提交中交互挂起（点按不翻转）、aria-busy 置真、data-loading 上漆，
// 但不是禁用——按钮不带 disabled、仍可聚焦。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSwitch } from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

async function mountSwitch(props: Record<string, unknown>): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => () => h(XhSwitch, props) })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  await tick()
  const root = document.querySelector<HTMLElement>('[data-scope="switch"][data-part="root"]')
  if (!root)
    throw new Error('找不到开关')
  return root
}

describe('switch loading', () => {
  it('提交中点按不翻转，aria-busy 与 data-loading 就位，不带原生 disabled', async () => {
    const onChange = vi.fn()
    const root = await mountSwitch({ 'loading': true, 'onChecked-change': onChange })
    expect(root.getAttribute('aria-busy')).toBe('true')
    expect(root.hasAttribute('data-loading')).toBe(true)
    expect(root.hasAttribute('disabled')).toBe(false)
    root.click()
    await tick()
    expect(onChange).not.toHaveBeenCalled()
    expect(root.getAttribute('aria-checked')).toBe('false')
  })

  it('不 loading 时照常翻转、无忙碌标记', async () => {
    const onChange = vi.fn()
    const root = await mountSwitch({ 'onChecked-change': onChange })
    expect(root.hasAttribute('aria-busy')).toBe(false)
    root.click()
    await tick()
    expect(onChange).toHaveBeenCalledWith({ checked: true })
  })
})
