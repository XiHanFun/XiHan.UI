import type { XhPopoverElement } from '../../src/elements/popover'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let style: HTMLStyleElement | null = null

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await Promise.resolve()
}

function finiteAnimations(node: HTMLElement): Animation[] {
  return node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
}

function content(): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='popover'][data-part='content']`)!
}

function mount(modal: boolean): { element: XhPopoverElement, outside: HTMLButtonElement, clicks: () => number } {
  let clickCount = 0
  const outside = document.createElement('button')
  outside.textContent = '页面按钮'
  outside.addEventListener('click', () => clickCount++)
  const host = document.createElement('div')
  host.innerHTML = `
    <xh-popover open modal="${modal}">
      <button data-xh-part="trigger">打开</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content"><h2 data-xh-part="title">设置</h2><button>保存</button></div>
      </div>
    </xh-popover>
  `
  document.body.append(outside, host)
  return { element: host.firstElementChild as XhPopoverElement, outside, clicks: () => clickCount }
}

afterEach(() => {
  style?.remove()
  style = null
  document.body.innerHTML = ''
})

describe('popover 模态资源', () => {
  it('非模态允许离开，展开中切换 modal 后锁页、失活背景并保留后开的 portal 层', async () => {
    const f = mount(false)
    await settle()

    await userEvent.click(f.outside)
    expect(f.clicks()).toBe(1)
    f.outside.focus()
    expect(document.activeElement).toBe(f.outside)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(false)

    f.element.modal = true
    await settle()
    expect(f.outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(true)
    f.outside.blur()
    f.outside.focus()
    expect(document.activeElement).not.toBe(f.outside)
    await userEvent.click(f.outside, { force: true })
    expect(f.clicks()).toBe(1)

    const nested = document.createElement('button')
    document.body.append(nested)
    const registration = getLayerRegistry(document).register({
      kind: 'popover',
      node: () => nested,
      branches: () => [],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
    expect(nested.inert).toBe(false)
    registration.dispose()
    nested.remove()

    f.element.modal = false
    await settle()
    expect(f.outside.inert).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')
    f.outside.focus()
    expect(document.activeElement).toBe(f.outside)
  })

  it('关闭期间保留模态资源至真实 CSS 退出，重开与卸载均不泄漏', async () => {
    style = document.createElement('style')
    style.textContent = `
      @keyframes popover-long-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='popover'][data-part='content'][data-state='closed'] {
        animation: popover-long-exit 60s linear forwards;
      }
    `
    document.head.append(style)
    const f = mount(true)
    await settle()

    f.element.open = false
    await settle()
    const closing = content()
    expect(closing.inert).toBe(true)
    expect(closing.getAttribute('aria-hidden')).toBe('true')
    expect(f.outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    expect(finiteAnimations(closing)).toHaveLength(1)

    f.element.open = true
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    expect(content().inert).toBe(false)

    f.element.open = false
    await settle()
    for (const animation of finiteAnimations(content())) animation.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(f.outside.inert).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')

    f.element.open = true
    await settle()
    f.element.open = false
    await settle()
    f.element.remove()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(f.outside.inert).toBe(false)
  })
})
