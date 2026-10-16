// 图表绘图区的可及名：放 caption 时引用它；不放 caption、只在根上命名时沿用根上的 aria-label / aria-labelledby。
import { runAxe } from '@xihan-ui/testing/a11y'
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

async function settle(): Promise<void> {
  await Promise.resolve()
  for (let i = 0; i < 4; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

interface ChartCase {
  readonly tag: string
  readonly attrs?: string
  /** 根里 caption 之后的结构（图例、视口与 plot、提示框等）。 */
  readonly body: string
  readonly feed: (el: Record<string, unknown>) => void
}

const VIEWPORT = '<div data-xh-part="viewport"><svg data-xh-part="plot"></svg><div data-xh-part="empty"></div></div><div data-xh-part="tooltip"></div>'

const CHARTS: readonly ChartCase[] = [
  {
    tag: 'cartesian-chart',
    body: `<div data-xh-part="legend"></div>${VIEWPORT}`,
    feed: (el) => {
      el.data = [{ month: '一月', amount: 12 }, { month: '二月', amount: 9 }]
      el.series = [{ mark: 'bar', x: 'month', y: 'amount', name: '销售额' }]
    },
  },
  {
    tag: 'pie-chart',
    attrs: 'name-field="channel" value-field="visits"',
    body: `<div data-xh-part="legend"></div><div data-xh-part="viewport"><svg data-xh-part="plot"></svg><div data-xh-part="center"></div><div data-xh-part="empty"></div></div><div data-xh-part="tooltip"></div>`,
    feed: (el) => {
      el.data = [{ channel: '搜索', visits: 42 }, { channel: '直接访问', visits: 26 }]
    },
  },
  {
    tag: 'radar-chart',
    attrs: 'name-field="model"',
    body: `<div data-xh-part="legend"></div>${VIEWPORT}`,
    feed: (el) => {
      el.data = [{ model: '甲', camera: 9, battery: 7, screen: 8 }]
      el.indicators = [{ key: 'camera', label: '影像' }, { key: 'battery', label: '续航' }, { key: 'screen', label: '屏幕' }]
    },
  },
  {
    tag: 'funnel-chart',
    attrs: 'name-field="stage" value-field="users"',
    body: VIEWPORT,
    feed: (el) => {
      el.data = [{ stage: '浏览', users: 100 }, { stage: '下单', users: 40 }]
    },
  },
  {
    tag: 'sankey-chart',
    body: `<div data-xh-part="legend"></div>${VIEWPORT}`,
    feed: (el) => {
      el.nodes = [{ id: 'a', name: '搜索' }, { id: 'b', name: '首页' }]
      el.links = [{ source: 'a', target: 'b', value: 10 }]
    },
  },
  {
    tag: 'graph-chart',
    body: `<div data-xh-part="legend"></div>${VIEWPORT}`,
    feed: (el) => {
      el.nodes = [{ id: 'a', name: '网关' }, { id: 'b', name: '认证' }]
      el.links = [{ source: 'a', target: 'b' }]
    },
  },
  {
    tag: 'hierarchy-chart',
    body: `<nav data-xh-part="path"></nav>${VIEWPORT}`,
    feed: (el) => {
      el.data = { name: '预算', children: [{ name: '研发', value: 4 }, { name: '市场', value: 2 }] }
    },
  },
]

async function mount(chart: ChartCase, naming: 'caption' | 'label' | 'labelledby'): Promise<{ root: HTMLElement, plot: Element }> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  const caption = naming === 'caption' ? '<figcaption data-xh-part="caption">图表标题</figcaption>' : ''
  const rootNaming = naming === 'label' ? 'aria-label="图表标题"' : naming === 'labelledby' ? 'aria-labelledby="chart-heading"' : ''
  host.innerHTML = `
    <h3 id="chart-heading">图表标题</h3>
    <xh-${chart.tag} ${chart.attrs ?? ''}>
      <figure data-xh-part="root" ${rootNaming}>${caption}${chart.body}</figure>
    </xh-${chart.tag}>`
  document.body.append(host)
  chart.feed(host.querySelector(`xh-${chart.tag}`) as unknown as Record<string, unknown>)
  await settle()
  return { root: host, plot: host.querySelector('[data-part="plot"]')! }
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

/** 只看与可及名相关的规则：svg-img-alt 与各角色的必需名字。 */
const NAME_RULES = ['svg-img-alt', 'aria-command-name', 'aria-input-field-name', 'aria-meter-name', 'aria-progressbar-name', 'aria-toggle-field-name', 'aria-tooltip-name', 'aria-dialog-name', 'aria-prohibited-attr', 'aria-valid-attr-value']

async function nameViolations(root: HTMLElement): Promise<string[]> {
  const { violations } = await runAxe(root)
  return violations.filter(v => NAME_RULES.includes(v.id)).map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)
}

describe('图表绘图区的可及名', () => {
  for (const chart of CHARTS) {
    it(`${chart.tag}：放 caption 时绘图区念 caption`, async () => {
      const { root, plot } = await mount(chart, 'caption')
      expect(plotName(plot)).toBe('图表标题')
      expect(await nameViolations(root)).toEqual([])
    })

    it(`${chart.tag}：只在根上写 aria-label 时绘图区沿用它`, async () => {
      const { root, plot } = await mount(chart, 'label')
      expect(plotName(plot)).toBe('图表标题')
      expect(await nameViolations(root)).toEqual([])
    })

    it(`${chart.tag}：只在根上写 aria-labelledby 时绘图区沿用它`, async () => {
      const { root, plot } = await mount(chart, 'labelledby')
      expect(plotName(plot)).toBe('图表标题')
      expect(await nameViolations(root)).toEqual([])
    })
  }

  it('后补上 caption 时绘图区改为念 caption', async () => {
    const { plot } = await mount(CHARTS[1]!, 'label')
    const figure = host!.querySelector('figure')!
    const caption = document.createElement('figcaption')
    caption.dataset.xhPart = 'caption'
    caption.textContent = '新标题'
    figure.prepend(caption)
    await settle()
    expect(plotName(plot)).toBe('新标题')
  })
})
