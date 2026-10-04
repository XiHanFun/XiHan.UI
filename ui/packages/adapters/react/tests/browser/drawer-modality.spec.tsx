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
  // 模态浮层的背景失活与关闭交接都排在「下一帧上屏之后」（两层 rAF），等两帧才落定
  await new Promise(resolve => requestAnimationFrame(resolve))
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
    // 背景失活等浮层第一帧上屏之后才施加
    await expect.poll(() => outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(true)
    // 失活前焦点就停在这颗按钮上；浏览器要到下一次渲染才把焦点从变 inert 的节点上收走，先松手再验证取不回焦点
    outside.blur()
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
