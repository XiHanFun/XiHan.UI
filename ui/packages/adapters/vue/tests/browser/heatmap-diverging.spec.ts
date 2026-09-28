// 发散色阶以中点分两侧：中点那一格是数据色的中性中点，两侧各自兑向负向与正向的发散色，对照条与网格同源。
// 兑色靠皮肤里的 color-mix，jsdom 不解析它，只在 Chromium 验证计算值。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhHeatmapRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

// 相关系数矩阵：对角线是 1，其余在 ±1 之间
const CORRELATION = [
  { row: 'a', column: 'a', value: 1 },
  { row: 'a', column: 'b', value: -1 },
  { row: 'a', column: 'c', value: 0.5 },
  { row: 'b', column: 'a', value: -1 },
  { row: 'b', column: 'b', value: 1 },
  { row: 'b', column: 'c', value: 0 },
  { row: 'c', column: 'a', value: 0.5 },
  { row: 'c', column: 'b', value: 0 },
  { row: 'c', column: 'c', value: 1 },
]

function mountHeatmap(extra: Record<string, unknown> = {}): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhHeatmapRoot, {
      variant: 'matrix',
      rows: ['a', 'b', 'c'],
      columns: ['a', 'b', 'c'],
      value: CORRELATION,
      animated: false,
      ...extra,
    }),
  })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => setTimeout(resolve, 60))
}

function cell(row: string, column: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='heatmap'][data-part='cell'][data-row='${row}'][data-value='${column}']`)
  if (!element)
    throw new Error(`找不到 ${row} × ${column} 那一格`)
  return element
}

function legendItems(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='heatmap'][data-part='legend-item']`)]
}

/** 把一段颜色写法解析成这台浏览器上的最终取值，用来与格子的计算值对账。 */
function resolved(color: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty('background-color', color)
  document.body.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

function background(element: HTMLElement): string {
  return getComputedStyle(element).backgroundColor
}

/** 两个计算色逐分量对账：color-mix 在 0% 与 100% 两端会带出末位的浮点误差。 */
function expectSameColor(actual: string, expected: string): void {
  const parse = (color: string): number[] => (color.match(/-?[\d.]+(?:e-?\d+)?/g) ?? []).map(Number)
  const [a, b] = [parse(actual), parse(expected)]
  expect(a, `${actual} 对 ${expected}`).toHaveLength(b.length)
  a.forEach((value, index) => expect(value, `${actual} 对 ${expected}`).toBeCloseTo(b[index]!, 4))
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('热力图的发散色阶', () => {
  it('数据里有负数：两端满档取发散两色，中点那一格取发散中点', async () => {
    mountHeatmap()
    await settle()
    const root = document.querySelector<HTMLElement>(`[data-scope='heatmap'][data-part='root']`)!
    expect(root.getAttribute('data-scale')).toBe('diverging')
    expectSameColor(background(cell('a', 'b')), resolved('color-mix(in oklab, var(--xh-chart-diverging-negative) 100%, var(--xh-chart-diverging-center))'))
    expectSameColor(background(cell('a', 'a')), resolved('color-mix(in oklab, var(--xh-chart-diverging-positive) 100%, var(--xh-chart-diverging-center))'))
    expectSameColor(background(cell('b', 'c')), resolved('color-mix(in oklab, var(--xh-chart-diverging-positive) 0%, var(--xh-chart-diverging-center))'))
  })

  it('对照条从负向满档经中点到正向满档，两端与网格里的满档同色', async () => {
    mountHeatmap()
    await settle()
    const items = legendItems()
    expect(items).toHaveLength(9)
    expectSameColor(background(items[0]!), background(cell('a', 'b')))
    expectSameColor(background(items[4]!), background(cell('b', 'c')))
    expectSameColor(background(items[8]!), background(cell('a', 'a')))
    expect(items.slice(0, 4).every(item => item.getAttribute('data-polarity') === 'negative')).toBe(true)
    expect(items.slice(5).every(item => item.getAttribute('data-polarity') === 'positive')).toBe(true)
  })

  it('色板与语气在发散色阶下不生效：两侧照旧取发散两色', async () => {
    mountHeatmap({ palette: 'gray', tone: 'danger' })
    await settle()
    expectSameColor(background(cell('a', 'b')), resolved('color-mix(in oklab, var(--xh-chart-diverging-negative) 100%, var(--xh-chart-diverging-center))'))
    expectSameColor(background(cell('a', 'a')), resolved('color-mix(in oklab, var(--xh-chart-diverging-positive) 100%, var(--xh-chart-diverging-center))'))
  })

  it('连续色阶：0.5 正好兑一半，不取整到档位', async () => {
    mountHeatmap({ continuous: true })
    await settle()
    expectSameColor(background(cell('a', 'c')), resolved('color-mix(in oklab, var(--xh-chart-diverging-positive) 50%, var(--xh-chart-diverging-center))'))
  })

  it('焦点在格上按 Enter 报告那一格；Space 不报告', async () => {
    const presses: unknown[] = []
    mountHeatmap({ onCellPress: (details: unknown) => presses.push(details) })
    await settle()
    cell('a', 'b').focus()
    await userEvent.keyboard('{Enter}')
    expect(presses).toEqual([expect.objectContaining({ row: 'a', column: 'b', count: -1, polarity: 'negative' })])
    await userEvent.keyboard(' ')
    expect(presses).toHaveLength(1)
    await userEvent.click(cell('c', 'a'))
    expect(presses).toHaveLength(2)
  })
})
