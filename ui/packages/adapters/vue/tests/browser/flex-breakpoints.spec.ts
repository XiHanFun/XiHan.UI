// Flex 逐档的方向、对齐、分布与间距：哪一档在多宽的视口上接管由皮肤的媒体查询定，
// 换档后缺省对齐跟着方向走、显式对齐不被换掉。媒体查询与计算样式只有真实浏览器量得出。
import type { FlexProps } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhFlex } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
let originalViewport: { width: number, height: number } | null = null

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  if (originalViewport)
    await page.viewport(originalViewport.width, originalViewport.height)
  originalViewport = null
})

/** 把测试文档切到给定宽度，等排版跟上再挂。 */
async function mountAt(width: number, props: FlexProps): Promise<HTMLElement> {
  originalViewport ??= { width: innerWidth, height: innerHeight }
  await page.viewport(width, 600)
  for (let i = 0; document.documentElement.clientWidth !== width; i += 1) {
    if (i >= 60)
      throw new Error(`视口没有切到 ${width}px（现在是 ${document.documentElement.clientWidth}px）`)
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhFlex, props, () => [h('span', 'A'), h('span', 'B')]) })
  app.mount(host)
  await nextTick()
  return document.querySelector<HTMLElement>('[data-scope="flex"][data-part="root"]')!
}

describe('flex 逐档书写（Chromium）', () => {
  it('窄屏竖排、md 起横排：缺省对齐随当档方向换（竖排拉伸、横排居中）', async () => {
    const props: FlexProps = { orientation: { base: 'vertical', md: 'horizontal' } }
    const narrow = await mountAt(375, props)
    expect(narrow.dataset.orientation).toBe('vertical')
    expect(narrow.dataset.orientationMd).toBe('horizontal')
    expect(getComputedStyle(narrow).flexDirection).toBe('column')
    expect(getComputedStyle(narrow).alignItems).toBe('stretch')
    app!.unmount()
    host!.remove()

    const wide = await mountAt(1024, props)
    expect(getComputedStyle(wide).flexDirection).toBe('row')
    expect(getComputedStyle(wide).alignItems).toBe('center')
  })

  it('显式对齐不随方向换档被换掉；逐档对齐在更宽的档接管', async () => {
    const pinned = await mountAt(1024, { orientation: { base: 'vertical', md: 'horizontal' }, align: 'end' })
    expect(getComputedStyle(pinned).alignItems).toBe('flex-end')
    app!.unmount()
    host!.remove()

    const tiered = await mountAt(1024, { align: { base: 'start', lg: 'baseline' } })
    expect(getComputedStyle(tiered).alignItems).toBe('baseline')
    app!.unmount()
    host!.remove()

    const below = await mountAt(768, { align: { base: 'start', lg: 'baseline' } })
    expect(getComputedStyle(below).alignItems).toBe('flex-start')
  })

  it('分布与间距逐档接管，没写的档沿用更窄的一档', async () => {
    const props: FlexProps = { justify: { base: 'start', sm: 'between' }, gap: { base: 'xs', xl: 'xl' } }
    const mid = await mountAt(1024, props)
    expect(getComputedStyle(mid).justifyContent).toBe('space-between')
    const midGap = Number.parseFloat(getComputedStyle(mid).columnGap)
    app!.unmount()
    host!.remove()

    const xl = await mountAt(1280, props)
    expect(getComputedStyle(xl).justifyContent).toBe('space-between')
    expect(Number.parseFloat(getComputedStyle(xl).columnGap)).toBeGreaterThan(midGap)
  })

  it('嵌套时内层不吃外层的显式对齐', async () => {
    originalViewport ??= { width: innerWidth, height: innerHeight }
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhFlex, { align: 'end' }, () => [h(XhFlex, { 'orientation': 'vertical', 'data-testid': 'inner' }, () => [h('span', 'A')])]),
    })
    app.mount(host)
    await nextTick()
    const inner = document.querySelector<HTMLElement>('[data-testid="inner"]')!
    expect(getComputedStyle(inner).alignItems).toBe('stretch')
  })
})
