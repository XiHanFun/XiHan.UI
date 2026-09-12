import type { XhDialogElement } from '../../src/elements/dialog'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await Promise.resolve()
}

function outsideButton(): HTMLButtonElement {
  const button = document.createElement('button')
  button.textContent = '页面按钮'
  button.style.cssText = 'position:fixed;inset:8px auto auto 8px;inline-size:120px;block-size:40px;z-index:1'
  document.body.append(button)
  return button
}

function hit(node: HTMLElement): Element | null {
  const rect = node.getBoundingClientRect()
  return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
}

function part(name: string): HTMLElement {
  return document.querySelector(`[data-scope='dialog'][data-part='${name}']`)!
}

function mount(): { dialog: XhDialogElement, outside: HTMLButtonElement } {
  const outside = outsideButton()
  const host = document.createElement('div')
  host.innerHTML = `
    <xh-dialog open modal="false">
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content"><h2 data-xh-part="title">设置</h2><button>保存</button></div>
      </div>
    </xh-dialog>
  `
  document.body.append(host)
  return { dialog: host.firstElementChild as XhDialogElement, outside }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('dialog 模态与非模态表面', () => {
  it('非模态隐藏作者遮罩且页面可交互，展开中切换 modal 同步全部约束', async () => {
    const { dialog, outside } = mount()
    await settle()

    expect(part('backdrop').style.display).toBe('none')
    expect(getComputedStyle(part('positioner')).pointerEvents).toBe('none')
    expect(getComputedStyle(part('content')).pointerEvents).toBe('auto')
    expect(hit(outside)).toBe(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(false)

    dialog.modal = true
    await settle()
    expect(part('backdrop').style.display).not.toBe('none')
    expect(outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(true)
    outside.focus()
    expect(document.activeElement).not.toBe(outside)

    dialog.modal = false
    await settle()
    expect(part('backdrop').style.display).toBe('none')
    expect(outside.inert).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(hit(outside)).toBe(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)
  })
})
