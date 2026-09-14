import type { App } from 'vue'
import { cdp } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhGradientText } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function text(): HTMLElement {
  return host!.querySelector<HTMLElement>('[data-scope="gradient-text"][data-part="root"]')!
}

async function mount(): Promise<{ boundary: HTMLElement }> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h('section', { 'data-contrast': 'more' }, [
      h('div', { 'data-contrast': 'default' }, [
        h(XhGradientText, { from: 'rgb(255 0 0)', to: 'rgb(0 0 255)', direction: 'to-bottom-left' }, () => '西汉'),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  return { boundary: host.querySelector<HTMLElement>('[data-contrast="default"]')! }
}

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

describe('gradient text 环境降级', () => {
  it('最近 contrast 作用域双向切换渐变与实体前景', async () => {
    const { boundary } = await mount()
    expect(getComputedStyle(text()).backgroundImage).toContain('linear-gradient')
    expect(getComputedStyle(text()).webkitTextFillColor).toBe('rgba(0, 0, 0, 0)')

    boundary.dataset.contrast = 'more'
    await nextTick()
    // 渐变声明仍保留，但实体 text fill 完全盖住它；局部退回 default 时无需重建背景。
    expect(getComputedStyle(text()).backgroundImage).toContain('linear-gradient')
    expect(getComputedStyle(text()).webkitTextFillColor).not.toBe('rgba(0, 0, 0, 0)')

    boundary.dataset.contrast = 'default'
    await nextTick()
    expect(getComputedStyle(text()).backgroundImage).toContain('linear-gradient')
    expect(getComputedStyle(text()).webkitTextFillColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('打印与 forced-colors 都使用可见的单色文字', async () => {
    await mount()
    await cdp().send('Emulation.setEmulatedMedia', { media: 'print', features: [] })
    expect(getComputedStyle(text()).backgroundImage).toBe('none')
    expect(getComputedStyle(text()).webkitTextFillColor).not.toBe('rgba(0, 0, 0, 0)')

    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    expect(matchMedia('(forced-colors: active)').matches).toBe(true)
    expect(getComputedStyle(text()).backgroundImage).toBe('none')
    expect(getComputedStyle(text()).webkitTextFillColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('选择与复制仍保留原始文本，不生成替代内容', async () => {
    await mount()
    const range = document.createRange()
    range.selectNodeContents(text())
    const selection = getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)

    expect(selection.toString()).toBe('西汉')
    selection.removeAllRanges()
  })
})
