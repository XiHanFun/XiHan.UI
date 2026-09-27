// 直角坐标图的刷选在真实浏览器里：真指针在绘图区拖出一段，框取整到首尾类目的整条带、画在柱之下，
// 松手派发一次；框外的柱按计算样式淡出；开了刷选时指针是十字、触屏只拦刷选的方向；
// jsdom 没有布局与计算样式，只在 Chromium 验证。
import type { CartesianBrushSelectionChangeDetails } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhCartesianChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown>): CartesianBrushSelectionChangeDetails[] {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  const changes: CartesianBrushSelectionChangeDetails[] = []
  const state = reactive({ animated: false, onBrushSelectionChange: (details: CartesianBrushSelectionChangeDetails) => changes.push(details), ...props })
  app = createApp({ render: () => h(XhCartesianChartRoot, state, { caption: () => '刷选' }) })
  app.mount(host)
  return changes
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function part(name: string): SVGGraphicsElement {
  return document.querySelector<SVGGraphicsElement>(`[data-scope='cartesian-chart'][data-part='${name}']`)!
}

function all(name: string): SVGGraphicsElement[] {
  return [...document.querySelectorAll<SVGGraphicsElement>(`[data-scope='cartesian-chart'][data-part='${name}']`)]
}

/** CDP 的坐标是 CSS 像素乘页面缩放：先派一次移动量出比例。 */
async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月']
const BARS = {
  data: MONTHS.map((month, i) => ({ month, v: 10 + i })),
  series: [{ mark: 'bar', x: 'month', y: 'v' }],
  brush: 'x',
}

describe('刷选', () => {
  it('真指针拖出一段：框盖住首尾类目的整条带、画在柱之下，松手派发一次，框外的柱淡出', async () => {
    const changes = mount(BARS)
    await settle()
    const scale = await mouseScale()
    const bars = all('bar').map(bar => bar.getBoundingClientRect())
    // 从三月的柱中间拖到五月的柱中间
    const y = (bars[2]!.top + bars[2]!.bottom) / 2 / scale
    const from = (bars[2]!.left + bars[2]!.right) / 2 / scale
    const to = (bars[4]!.left + bars[4]!.right) / 2 / scale
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from, y })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, x: from, y })
    for (let i = 1; i <= 4; i++)
      await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', x: from + ((to - from) * i) / 4, y })
    await settle()
    expect(changes).toHaveLength(0)
    expect(part('plot').hasAttribute('data-dragging')).toBe(true)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, x: to, y })
    await settle()
    expect(changes).toHaveLength(1)
    expect(changes[0]!.selection).toEqual({ x: ['三月', '五月'], y: null })
    // 按下不抢焦点：焦点没被转投到锚点上，也就没有弹出的提示框
    expect(document.activeElement?.closest('[data-scope=\'cartesian-chart\']')).toBeNull()
    expect(part('tooltip').getAttribute('data-state')).not.toBe('visible')
    expect(changes[0]!.data.map(d => d.key)).toEqual(['三月', '四月', '五月'])
    const box = part('brush')
    const rect = box.getBoundingClientRect()
    expect(rect.left).toBeLessThanOrEqual(bars[2]!.left)
    expect(rect.right).toBeGreaterThanOrEqual(bars[4]!.right)
    // 垫在柱之下：文档序在系列之前
    expect(box.compareDocumentPosition(all('series')[0]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(getComputedStyle(box).fill).not.toBe('none')
    const opacity = all('bar').map(bar => Number(getComputedStyle(bar).opacity))
    expect(opacity[3]).toBe(1)
    expect(opacity[0]).toBeLessThan(1)
  })

  it('开了刷选时指针是十字；触屏只拦刷选的方向，竖着滑照常滚页面', async () => {
    mount(BARS)
    await settle()
    expect(getComputedStyle(part('plot')).cursor).toBe('crosshair')
    expect(getComputedStyle(part('plot')).touchAction).toBe('pan-y')
  })
})
