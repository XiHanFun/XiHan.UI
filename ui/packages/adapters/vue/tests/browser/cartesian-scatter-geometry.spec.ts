// 直角坐标图的散点与气泡在真实布局里：点是可聚焦的标记、贴着定义域两端也不压在轴线上，
// 气泡的外接框与面积对得上，图例与提示框的色标画成点的形状，隐藏的裁切形状改为淡出。
// jsdom 量不出外接框与裁切，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhCartesianChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown>, width = 480): Record<string, unknown> {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  const state = reactive({ animated: false, ...props })
  app = createApp({
    render: () => h(XhCartesianChartRoot, state, { caption: () => '散点' }),
  })
  app.mount(host)
  return state
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function all(name: string): SVGGraphicsElement[] {
  return [...document.querySelectorAll<SVGGraphicsElement>(`[data-scope='cartesian-chart'][data-part='${name}']`)]
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const POINTS = [
  { x: 0, a: 0, b: 5 },
  { x: 5, a: 3, b: 1 },
  { x: 10, a: 10, b: 8 },
]

describe('散点', () => {
  it('点是 graphics-symbol，贴着定义域两端的点整个落在绘图区里、不压在坐标轴线上', async () => {
    mount({ data: POINTS, series: [{ mark: 'scatter', x: 'x', y: 'a' }] })
    await settle()
    const points = all('point')
    expect(points).toHaveLength(3)
    expect(points.every(p => p.getAttribute('role') === 'graphics-symbol')).toBe(true)
    const axis = all('axis-line')[0]!.getBoundingClientRect()
    const plot = document.querySelector<SVGElement>(`[data-scope='cartesian-chart'][data-part='plot']`)!.getBoundingClientRect()
    for (const p of points) {
      const box = p.getBoundingClientRect()
      expect(box.bottom).toBeLessThan(axis.top)
      expect(box.left).toBeGreaterThan(plot.left)
    }
  })

  it('键盘：Tab 落在第一个点上，方向键沿 x 走到下一个点', async () => {
    mount({ data: POINTS, series: [{ mark: 'scatter', x: 'x', y: 'a' }] })
    await settle()
    await userEvent.tab()
    await settle()
    const points = all('point')
    expect(document.activeElement).toBe(points[0])
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expect(document.activeElement?.getAttribute('data-key')).toBe(points[1]!.getAttribute('data-key'))
    // 焦点环按点的大小外扩，圆心落在点上
    const ring = all('focus-ring')[0]!.getBoundingClientRect()
    const own = (document.activeElement as SVGGraphicsElement).getBoundingClientRect()
    expect(ring.width).toBeGreaterThan(own.width)
    expect(ring.left + ring.width / 2).toBeCloseTo(own.left + own.width / 2, 0)
  })

  it('色标画成点的形状：第一个系列是圆，第二个系列按裁切多边形画成方块以外的形状时带裁切', async () => {
    mount({
      data: POINTS,
      series: [
        { mark: 'scatter', x: 'x', y: 'a' },
        { mark: 'scatter', x: 'x', y: 'b', symbol: 'diamond' },
      ],
    })
    await settle()
    const [circle, diamond] = all('legend-swatch') as unknown as HTMLElement[]
    expect(circle!.dataset.symbol).toBe('circle')
    expect(getComputedStyle(circle!).borderTopLeftRadius).toBe('50%')
    expect(getComputedStyle(diamond!).clipPath).toMatch(/^polygon\(/)
    // 隐藏的裁切形状画不出空心：改为淡出
    ;(all('legend-item')[1] as unknown as HTMLElement).click()
    await settle()
    expect(Number(getComputedStyle(diamond!).opacity)).toBeLessThan(1)
  })
})

describe('气泡', () => {
  it('外接框的面积之比等于大小之比，最大的直径是两倍柱厚上限', async () => {
    mount({
      data: [{ x: 1, y: 1, n: 100 }, { x: 2, y: 2, n: 400 }],
      series: [{ mark: 'scatter', x: 'x', y: 'y', size: 'n' }],
    })
    await settle()
    const [big, small] = all('point').map(p => p.getBBox())
    const barMax = Number.parseFloat(getComputedStyle(document.querySelector(`[data-scope='cartesian-chart'][data-part='root']`)!).getPropertyValue('--xh-_chart-metric-bar-max'))
    expect(big!.width).toBeCloseTo(barMax * 2, 0)
    expect((big!.width * big!.height) / (small!.width * small!.height)).toBeCloseTo(4, 1)
  })
})

/** 计算样式里的颜色换成 OKLab 明度：浏览器把 color-mix 算完后返回 oklch(L C H) 或 oklab(L a b)。 */
function lightness(css: string): number {
  const m = /okl(?:ch|ab)\(\s*([\d.]+)/.exec(css)
  if (!m)
    throw new Error(`颜色不是 oklch / oklab：${css}`)
  return Number(m[1])
}

describe('按值着色', () => {
  const HEAT = [1, 2, 3, 4, 5].map(i => ({ x: i, y: i, t: i * 10 }))

  it('浅色主题下值越大越深；色板换了色相，明度走向不变', async () => {
    mount({ data: HEAT, series: [{ mark: 'scatter', x: 'x', y: 'y', color: 't' }] })
    await settle()
    const ls = all('point').map(p => lightness(getComputedStyle(p).fill))
    for (let i = 1; i < ls.length; i++)
      expect(ls[i]!).toBeLessThan(ls[i - 1]!)
    const before = getComputedStyle(all('point')[4]!).fill
    app?.unmount()
    host?.remove()
    mount({ data: HEAT, series: [{ mark: 'scatter', x: 'x', y: 'y', color: 't' }], palette: 'teal' })
    await settle()
    const teal = all('point').map(p => getComputedStyle(p).fill)
    expect(teal[4]).not.toBe(before)
    const tl = teal.map(lightness)
    for (let i = 1; i < tl.length; i++)
      expect(tl[i]!).toBeLessThan(tl[i - 1]!)
  })

  it('深色主题下反过来：值越大越亮，始终是离承载面越远越显眼；写了色板也一样', async () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    try {
      for (const palette of [undefined, 'teal']) {
        mount({ data: HEAT, series: [{ mark: 'scatter', x: 'x', y: 'y', color: 't' }], palette })
        await settle()
        const ls = all('point').map(p => lightness(getComputedStyle(p).fill))
        for (let i = 1; i < ls.length; i++)
          expect(ls[i]!).toBeGreaterThan(ls[i - 1]!)
        app?.unmount()
        host?.remove()
        app = null
        host = null
      }
    }
    finally {
      document.documentElement.removeAttribute('data-theme')
    }
  })

  it('色阶图例：渐变条有宽度、画着渐变，两端的值与名字排在一行', async () => {
    mount({ data: HEAT, series: [{ mark: 'scatter', x: 'x', y: 'y', color: 't' }] })
    await settle()
    const bar = all('legend-scale-bar')[0] as unknown as HTMLElement
    expect(bar.getBoundingClientRect().width).toBeGreaterThan(40)
    expect(getComputedStyle(bar).backgroundImage).toMatch(/^linear-gradient/)
    // 渐变的起点就是值最小的那个点的颜色：图例读到的颜色与点上的一致
    const first = /linear-gradient\([^,]+,\s*(okl(?:ch|ab)\([^)]*\))/.exec(getComputedStyle(bar).backgroundImage)?.[1]
    expect(first).toBe(getComputedStyle(all('point')[0]!).fill)
    const [min, max] = all('legend-scale-value') as unknown as HTMLElement[]
    expect(min!.textContent).toBe('10')
    expect(max!.textContent).toBe('50')
    expect(Math.abs(min!.getBoundingClientRect().top - max!.getBoundingClientRect().top)).toBeLessThan(1)
  })
})
