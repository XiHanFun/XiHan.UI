// 图片的大图预览：点击或 Enter / Space 打开一台图片预览，收起后焦点回到图片。
// React 的合成事件会顺着组件树从 Portal 冒回来：预览层里的点击与按键不能再打开一次。真实焦点只有真实浏览器给得出。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { XhImageFallback, XhImageImage, XhImageRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import './hidden-important-host'

let root: Root | null = null
let host: HTMLElement | null = null
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
})

function svg(fill: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="${fill}"/></svg>`)}`
}

const THUMB = svg('#58a')
const FULL = svg('#a85')

async function mount(preview: boolean | { src: string } = true): Promise<HTMLElement> {
  await page.viewport(900, 700)
  host = document.createElement('div')
  document.body.prepend(host)
  root = createRoot(host)
  await inAct(() => root!.render(
    <XhImageRoot src={THUMB} alt="山谷" preview={preview} style={{ inlineSize: '160px' }}>
      <XhImageImage />
      <XhImageFallback>加载中</XhImageFallback>
    </XhImageRoot>,
  ))
  const image = host.querySelector<HTMLElement>('[data-scope="image"][data-part="root"]')!
  await expect.poll(() => image.getAttribute('data-state')).toBe('loaded')
  return image
}

function viewer(part: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="image-viewer"][data-part="${part}"]`)
}

async function expectOpen(): Promise<void> {
  await expect.poll(() => viewer('content')?.getAttribute('data-state') ?? null).toBe('open')
  await expect.poll(() => viewer('content')!.contains(document.activeElement)).toBe(true)
}

async function expectClosedWithFocusOn(image: HTMLElement): Promise<void> {
  await expect.poll(() => viewer('content')?.getAttribute('data-state') ?? 'closed').toBe('closed')
  await expect.poll(() => document.activeElement).toBe(image)
}

describe('xhImageRoot 大图预览', () => {
  it('点击打开预览，Esc 收起，焦点回到图片', async () => {
    const image = await mount()
    expect(image.getAttribute('role')).toBe('button')
    expect(image.tabIndex).toBe(0)
    expect(image.getAttribute('aria-haspopup')).toBe('dialog')
    await userEvent.click(image)
    await expectOpen()
    expect(viewer('image')!.getAttribute('src')).toBe(THUMB)
    expect(viewer('image')!.getAttribute('alt')).toBe('山谷')
    // 预览层不在图片这颗按钮里面
    expect(image.contains(viewer('content'))).toBe(false)
    await userEvent.keyboard('{Escape}')
    await expectClosedWithFocusOn(image)
  })

  it('预览层里的点击与按键不冒回图片：关闭钮一点就收、不会又被打开', async () => {
    const image = await mount()
    image.focus()
    await userEvent.keyboard('{Enter}')
    await expectOpen()
    await userEvent.click(viewer('close-trigger')!)
    await expectClosedWithFocusOn(image)

    await userEvent.keyboard(' ')
    await expectOpen()
    viewer('close-trigger')!.focus()
    await userEvent.keyboard('{Enter}')
    await expectClosedWithFocusOn(image)
    // 工具条的按钮照常响应：Enter 不被图片拦下
    await userEvent.keyboard('{Enter}')
    await expectOpen()
    viewer('zoom-in-trigger')!.focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => viewer('image')!.style.scale).not.toBe('1')
    expect(viewer('content')!.getAttribute('data-state')).toBe('open')
  })

  it('preview.src 给预览层另一张图', async () => {
    const image = await mount({ src: FULL })
    await userEvent.click(image)
    await expectOpen()
    expect(viewer('image')!.getAttribute('src')).toBe(FULL)
  })
})
