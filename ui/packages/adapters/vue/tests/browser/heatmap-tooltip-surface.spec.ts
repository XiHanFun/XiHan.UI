// Heatmap 的详情条与其余图表的提示框同一副 frosted 材质（Chart 家族配方）：非透明描边、背景模糊、
// frosted 影、overlay 圆角、正文字号，不反白；色板取基础色板同名色相的满档。计算值依赖真实级联，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhHeatmapRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mountHeatmap(extra: Record<string, unknown> = {}): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhHeatmapRoot, {
      ...extra,
      startDate: '2026-01-05',
      endDate: '2026-01-18',
      value: [{ date: '2026-01-06', count: 3 }, { date: '2026-01-12', count: 9 }],
    }, {
      tooltip: (details: { count: number } | null) => [h('span', null, details ? `${details.count} 次` : '')],
    }),
  })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => setTimeout(resolve, 60))
}

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='heatmap'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 heatmap/${name}`)
  return element
}

/** 把令牌解析成这台浏览器上的最终取值，用来与详情条的计算值对账。 */
function tokenValue(property: 'box-shadow' | 'backdrop-filter' | 'color' | 'border-radius' | 'font-size', token: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  document.body.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('热力图的详情条', () => {
  it('悬停到一格后详情条现身：frosted 材质、非透明描边、overlay 圆角、正文字号，不反白', async () => {
    mountHeatmap()
    await settle()
    const cell = document.querySelector<HTMLElement>('[data-scope=\'heatmap\'][data-part=\'cell\'][data-value=\'2026-01-12\']')
    expect(cell).not.toBeNull()
    await userEvent.hover(cell!)
    await settle()

    const tooltip = part('tooltip')
    expect(tooltip.dataset.state).toBe('visible')
    const style = getComputedStyle(tooltip)
    // 任何浮层的 content 都得有非透明描边，不能只靠影分层
    expect(style.borderTopStyle).toBe('solid')
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(style.borderTopColor).not.toBe(style.backgroundColor)
    // 与图表提示框同一副：frosted 影与背景滤镜、overlay 圆角、正文字号，字色不反白
    expect(style.boxShadow).toBe(tokenValue('box-shadow', '--xh-material-frosted-shadow'))
    expect(style.backdropFilter).toBe(tokenValue('backdrop-filter', '--xh-material-frosted-backdrop'))
    expect(style.borderTopLeftRadius).toBe(tokenValue('border-radius', '--xh-shape-overlay'))
    expect(style.fontSize).toBe(tokenValue('font-size', '--xh-text-body-size'))
    expect(style.color).toBe(tokenValue('color', '--xh-material-frosted-fg'))
    expect(style.color).not.toBe(tokenValue('color', '--xh-bg-surface'))
    // 配方的物理左缘与平移让开，详情条仍按格子的逻辑缘落位
    expect(style.translate).toBe('none')
    const tip = tooltip.getBoundingClientRect()
    const box = cell!.getBoundingClientRect()
    expect(tip.right).toBeGreaterThan(box.left)
    expect(tip.left).toBeLessThan(box.right)
  })

  it('对照条接配方后仍是一行：容器再窄，「少」、色块与「多」也不折行', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '60px'
    document.body.append(host)
    app = createApp({ render: () => h(XhHeatmapRoot, { startDate: '2026-01-05', endDate: '2026-01-18', value: [] }) })
    app.mount(host)
    await settle()
    const tops = [...document.querySelectorAll<HTMLElement>('[data-scope=\'heatmap\'][data-part=\'legend\'] > *')].map(el => Math.round(el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2))
    expect(tops.length).toBeGreaterThan(2)
    expect(new Set(tops).size).toBe(1)
  })

  it('色板取基础色板同名色相的 600 档作满档', async () => {
    mountHeatmap({ palette: 'amber' })
    await settle()
    const root = part('root')
    const ink = getComputedStyle(root).getPropertyValue('--xh-_heatmap-ink').trim()
    const probe = document.createElement('span')
    probe.style.color = ink
    document.body.append(probe)
    const resolved = getComputedStyle(probe).color
    probe.remove()
    expect(resolved).toBe(tokenValue('color', '--xh-color-amber-600'))
  })
})
