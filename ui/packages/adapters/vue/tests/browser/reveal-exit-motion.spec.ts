// 提示框退场与重新露面的进场：图表提示框与热力图详情条隐去时留着上一回的内容与落点淡出；
// 关掉的警示条再显示时按实测高度展开；加载完的骨架屏再开始加载时淡入。
// 在播的过渡与补间途中的尺寸只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhAlertContent,
  XhAlertDescription,
  XhAlertRoot,
  XhAlertTitle,
  XhHeatmapRoot,
  XhPieChartRoot,
  XhSkeletonItem,
  XhSkeletonRoot,
} from '../../src'
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

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++) {
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function mountHost(): HTMLElement {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  for (const name of ['enter', 'exit', 'expand', 'collapse'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  return host
}

function part(scope: string, name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)!
}

function fading(el: Element): CSSTransition | undefined {
  return el.getAnimations().find(a => a instanceof CSSTransition && (a as CSSTransition).transitionProperty === 'opacity') as CSSTransition | undefined
}

function tween(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

describe('图表提示框隐去', () => {
  it('焦点离开扇区：提示框留着上一回的内容与落点淡出，不先变空、不跳回原点', async () => {
    mountHost()
    app = createApp({
      render: () => h('div', [
        h('button', { 'data-test-away': '' }, '别处'),
        h(XhPieChartRoot, { data: [{ c: '搜索', v: 40 }, { c: '直接访问', v: 30 }], nameField: 'c', valueField: 'v', labels: 'none', animated: false }, { caption: () => '访问来源' }),
      ]),
    })
    app.mount(host!)
    await frames(3)
    const slice = document.querySelector<HTMLElement>(`[data-scope='pie-chart'][data-part='slice']`)!
    slice.focus()
    await frames(2)
    const tooltip = part('pie-chart', 'tooltip')
    expect(tooltip.dataset.state).toBe('visible')
    for (const animation of tooltip.getAnimations())
      animation.finish()
    const text = tooltip.textContent
    const x = tooltip.style.getPropertyValue('--xh-_chart-tip-x')
    expect(text).not.toBe('')
    document.querySelector<HTMLElement>('[data-test-away]')!.focus()
    await frames(1)
    expect(tooltip.dataset.state).toBe('hidden')
    expect(fading(tooltip)).toBeDefined()
    expect(tooltip.textContent).toBe(text)
    expect(tooltip.style.getPropertyValue('--xh-_chart-tip-x')).toBe(x)
    expect(getComputedStyle(tooltip).visibility).toBe('visible')
  })

  it('热力图详情条隐去时同样留着上一格淡出', async () => {
    mountHost()
    app = createApp({
      render: () => h(XhHeatmapRoot, {
        startDate: '2026-01-05',
        endDate: '2026-01-18',
        value: [{ date: '2026-01-06', count: 3 }, { date: '2026-01-12', count: 9 }],
      }, {
        tooltip: (details: { count: number } | null) => [h('span', null, details ? `${details.count} 次` : '')],
      }),
    })
    app.mount(host!)
    await frames(3)
    const cell = document.querySelector<HTMLElement>(`[data-scope='heatmap'][data-part='cell'][data-value='2026-01-12']`)!
    await userEvent.hover(cell)
    const tooltip = part('heatmap', 'tooltip')
    await expect.poll(() => tooltip.dataset.state).toBe('visible')
    for (const animation of tooltip.getAnimations())
      animation.finish()
    expect(tooltip.textContent).toContain('9 次')
    await userEvent.hover(document.body, { position: { x: 1, y: 1 } })
    await expect.poll(() => tooltip.dataset.state).toBe('hidden')
    expect(fading(tooltip)).toBeDefined()
    expect(tooltip.textContent).toContain('9 次')
  })
})

describe('警示条重新显示', () => {
  it('关掉之后再显示：按实测高度从 0 展开，下面的内容一路挪下去', async () => {
    mountHost()
    const open = ref(false)
    app = createApp({
      render: () => h('div', [
        h(XhAlertRoot, { tone: 'warning', open: open.value }, () => h(XhAlertContent, null, () => [
          h(XhAlertTitle, null, () => '存储空间不足'),
          h(XhAlertDescription, null, () => '剩余空间低于 10%，请尽快清理'),
        ])),
        h('p', { 'data-test-below': '', 'style': 'margin:0' }, '下面的内容'),
      ]),
    })
    app.mount(host!)
    await frames(2)
    const below = document.querySelector<HTMLElement>('[data-test-below]')!
    const top = below.getBoundingClientRect().top
    open.value = true
    await frames(1)
    const root = part('alert', 'root')
    const expanding = tween(root)!
    expect(expanding).toBeDefined()
    expanding.pause()
    expanding.currentTime = 0
    expect(root.getBoundingClientRect().height).toBeLessThan(1)
    expect(Math.abs(below.getBoundingClientRect().top - top)).toBeLessThan(1)
    expanding.finish()
    expect(below.getBoundingClientRect().top - top).toBeGreaterThan(10)
  })
})

describe('骨架屏再开始加载', () => {
  it('挂载时就在加载的直接呈现；加载完之后再开始加载时淡入', async () => {
    mountHost()
    const loading = ref(true)
    app = createApp({
      render: () => h(XhSkeletonRoot, { loading: loading.value, style: 'inline-size: 260px' }, () => [h(XhSkeletonItem), h(XhSkeletonItem)]),
    })
    app.mount(host!)
    await frames(2)
    const root = part('skeleton', 'root')
    const names = (): string[] => root.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
    expect(names()).toEqual([])
    loading.value = false
    await frames(1)
    for (const animation of root.getAnimations())
      animation.finish()
    await expect.poll(() => root.hidden).toBe(true)
    loading.value = true
    await frames(1)
    expect(names()).toEqual(['xh-fade-in'])
  })
})
