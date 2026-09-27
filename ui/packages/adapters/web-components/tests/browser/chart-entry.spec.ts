// 图表的入场按作者的真实写法量：data 只走 JS property，元素连上、量完尺寸、画过一帧空态之后才赋值。
// 这时画面里还没有数据，数据到来仍是首次出现，与 Vue、React 挂载时就带着数据的那一段入场相同。
// 几何与计算样式 jsdom 量不出，只在 Chromium 验证。
import type { XhFunnelChartElement } from '../../src/elements/funnel-chart'
import type { XhPieChartElement } from '../../src/elements/pie-chart'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

// 把入场时长拉长到几秒：量第一帧时过渡一定还在半路，不受机器快慢影响
const SLOW = '--xh-motion-duration-reveal: 4s'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function frames(count = 3): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function mount<T extends HTMLElement>(markup: string): T {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  host.innerHTML = markup
  document.body.append(host)
  return host.firstElementChild as T
}

function all(chart: HTMLElement, part: string): Element[] {
  return [...chart.querySelectorAll(`[data-part='${part}']`)]
}

function union(rects: DOMRect[]): { left: number, right: number, top: number } {
  return {
    left: Math.min(...rects.map(r => r.left)),
    right: Math.max(...rects.map(r => r.right)),
    top: Math.min(...rects.map(r => r.top)),
  }
}

describe('数据晚于尺寸到达仍按首次出现入场', () => {
  it('漏斗图：各阶段从中线一起横向展开', async () => {
    const chart = mount<XhFunnelChartElement>(`
      <xh-funnel-chart name-field="stage" value-field="users" style="${SLOW}">
        <figure data-xh-part="root">
          <figcaption data-xh-part="caption">购买流程</figcaption>
          <div data-xh-part="viewport"><svg data-xh-part="plot"></svg><div data-xh-part="empty"></div></div>
        </figure>
      </xh-funnel-chart>`)
    await frames()
    expect(all(chart, 'stage')).toHaveLength(0)

    chart.data = [
      { stage: '访问', users: 10000 },
      { stage: '注册', users: 5000 },
      { stage: '下单', users: 2000 },
    ]
    await frames()
    const early = all(chart, 'stage').map(el => el.getBoundingClientRect())
    chart.animated = false
    await frames()
    const final = all(chart, 'stage').map(el => el.getBoundingClientRect())
    expect(early).toHaveLength(3)
    early.forEach((rect, i) => {
      expect(rect.width).toBeLessThan(final[i]!.width * 0.6)
      expect(Math.abs((rect.left + rect.right) / 2 - (final[i]!.left + final[i]!.right) / 2)).toBeLessThanOrEqual(1)
    })
  })

  it('饼图：整圈从 12 点顺着扫开，环形中心等扫完再出现', async () => {
    const chart = mount<XhPieChartElement>(`
      <xh-pie-chart name-field="channel" value-field="visits" labels="none" style="${SLOW}">
        <figure data-xh-part="root">
          <figcaption data-xh-part="caption">访问来源</figcaption>
          <div data-xh-part="viewport">
            <svg data-xh-part="plot"></svg>
            <div data-xh-part="center"></div>
            <div data-xh-part="empty"></div>
          </div>
        </figure>
      </xh-pie-chart>`)
    await frames()
    expect(all(chart, 'slice')).toHaveLength(0)

    chart.data = [
      { channel: '搜索', visits: 40 },
      { channel: '直接', visits: 30 },
      { channel: '外链', visits: 20 },
      { channel: '社交', visits: 10 },
    ]
    await frames()
    const early = union(all(chart, 'slice').map(el => el.getBoundingClientRect()))
    const center = all(chart, 'center')[0]!
    expect(Number(getComputedStyle(center).opacity)).toBe(0)
    chart.animated = false
    await frames()
    const final = union(all(chart, 'slice').map(el => el.getBoundingClientRect()))
    // 扫开的前一小段落在 12 点右侧：宽度远不到整圆，顶边已经贴着整圆的顶
    expect(early.right - early.left).toBeLessThan((final.right - final.left) * 0.6)
    expect(early.left).toBeGreaterThanOrEqual((final.left + final.right) / 2 - 1)
    expect(Math.abs(early.top - final.top)).toBeLessThanOrEqual(1)
    expect(Number(getComputedStyle(center).opacity)).toBe(1)
  })
})
