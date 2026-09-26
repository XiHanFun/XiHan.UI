// 直角坐标图在真实布局里的几何：柱高与比例尺一致、立在基线上，视口换宽度就重排，
// 焦点环画在标记外且不越过基线，折线的焦点代理换点后焦点跟过去，绘图区不随 RTL 镜像而图例镜像，
// 提示框是 frosted 气泡、落在根里；入场时柱从基线长出、折线由描线关键帧描出，减弱动效下几何直接到位。
// jsdom 量不出这些，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhCartesianChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

const SALES = [
  { month: '一月', amount: 100 },
  { month: '二月', amount: 200 },
  { month: '三月', amount: 150 },
]

function mount(props: Record<string, unknown>, width = 480, dir?: 'rtl'): Record<string, unknown> {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  if (dir)
    host.dir = dir
  document.body.append(host)
  // 几何用例看终态；过渡用例显式打开 animated
  const state = reactive({ animated: false, ...props })
  app = createApp({
    render: () => h(XhCartesianChartRoot, state, { caption: () => '月度销售额' }),
  })
  app.mount(host)
  return state
}

async function settle(): Promise<void> {
  await nextTick()
  // 视口量测按帧合并，等两帧让尺寸与度量都落下来
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function all(name: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='cartesian-chart'][data-part='${name}']`)]
}

function one(name: string): HTMLElement {
  const element = all(name)[0]
  if (!element)
    throw new Error(`找不到 cartesian-chart/${name}`)
  return element
}

/** 把令牌解析成这台浏览器上的最终取值。 */
function tokenValue(property: string, token: string): string {
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

describe('柱的几何', () => {
  it('柱高与数值成正比，底边立在同一条基线上', async () => {
    mount({ data: SALES, series: [{ mark: 'bar', x: 'month', y: 'amount' }] })
    await settle()
    const bars = all('bar').map(el => el.getBoundingClientRect())
    expect(bars).toHaveLength(3)
    // 二月是一月的两倍、三月是 1.5 倍：高度比在 1px 取整误差内
    expect(bars[1]!.height / bars[0]!.height).toBeCloseTo(2, 1)
    expect(bars[2]!.height / bars[0]!.height).toBeCloseTo(1.5, 1)
    const bottoms = bars.map(r => Math.round(r.bottom))
    expect(new Set(bottoms).size).toBe(1)
    // 基线就是 x 轴线所在的那条水平线
    const axis = document.querySelector<SVGGraphicsElement>(`[data-scope='cartesian-chart'][data-part='axis'][data-axis='x'] [data-part='axis-line']`)!
    expect(Math.abs(axis.getBoundingClientRect().top - bars[0]!.bottom)).toBeLessThanOrEqual(1)
  })

  it('柱的厚度不超过度量槽；改写组件槽，几何跟着变', async () => {
    mount({ data: SALES, series: [{ mark: 'bar', x: 'month', y: 'amount' }] }, 900)
    await settle()
    expect(Math.round(one('bar').getBoundingClientRect().width)).toBe(24)
    app!.unmount()
    host!.remove()
    mount({ data: SALES, series: [{ mark: 'bar', x: 'month', y: 'amount' }], style: '--xh-cartesian-chart-bar-max: 12px' }, 900)
    await settle()
    expect(Math.round(one('bar').getBoundingClientRect().width)).toBe(12)
  })

  it('容器变窄后重新布局：绘图区跟着缩，柱仍在绘图区里', async () => {
    mount({ data: SALES, series: [{ mark: 'bar', x: 'month', y: 'amount' }] }, 600)
    await settle()
    expect(one('plot').getAttribute('width')).toBe('600')
    host!.style.inlineSize = '320px'
    await settle()
    await settle()
    expect(one('plot').getAttribute('width')).toBe('320')
    const plot = one('plot').getBoundingClientRect()
    for (const bar of all('bar').map(el => el.getBoundingClientRect()))
      expect(bar.right).toBeLessThanOrEqual(plot.right + 0.5)
  })
})

describe('焦点', () => {
  it('键盘聚焦柱：焦点环画在柱外，基线那一端不外扩', async () => {
    mount({ data: SALES, series: [{ mark: 'bar', x: 'month', y: 'amount' }] })
    await settle()
    all('bar')[0]!.focus()
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    const bar = all('bar')[1]!
    expect(document.activeElement).toBe(bar)
    const ring = one('focus-ring').getBoundingClientRect()
    const box = bar.getBoundingClientRect()
    expect(ring.left).toBeLessThan(box.left)
    expect(ring.right).toBeGreaterThan(box.right)
    expect(ring.top).toBeLessThan(box.top)
    // 立在基线上的一端与柱底齐平（容描边半宽的误差）
    expect(Math.abs(ring.bottom - box.bottom)).toBeLessThanOrEqual(2)
  })

  it('折线：方向键换点时焦点跟到新的焦点代理上', async () => {
    mount({
      data: SALES,
      series: [{ mark: 'line', x: 'month', y: 'amount', name: '销售额' }],
    })
    await settle()
    one('plot').focus()
    await settle()
    expect(document.activeElement?.getAttribute('data-part')).toBe('point')
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    const active = document.activeElement!
    expect(active.getAttribute('data-part')).toBe('point')
    expect(active.getAttribute('aria-label')).toBe('二月, 销售额 200')
    await userEvent.keyboard('{End}')
    await settle()
    expect(document.activeElement?.getAttribute('aria-label')).toBe('三月, 销售额 150')
  })
})

describe('方向', () => {
  it('绘图区在 RTL 下不镜像，图例镜像', async () => {
    mount({
      data: [{ month: '一月', a: 1, b: 2 }, { month: '二月', a: 2, b: 3 }],
      series: [{ mark: 'bar', x: 'month', y: 'a', name: '甲' }, { mark: 'bar', x: 'month', y: 'b', name: '乙' }],
    }, 480, 'rtl')
    await settle()
    const bars = all('bar')
    // 一月的柱仍在左边：时间与类目的方向是数据约定
    expect(bars[0]!.getBoundingClientRect().left).toBeLessThan(bars[1]!.getBoundingClientRect().left)
    const items = all('legend-item')
    expect(items[0]!.getBoundingClientRect().left).toBeGreaterThan(items[1]!.getBoundingClientRect().left)
  })
})

describe('提示框', () => {
  it('悬停后现身：frosted 描边与影、overlay 圆角，画在根里', async () => {
    mount({ data: SALES, series: [{ mark: 'bar', x: 'month', y: 'amount' }] })
    await settle()
    await userEvent.hover(all('bar')[1]!)
    await settle()
    const tooltip = one('tooltip')
    expect(tooltip.dataset.state).toBe('visible')
    const style = getComputedStyle(tooltip)
    expect(style.borderTopStyle).toBe('solid')
    expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(style.boxShadow).toBe(tokenValue('box-shadow', '--xh-material-frosted-shadow'))
    expect(style.borderTopLeftRadius).toBe('12px')
    // 提示框不接指针：跟着指针走时不挡住下面的标记
    expect(style.pointerEvents).toBe('none')
    expect(tooltip.parentElement).toBe(one('root'))
    const rows = all('tooltip-row')
    expect(rows).toHaveLength(1)
    expect(rows[0]!.textContent).toContain('200')
  })
})

describe('状态', () => {
  it('pending：视口淡下去，根上 aria-busy', async () => {
    mount({ data: SALES, series: [{ mark: 'bar', x: 'month', y: 'amount' }], pending: true })
    await settle()
    expect(one('root').getAttribute('aria-busy')).toBe('true')
    expect(Number(getComputedStyle(one('viewport')).opacity)).toBeLessThan(1)
  })

  it('没有数据：空态叠在视口正中，标题不被盖住', async () => {
    mount({ data: [], series: [{ mark: 'bar', x: 'month', y: 'amount' }] })
    await settle()
    const empty = one('empty').getBoundingClientRect()
    const viewport = one('viewport').getBoundingClientRect()
    expect(Math.abs(empty.top - viewport.top)).toBeLessThanOrEqual(1)
    expect(Math.abs(empty.height - viewport.height)).toBeLessThanOrEqual(1)
    expect(one('caption').getBoundingClientRect().bottom).toBeLessThanOrEqual(viewport.top)
  })
})

describe('数据标签', () => {
  it('柱端标签立在柱顶之上、不出视口；堆叠合计在整叠之上', async () => {
    const STACKED = [
      { month: '一月', online: 120, store: 80 },
      { month: '二月', online: 200, store: 100 },
      { month: '三月', online: 150, store: 60 },
    ]
    mount({
      data: STACKED,
      series: [
        { mark: 'bar', x: 'month', y: 'online', stack: 's' },
        { mark: 'bar', x: 'month', y: 'store', stack: 's' },
      ],
      totals: true,
    })
    await settle()
    const viewport = one('viewport').getBoundingClientRect()
    const totals = all('total-label')
    expect(totals.map(t => t.textContent)).toEqual(['200', '300', '210'])
    const bars = all('bar').map(el => el.getBoundingClientRect())
    totals.forEach((label, i) => {
      const box = label.getBoundingClientRect()
      const top = Math.min(bars[i]!.top, bars[i + 3]!.top)
      expect(box.bottom).toBeLessThanOrEqual(top + 0.5)
      expect(box.top).toBeGreaterThanOrEqual(viewport.top - 0.5)
    })
  })

  it('横向柱内的标签整个落在柱里，字取配对的前景色', async () => {
    mount({ data: SALES, series: [{ mark: 'bar', x: 'month', y: 'amount', labels: 'inside' }], orientation: 'horizontal' }, 600)
    await settle()
    const labels = all('data-label')
    expect(labels.length).toBe(3)
    labels.forEach((label, i) => {
      const box = label.getBoundingClientRect()
      const bar = all('bar')[i]!.getBoundingClientRect()
      expect(box.left).toBeGreaterThanOrEqual(bar.left - 0.5)
      expect(box.right).toBeLessThanOrEqual(bar.right + 0.5)
      expect(box.top).toBeGreaterThanOrEqual(bar.top - 0.5)
      expect(box.bottom).toBeLessThanOrEqual(bar.bottom + 0.5)
    })
    expect(getComputedStyle(labels[0]!).fill).not.toBe(getComputedStyle(all('tick-label')[0]!).fill)
  })

  it('线尾标签写在最后一个点右边，整个落在视口里', async () => {
    mount({ data: SALES, series: [{ mark: 'line', x: 'month', y: 'amount', name: '销售额', endLabel: true }] })
    await settle()
    const label = one('end-label')
    expect(label.textContent).toBe('销售额 150')
    const box = label.getBoundingClientRect()
    const viewport = one('viewport').getBoundingClientRect()
    const line = one('line').getBoundingClientRect()
    expect(box.left).toBeGreaterThanOrEqual(line.right)
    expect(box.right).toBeLessThanOrEqual(viewport.right + 0.5)
  })
})

describe('过渡', () => {
  // 把时长拉长到几秒：量第一帧时过渡一定还在半路，不受机器快慢影响。写在根上随挂载生效，不与起跑抢先后
  const SLOW = '--xh-motion-duration-reveal: 4s; --xh-motion-duration-morph: 4s; --xh-motion-duration-enter: 4s'
  const MIXED = [{ mark: 'bar', x: 'month', y: 'amount' }, { mark: 'line', x: 'month', y: 'amount', id: 'trend' }]

  it('入场：柱从基线长出、底边不动，折线由描线关键帧描出；关掉 animated 直接落到终态', async () => {
    const state = mount({ data: SALES, series: MIXED, animated: true, style: SLOW })
    await settle()
    const early = all('bar').map(el => el.getBoundingClientRect())
    const line = one('line')
    expect(line.hasAttribute('data-drawing')).toBe(true)
    const offset = Number.parseFloat(getComputedStyle(line).strokeDashoffset)
    expect(offset).toBeGreaterThan(0)
    expect(offset).toBeLessThan(1)
    // 数据点等笔尖扫到才出现：笔尖还在起点附近，末端的点仍是透明的
    const dots = all('dot')
    expect(dots.length).toBeGreaterThan(1)
    expect(Number(getComputedStyle(dots.at(-1)!).opacity)).toBe(0)

    state.animated = false
    await settle()
    const final = all('bar').map(el => el.getBoundingClientRect())
    final.forEach((bar, i) => {
      expect(early[i]!.height).toBeLessThan(bar.height * 0.9)
      expect(Math.abs(early[i]!.bottom - bar.bottom)).toBeLessThanOrEqual(0.5)
    })
    expect(line.hasAttribute('data-drawing')).toBe(false)
    expect(getComputedStyle(line).strokeDasharray).toBe('none')
  })

  it('减弱动效：柱第一帧就是终值高度，只淡入；作者放慢了时长折线也不描', async () => {
    mount({ 'data': SALES, 'series': MIXED, 'animated': true, 'style': SLOW, 'data-motion': 'reduce' })
    await settle()
    const early = all('bar').map(el => ({ height: el.getBoundingClientRect().height, opacity: Number(el.getAttribute('opacity')) }))
    expect(early.every(bar => bar.opacity < 1)).toBe(true)
    expect(getComputedStyle(one('line')).animationName).toBe('none')
    app!.unmount()
    host!.remove()
    mount({ data: SALES, series: [{ mark: 'bar', x: 'month', y: 'amount' }] })
    await settle()
    all('bar').forEach((el, i) => expect(Math.abs(el.getBoundingClientRect().height - early[i]!.height)).toBeLessThanOrEqual(0.5))
  })
})
