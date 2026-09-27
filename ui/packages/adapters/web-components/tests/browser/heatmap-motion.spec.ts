// 热力图的过渡在真浏览器里量：首次出现时有颜色的格子按日期先后等扫描扫到再填色，扫到之前停在空格底色；
// 之后的数据变化只在根上标出的那一段按数据角色的时长换色。按作者的真实写法：value 只走 JS property，
// 元素连上之后才赋值。计算样式与动画 jsdom 量不出，只在 Chromium 验证。
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

async function frames(count = 3): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function part(name: string, value?: string | number): HTMLElement {
  const el = document.createElement('div')
  el.dataset.xhPart = name
  if (value !== undefined)
    el.setAttribute('value', String(value))
  return el
}

/** 两周的日历，格子照元素给出的 grid 铺；style 写在宿主上，令牌的覆盖从这里往下生效。 */
async function mount(style: string): Promise<XhHeatmapElement> {
  host = document.createElement('div')
  host.innerHTML = `<xh-heatmap start-date="2024-01-01" end-date="2024-01-14" style="${style}"><div data-xh-part="root"></div></xh-heatmap>`
  document.body.append(host)
  const heatmap = host.querySelector<XhHeatmapElement>('xh-heatmap')!
  const grid = part('grid')
  for (const row of heatmap.grid.rows) {
    const line = part('row', row.weekDay)
    for (const day of row.cells)
      line.append(part('cell', day.date))
    grid.append(line)
  }
  heatmap.querySelector('[data-xh-part="root"]')!.append(grid)
  await heatmap.updateComplete
  await frames()
  return heatmap
}

function cell(heatmap: HTMLElement, date: string): HTMLElement {
  return heatmap.querySelector<HTMLElement>(`[data-part="cell"][value="${date}"]`)!
}

const bg = (el: HTMLElement): string => getComputedStyle(el).backgroundColor

describe('热力图的过渡', () => {
  it('首次出现：扫描还没扫到的格子停在空格底色，关掉过渡后落到自己的档位色', async () => {
    // 扫描与填色都拉长到几秒：量的时候过渡一定还在半路
    const heatmap = await mount('--xh-motion-duration-reveal: 4s; --xh-motion-duration-enter: 4s')
    const empty = bg(cell(heatmap, '2024-01-07'))

    heatmap.value = [
      { date: '2024-01-01', count: 3 },
      { date: '2024-01-14', count: 5 },
    ]
    await heatmap.updateComplete
    await frames()
    const late = cell(heatmap, '2024-01-14')
    expect(late.hasAttribute('data-drawing')).toBe(true)
    expect(bg(late)).toBe(empty)

    heatmap.animated = false
    await heatmap.updateComplete
    await frames()
    expect(late.hasAttribute('data-drawing')).toBe(false)
    expect(bg(late)).not.toBe(empty)
  })

  it('数据变化：根上标出换色进行中，格子按 morph 的时长过渡；过渡之外换色不拖时长', async () => {
    const heatmap = await mount('--xh-motion-duration-reveal: 1ms; --xh-motion-duration-enter: 1ms; --xh-motion-duration-morph: 3s')
    heatmap.value = [{ date: '2024-01-03', count: 2 }]
    await heatmap.updateComplete
    await frames(6)
    const target = cell(heatmap, '2024-01-03')
    const root = heatmap.querySelector<HTMLElement>('[data-part="root"]')!
    expect(root.hasAttribute('data-animating')).toBe(false)
    expect(getComputedStyle(target).transitionDuration).toBe('0s')

    heatmap.value = [{ date: '2024-01-03', count: 8 }, { date: '2024-01-04', count: 2 }]
    await heatmap.updateComplete
    await frames()
    expect(root.hasAttribute('data-animating')).toBe(true)
    expect(getComputedStyle(target).transitionDuration).toBe('3s')
    expect(target.hasAttribute('data-drawing')).toBe(false)
  })
})
