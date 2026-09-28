// 菜单条目的两种次级文字——第 2 行的说明与行尾的快捷键——同档同色：同一行里不许出现两种次级字号，
// 也要与 Select 等列表的说明同档（控件次级字号，不取 caption 令牌）。计算样式只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuItemDescription,
  XhMenuItemShortcut,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('menu 次级文字', () => {
  it('说明与快捷键同一档字号，取控件次级字号', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhMenuRoot, null, () => [
        h(XhMenuTrigger, null, () => '打开'),
        h(XhMenuPositioner, null, () => h(XhMenuContent, null, () => [
          h(XhMenuItem, { value: 'copy' }, () => [
            h(XhMenuItemText, null, () => '复制'),
            h(XhMenuItemDescription, null, () => '复制选中的内容'),
            h(XhMenuItemShortcut, null, () => '⌘C'),
          ]),
        ])),
      ]),
    })
    app.mount(host)
    await nextTick()
    await userEvent.click(document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)!)
    await nextTick()
    const description = document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='item-description']`)!
    const shortcut = document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='item-shortcut']`)!
    const probe = document.createElement('span')
    probe.style.fontSize = 'var(--xh-control-caption-md)'
    description.append(probe)
    const expected = getComputedStyle(probe).fontSize
    probe.remove()
    expect(getComputedStyle(description).fontSize).toBe(expected)
    expect(getComputedStyle(shortcut).fontSize).toBe(expected)
  })
})
