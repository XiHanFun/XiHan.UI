import type { App, Ref } from 'vue'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhCommandContent, XhCommandInput, XhCommandList, XhCommandRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

async function settle(): Promise<void> {
  await nextTick()
  // 模态浮层的背景失活与关闭交接都排在「下一帧上屏之后」（两层 rAF），等两帧才落定
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function outsideButton(): HTMLButtonElement {
  const button = document.createElement('button')
  button.textContent = '页面按钮'
  button.style.cssText = 'position:fixed;inset:8px auto auto 8px;inline-size:120px;block-size:40px;z-index:1'
  document.body.append(button)
  return button
}

/**
 * 命中测页面按钮的上沿一带：面板进场从上方落下，途中会短暂盖到终点上方那一小段（按钮下半截），
 * 这里量的是模态约束，不是进场几何。
 */
function hit(node: HTMLElement): Element | null {
  const rect = node.getBoundingClientRect()
  return document.elementFromPoint(rect.left + rect.width / 2, rect.top + 4)
}

function backdrop(): HTMLElement | null {
  return document.querySelector(`[data-scope='command'][data-part='backdrop']`)
}

function positioner(): HTMLElement {
  return document.querySelector(`[data-scope='command'][data-part='positioner']`)!
}

function content(): HTMLElement {
  return document.querySelector(`[data-scope='command'][data-part='content']`)!
}

function mount(modal: Ref<boolean>): HTMLButtonElement {
  const outside = outsideButton()
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCommandRoot, { open: true, modal: modal.value }, () =>
      h(XhCommandContent, null, () => [h(XhCommandInput), h(XhCommandList)])),
  })
  app.mount(host)
  return outside
}

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

describe('command 模态与非模态表面', () => {
  it('非模态不创建遮罩且页面可交互，展开中切换 modal 同步全部约束', async () => {
    const modal = ref(false)
    const outside = mount(modal)
    await settle()

    expect(backdrop()).toBeNull()
    expect(getComputedStyle(positioner()).pointerEvents).toBe('none')
    expect(getComputedStyle(content()).pointerEvents).toBe('auto')
    expect(hit(outside)).toBe(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(false)

    modal.value = true
    await settle()
    expect(backdrop()).not.toBeNull()
    await expect.poll(() => outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(true)
    outside.focus()
    expect(document.activeElement).not.toBe(outside)

    modal.value = false
    await settle()
    expect(backdrop()).toBeNull()
    expect(outside.inert).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(hit(outside)).toBe(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)
  })
})
