// 图片的大图预览：点击或 Enter / Space 打开一台图片预览，Esc 收起后焦点回到图片；键盘聚焦时环画在图片之上。
// 真实焦点、焦点归还与伪元素的计算样式只有真实浏览器给得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhImageFallback, XhImageImage, XhImagePlaceholder, XhImageRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function svg(fill: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="${fill}"/></svg>`)}`
}

const THUMB = svg('#58a')
const FULL = svg('#a85')

async function mount(props: Record<string, unknown> = {}): Promise<HTMLElement> {
  await page.viewport(900, 700)
  host = document.createElement('div')
  document.body.prepend(host)
  app = createApp({
    render: () => h(XhImageRoot, { src: THUMB, alt: '山谷', preview: true, style: 'inline-size: 160px; --xh-image-ratio: 4 / 3;', ...props }, () => [
      h(XhImageImage),
      h(XhImagePlaceholder),
      h(XhImageFallback, null, () => '加载中'),
    ]),
  })
  app.mount(host)
  await nextTick()
  const root = host.querySelector<HTMLElement>('[data-scope="image"][data-part="root"]')!
  await expect.poll(() => root.getAttribute('data-state')).toBe('loaded')
  return root
}

function viewer(part: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="image-viewer"][data-part="${part}"]`)
}

async function expectOpen(): Promise<void> {
  await expect.poll(() => viewer('content')?.getAttribute('data-state') ?? null).toBe('open')
  expect(viewer('content')!.getAttribute('role')).toBe('dialog')
  await expect.poll(() => viewer('content')!.contains(document.activeElement)).toBe(true)
}

async function expectClosedWithFocusOn(root: HTMLElement): Promise<void> {
  await expect.poll(() => viewer('content')?.getAttribute('data-state') ?? 'closed').toBe('closed')
  await expect.poll(() => document.activeElement).toBe(root)
}

describe('图片大图预览', () => {
  it('开了预览：图片是一颗打开对话框的按钮，名字取自 alt', async () => {
    const root = await mount()
    expect(root.getAttribute('role')).toBe('button')
    expect(root.tabIndex).toBe(0)
    expect(root.getAttribute('aria-haspopup')).toBe('dialog')
    expect(root.hasAttribute('data-interactive')).toBe(true)
    expect(getComputedStyle(root).cursor).toBe('zoom-in')
    // 还没打开时页面上没有预览层的内容
    expect(viewer('content')).toBeNull()
  })

  it('点击打开预览，看的是同一张图；Esc 收起，焦点回到图片', async () => {
    const root = await mount()
    await userEvent.click(root)
    await expectOpen()
    expect(viewer('image')!.getAttribute('src')).toBe(THUMB)
    expect(viewer('image')!.getAttribute('alt')).toBe('山谷')
    // 工具条放齐缩放、旋转、翻转与归零，外加关闭钮
    expect([...viewer('toolbar')!.querySelectorAll('[data-part]')].map(el => el.getAttribute('data-part'))).toEqual([
      'zoom-out-trigger',
      'zoom-in-trigger',
      'rotate-left-trigger',
      'rotate-right-trigger',
      'flip-horizontal-trigger',
      'flip-vertical-trigger',
      'reset-trigger',
    ])
    expect(viewer('close-trigger')).not.toBeNull()

    await userEvent.keyboard('{Escape}')
    await expectClosedWithFocusOn(root)
  })

  it('聚焦后 Enter 与 Space 都能打开；关闭钮收起后焦点同样回到图片', async () => {
    const root = await mount()
    root.focus()
    await userEvent.keyboard('{Enter}')
    await expectOpen()
    await userEvent.click(viewer('close-trigger')!)
    await expectClosedWithFocusOn(root)

    await userEvent.keyboard(' ')
    await expectOpen()
    // 预览层里的按键不冒回图片：在关闭钮上按 Enter 是关，不是再打开一次
    viewer('close-trigger')!.focus()
    await userEvent.keyboard('{Enter}')
    await expectClosedWithFocusOn(root)
  })

  it('preview.src 给预览层另一张图：缩略图仍是小图', async () => {
    const root = await mount({ preview: { src: FULL } })
    await userEvent.click(root)
    await expectOpen()
    expect(viewer('image')!.getAttribute('src')).toBe(FULL)
    expect(root.querySelector('[data-scope="image"][data-part="image"]')!.getAttribute('src')).toBe(THUMB)
    await userEvent.keyboard('{Escape}')
    await expectClosedWithFocusOn(root)
  })

  it('键盘聚焦时环画在图片之上：图片与占位层盖不住它，环内侧衬一道底色间隔线', async () => {
    const root = await mount()
    const before = document.createElement('button')
    before.textContent = '前面'
    host!.before(before)
    before.focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(root)
    const ring = getComputedStyle(root, '::after')
    expect(ring.position).toBe('absolute')
    expect(ring.pointerEvents).toBe('none')
    expect(ring.outlineStyle).toBe('solid')
    expect(ring.outlineWidth).toBe('2px')
    expect(ring.outlineOffset).toBe('-2px')
    expect(ring.boxShadow).toContain('inset')
    before.remove()
  })

  it('没开预览：图片不可聚焦、不是按钮，点了也不出预览层', async () => {
    const root = await mount({ preview: false })
    expect(root.hasAttribute('role')).toBe(false)
    expect(root.hasAttribute('tabindex')).toBe(false)
    await userEvent.click(root)
    await nextTick()
    expect(viewer('content')).toBeNull()
  })
})
