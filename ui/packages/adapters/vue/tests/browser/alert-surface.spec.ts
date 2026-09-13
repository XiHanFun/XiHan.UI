/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// Alert 的中性抬升表面、语气文字与尾端操作依赖真实计算样式和布局。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhAlertAction,
  XhAlertCloseTrigger,
  XhAlertContent,
  XhAlertDescription,
  XhAlertIndicator,
  XhAlertRoot,
  XhAlertTitle,
  XhButton,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='alert'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 alert/${name}`)
  return element
}

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '520px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhAlertRoot, { tone: 'success', closable: true }, () => [
      h(XhAlertIndicator, null, () => '✓'),
      h(XhAlertContent, null, () => [
        h(XhAlertTitle, null, () => '保存成功'),
        h(XhAlertDescription, null, () => '更改已经生效。'),
      ]),
      h(XhAlertAction, null, () => h(XhButton, { size: 'sm' }, () => '查看')),
      h(XhAlertCloseTrigger),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('警告提示的表面与信息层级', () => {
  it('使用中性抬升面，语气只强调标题与图标', async () => {
    await mount()
    const root = part('root')

    expect(getComputedStyle(root).backgroundColor).toBe(tokenColor('--xh-bg-surface'))
    expect(getComputedStyle(root).boxShadow).not.toBe('none')
    expect(getComputedStyle(part('title')).color).toBe(getComputedStyle(part('indicator')).color)
    expect(getComputedStyle(part('description')).color).toBe(tokenColor('--xh-fg-muted'))
  })

  it('文本留在必需内容列，操作与关闭入口排在尾端', async () => {
    await mount()
    const root = part('root').getBoundingClientRect()
    const content = part('content').getBoundingClientRect()
    const action = part('action').getBoundingClientRect()
    const close = part('close-trigger').getBoundingClientRect()

    expect(content.left).toBeLessThan(action.left)
    expect(action.right).toBeLessThanOrEqual(close.left)
    expect(close.right).toBeLessThanOrEqual(root.right)
    expect(part('content').childElementCount).toBe(2)
  })
})
