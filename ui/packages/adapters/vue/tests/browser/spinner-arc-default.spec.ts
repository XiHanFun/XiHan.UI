/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// Spinner 的默认渐隐弧与三档尺寸依赖真实伪元素样式。
import type { Size } from '@xihan-ui/core'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSpinner } from '../../src'
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

async function mount(size?: Size): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.color = 'rgb(120, 80, 200)'
  document.body.append(host)
  app = createApp({ render: () => h(XhSpinner, { label: '加载中', size }) })
  app.mount(host)
  await nextTick()
  return document.querySelector<HTMLElement>('[data-scope="spinner"][data-part="root"]')!
}

describe('加载指示器的默认渐隐弧', () => {
  it.each([
    { size: 'sm', edge: 16 },
    { size: undefined, edge: 24 },
    { size: 'lg', edge: 32 },
  ] as const)('$size 档直径为 $edge px', async ({ size, edge }) => {
    const root = await mount(size)
    const graphic = getComputedStyle(root, '::before')
    expect(root.dataset.variant).toBe('arc')
    expect(Number.parseFloat(graphic.width)).toBe(edge)
    expect(Number.parseFloat(graphic.height)).toBe(edge)
    expect(graphic.backgroundImage).toContain('conic-gradient')
    expect(graphic.backgroundImage).toContain('rgb(120, 80, 200)')
    expect(getComputedStyle(root).pointerEvents).toBe('none')
  })
})
