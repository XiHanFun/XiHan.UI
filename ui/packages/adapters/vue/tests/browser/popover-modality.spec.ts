import type { App, Ref } from 'vue'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhPopoverContent, XhPopoverPositioner, XhPopoverRoot, XhPopoverTitle, XhPopoverTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let style: HTMLStyleElement | null = null

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function finiteAnimations(node: HTMLElement): Animation[] {
  return node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
}

function content(): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='popover'][data-part='content']`)!
}

function positioner(): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='popover'][data-part='positioner']`)!
}

function mount(open: Ref<boolean>, modal: Ref<boolean>): { outside: HTMLButtonElement, clicks: () => number } {
  let clickCount = 0
  const outside = document.createElement('button')
  outside.textContent = '页面按钮'
  outside.addEventListener('click', () => clickCount++)
  const host = document.createElement('div')
  document.body.append(outside, host)
  app = createApp({
    render: () => h(XhPopoverRoot, { open: open.value, modal: modal.value }, () => [
      h(XhPopoverTrigger, null, () => '打开'),
      h(XhPopoverPositioner, null, () => h(XhPopoverContent, null, () => [
        h(XhPopoverTitle, null, () => '设置'),
        h('button', '保存'),
      ])),
    ]),
  })
  app.mount(host)
  return { outside, clicks: () => clickCount }
}

afterEach(() => {
  app?.unmount()
  app = null
  style?.remove()
  style = null
  document.body.innerHTML = ''
})

describe('popover 模态资源', () => {
  it('非模态允许离开，展开中切换 modal 后锁页、失活背景并保留后开的 portal 层', async () => {
    const open = ref(true)
    const modal = ref(false)
    const f = mount(open, modal)
    await settle()

    await userEvent.click(f.outside)
    expect(f.clicks()).toBe(1)
    f.outside.focus()
    expect(document.activeElement).toBe(f.outside)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(false)
    const nonModalLayer = Number(getComputedStyle(positioner()).zIndex)
    expect(Number.isFinite(nonModalLayer)).toBe(true)
    expect(positioner().style.getPropertyValue('--xh-_layer')).toContain('+ 2)')

    modal.value = true
    await settle()
    expect(f.outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(true)
    expect(Number(getComputedStyle(positioner()).zIndex)).toBe(nonModalLayer + 1)
    expect(positioner().style.getPropertyValue('--xh-_layer')).toContain('+ 3)')
    positioner().style.setProperty('--xh-popover-layer', '7777')
    expect(getComputedStyle(positioner()).zIndex).toBe('7777')
    positioner().style.removeProperty('--xh-popover-layer')
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
      surfaces: () => [],
    })
    expect(nested.inert).toBe(false)
    registration.dispose()
    nested.remove()

    modal.value = false
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
    const open = ref(true)
    const modal = ref(true)
    const f = mount(open, modal)
    await settle()

    open.value = false
    await settle()
    const closing = content()
    expect(closing.inert).toBe(true)
    expect(closing.getAttribute('aria-hidden')).toBe('true')
    expect(f.outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    const firstExit = finiteAnimations(closing)
    expect(firstExit).toHaveLength(1)

    open.value = true
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    expect(content().inert).toBe(false)

    open.value = false
    await settle()
    for (const animation of finiteAnimations(content())) animation.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(f.outside.inert).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')

    open.value = true
    await settle()
    open.value = false
    await settle()
    app!.unmount()
    app = null
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(f.outside.inert).toBe(false)
  })
})
