// 漏斗图在真实布局里：阶段宽度与数值成正比、自上而下排开，写在阶段里的标签不越出阶段，
// 转化率落在两个阶段之间，阶段由深入浅；jsdom 量不出外接框与计算样式，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhFunnelChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown>): void {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  const state = reactive({ animated: false, ...props })
  app = createApp({ render: () => h(XhFunnelChartRoot, state, { caption: () => '漏斗图' }) })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function all(name: string): SVGGraphicsElement[] {
  return [...document.querySelectorAll<SVGGraphicsElement>(`[data-scope='funnel-chart'][data-part='${name}']`)]
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const BASE = {
  data: [
    { stage: '访问', users: 10000 },
    { stage: '注册', users: 5000 },
    { stage: '下单', users: 2000 },
    { stage: '复购', users: 800 },
  ],
  nameField: 'stage',
  valueField: 'users',
}

describe('漏斗图', () => {
  it('条形的宽度与数值成正比，阶段自上而下、互不重叠', async () => {
    mount({ ...BASE, shape: 'bar' })
    await settle()
    const boxes = all('stage').map(s => s.getBoundingClientRect())
    expect(boxes).toHaveLength(4)
    expect(boxes[1]!.width / boxes[0]!.width).toBeCloseTo(0.5, 1)
    for (let i = 1; i < boxes.length; i++)
      expect(boxes[i]!.top).toBeGreaterThanOrEqual(boxes[i - 1]!.bottom - 0.5)
  })

  it('labels="inside" 时写在阶段里的标签不越出阶段；转化率落在相邻两个阶段之间', async () => {
    mount({ ...BASE, labels: 'inside' })
    await settle()
    const stages = all('stage').map(s => s.getBoundingClientRect())
    const [first] = all('stage-label')
    expect(first!.getAttribute('data-placement')).toBe('inside')
    const label = first!.getBoundingClientRect()
    expect(label.left).toBeGreaterThanOrEqual(stages[0]!.left)
    expect(label.right).toBeLessThanOrEqual(stages[0]!.right)
    const conversion = all('conversion')[0]!.getBoundingClientRect()
    const mid = (conversion.top + conversion.bottom) / 2
    expect(mid).toBeGreaterThan(stages[0]!.top)
    expect(mid).toBeLessThan(stages[1]!.bottom)
    expect(conversion.right).toBeLessThanOrEqual(Math.min(stages[0]!.left, stages[1]!.left) + 0.5)
  })

  it('阶段由深入浅：第一阶段与最后一个阶段的填充色不同，都不是透明', async () => {
    mount(BASE)
    await settle()
    const fills = all('stage').map(s => getComputedStyle(s).fill)
    expect(fills[0]).not.toBe(fills[3])
    expect(fills.every(f => f !== 'none' && !f.includes('0)'))).toBe(true)
  })
})
