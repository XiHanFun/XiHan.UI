// 迷你图在真实布局里的几何：缺省宽 6rem、高一行字高且不撑高所在的行，线与末点不被根的边裁掉，
// 组件槽改尺寸后重新计算几何而线宽不随之缩放，参考带铺满宽度；入场描线、减弱动效不描，强制色取系统色。
// jsdom 量不出这些，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhSparkline } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

const VISITS = [320, 356, 341, 398, 420, 388, 452, 470, 431, 498, 520, 548]

/** 挂一行正文，迷你图放在字中间：量行高是否被它撑开。 */
function mount(props: Record<string, unknown>, text = true): Record<string, unknown> {
  host = document.createElement('div')
  host.style.cssText = 'font-size: 16px; line-height: 1.5; inline-size: 480px'
  document.body.append(host)
  // 几何用例看终态；过渡用例显式打开 animated
  const state = reactive({ 'data': VISITS, 'animated': false, 'aria-label': '近 12 周访问量', ...props })
  app = createApp({
    render: () => h('div', { 'data-test-line': '' }, text ? ['本周访问 ', h(XhSparkline, state), ' 548 次'] : [h(XhSparkline, state)]),
  })
  app.mount(host)
  return state
}

async function settle(): Promise<void> {
  await nextTick()
  // 根的量测按帧合并，等两帧让尺寸与度量都落下来
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function all(name: string): SVGElement[] {
  return [...document.querySelectorAll<SVGElement>(`[data-scope='sparkline'][data-part='${name}']`)]
}

function one(name: string): SVGElement {
  const element = all(name)[0]
  if (!element)
    throw new Error(`找不到 sparkline/${name}`)
  return element
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('尺寸', () => {
  it('缺省宽 6rem、高一行字高；放在一行字里不撑高这一行', async () => {
    mount({})
    await settle()
    const root = one('root').getBoundingClientRect()
    const rootFont = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    expect(root.width).toBeCloseTo(rootFont * 6, 1)
    expect(root.height).toBeCloseTo(24, 1)
    const line = document.querySelector('[data-test-line]')!.getBoundingClientRect()
    expect(line.height).toBeLessThanOrEqual(24.5)
  })

  it('折线与末点都在根里：末点的外圈不被根的边裁掉', async () => {
    mount({})
    await settle()
    const root = one('root').getBoundingClientRect()
    const dot = one('dot').getBoundingClientRect()
    const line = one('line').getBoundingClientRect()
    for (const box of [dot, line]) {
      expect(box.left).toBeGreaterThanOrEqual(root.left - 0.5)
      expect(box.right).toBeLessThanOrEqual(root.right + 0.5)
      expect(box.top).toBeGreaterThanOrEqual(root.top - 0.5)
      expect(box.bottom).toBeLessThanOrEqual(root.bottom + 0.5)
    }
    // 末点在最右、最高的那个位置
    expect(dot.right).toBeGreaterThan(root.right - 12)
    expect(dot.top).toBeLessThan(root.top + 4)
  })

  it('组件槽改宽高后几何重新计算，线宽不随之缩放', async () => {
    mount({ style: '--xh-sparkline-width: 300px; --xh-sparkline-height: 60px' }, false)
    await settle()
    const root = one('root').getBoundingClientRect()
    expect(root.width).toBeCloseTo(300, 1)
    expect(root.height).toBeCloseTo(60, 1)
    expect(one('root').getAttribute('viewBox')).toBe('0 0 300 60')
    expect(one('line').getBoundingClientRect().width).toBeGreaterThan(280)
    expect(getComputedStyle(one('line')).strokeWidth).toBe('2px')
  })

  it('参考带横贯整个宽度，画在折线之下', async () => {
    mount({ band: [300, 400], markers: 'none' })
    await settle()
    const root = one('root').getBoundingClientRect()
    const band = one('band').getBoundingClientRect()
    expect(band.left).toBeCloseTo(root.left, 1)
    expect(band.width).toBeCloseTo(root.width, 1)
    expect(one('band').compareDocumentPosition(one('line')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('盈亏：正负两排柱等高，中线两侧对称', async () => {
    mount({ data: [3, -2, 5, -1], variant: 'win-loss' })
    await settle()
    const root = one('root').getBoundingClientRect()
    const bars = all('bar').map(el => el.getBoundingClientRect())
    expect(new Set(bars.map(b => Math.round(b.height)))).toHaveLength(1)
    expect(bars[0]!.top).toBeCloseTo(root.top, 1)
    expect(bars[1]!.bottom).toBeCloseTo(root.bottom, 1)
  })
})

describe('颜色', () => {
  it('缺省中性：线取弱化色，末点取分类色 1；写了语气整条取语气色', async () => {
    const state = mount({})
    await settle()
    const probe = document.createElement('span')
    document.body.append(probe)
    const colorOf = (value: string): string => {
      probe.style.color = value
      return getComputedStyle(probe).color
    }
    expect(getComputedStyle(one('line')).stroke).toBe(colorOf('var(--xh-chart-deemphasis)'))
    expect(getComputedStyle(one('dot')).fill).toBe(colorOf('var(--xh-chart-categorical-1)'))
    state.tone = 'danger'
    await settle()
    expect(getComputedStyle(one('line')).stroke).toBe(getComputedStyle(one('dot')).fill)
    expect(getComputedStyle(one('line')).stroke).not.toBe(colorOf('var(--xh-chart-deemphasis)'))
    probe.remove()
  })

  it('强制色：线取系统前景色，末点取强调色', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'forced-colors', value: 'active' }] })
    mount({})
    await settle()
    const probe = document.createElement('span')
    probe.style.cssText = 'color: CanvasText; background-color: Highlight; forced-color-adjust: none'
    document.body.append(probe)
    expect(getComputedStyle(one('line')).stroke).toBe(getComputedStyle(probe).color)
    expect(getComputedStyle(one('dot')).fill).toBe(getComputedStyle(probe).backgroundColor)
    probe.remove()
  })
})

describe('过渡', () => {
  // 把时长拉长到几秒：量第一帧时过渡一定还在半路，不受机器快慢影响
  const SLOW = '--xh-motion-duration-reveal: 4s; --xh-motion-duration-morph: 4s; --xh-motion-duration-enter: 4s'

  it('入场：折线由描线关键帧描出，末点等笔尖到了才出现；关掉 animated 直接落到终态', async () => {
    const state = mount({ animated: true, style: SLOW })
    await settle()
    const line = one('line')
    expect(line.hasAttribute('data-drawing')).toBe(true)
    await expect.poll(
      () => Number.parseFloat(getComputedStyle(line).strokeDashoffset),
      { timeout: 2000 },
    ).toBeLessThan(1)
    const offset = Number.parseFloat(getComputedStyle(line).strokeDashoffset)
    expect(offset).toBeGreaterThan(0)
    expect(Number(getComputedStyle(one('dot')).opacity)).toBe(0)
    state.animated = false
    await settle()
    expect(line.hasAttribute('data-drawing')).toBe(false)
    expect(getComputedStyle(line).strokeDasharray).toBe('none')
  })

  it('入场：柱从基线长出，底边不动', async () => {
    mount({ variant: 'bar', animated: true, style: SLOW })
    await settle()
    const early = all('bar').map(el => el.getBoundingClientRect())
    app!.unmount()
    host!.remove()
    mount({ variant: 'bar' })
    await settle()
    all('bar').forEach((el, i) => {
      const bar = el.getBoundingClientRect()
      expect(early[i]!.height).toBeLessThan(bar.height * 0.9)
      expect(Math.abs(early[i]!.bottom - bar.bottom)).toBeLessThanOrEqual(0.5)
    })
  })

  it('减弱动效：作者放慢了时长折线也不描，只随过渡淡入', async () => {
    mount({ 'animated': true, 'style': SLOW, 'data-motion': 'reduce' })
    await settle()
    expect(getComputedStyle(one('line')).animationName).toBe('none')
  })
})
