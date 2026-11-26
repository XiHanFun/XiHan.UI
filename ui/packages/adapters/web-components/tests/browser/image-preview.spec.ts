// <xh-image preview>：元素在 root 之后生成一台图片预览（遮罩、大图、工具条与关闭钮都不用作者写），
// 点击或 Enter / Space 打开，Esc 收起后焦点回到图片；预览层的 open-change 不冒出图片。真实焦点只有真实浏览器给得出。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

beforeEach(() => {
  setDiagnosticsLevel('silent')
})

afterEach(() => {
  host?.remove()
  host = null
  setDiagnosticsLevel('warn')
})

function svg(fill: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="${fill}"/></svg>`)}`
}

const THUMB = svg('#58a')
const FULL = svg('#a85')

async function mount(configure: (el: HTMLElement) => void = el => el.setAttribute('preview', '')): Promise<{ el: HTMLElement, root: HTMLElement }> {
  await page.viewport(900, 700)
  host = document.createElement('div')
  document.body.prepend(host)
  const el = document.createElement('xh-image')
  el.setAttribute('src', THUMB)
  el.setAttribute('alt', '山谷')
  configure(el)
  el.innerHTML = `<div data-xh-part="root" style="inline-size: 160px"><img data-xh-part="image"><div data-xh-part="fallback">加载中</div></div>`
  host.append(el)
  const root = el.querySelector<HTMLElement>('[data-xh-part="root"]')!
  await expect.poll(() => root.getAttribute('data-state')).toBe('loaded')
  return { el, root }
}

function viewer(part: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="image-viewer"][data-part="${part}"]`)
}

async function expectOpen(): Promise<void> {
  await expect.poll(() => viewer('content')?.getAttribute('data-state') ?? null).toBe('open')
  await expect.poll(() => viewer('content')!.contains(document.activeElement)).toBe(true)
}

async function expectClosedWithFocusOn(root: HTMLElement): Promise<void> {
  await expect.poll(() => viewer('content')?.getAttribute('data-state')).toBe('closed')
  await expect.poll(() => document.activeElement).toBe(root)
}

describe('xh-image 大图预览', () => {
  it('写上 preview：root 成为按钮，root 之后生成一台图片预览，工具条与关闭钮齐全', async () => {
    const { el, root } = await mount()
    expect(root.getAttribute('role')).toBe('button')
    expect(root.tabIndex).toBe(0)
    expect(root.getAttribute('aria-haspopup')).toBe('dialog')
    const generated = root.nextElementSibling
    expect(generated?.localName).toBe('xh-image-viewer')
    expect(generated?.parentElement).toBe(el)
    await expect.poll(() => viewer('toolbar') !== null).toBe(true)
    expect([...viewer('toolbar')!.querySelectorAll('[data-part]')].map(node => node.getAttribute('data-part'))).toEqual([
      'zoom-out-trigger',
      'zoom-in-trigger',
      'rotate-left-trigger',
      'rotate-right-trigger',
      'flip-horizontal-trigger',
      'flip-vertical-trigger',
      'reset-trigger',
    ])
    expect(viewer('close-trigger')).not.toBeNull()
  })

  it('点击打开，Esc 收起，焦点回到图片；预览层的 open-change 不冒出图片', async () => {
    const { el, root } = await mount()
    const heard: unknown[] = []
    el.addEventListener('open-change', event => heard.push((event as CustomEvent).detail))
    await userEvent.click(root)
    await expectOpen()
    expect(viewer('image')!.getAttribute('src')).toBe(THUMB)
    expect(viewer('image')!.getAttribute('alt')).toBe('山谷')
    await userEvent.keyboard('{Escape}')
    await expectClosedWithFocusOn(root)
    expect(heard).toEqual([])
  })

  it('聚焦后 Enter 与 Space 都能打开', async () => {
    const { root } = await mount()
    root.focus()
    await userEvent.keyboard('{Enter}')
    await expectOpen()
    await userEvent.click(viewer('close-trigger')!)
    await expectClosedWithFocusOn(root)
    await userEvent.keyboard(' ')
    await expectOpen()
    await userEvent.keyboard('{Escape}')
    await expectClosedWithFocusOn(root)
  })

  it('preview 经 property 赋对象：预览层看 preview.src 那一张', async () => {
    const { root } = await mount((el) => {
      ;(el as HTMLElement & { preview: unknown }).preview = { src: FULL }
    })
    await userEvent.click(root)
    await expectOpen()
    expect(viewer('image')!.getAttribute('src')).toBe(FULL)
  })

  it('撤掉 preview：预览层跟着撤走，root 不再是按钮', async () => {
    const { el, root } = await mount()
    expect(root.nextElementSibling?.localName).toBe('xh-image-viewer')
    el.removeAttribute('preview')
    await expect.poll(() => root.hasAttribute('role')).toBe(false)
    expect(el.querySelector('xh-image-viewer')).toBeNull()
    expect(root.hasAttribute('tabindex')).toBe(false)
  })
})
