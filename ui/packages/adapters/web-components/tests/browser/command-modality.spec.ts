import type { XhCommandElement } from '../../src/elements/command'
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
  return document.querySelector(`[data-scope='command'][data-part='${name}']`)!
}

function mount(): { command: XhCommandElement, outside: HTMLButtonElement } {
  const outside = outsideButton()
  const host = document.createElement('div')
  host.innerHTML = `
    <xh-command open modal="false">
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <input data-xh-part="input" />
          <div data-xh-part="list"></div>
        </div>
      </div>
    </xh-command>
  `
  document.body.append(host)
  return { command: host.firstElementChild as XhCommandElement, outside }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('command 模态与非模态表面', () => {
  it('非模态隐藏作者遮罩且页面可交互，展开中切换 modal 同步全部约束', async () => {
    const { command, outside } = mount()
    await settle()

    expect(part('backdrop').style.display).toBe('none')
    expect(getComputedStyle(part('positioner')).pointerEvents).toBe('none')
    expect(getComputedStyle(part('content')).pointerEvents).toBe('auto')
    expect(hit(outside)).toBe(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(false)

    command.modal = true
    await settle()
    expect(part('backdrop').style.display).not.toBe('none')
    expect(outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(true)
    outside.focus()
    expect(document.activeElement).not.toBe(outside)

    command.modal = false
    await settle()
    expect(part('backdrop').style.display).toBe('none')
    expect(outside.inert).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(hit(outside)).toBe(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)
  })
})
