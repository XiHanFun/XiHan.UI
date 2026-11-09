// 提示框退场与重新露面的进场：图表提示框与热力图详情条隐去时留着上一回的内容与落点淡出；
// 关掉的警示条再显示时按实测高度展开；加载完的骨架屏再开始加载时淡入。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

type XhElement = HTMLElement & { updateComplete: Promise<unknown>, [key: string]: unknown }

let host: HTMLElement | null = null

beforeEach(() => {
  setDiagnosticsLevel('silent')
})

afterEach(() => {
  host?.remove()
  host = null
  setDiagnosticsLevel('warn')
})

async function settle(el: XhElement): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    await el.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mount(tag: string, setup: (el: XhElement) => void, markup = ''): Promise<XhElement> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  for (const name of ['enter', 'exit', 'expand', 'collapse'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  const el = document.createElement(tag) as XhElement
  el.innerHTML = markup
  setup(el)
  host.append(el)
  await settle(el)
  return el
}

function part(scope: string, name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)!
}

function fading(el: Element): Animation | undefined {
  return el.getAnimations().find(a => a instanceof CSSTransition && (a as CSSTransition).transitionProperty === 'opacity')
}

function tween(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

describe('xh-pie-chart 与 xh-heatmap 提示框隐去', () => {
  it('焦点离开扇区：提示框留着上一回的内容与落点淡出', async () => {
    const away = document.createElement('button')
    away.textContent = '别处'
    const chart = await mount('xh-pie-chart', (el) => {
      el.setAttribute('name-field', 'c')
      el.setAttribute('value-field', 'v')
      el.setAttribute('labels', 'none')
      el.data = [{ c: '搜索', v: 40 }, { c: '直接访问', v: 30 }]
    }, `<figure data-xh-part="root">
      <figcaption data-xh-part="caption">访问来源</figcaption>
      <div data-xh-part="viewport"><svg data-xh-part="plot"></svg><div data-xh-part="tooltip"></div></div>
    </figure>`)
    host!.prepend(away)
    const slice = document.querySelector<HTMLElement>(`[data-scope='pie-chart'][data-part='slice']`)!
    slice.focus()
    await settle(chart)
    const tooltip = part('pie-chart', 'tooltip')
    await expect.poll(() => tooltip.dataset.state).toBe('visible')
    for (const animation of tooltip.getAnimations())
      animation.finish()
    const text = tooltip.textContent
    const x = tooltip.style.getPropertyValue('--xh-_chart-tip-x')
    expect(text).not.toBe('')
    away.focus()
    await settle(chart)
    expect(tooltip.dataset.state).toBe('hidden')
    expect(fading(tooltip)).toBeDefined()
    expect(tooltip.textContent).toBe(text)
    expect(tooltip.style.getPropertyValue('--xh-_chart-tip-x')).toBe(x)
  })

  it('热力图详情条隐去时落点不跳回原点', async () => {
    const heatmap = await mount('xh-heatmap', (el) => {
      el.setAttribute('start-date', '2026-01-05')
      el.setAttribute('end-date', '2026-01-18')
      el.value = [{ date: '2026-01-06', count: 3 }, { date: '2026-01-12', count: 9 }]
    }, '<div data-xh-part="root"><div data-xh-part="tooltip"></div></div>')
    const cell = document.querySelector<HTMLElement>(`[data-scope='heatmap'][data-part='cell'][data-value='2026-01-12']`)!
    await userEvent.hover(cell)
    const tooltip = part('heatmap', 'tooltip')
    await expect.poll(() => tooltip.dataset.state).toBe('visible')
    for (const animation of tooltip.getAnimations())
      animation.finish()
    const x = tooltip.style.getPropertyValue('--xh-_heatmap-tip-x')
    expect(x).not.toBe('')
    await userEvent.hover(document.body, { position: { x: 1, y: 1 } })
    await settle(heatmap)
    await expect.poll(() => tooltip.dataset.state).toBe('hidden')
    expect(fading(tooltip)).toBeDefined()
    expect(tooltip.style.getPropertyValue('--xh-_heatmap-tip-x')).toBe(x)
  })
})

describe('xh-alert 与 xh-skeleton 重新露面', () => {
  it('警示条关掉之后再显示：按实测高度从 0 展开', async () => {
    const alert = await mount('xh-alert', (el) => {
      el.setAttribute('tone', 'warning')
      el.open = false
    }, `<div data-xh-part="root"><div data-xh-part="content"><div data-xh-part="title">存储空间不足</div><div data-xh-part="description">剩余空间低于 10%，请尽快清理</div></div></div>`)
    const below = document.createElement('p')
    below.style.margin = '0'
    below.textContent = '下面的内容'
    host!.append(below)
    const top = below.getBoundingClientRect().top
    alert.open = true
    await settle(alert)
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

  it('骨架屏加载完之后再开始加载时淡入', async () => {
    const skeleton = await mount('xh-skeleton', (el) => {
      el.loading = true
    }, `<div data-xh-part="root" style="inline-size: 260px"><div data-xh-part="item"></div><div data-xh-part="item"></div></div>`)
    const root = part('skeleton', 'root')
    const names = (): string[] => root.getAnimations().filter(a => a instanceof CSSAnimation).map(a => (a as CSSAnimation).animationName)
    expect(names()).toEqual([])
    skeleton.loading = false
    await settle(skeleton)
    for (const animation of root.getAnimations())
      animation.finish()
    await expect.poll(() => root.hidden || getComputedStyle(root).display === 'none').toBe(true)
    skeleton.loading = true
    await settle(skeleton)
    expect(names()).toEqual(['xh-fade-in'])
  })
})
