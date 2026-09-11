import type { Root } from 'react-dom/client'
import { getLayerRegistry } from '@xihan-ui/core'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhPopoverContent, XhPopoverPositioner, XhPopoverRoot, XhPopoverTitle, XhPopoverTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null
let style: HTMLStyleElement | null = null
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

async function inAct(task: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(task)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

async function settle(): Promise<void> {
  for (let count = 0; count < 3; count++)
    await inAct(async () => Promise.resolve())
  await new Promise(resolve => requestAnimationFrame(resolve))
}

function finiteAnimations(node: HTMLElement): Animation[] {
  return node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
}

function content(): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='popover'][data-part='content']`)!
}

async function render(open: boolean, modal: boolean): Promise<void> {
  await inAct(() => {
    root!.render(
      <XhPopoverRoot open={open} modal={modal}>
        <XhPopoverTrigger>打开</XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverTitle>设置</XhPopoverTitle>
            <button type="button">保存</button>
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>,
    )
  })
  await settle()
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  style?.remove()
  style = null
  document.body.innerHTML = ''
})

describe('popover 模态资源', () => {
  it('非模态允许离开，展开中切换 modal 后锁页、失活背景并保留后开的 portal 层', async () => {
    let clickCount = 0
    const outside = document.createElement('button')
    outside.textContent = '页面按钮'
    outside.addEventListener('click', () => clickCount++)
    const host = document.createElement('div')
    document.body.append(outside, host)
    root = createRoot(host)
    await render(true, false)

    await inAct(() => userEvent.click(outside))
    expect(clickCount).toBe(1)
    outside.focus()
    expect(document.activeElement).toBe(outside)
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(false)

    await render(true, true)
    expect(outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(true)
    outside.blur()
    outside.focus()
    expect(document.activeElement).not.toBe(outside)
    await inAct(() => userEvent.click(outside, { force: true }))
    expect(clickCount).toBe(1)

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

    await render(true, false)
    expect(outside.inert).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')
    outside.focus()
    expect(document.activeElement).toBe(outside)
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
    const outside = document.createElement('button')
    const host = document.createElement('div')
    document.body.append(outside, host)
    root = createRoot(host)
    await render(true, true)

    await render(false, true)
    const closing = content()
    expect(closing.inert).toBe(true)
    expect(closing.getAttribute('aria-hidden')).toBe('true')
    expect(outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    expect(finiteAnimations(closing)).toHaveLength(1)

    await render(true, true)
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    expect(content().inert).toBe(false)

    await render(false, true)
    await inAct(async () => {
      for (const animation of finiteAnimations(content())) animation.finish()
      await Promise.resolve()
    })
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(outside.inert).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')

    await render(true, true)
    await render(false, true)
    await inAct(() => root!.unmount())
    root = null
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(outside.inert).toBe(false)
  })
})
