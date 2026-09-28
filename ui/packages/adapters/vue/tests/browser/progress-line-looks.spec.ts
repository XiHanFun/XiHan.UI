// 线形的三样外观在真实布局里的样子：分段把轨道切成等宽的格、填充按整格走；条纹进行中流动、完成与减弱动效下静止；
// 缓冲段按比例落位、压在填充之下，RTL 下从右往左长。jsdom 量不出这些，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhProgress } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown>, attrs: Record<string, string> = {}): Record<string, unknown> {
  host = document.createElement('div')
  host.style.inlineSize = '400px'
  for (const [name, value] of Object.entries(attrs))
    host.setAttribute(name, value)
  document.body.append(host)
  const state = reactive({ 'aria-label': '进度', ...props })
  app = createApp({ render: () => h(XhProgress, state) })
  app.mount(host)
  return state
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

function one(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='progress'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 progress/${name}`)
  return element
}

/** 平移过渡落定之后的几何：先把过渡关掉再量，免得量到半路。 */
function settledRect(el: HTMLElement): DOMRect {
  el.style.transition = 'none'
  return el.getBoundingClientRect()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('分段', () => {
  it('轨道被遮罩切成格；填充按整格走，3.5 格只亮到第 3 格的末端', async () => {
    mount({ value: 35, steps: 10 })
    await settle()
    const track = one('track')
    const mask = getComputedStyle(track).maskImage
    expect(mask).toContain('repeating-linear-gradient')
    const box = track.getBoundingClientRect()
    const range = settledRect(one('range'))
    expect(range.right).toBeCloseTo(box.left + box.width * 0.3, 0)
  })

  it('没分段时轨道不带遮罩', async () => {
    mount({ value: 35 })
    await settle()
    expect(getComputedStyle(one('track')).maskImage).toBe('none')
  })
})

describe('条纹', () => {
  it('进行中铺斜纹并流动，完成后静止', async () => {
    const state = mount({ value: 40, striped: true })
    await settle()
    const range = one('range')
    expect(getComputedStyle(range).backgroundImage).toContain('linear-gradient')
    expect(getComputedStyle(range).animationName).toBe('xh-progress-stripes')
    state.value = 100
    await settle()
    expect(getComputedStyle(range).backgroundImage).toContain('linear-gradient')
    expect(getComputedStyle(range).animationName).toBe('none')
  })

  it('减弱动效下斜纹留着、不流动', async () => {
    mount({ value: 40, striped: true }, { 'data-motion': 'reduce' })
    await settle()
    const range = one('range')
    expect(getComputedStyle(range).backgroundImage).toContain('linear-gradient')
    expect(getComputedStyle(range).animationName).toBe('none')
  })
})

describe('缓冲', () => {
  it('缓冲段按比例落位、压在填充之下，颜色与填充和底槽都不同', async () => {
    mount({ value: 30, buffer: 60 })
    await settle()
    const box = one('track').getBoundingClientRect()
    const buffer = settledRect(one('buffer'))
    const range = settledRect(one('range'))
    // 平移后的盒子一半在轨道外，由轨道裁掉：露出来的那段止于缓冲比例处
    expect(buffer.right).toBeCloseTo(box.left + box.width * 0.6, 0)
    expect(range.right).toBeCloseTo(box.left + box.width * 0.3, 0)
    // 填充压在缓冲段之上：在两段重叠处取到的是填充
    const probe = document.elementFromPoint(box.left + box.width * 0.15, (box.top + box.bottom) / 2)
    expect(probe).toBe(one('range'))
    const colors = new Set([one('buffer'), one('range'), one('track')].map(el => getComputedStyle(el).backgroundColor))
    expect(colors.size).toBe(3)
  })

  it('从右往左排版时，缓冲段从行首（右端）往左长', async () => {
    mount({ value: 30, buffer: 60 }, { dir: 'rtl' })
    await settle()
    const box = one('track').getBoundingClientRect()
    const buffer = settledRect(one('buffer'))
    expect(buffer.left).toBeCloseTo(box.right - box.width * 0.6, 0)
  })
})
