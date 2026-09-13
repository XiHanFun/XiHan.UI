/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// Toast 的中性浮层、文本列与悬停关闭入口依赖真实布局和媒体查询。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhToastCloseTrigger,
  XhToastContent,
  XhToastDescription,
  XhToastIndicator,
  XhToastRoot,
  XhToastTitle,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhToastRoot, {
      type: 'success',
      title: '更改已保存',
      description: '内容已同步到云端',
      duration: 0,
    }, () => [
      h(XhToastIndicator),
      h(XhToastContent, () => [h(XhToastTitle), h(XhToastDescription)]),
      h(XhToastCloseTrigger),
    ]),
  })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>('[data-scope="toast"][data-part="root"]')!
}

function resolvedColor(root: HTMLElement, property: 'background' | 'color', value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  root.append(probe)
  const resolved = getComputedStyle(probe)[property === 'background' ? 'backgroundColor' : 'color']
  probe.remove()
  return resolved
}

function resolvedWidth(root: HTMLElement, value: string): number {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;inline-size:${value}`
  root.append(probe)
  const resolved = probe.getBoundingClientRect().width
  probe.remove()
  return resolved
}

describe('轻提示的 Hero 风格中性浮层', () => {
  it('使用 384px 中性浮层，语气只落在标题和指示符', async () => {
    const root = await mount()
    const rootStyle = getComputedStyle(root)
    const title = root.querySelector<HTMLElement>('[data-part="title"]')!
    const description = root.querySelector<HTMLElement>('[data-part="description"]')!
    const indicator = root.querySelector<HTMLElement>('[data-part="indicator"]')!

    expect(root.getBoundingClientRect().width).toBe(resolvedWidth(root, 'var(--xh-overlay-max-w-lg)'))
    expect(rootStyle.paddingBlock).toBe('12px')
    expect(rootStyle.paddingInline).toBe('16px')
    expect(rootStyle.borderRadius).toBe('24px')
    expect(rootStyle.backgroundColor).toBe(resolvedColor(root, 'background', 'var(--xh-bg-surface)'))
    expect(getComputedStyle(title).color).toBe(resolvedColor(root, 'color', 'var(--xh-_tone-fg)'))
    expect(getComputedStyle(description).color).toBe(resolvedColor(root, 'color', 'var(--xh-fg-muted)'))
    expect(indicator.getBoundingClientRect().width).toBe(resolvedWidth(
      root,
      'calc(var(--xh-glyph-size-sm) + var(--xh-space-1) + var(--xh-space-1))',
    ))
  })

  it('有悬停能力时关闭入口静默，键盘焦点进入后显现', async () => {
    const root = await mount()
    const close = root.querySelector<HTMLButtonElement>('[data-part="close-trigger"]')!

    if (matchMedia('(hover: hover)').matches)
      expect(getComputedStyle(close).opacity).toBe('0')

    close.focus()
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(getComputedStyle(close).opacity).toBe('1')
    expect(close.getBoundingClientRect().width).toBe(resolvedWidth(root, 'var(--xh-control-action-size)'))
  })
})
