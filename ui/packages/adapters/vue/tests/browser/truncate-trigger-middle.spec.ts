// Truncate 的展开按钮与中间省略：按钮排在文字盒子之外、Tab 只停在按钮上、真键盘激活铺开；
// 中间省略由两个伪元素各画一半，原文照旧排着量溢出、读屏读原文。几何、焦点与伪元素样式只有真实浏览器给得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h } from 'vue'
import { XhTruncate } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const TEXT = 'quarterly-report-final-version-2026-09-28-reviewed.pdf'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

function mount(props: Record<string, unknown>, width = '12rem'): void {
  host = document.createElement('div')
  host.style.inlineSize = width
  document.body.append(host)
  app = createApp({ render: () => h(XhTruncate, props, () => TEXT) })
  app.mount(host)
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="truncate"][data-part="${name}"]`)!
}

async function overflowing(): Promise<HTMLElement> {
  const root = part('root')
  await vi.waitFor(() => expect(root.hasAttribute('data-overflowing')).toBe(true))
  return root
}

describe('truncate 展开按钮（Chromium）', () => {
  it('按钮排在文字盒子之后、不被裁；Tab 越过文字盒子停在按钮上，Enter 铺开、Space 收回', async () => {
    mount({ expandable: true })
    const root = await overflowing()
    const trigger = part('trigger')
    // 按钮在文字盒子外面，文字盒子的裁剪够不着它
    expect(root.contains(trigger)).toBe(false)
    expect(trigger.getBoundingClientRect().top).toBeGreaterThanOrEqual(root.getBoundingClientRect().bottom - 1)
    expect(trigger.getBoundingClientRect().height).toBeGreaterThan(0)

    const before = document.createElement('button')
    before.textContent = '之前'
    host!.prepend(before)
    before.focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(trigger)

    await userEvent.keyboard('{Enter}')
    await vi.waitFor(() => expect(root.getAttribute('data-state')).toBe('open'))
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    // 铺开后裁剪撤掉，整段文字折行显示
    expect(getComputedStyle(root).whiteSpace).toBe('normal')

    await userEvent.keyboard(' ')
    await vi.waitFor(() => expect(root.getAttribute('data-state')).toBe('closed'))
  })
})

describe('truncate 中间省略（Chromium）', () => {
  it('被裁时两个伪元素各占一半：前一半末尾收省略号，后一半反向排露出结尾；原文不上色但照旧排着', async () => {
    mount({ position: 'middle' })
    const root = await overflowing()
    await vi.waitFor(() => expect(root.getAttribute('data-middle-text')).toBe(TEXT))
    const width = root.getBoundingClientRect().width
    const head = getComputedStyle(root, '::before')
    const tail = getComputedStyle(root, '::after')
    expect(head.content).toContain(TEXT)
    expect(tail.content).toContain(TEXT)
    expect(Number.parseFloat(head.width)).toBeCloseTo(width / 2, 0)
    expect(Number.parseFloat(tail.width)).toBeCloseTo(width / 2, 0)
    expect(head.textOverflow).toBe('ellipsis')
    expect(tail.direction).toBe('rtl')
    // 原文只是不上色：溢出照它量，量出来仍是被裁
    expect(getComputedStyle(root).webkitTextFillColor).toBe('rgba(0, 0, 0, 0)')
    expect(root.scrollWidth).toBeGreaterThan(root.clientWidth)
    // 伪元素描出来的字与正文同色
    expect(head.webkitTextFillColor).toBe(getComputedStyle(root).color)
  })

  it('装得下时不拼两段：原文照常显示', async () => {
    mount({ position: 'middle' }, '60rem')
    const root = part('root')
    await vi.waitFor(() => expect(root.hasAttribute('data-lines')).toBe(true))
    await vi.waitFor(() => expect(root.hasAttribute('data-overflowing')).toBe(false))
    expect(root.hasAttribute('data-middle-text')).toBe(false)
    expect(getComputedStyle(root, '::before').content).toBe('none')
    expect(getComputedStyle(root).webkitTextFillColor).toBe(getComputedStyle(root).color)
  })
})
