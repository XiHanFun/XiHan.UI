// 步骤条的点状形态：圆点不盛内容，是纯位置标记，直径走空间尺，不随密度换档；
// 没走到的空心、走过的实心标记色、当前步实心品牌并放大一档；每个点都按当前步的直径占位，换步不挪版面。
// 竖排时连接线落在圆点的中轴上。几何与计算样式只有真实 Chromium 算得出，jsdom 不算数。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhStepsDescription,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Size = 'sm' | 'md' | 'lg'

interface MountOptions {
  size?: Size
  orientation?: 'horizontal' | 'vertical'
  value?: number
  tones?: Record<number, 'danger'>
  linear?: boolean
}

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.density
  delete document.documentElement.dataset.theme
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

async function mount(options: MountOptions = {}) {
  const value = ref(options.value ?? 1)
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  // 断言读的是终值：换面与环的淡入淡出时长归零
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  document.body.append(host)
  app = createApp({
    render: () => h(XhStepsRoot, {
      'variant': 'dot',
      'count': 3,
      'size': options.size,
      'orientation': options.orientation,
      'tones': options.tones,
      'linear': options.linear,
      'value': value.value,
      'onUpdate:value': (next: number) => { value.value = next },
    }, () => h(XhStepsList, null, () => [0, 1, 2].map(index => h(XhStepsItem, { key: index, value: index }, () => [
      h(XhStepsTrigger, null, () => [
        h(XhStepsIndicator),
        h(XhStepsTitle, null, () => `步骤 ${index + 1}`),
        h(XhStepsDescription, null, () => '步骤说明'),
      ]),
      h(XhStepsSeparator),
    ])))),
  })
  app.mount(host)
  await nextTick()
  const all = (part: string): HTMLElement[] => [...host!.querySelectorAll<HTMLElement>(`[data-scope="steps"][data-part="${part}"]`)]
  return { value, indicators: all('indicator'), triggers: all('trigger'), separators: all('separator') }
}

/** 令牌在夹具里解到的长度。 */
function tokenPx(name: string): number {
  const probe = document.createElement('span')
  probe.style.cssText = `display: block; inline-size: var(${name})`
  host!.append(probe)
  const value = probe.getBoundingClientRect().width
  probe.remove()
  return value
}

/** 语义色令牌在夹具里解到的颜色。 */
function token(name: string): string {
  const probe = document.createElement('span')
  probe.style.cssText = `color: var(${name})`
  host!.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

const canvas = document.createElement('canvas')
const context = canvas.getContext('2d', { willReadFrequently: true })!

function rgb(color: string): [number, number, number] {
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = '#fff'
  context.fillRect(0, 0, 1, 1)
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const data = context.getImageData(0, 0, 1, 1).data
  return [data[0]!, data[1]!, data[2]!]
}

function contrast(first: string, second: string): number {
  const luminance = ([r, g, b]: readonly [number, number, number]): number => {
    const linear = (channel: number): number => {
      const value = channel / 255
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  }
  const values = [luminance(rgb(first)), luminance(rgb(second))].sort((a, b) => b - a) as [number, number]
  return (values[0] + 0.05) / (values[1] + 0.05)
}

/** 各档的点径：走过与没走到的点、当前步放大一档的点 */
const DOT = {
  sm: { rest: '--xh-space-1_5', current: '--xh-space-2' },
  md: { rest: '--xh-space-2', current: '--xh-space-2_5' },
  lg: { rest: '--xh-space-2_5', current: '--xh-space-3' },
} as const

describe.each(['comfortable', 'compact'] as const)('点状形态的尺寸档（%s）', (density) => {
  it.each(['sm', 'md', 'lg'] as const)('%s 档的圆点走空间尺、不随密度换档，当前步放大一档', async (size) => {
    document.documentElement.dataset.density = density
    const { indicators } = await mount({ size })
    const rest = tokenPx(DOT[size].rest)
    const current = tokenPx(DOT[size].current)
    for (const [i, indicator] of indicators.entries()) {
      const rect = indicator.getBoundingClientRect()
      const expected = i === 1 ? current : rest
      expect(rect.width, `圆点 ${rect.width}×${rect.height}`).toBe(expected)
      expect(rect.height, `圆点 ${rect.width}×${rect.height}`).toBe(expected)
      expect(getComputedStyle(indicator).borderRadius).toBe('50%')
    }
    expect(current).toBeGreaterThan(rest)
    expect(current).not.toBe(tokenPx(`--xh-control-h-${size}`))
  })
})

describe('点状形态的三态', () => {
  it('没走到的空心粗圈、走过的实心标记色、当前步实心品牌', async () => {
    const { indicators } = await mount()
    const [completed, current, incomplete] = indicators.map(el => getComputedStyle(el))
    const thick = `${tokenPx('--xh-stroke-thick')}px`

    expect(incomplete!.borderTopWidth).toBe(thick)
    expect(incomplete!.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(incomplete!.borderTopColor).toBe(token('--xh-fg-muted'))

    expect(completed!.backgroundColor).toBe(token('--xh-fg-brand'))
    expect(completed!.borderTopColor).toBe(token('--xh-fg-brand'))

    expect(current!.backgroundColor).toBe(token('--xh-bg-brand'))
    expect(current!.borderTopColor).toBe(token('--xh-bg-brand'))
    expect(current!.boxShadow).toBe('none')
  })

  it('走过的点不画兜底对号：点状形态不盛内容', async () => {
    const { indicators } = await mount()
    expect(getComputedStyle(indicators[0]!, '::before').content).toBe('none')
  })

  it('没走到的空心圈在明暗两档都与页面拉开 3:1，是看得见的图形', async () => {
    for (const theme of ['light', 'dark'] as const) {
      document.documentElement.dataset.theme = theme
      document.body.style.backgroundColor = 'var(--xh-bg-canvas)'
      const { indicators } = await mount()
      const ring = getComputedStyle(indicators[2]!).borderTopColor
      expect(contrast(ring, getComputedStyle(document.body).backgroundColor), theme).toBeGreaterThanOrEqual(3)
      app!.unmount()
      app = null
      host!.remove()
    }
    document.body.style.backgroundColor = ''
  })

  it('当前步不画环：放大一档的实心点就是它与走过的点之间的形状通道', async () => {
    const { indicators } = await mount()
    for (const indicator of indicators)
      expect(getComputedStyle(indicator, '::after').opacity).toBe('0')
    expect(indicators[1]!.getBoundingClientRect().width).toBeGreaterThan(indicators[0]!.getBoundingClientRect().width)
  })

  it('每个点都按当前步的直径占位，点心在同一条线上，换步时每一步的触发器都不挪', async () => {
    const { value, indicators, triggers } = await mount()
    const footprint = tokenPx(DOT.md.current)
    const before = triggers.map(el => el.getBoundingClientRect().toJSON())
    const centers = indicators.map((indicator) => {
      const dot = indicator.getBoundingClientRect()
      const style = getComputedStyle(indicator)
      expect(dot.width + Number.parseFloat(style.marginLeft) + Number.parseFloat(style.marginRight)).toBe(footprint)
      return (dot.top + dot.bottom) / 2
    })
    expect(new Set(centers).size).toBe(1)
    value.value = 2
    await nextTick()
    expect(triggers.map(el => el.getBoundingClientRect().toJSON())).toEqual(before)
  })

  it('标了 danger 的那一步没走到时仍是空心圈、圈换语气色，心里只铺语气淡底；走到时实心换语气色', async () => {
    const { value, indicators } = await mount({ tones: { 2: 'danger' } })
    const toned = indicators[2]!
    const rest = getComputedStyle(toned)
    expect(rest.borderTopColor).not.toBe(token('--xh-fg-muted'))
    expect(rest.backgroundColor).not.toBe(rest.borderTopColor)
    value.value = 2
    await nextTick()
    const current = getComputedStyle(toned)
    expect(current.backgroundColor).not.toBe(token('--xh-bg-brand'))
    expect(current.borderTopColor).toBe(current.backgroundColor)
  })

  it('linear 未解锁的那几步禁用：空心圈退到禁用墨色，仍是空心', async () => {
    const { indicators } = await mount({ linear: true, value: 0 })
    const locked = getComputedStyle(indicators[2]!)
    expect(locked.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(locked.borderTopColor).toBe(token('--xh-fg-disabled'))
  })

  it('悬停与按下不把实心点换成中性面：行换面即是反馈，按下实心点换语气 active 档', async () => {
    const { indicators, triggers } = await mount()
    await userEvent.hover(triggers[0]!)
    expect(getComputedStyle(indicators[0]!).backgroundColor).toBe(token('--xh-fg-brand'))
    triggers[0]!.setAttribute('data-pressed', '')
    expect(getComputedStyle(indicators[0]!).backgroundColor).toBe(token('--xh-bg-brand-active'))
    expect(getComputedStyle(indicators[0]!).borderTopColor).toBe(token('--xh-bg-brand-active'))
    triggers[0]!.removeAttribute('data-pressed')
    await userEvent.unhover(triggers[0]!)
  })
})

describe('点状形态的竖排', () => {
  it('连接线落在圆点的中轴上', async () => {
    const { indicators, separators } = await mount({ orientation: 'vertical' })
    const dot = indicators[0]!.getBoundingClientRect()
    const line = separators[0]!.getBoundingClientRect()
    expect(Math.abs((line.left + line.right) / 2 - (dot.left + dot.right) / 2)).toBeLessThanOrEqual(0.5)
  })
})

describe('点状形态的强制色', () => {
  it('实心与空心在系统配色下仍分得开，当前步靠放大一档与走过的步分开；整行悬停涂成高亮时点照样看得见', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'forced-colors', value: 'active' }] })
    const { indicators, triggers } = await mount()
    const [completed, current, incomplete] = indicators.map(el => getComputedStyle(el))
    expect(completed!.backgroundColor).not.toBe(incomplete!.backgroundColor)
    expect(current!.backgroundColor).toBe(completed!.backgroundColor)
    expect(incomplete!.borderTopStyle).toBe('solid')
    expect(indicators[1]!.getBoundingClientRect().width).toBeGreaterThan(indicators[0]!.getBoundingClientRect().width)

    await userEvent.hover(triggers[1]!)
    const row = getComputedStyle(triggers[1]!).backgroundColor
    expect(getComputedStyle(indicators[1]!).backgroundColor).not.toBe(row)
    await userEvent.unhover(triggers[1]!)
  })
})
