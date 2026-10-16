// 取数中与空态在真浏览器里的样子：网格淡到图表的 pending 透明度、对照条不淡；
// 空态叠在热力图上居中，有数据时收起不占位。只写 root，结构由元素生成。
import type { XhHeatmapElement } from '../../src/elements/heatmap'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function mount(attrs: string, value: unknown[]): Promise<XhHeatmapElement> {
  host = document.createElement('div')
  host.style.inlineSize = '800px'
  host.innerHTML = `<xh-heatmap start-date="2024-01-01" end-date="2024-03-31" animated="false"${attrs}><div data-xh-part="root"></div></xh-heatmap>`
  document.body.append(host)
  const el = host.querySelector('xh-heatmap') as XhHeatmapElement
  el.value = value as XhHeatmapElement['value']
  for (let i = 0; i < 3; i++)
    await el.updateComplete
  await new Promise(resolve => requestAnimationFrame(resolve))
  return el
}

function part(el: Element, name: string): HTMLElement {
  return el.querySelector<HTMLElement>(`[data-scope="heatmap"][data-part="${name}"]`)!
}

/** 过渡走完再读：透明度按 micro 时长过渡。 */
async function settledOpacity(el: HTMLElement): Promise<number> {
  await Promise.all(el.getAnimations().map(animation => animation.finished))
  return Number(getComputedStyle(el).opacity)
}

describe('heatmap 取数中与空态', () => {
  it('pending：网格淡到 --xh-chart-pending-alpha，对照条照常', async () => {
    const el = await mount(' pending', [{ date: '2024-01-02', count: 3 }])
    const alpha = Number(getComputedStyle(document.documentElement).getPropertyValue('--xh-chart-pending-alpha').trim())
    expect(alpha).toBeGreaterThan(0)
    expect(alpha).toBeLessThan(1)
    expect(await settledOpacity(part(el, 'grid'))).toBeCloseTo(alpha, 2)
    expect(Number(getComputedStyle(part(el, 'legend')).opacity)).toBe(1)
    expect(part(el, 'empty').getBoundingClientRect().height).toBe(0)
  })

  it('空态：叠在热力图上、文字居中，不把版面撑高', async () => {
    const withData = await mount('', [{ date: '2024-01-02', count: 3 }])
    const height = part(withData, 'root').getBoundingClientRect().height
    host?.remove()

    const el = await mount('', [])
    const root = part(el, 'root').getBoundingClientRect()
    const empty = part(el, 'empty')
    expect(empty.textContent).toBe('No data')
    expect(root.height).toBeCloseTo(height, 0)
    const box = empty.getBoundingClientRect()
    expect(box.top).toBeGreaterThanOrEqual(root.top - 0.5)
    expect(box.bottom).toBeLessThanOrEqual(root.bottom + 0.5)
    const text = document.createRange()
    text.selectNodeContents(empty)
    const glyphs = text.getBoundingClientRect()
    expect(Math.abs((glyphs.left + glyphs.right) / 2 - (box.left + box.right) / 2)).toBeLessThan(2)
  })
})
