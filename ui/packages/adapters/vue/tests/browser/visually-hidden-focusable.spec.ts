// 视觉隐藏的藏法与 focusable 的显出全在皮肤里：盒子多大、裁没裁掉、焦点进来后回不回到正常排版，
// 只有真实浏览器量得出；可及名照读要走浏览器自己的可及名计算。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhVisuallyHidden } from '../../src'
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

async function mount(render: () => ReturnType<typeof h>): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.padding = '32px'
  document.body.prepend(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>('[data-scope="visually-hidden"][data-part="root"]')!
}

describe('visually-hidden（Chromium）', () => {
  it('缺省：盒子缩成 1×1 并被裁掉，藏起来的文字照样成为按钮的可及名', async () => {
    const root = await mount(() => h('button', { type: 'button' }, [
      h('svg', { 'viewBox': '0 0 24 24', 'width': 16, 'height': 16, 'aria-hidden': 'true' }),
      h(XhVisuallyHidden, null, () => '删除'),
    ]))

    const rect = root.getBoundingClientRect()
    expect(rect.width).toBeCloseTo(1, 1)
    expect(rect.height).toBeCloseTo(1, 1)
    const style = getComputedStyle(root)
    expect(style.position).toBe('absolute')
    expect(style.clipPath).toBe('inset(50%)')
    expect(style.whiteSpace).toBe('nowrap')
    // 读屏照读：内容不被 aria-hidden / display: none 摘出无障碍树
    expect(style.display).not.toBe('none')
    expect(page.getByRole('button', { name: '删除' }).element()).toBe(root.closest('button'))
  })

  it('focusable：里面的链接获得焦点即显出成正常大小，焦点离开再藏回去', async () => {
    const root = await mount(() => h('div', null, [
      h(XhVisuallyHidden, { focusable: true }, () => h('a', { href: '#visually-hidden-main' }, '跳到正文')),
      h('button', { type: 'button' }, '下一项'),
      h('p', { id: 'visually-hidden-main' }, '正文'),
    ]))
    const link = root.querySelector('a')!

    expect(root.getBoundingClientRect().width).toBeCloseTo(1, 1)
    expect(getComputedStyle(root).clipPath).toBe('inset(50%)')

    // 藏着的时候照样在焦点序里：Tab 一下就落到它
    await userEvent.tab()
    expect(document.activeElement).toBe(link)

    const style = getComputedStyle(root)
    expect(style.position).toBe('static')
    expect(style.clipPath).toBe('none')
    const shown = link.getBoundingClientRect()
    expect(shown.width).toBeGreaterThan(16)
    expect(shown.height).toBeGreaterThan(8)
    // 回到正常排版：根不再是 1×1，与里面的链接一样宽
    expect(root.getBoundingClientRect().width).toBeCloseTo(shown.width, 0)

    await userEvent.tab()
    expect(document.activeElement?.textContent).toBe('下一项')
    expect(root.getBoundingClientRect().width).toBeCloseTo(1, 1)
    expect(getComputedStyle(root).clipPath).toBe('inset(50%)')
  })
})
