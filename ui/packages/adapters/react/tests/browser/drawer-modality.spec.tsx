import type { Root } from 'react-dom/client'
import { getLayerRegistry } from '@xihan-ui/core'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { XhDrawerContent, XhDrawerRoot, XhDrawerTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null

async function settle(): Promise<void> {
  for (let count = 0; count < 3; count++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
  await new Promise(resolve => requestAnimationFrame(resolve))
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

function backdrop(): HTMLElement | null {
  return document.querySelector(`[data-scope='drawer'][data-part='backdrop']`)
}

function positioner(): HTMLElement {
  return document.querySelector(`[data-scope='drawer'][data-part='positioner']`)!
}

function content(): HTMLElement {
  return document.querySelector(`[data-scope='drawer'][data-part='content']`)!
}

async function render(modal: boolean): Promise<void> {
  await act(async () => {
    root!.render(
      <XhDrawerRoot open modal={modal}>
        <XhDrawerContent>
          <XhDrawerTitle>设置</XhDrawerTitle>
          <button type="button">保存</button>
        </XhDrawerContent>
      </XhDrawerRoot>,
    )
  })
  await settle()
}

beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true))
afterEach(() => {
  act(() => root?.unmount())
  root = null
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('drawer 模态与非模态表面', () => {
  it('非模态不创建遮罩且页面可交互，展开中切换 modal 同步全部约束', async () => {
    const outside = outsideButton()
    const host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await render(false)

    expect(backdrop()).toBeNull()
    expect(getComputedStyle(positioner()).pointerEvents).toBe('none')
    expect(getComputedStyle(content()).pointerEvents).toBe('auto')
    expect(hit(outside)).toBe(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(false)

    await render(true)
    expect(backdrop()).not.toBeNull()
    expect(outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(true)
    outside.focus()
    expect(document.activeElement).not.toBe(outside)

    await render(false)
    expect(backdrop()).toBeNull()
    expect(outside.inert).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(hit(outside)).toBe(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)
  })
})
