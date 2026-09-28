// 导航菜单的面板是面板型浮层：按内容的自然宽度排开，不被它挂着的那一项（一个窄 li）压窄，
// 超过浮层最大宽时才折行。面板绝对定位在入口那一项里，收缩适配的可用宽就是那一项的宽，
// 不另给宽度的话面板只剩最小宽，一行放得下的链接文字也会折成两行。只有真实布局量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhNavigationMenuLink, XhNavigationMenuRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

const LINKS = ['多端适配器：Vue、React 与 Web Components', '无头内核']

async function mountOpen(links: readonly string[]): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '720px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhNavigationMenuRoot, { collection: [{ value: 'products', label: '产品' }], defaultValue: 'products' }, {
      panel: () => links.map(text => h(XhNavigationMenuLink, { key: text, href: `#${text}` }, () => text)),
    }),
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  const content = host.querySelector<HTMLElement>(`[data-scope='navigation-menu'][data-part='content']`)
  if (!content)
    throw new Error('面板没有渲染')
  return content
}

function px(token: string, on: HTMLElement): number {
  const probe = document.createElement('div')
  probe.style.inlineSize = `var(${token})`
  on.append(probe)
  const width = probe.getBoundingClientRect().width
  probe.remove()
  return width
}

describe('导航菜单面板按自然宽度排开', () => {
  it('一行放得下的链接文字不折行，面板比入口那一项宽', async () => {
    const content = await mountOpen(LINKS)
    const link = content.querySelector<HTMLElement>(`[data-part='link']`)!
    const lineHeight = Number.parseFloat(getComputedStyle(link).lineHeight)
    const range = document.createRange()
    range.selectNodeContents(link)
    // 文字只占一行
    expect(range.getClientRects().length).toBe(1)
    expect(link.getBoundingClientRect().height).toBeLessThan(lineHeight * 2)
    const item = content.parentElement!
    expect(content.getBoundingClientRect().width).toBeGreaterThan(item.getBoundingClientRect().width)
  })

  it('再长也不超过浮层最大宽，超出的才折行', async () => {
    const content = await mountOpen(['很长的链接文字'.repeat(20)])
    expect(content.getBoundingClientRect().width).toBeLessThanOrEqual(px('--xh-overlay-max-w-xl', document.body) + 0.5)
  })
})
