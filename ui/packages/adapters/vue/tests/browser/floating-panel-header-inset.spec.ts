// 浮动面板头部与正文的起始线对齐：标题的左缘与正文文字的左缘在同一条竖线上。
// 同类面（Dialog、Drawer、Card）的头、正文、尾横向内衬都取同一支令牌，只有它的头部另取了一档。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFloatingPanelBody,
  XhFloatingPanelContent,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.documentElement.removeAttribute('data-density')
})

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope="floating-panel"][data-part="${name}"]`)
  if (!el)
    throw new Error(`找不到 ${name}`)
  return el
}

async function mountPanel(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhFloatingPanelRoot, {
      defaultOpen: true,
      defaultPosition: { x: 120, y: 80 },
      defaultDimensions: { width: 320, height: 240 },
    }, () => [
      h(XhFloatingPanelPositioner, null, () => [
        h(XhFloatingPanelContent, null, () => [
          h(XhFloatingPanelHeader, null, () => [h(XhFloatingPanelTitle, null, () => '调试面板')]),
          h(XhFloatingPanelBody, null, () => [h('span', { 'data-test': 'text' }, '正文')]),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await Promise.all(part('positioner').getAnimations().map(a => a.finished))
}

function expectAligned(): void {
  const title = part('title').getBoundingClientRect().left
  const text = document.querySelector<HTMLElement>('[data-test="text"]')!.getBoundingClientRect().left
  expect(title).toBeCloseTo(text, 0)
}

describe('浮动面板头部与正文的起始线', () => {
  it('舒适密度：标题与正文左缘对齐', async () => {
    await mountPanel()
    expectAligned()
  })

  it('紧凑密度：内衬一起收，仍然对齐', async () => {
    document.documentElement.setAttribute('data-density', 'compact')
    await mountPanel()
    expectAligned()
  })
})
