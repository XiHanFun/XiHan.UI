// 图表在根末尾追加的视觉隐藏数据表，不能把可滚动的祖先撑出滚动条。
// 表格的 block-size 只当最小高度、overflow 对表格不生效：1px 的隐藏样式直接写在 <table> 上时，
// 表格照样有几十行那么高，绝对定位的盒子算进祖先的可滚动溢出，放进 overflow: auto 的容器就多出一截空滚动。
// 隐藏交给包着表格的块级区域（table-region），表格本身不再带隐藏样式。判据是真实布局，jsdom 不排版。
import type { App, Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
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

/** 行数取到数据表远高于容器：没收住时溢出一眼可见 */
const COUNT = 80

const range = Array.from({ length: COUNT }, (_, i) => i)

const CASES: Array<{ scope: string, component: Component, props: Record<string, unknown> }> = [
  {
    scope: 'cartesian-chart',
    component: XhCartesianChartRoot,
    props: { data: range.map(i => ({ day: `D${i}`, amount: i + 1 })), series: [{ mark: 'bar', x: 'day', y: 'amount' }] },
  },
  {
    scope: 'pie-chart',
    component: XhPieChartRoot,
    props: { data: range.map(i => ({ name: `S${i}`, value: i + 1 })), nameField: 'name', valueField: 'value' },
  },
  {
    scope: 'funnel-chart',
    component: XhFunnelChartRoot,
    props: { data: range.map(i => ({ stage: `L${i}`, users: COUNT - i })), nameField: 'stage', valueField: 'users' },
  },
  {
    scope: 'radar-chart',
    component: XhRadarChartRoot,
    props: {
      data: range.map(i => ({ model: `M${i}`, speed: i % 7, power: i % 5, range: i % 3 })),
      nameField: 'model',
      indicators: [{ key: 'speed', label: '速度' }, { key: 'power', label: '动力' }, { key: 'range', label: '续航' }],
    },
  },
  {
    scope: 'graph-chart',
    component: XhGraphChartRoot,
    props: {
      nodes: range.map(i => ({ id: `n${i}`, name: `N${i}` })),
      links: range.slice(1).map(i => ({ source: `n${i - 1}`, target: `n${i}` })),
    },
  },
  {
    scope: 'hierarchy-chart',
    component: XhHierarchyChartRoot,
    props: { data: { name: '全部', children: range.map(i => ({ name: `C${i}`, value: i + 1 })) } },
  },
  {
    scope: 'sankey-chart',
    component: XhSankeyChartRoot,
    props: {
      nodes: range.map(i => ({ id: `n${i}`, name: `N${i}` })),
      links: range.slice(1).map(i => ({ source: `n${i - 1}`, target: `n${i}`, value: COUNT - i })),
    },
  },
]

let app: App | null = null
let scroller: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  scroller?.remove()
  app = null
  scroller = null
})

async function mountInScroller(component: Component, props: Record<string, unknown>): Promise<HTMLElement> {
  scroller = document.createElement('div')
  // 容器装得下图表本身，装不下几十行的数据表
  scroller.style.cssText = 'inline-size: 480px; block-size: 640px; overflow: auto'
  document.body.append(scroller)
  app = createApp({ render: () => h(component, { animated: false, ...props }, { caption: () => '数据表' }) })
  app.mount(scroller)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  return scroller
}

describe('图表的视觉隐藏数据表', () => {
  for (const { scope, component, props } of CASES) {
    it(`${scope}：放进可滚动容器不撑出滚动，表格在 1px 的隐藏区域里且行数齐全`, async () => {
      const host = await mountInScroller(component, props)
      expect(host.scrollHeight).toBeLessThanOrEqual(host.clientHeight)
      expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth)

      const region = host.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='table-region']`)
      expect(region).not.toBeNull()
      const box = region!.getBoundingClientRect()
      expect(box.height).toBeLessThanOrEqual(1)
      expect(box.width).toBeLessThanOrEqual(1)
      expect(getComputedStyle(region!).overflow).toBe('hidden')

      const table = region!.querySelector<HTMLTableElement>(`table[data-scope='${scope}'][data-part='table']`)
      expect(table).not.toBeNull()
      expect(table!.parentElement).toBe(region)
      // 表格只在区域里被裁掉：它自己不是绝对定位的 1px 盒，行照常排、读屏照常读
      expect(getComputedStyle(table!).position).toBe('static')
      expect(table!.tBodies[0]!.rows.length).toBeGreaterThan(1)
    })
  }
})
