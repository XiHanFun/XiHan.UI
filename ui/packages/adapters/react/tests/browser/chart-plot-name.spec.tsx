// 图表绘图区的可及名：放 caption 时引用它；不放 caption、只在根上命名时沿用根上的 aria-label / aria-labelledby。
import type { ComponentType } from 'react'
import { runAxe } from '@xihan-ui/testing/a11y'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhCartesianChartRoot,
  XhFunnelChartRoot,
  XhGraphChartRoot,
  XhHierarchyChartRoot,
  XhPieChartRoot,
  XhRadarChartRoot,
  XhSankeyChartRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const CASES: Array<{ scope: string, component: ComponentType<Record<string, unknown>>, props: Record<string, unknown> }> = [
  {
    scope: 'cartesian-chart',
    component: XhCartesianChartRoot as ComponentType<Record<string, unknown>>,
    props: { data: [{ month: '一月', amount: 12 }, { month: '二月', amount: 9 }], series: [{ mark: 'bar', x: 'month', y: 'amount', name: '销售额' }] },
  },
  {
    scope: 'pie-chart',
    component: XhPieChartRoot as ComponentType<Record<string, unknown>>,
    props: { data: [{ channel: '搜索', visits: 42 }, { channel: '直接访问', visits: 26 }], nameField: 'channel', valueField: 'visits' },
  },
  {
    scope: 'radar-chart',
    component: XhRadarChartRoot as ComponentType<Record<string, unknown>>,
    props: {
      data: [{ model: '甲', camera: 9, battery: 7, screen: 8 }],
      nameField: 'model',
      indicators: [{ key: 'camera', label: '影像' }, { key: 'battery', label: '续航' }, { key: 'screen', label: '屏幕' }],
    },
  },
  {
    scope: 'funnel-chart',
    component: XhFunnelChartRoot as ComponentType<Record<string, unknown>>,
    props: { data: [{ stage: '浏览', users: 100 }, { stage: '下单', users: 40 }], nameField: 'stage', valueField: 'users' },
  },
  {
    scope: 'sankey-chart',
    component: XhSankeyChartRoot as ComponentType<Record<string, unknown>>,
    props: { nodes: [{ id: 'a', name: '搜索' }, { id: 'b', name: '首页' }], links: [{ source: 'a', target: 'b', value: 10 }] },
  },
  {
    scope: 'graph-chart',
    component: XhGraphChartRoot as ComponentType<Record<string, unknown>>,
    props: { nodes: [{ id: 'a', name: '网关' }, { id: 'b', name: '认证' }], links: [{ source: 'a', target: 'b' }] },
  },
  {
    scope: 'hierarchy-chart',
    component: XhHierarchyChartRoot as ComponentType<Record<string, unknown>>,
    props: { data: { name: '预算', children: [{ name: '研发', value: 4 }, { name: '市场', value: 2 }] } },
  },
]

let unmount: (() => void) | null = null
let host: HTMLElement | null = null

afterEach(() => {
  unmount?.()
  host?.remove()
  unmount = null
  host = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await act(() => new Promise(resolve => requestAnimationFrame(resolve)))
}

type Naming = 'caption' | 'label' | 'labelledby'

async function mount(component: ComponentType<Record<string, unknown>>, props: Record<string, unknown>, naming: Naming): Promise<Element> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  host.innerHTML = '<h3 id="chart-heading">图表标题</h3>'
  const mountPoint = document.createElement('div')
  host.append(mountPoint)
  document.body.append(host)
  const extra = naming === 'caption'
    ? { caption: '图表标题' }
    : naming === 'label' ? { 'aria-label': '图表标题' } : { 'aria-labelledby': 'chart-heading' }
  const root = createRoot(mountPoint)
  await act(async () => {
    root.render(createElement(component, { animated: false, ...props, ...extra }))
  })
  unmount = () => act(() => root.unmount())
  await settle()
  return host.querySelector('[data-part="plot"]')!
}

/** 绘图区按 aria-labelledby / aria-label 算出来的名字；引用要指向文档里真实存在的节点。 */
function plotName(plot: Element): string {
  const ids = plot.getAttribute('aria-labelledby')
  if (ids) {
    return ids.split(/\s+/).map((id) => {
      const target = document.getElementById(id)
      expect(target, `aria-labelledby 指向的 ${id} 不存在`).not.toBeNull()
      return target!.textContent!.trim()
    }).join(' ')
  }
  return plot.getAttribute('aria-label') ?? ''
}

/** 只看与可及名相关的规则。 */
const NAME_RULES = ['svg-img-alt', 'aria-input-field-name', 'aria-prohibited-attr', 'aria-valid-attr-value']

async function nameViolations(): Promise<string[]> {
  const { violations } = await runAxe(host!)
  return violations.filter(v => NAME_RULES.includes(v.id)).map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)
}

describe('图表绘图区的可及名', () => {
  for (const { scope, component, props } of CASES) {
    for (const naming of ['caption', 'label', 'labelledby'] as const) {
      it(`${scope}：${naming === 'caption' ? '放 caption' : `只在根上写 aria-${naming}`}时绘图区念得出图表标题`, async () => {
        const plot = await mount(component, props, naming)
        expect(plotName(plot)).toBe('图表标题')
        expect(await nameViolations()).toEqual([])
      })
    }
  }
})
