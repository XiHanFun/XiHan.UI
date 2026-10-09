// 字段外壳的多行档：textarea 上下内衬 --xh-space-1，一行时盒仍不低于本档控件高。计算样式与几何只有真实浏览器量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function px(token: string): number {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;inline-size:var(${token})`
  host!.append(probe)
  const value = probe.getBoundingClientRect().width
  probe.remove()
  return value
}

describe('字段外壳的多行档', () => {
  it('textarea 上下内衬取 --xh-space-1，一行时盒不低于本档控件高', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhTextFieldRoot, null, () => h(XhTextFieldControl, null, () => h(XhTextFieldInput, { 'as': 'textarea', 'rows': 1, 'aria-label': '备注' }))),
    })
    app.mount(host)
    await nextTick()
    const input = host.querySelector<HTMLElement>('[data-xh-field-input]')!
    const control = host.querySelector<HTMLElement>('[data-xh-field-chrome]')!
    const style = getComputedStyle(input)
    expect(input.dataset.xhFieldLayout).toBe('textarea')
    expect(Number.parseFloat(style.paddingBlockStart)).toBe(px('--xh-space-1'))
    expect(Number.parseFloat(style.paddingBlockEnd)).toBe(px('--xh-space-1'))
    expect(control.getBoundingClientRect().height).toBeGreaterThanOrEqual(px('--xh-control-h-md'))
  })
})
