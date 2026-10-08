// 图表配色方案：祖先上写 data-xh-chart-palette 即换掉分类色槽，系列色跟着换；主题单色取品牌色阶，
// 随 data-brand 换色；嵌套区域可以改回缺省方案；方案下面的暗色子树取方案的暗色一套。
// 取值落在令牌层，jsdom 不解析层叠与 color-mix，只在 Chromium 验证。
import type { App } from 'vue'
import { registerBrand } from '@xihan-ui/tokens'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhCartesianChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let outer: HTMLElement | null = null
const cleanups: Array<() => void> = []

const DATA = [
  { month: '一月', a: 100, b: 80, c: 60 },
  { month: '二月', a: 200, b: 120, c: 90 },
]
const SERIES = ['a', 'b', 'c'].map(y => ({ mark: 'bar', x: 'month', y, name: y }))

/** 外层容器是配色方案的祖先，inner 是图表的宿主（可以再写一层自己的属性）。 */
function mount(outerAttrs: Record<string, string> = {}, innerAttrs: Record<string, string> = {}): HTMLElement {
  outer = document.createElement('div')
  for (const [name, value] of Object.entries(outerAttrs))
    outer.setAttribute(name, value)
  const inner = document.createElement('div')
  inner.style.inlineSize = '480px'
  for (const [name, value] of Object.entries(innerAttrs))
    inner.setAttribute(name, value)
  outer.append(inner)
  document.body.append(outer)
  app = createApp({ render: () => h(XhCartesianChartRoot, { data: DATA, series: SERIES, animated: false }, { caption: () => '配色' }) })
  app.mount(inner)
  return inner
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

/** 每个系列第一根柱的计算填充色。 */
function seriesFills(scope: Element): string[] {
  return SERIES.map(({ y }) => {
    const bar = scope.querySelector<SVGElement>(`[data-scope='cartesian-chart'][data-part='series'][data-series-id='${y}'] [data-part='bar']`)
    if (!bar)
      throw new Error(`找不到系列 ${y} 的柱`)
    return getComputedStyle(bar).fill
  })
}

/** 在 scope 里把一支令牌解析成计算后的颜色。 */
function tokenColor(scope: Element, token: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty('color', `var(${token})`)
  scope.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

afterEach(async () => {
  app?.unmount()
  outer?.remove()
  app = null
  outer = null
  for (const cleanup of cleanups.splice(0))
    cleanup()
  document.documentElement.removeAttribute('data-brand')
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('配色方案换掉分类色槽', () => {
  it('不写方案时取多彩分类：前三个系列是三个不同的色相', async () => {
    const inner = mount()
    await settle()
    const fills = seriesFills(inner)
    expect(fills).toEqual([1, 2, 3].map(n => tokenColor(inner, `--xh-chart-palette-categorical-${n}`)))
    expect(new Set(fills).size).toBe(3)
  })

  it('主题单色：系列依次取品牌 600、500、400，由深到浅', async () => {
    const inner = mount({ 'data-xh-chart-palette': 'monochrome' })
    await settle()
    expect(seriesFills(inner)).toEqual(['600', '500', '400'].map(step => tokenColor(inner, `--xh-color-brand-${step}`)))
  })

  it('柔和品牌与莫兰迪柔彩：系列取各自方案的色槽，且与缺省不同', async () => {
    for (const scheme of ['brand', 'muted']) {
      const inner = mount({ 'data-xh-chart-palette': scheme })
      await settle()
      const fills = seriesFills(inner)
      expect(fills).toEqual([1, 2, 3].map(n => tokenColor(inner, `--xh-chart-palette-${scheme}-${n}`)))
      expect(fills).not.toEqual([1, 2, 3].map(n => tokenColor(inner, `--xh-chart-palette-categorical-${n}`)))
      app!.unmount()
      outer!.remove()
    }
  })

  it('运行中改写祖先上的方案，系列色跟着换', async () => {
    const inner = mount({ 'data-xh-chart-palette': 'muted' })
    await settle()
    const muted = seriesFills(inner)
    outer!.setAttribute('data-xh-chart-palette', 'monochrome')
    await settle()
    const mono = seriesFills(inner)
    expect(mono).not.toEqual(muted)
    expect(mono[0]).toBe(tokenColor(inner, '--xh-color-brand-600'))
  })

  it('嵌套区域写 categorical 改回缺省方案', async () => {
    const inner = mount({ 'data-xh-chart-palette': 'monochrome' }, { 'data-xh-chart-palette': 'categorical' })
    await settle()
    expect(seriesFills(inner)).toEqual([1, 2, 3].map(n => tokenColor(inner, `--xh-chart-palette-categorical-${n}`)))
  })

  it('方案下面的暗色子树取方案的暗色一套：主题单色从暗色主题色 500 起', async () => {
    const inner = mount({ 'data-xh-chart-palette': 'monochrome' }, { 'data-theme': 'dark' })
    await settle()
    expect(seriesFills(inner)).toEqual(['500', '600', '700'].map(step => tokenColor(inner, `--xh-color-brand-${step}`)))
  })

  it('主题单色随 data-brand 换色：换成紫色品牌后系列 1 是新品牌的主题色', async () => {
    cleanups.push(registerBrand('violet', '#6c5ce7'))
    document.documentElement.setAttribute('data-brand', 'violet')
    const inner = mount({ 'data-xh-chart-palette': 'monochrome' })
    await settle()
    const [first] = seriesFills(inner)
    expect(first).toBe(tokenColor(inner, '--xh-color-brand-600'))
    expect(first).toBe(tokenColor(document.body, '--xh-color-brand-600'))
    expect(first).not.toBe(tokenColor(inner, '--xh-color-indigo-600'))
  })
})
