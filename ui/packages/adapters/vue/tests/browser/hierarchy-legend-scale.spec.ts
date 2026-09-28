// 层级图按值着色时的色阶图例：真实布局里每层一条横排在视口上方，渐变条有宽度、画的是顺序色阶，
// 低端的值在行首；其余着色方式整块收起。jsdom 量不出外接框与计算样式，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhHierarchyChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const TREE = {
  name: 'All',
  children: [
    { name: 'East', children: [{ name: 'Shanghai', value: 50 }, { name: 'Hangzhou', value: 30 }] },
    { name: 'South', children: [{ name: 'Guangzhou', value: 40 }, { name: 'Shenzhen', value: 60 }] },
  ],
}

async function mount(props: Record<string, unknown>): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '560px'
  document.body.append(host)
  app = createApp({ render: () => h(XhHierarchyChartRoot, { data: TREE, animated: false, locale: 'en-US', ...props }, { caption: () => '各区销售' }) })
  app.mount(host)
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

function part(name: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='hierarchy-chart'][data-part='${name}']`)]
}

describe('层级图的色阶图例', () => {
  it('每层一条：名字、低端的值、渐变条、高端的值排成一行，整块在视口上方', async () => {
    await mount({ colorBy: 'value' })
    await expect.poll(() => part('legend-scale').length).toBe(2)
    const [legend] = part('legend')
    expect(legend!.hidden).toBe(false)
    expect(legend!.getBoundingClientRect().bottom).toBeLessThanOrEqual(part('viewport')[0]!.getBoundingClientRect().top + 0.5)
    const row = part('legend-scale')[0]!
    expect([...row.children].map(el => el.getAttribute('data-part'))).toEqual(['legend-scale-name', 'legend-scale-value', 'legend-scale-bar', 'legend-scale-value'])
    expect(row.textContent).toBe('Level 10100')
    const tops = [...row.children].map(el => el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2)
    for (const y of tops)
      expect(Math.abs(y - tops[0]!)).toBeLessThan(2)
    const bar = part('legend-scale-bar')[0]!
    expect(bar.getBoundingClientRect().width).toBeGreaterThan(40)
    expect(getComputedStyle(bar).backgroundImage).toContain('linear-gradient')
  })

  it('按分支着色时图例收起，不占位置', async () => {
    await mount({})
    const [legend] = part('legend')
    expect(legend!.hidden).toBe(true)
    expect(legend!.getBoundingClientRect().height).toBe(0)
  })
})
