// 图表的几何度量（圆角、间隙、柱厚上限……）写成 calc() / max() 也照样生效：应用常把圆角接到自己的偏好上，
// 如 --xh-shape-inset: max(2px, calc(var(--radius) / 2))。此前内核只认得 px / rem / em 的字面写法，
// 读到表达式就退回缺省的 2px，卡片已经调到 16px 的大圆角，柱子、扇区与桑基节点还是 2px，看着像没有圆角。
// 计算样式与绘出的路径只有真实浏览器给得出来。
import type { App, Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhCartesianChartRoot, XhPieChartRoot, XhSankeyChartRoot } from '../../src'
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

async function mount(root: Component, props: Record<string, unknown>, style: string): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = `inline-size: 640px; ${style}`
  document.body.append(host)
  app = createApp({ render: () => h(root, { animated: false, ...props }, { caption: () => '度量' }) })
  app.mount(host)
  await nextTick()
  // 视口量测与度量读取按帧合并，等两帧让它们落下来
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

/** 某个部件绘出的路径里出现过的圆角半径（弧命令 A rx,ry 的 rx），去重。 */
function arcRadii(scope: string, part: string): number[] {
  const radii = new Set<number>()
  for (const path of document.querySelectorAll(`[data-scope='${scope}'][data-part='${part}']`)) {
    for (const match of (path.getAttribute('d') ?? '').matchAll(/A([\d.]+),/g))
      radii.add(Number(match[1]))
  }
  return [...radii]
}

describe('图表度量写成表达式', () => {
  it('饼图：--xh-shape-inset 写成 max(2px, calc(16px / 2))，扇区四角按 8px 圆', async () => {
    await mount(XhPieChartRoot, {
      data: [{ name: '甲', value: 40 }, { name: '乙', value: 35 }, { name: '丙', value: 25 }],
      nameField: 'name',
      valueField: 'value',
      innerRadius: 0.6,
    }, '--xh-shape-inset: max(2px, calc(16px / 2))')
    expect(arcRadii('pie-chart', 'slice')).toContain(8)
  })

  it('柱图：组件槽写成 calc(0.25rem + 4px)，柱的远端按 8px 圆', async () => {
    await mount(XhCartesianChartRoot, {
      data: [{ month: '一月', amount: 120 }, { month: '二月', amount: 90 }],
      series: [{ mark: 'bar', x: 'month', y: 'amount' }],
    }, '--xh-cartesian-chart-bar-radius: calc(0.25rem + 4px)')
    expect(arcRadii('cartesian-chart', 'bar')).toEqual([8])
  })

  it('桑基图：--xh-shape-inset 写成 max() 表达式，节点按算出来的 8px 圆（不超过节点厚度的一半）', async () => {
    await mount(XhSankeyChartRoot, {
      nodes: [{ id: 'a', name: '甲' }, { id: 'b', name: '乙' }, { id: 'c', name: '丙' }],
      links: [{ source: 'a', target: 'b', value: 30 }, { source: 'a', target: 'c', value: 20 }],
    }, '--xh-shape-inset: max(2px, calc(16px / 2))')
    const node = document.querySelector<SVGGraphicsElement>(`[data-scope='sankey-chart'][data-part='node']`)!
    const box = node.getBBox()
    const expected = Math.min(8, box.width / 2, box.height / 2)
    // 节点厚度比 16px 还窄时由厚度封顶；仍要比读不懂表达式时的缺省 2px 大
    expect(expected).toBeGreaterThan(2)
    const radii = arcRadii('sankey-chart', 'node')
    expect(radii).toHaveLength(1)
    expect(radii[0]).toBeCloseTo(expected, 1)
  })
})
