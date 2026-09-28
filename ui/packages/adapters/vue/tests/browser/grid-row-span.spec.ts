// Grid 的跨行：跨几行就占几条行轨道（连同中间的行间距），逐档跨行按视口接管。
// 轨道几何只有真实布局量得出。
import type { GridItemProps } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhGridItem, XhGridRoot } from '../../src'
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

async function mountAt(width: number, rowSpan: GridItemProps['rowSpan']): Promise<HTMLElement[]> {
  originalViewport ??= { width: innerWidth, height: innerHeight }
  await page.viewport(width, 600)
  for (let i = 0; document.documentElement.clientWidth !== width; i += 1) {
    if (i >= 60)
      throw new Error(`视口没有切到 ${width}px（现在是 ${document.documentElement.clientWidth}px）`)
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
  host = document.createElement('div')
  document.body.append(host)
  const cell = (text: string, extra: Record<string, unknown> = {}) =>
    h(XhGridItem, extra, () => h('div', { style: 'block-size: 40px' }, text))
  app = createApp({
    render: () => h(XhGridRoot, { cols: 2, gap: 'sm', style: 'inline-size: 300px' }, () => [
      cell('甲', { rowSpan }),
      cell('乙'),
      cell('丙'),
    ]),
  })
  app.mount(host)
  await nextTick()
  return [...document.querySelectorAll<HTMLElement>('[data-scope="grid"][data-part="item"]')]
}

describe('grid 跨行（Chromium）', () => {
  it('跨两行的格子占两条行轨道，连同中间的行间距；右侧两格各占一行', async () => {
    const [a, b, c] = await mountAt(1024, 2)
    const boxA = a!.getBoundingClientRect()
    const boxB = b!.getBoundingClientRect()
    const boxC = c!.getBoundingClientRect()
    // 乙、丙落在右列上下两行
    expect(boxB.left).toBeCloseTo(boxC.left, 0)
    expect(boxC.top).toBeGreaterThan(boxB.bottom)
    expect(boxA.top).toBeCloseTo(boxB.top, 0)
    expect(boxA.bottom).toBeCloseTo(boxC.bottom, 0)
  })

  it('逐档跨行按视口接管：lg 起跨两行，窄一档只占一行', async () => {
    const wide = await mountAt(1024, { base: 1, lg: 2 })
    expect(wide[0]!.getBoundingClientRect().bottom).toBeCloseTo(wide[2]!.getBoundingClientRect().bottom, 0)
    app!.unmount()
    host!.remove()

    const narrow = await mountAt(768, { base: 1, lg: 2 })
    // 只占一行时丙换到左列第二行，甲的底边与乙齐平
    expect(narrow[0]!.getBoundingClientRect().bottom).toBeCloseTo(narrow[1]!.getBoundingClientRect().bottom, 0)
    expect(narrow[2]!.getBoundingClientRect().left).toBeCloseTo(narrow[0]!.getBoundingClientRect().left, 0)
  })
})
