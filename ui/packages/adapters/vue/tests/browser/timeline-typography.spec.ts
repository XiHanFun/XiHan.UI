// 验证 Timeline 条目文字与圆点 / 连线在真实浏览器里的排版档与形状（真源 §6.3 / §6.4）。

import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhTimelineConnector,
  XhTimelineContent,
  XhTimelineDescription,
  XhTimelineIndicator,
  XhTimelineItem,
  XhTimelineRoot,
  XhTimelineTime,
  XhTimelineTitle,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(render: () => VNode): HTMLElement {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
  return host
}

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function renderTimeline(): VNode {
  return h(XhTimelineRoot, null, () => [
    h(XhTimelineItem, null, () => [
      h(XhTimelineIndicator),
      h(XhTimelineConnector),
      h(XhTimelineContent, null, () => [
        h(XhTimelineTitle, null, () => '发布 1.2.0'),
        h(XhTimelineDescription, null, () => '修复浮层定位在 RTL 下的偏移'),
        h(XhTimelineTime, { datetime: '2026-09-17T10:00' }, () => '10:00'),
      ]),
    ]),
    h(XhTimelineItem, null, () => [
      h(XhTimelineIndicator),
      h(XhTimelineContent, null, () => [
        h(XhTimelineTitle, null, () => '开始灰度'),
      ]),
    ]),
  ])
}

describe('timeline 排版与形状', () => {
  it('说明走说明档 13px / fg-muted / 正文行高，时间走次级标注档 12px', () => {
    const root = mount(renderTimeline)
    const description = root.querySelector<HTMLElement>('[data-scope="timeline"][data-part="description"]')!
    const time = root.querySelector<HTMLElement>('[data-scope="timeline"][data-part="time"]')!
    const style = getComputedStyle(description)

    expect(Number.parseFloat(style.fontSize)).toBe(13)
    expect(style.color).toBe(tokenColor('--xh-fg-muted'))
    expect(Number.parseFloat(style.lineHeight)).toBeCloseTo(13 * 1.5, 1)
    expect(Number.parseFloat(getComputedStyle(time).fontSize)).toBe(12)
  })

  it('圆点是等宽高的圆，连线是胶囊', () => {
    const root = mount(renderTimeline)
    const indicator = root.querySelector<HTMLElement>('[data-scope="timeline"][data-part="indicator"]')!
    const connector = root.querySelector<HTMLElement>('[data-scope="timeline"][data-part="connector"]')!
    const box = indicator.getBoundingClientRect()

    expect(box.width).toBeGreaterThan(0)
    expect(box.width).toBe(box.height)
    expect(getComputedStyle(indicator).borderTopLeftRadius).toBe('50%')
    expect(getComputedStyle(connector).borderTopLeftRadius).toBe('9999px')
  })
})
