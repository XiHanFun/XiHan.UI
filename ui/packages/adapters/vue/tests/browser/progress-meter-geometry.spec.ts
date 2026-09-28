// 进度条在真实布局里的几何：环形的填充画在环上（线形那套按比例的平移不作用在弧上），
// 子弹图的色带、填充、目标刻度与量程刻度按比例落位，仪表盘的指针按当前值的角度转过去。
// jsdom 量不出这些，只在 Chromium 验证。
import type { ProgressThreshold } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhProgress } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

const ZONES: ProgressThreshold[] = [
  { value: 60, tone: 'success', label: '正常' },
  { value: 85, tone: 'warning', label: '警戒' },
  { value: 100, tone: 'danger', label: '过载' },
]

function mount(props: Record<string, unknown>, label?: string): Record<string, unknown> {
  host = document.createElement('div')
  host.style.inlineSize = '400px'
  document.body.append(host)
  const state = reactive({ 'aria-label': '量', ...props })
  app = createApp({ render: () => h(XhProgress, state, label == null ? undefined : () => label) })
  app.mount(host)
  return state
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

function all(name: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='progress'][data-part='${name}']`)]
}

function one(name: string): HTMLElement {
  const element = all(name)[0]
  if (!element)
    throw new Error(`找不到 progress/${name}`)
  return element
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('环形', () => {
  it('环形的填充画在环上，不被按比例的平移挪出画面', async () => {
    mount({ variant: 'circle', value: 50 })
    await settle()
    const canvas = one('canvas').getBoundingClientRect()
    const range = one('range').getBoundingClientRect()
    expect(getComputedStyle(one('range')).translate).toBe('none')
    expect(range.left).toBeGreaterThanOrEqual(canvas.left - 1)
    expect(range.right).toBeLessThanOrEqual(canvas.right + 1)
    expect(range.width).toBeGreaterThan(0)
  })

  it('仪表盘的指针按当前值的角度转过去，填充收起、色带留着', async () => {
    const state = mount({ variant: 'dashboard', semantics: 'meter', value: 50, thresholds: ZONES, indicator: 'needle' }, '50%')
    await settle()
    const needle = one('needle')
    // 缺省缺口 75° 朝下：一半处正对 12 点
    expect(getComputedStyle(needle).rotate).toBe('270deg')
    expect(getComputedStyle(one('range')).display).toBe('none')
    expect(all('threshold')).toHaveLength(3)
    state.value = 72
    await settle()
    expect(getComputedStyle(needle).rotate).not.toBe('270deg')
    expect(getComputedStyle(one('label')).alignSelf).toBe('end')
  })
})

describe('仪表盘的数值动效', () => {
  it('指针转动与圆弧填充同属数值角色：同一次值变化两者同一档时长与曲线，指针不领先于弧', async () => {
    mount({ variant: 'dashboard', semantics: 'meter', value: 50, thresholds: ZONES, indicator: 'needle' }, '50%')
    await settle()
    const needle = getComputedStyle(one('needle'))
    const arc = getComputedStyle(one('range'))
    expect(needle.transitionProperty).toBe('rotate')
    expect(arc.transitionProperty).toBe('stroke-dashoffset')
    expect(needle.transitionDuration).toBe(arc.transitionDuration)
    expect(needle.transitionTimingFunction).toBe(arc.transitionTimingFunction)
  })
})

describe('子弹图', () => {
  it('色带按上界比例落位，填充收窄压在色带正中，目标刻度落在目标值上', async () => {
    mount({ semantics: 'meter', value: 72, thresholds: ZONES, target: 80 })
    await settle()
    const track = one('track').getBoundingClientRect()
    const bands = all('threshold').map(el => el.getBoundingClientRect())
    expect(bands[0]!.width).toBeCloseTo(track.width * 0.6, 0)
    expect(bands[1]!.left).toBeCloseTo(track.left + track.width * 0.6, 0)
    const range = one('range').getBoundingClientRect()
    expect(range.height).toBeCloseTo(track.height / 2, 0)
    expect((range.top + range.bottom) / 2).toBeCloseTo((track.top + track.bottom) / 2, 0)
    const target = one('target').getBoundingClientRect()
    expect((target.left + target.right) / 2).toBeCloseTo(track.left + track.width * 0.8, 0)
    expect(target.top).toBeLessThan(track.top)
    expect(target.bottom).toBeGreaterThan(track.bottom)
  })

  it('量程刻度排在轨道下方：两端的刻度值贴着轨道两端，中间的居中在刻度线上', async () => {
    mount({ semantics: 'meter', value: 40, scale: true })
    await settle()
    const track = one('track').getBoundingClientRect()
    const labels = all('scale-label').map(el => el.getBoundingClientRect())
    const ticks = all('scale-tick').map(el => el.getBoundingClientRect())
    expect(labels).toHaveLength(6)
    expect(labels[0]!.left).toBeCloseTo(track.left, 0)
    expect(labels.at(-1)!.right).toBeCloseTo(track.right, 0)
    expect((labels[2]!.left + labels[2]!.right) / 2).toBeCloseTo((ticks[2]!.left + ticks[2]!.right) / 2, 0)
    expect(labels[0]!.top).toBeGreaterThan(track.bottom)
  })

  it('从右往左的文字方向下：色带、目标与刻度从右往左排', async () => {
    host = document.createElement('div')
    host.dir = 'rtl'
    host.style.inlineSize = '400px'
    document.body.append(host)
    app = createApp({ render: () => h(XhProgress, { 'semantics': 'meter', 'value': 40, 'thresholds': ZONES, 'target': 80, 'scale': true, 'aria-label': '量' }) })
    app.mount(host)
    await settle()
    const track = one('track').getBoundingClientRect()
    expect(all('threshold')[0]!.getBoundingClientRect().right).toBeCloseTo(track.right, 0)
    const target = one('target').getBoundingClientRect()
    expect((target.left + target.right) / 2).toBeCloseTo(track.right - track.width * 0.8, 0)
    expect(all('scale-label')[0]!.getBoundingClientRect().right).toBeCloseTo(track.right, 0)
  })
})
