// Spinner 的默认渐隐弧与三档尺寸依赖真实伪元素样式。
import type { Size } from '@xihan-ui/core'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhSpinner } from '../../src'
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

async function mount(size?: Size, variant?: 'ring' | 'arc' | 'dots'): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.color = 'rgb(120, 80, 200)'
  document.body.append(host)
  app = createApp({ render: () => h(XhSpinner, { label: '加载中', size, variant }) })
  app.mount(host)
  await nextTick()
  return document.querySelector<HTMLElement>('[data-scope="spinner"][data-part="root"]')!
}

describe('加载指示器的默认渐隐弧', () => {
  it.each([
    { size: 'sm', edge: 16 },
    { size: undefined, edge: 20 },
    { size: 'lg', edge: 24 },
  ] as const)('$size 档直径为 $edge px', async ({ size, edge }) => {
    const root = await mount(size)
    const graphic = getComputedStyle(root, '::before')
    expect(root.dataset.variant).toBe('arc')
    expect(Number.parseFloat(graphic.width)).toBe(edge)
    expect(Number.parseFloat(graphic.height)).toBe(edge)
    expect(graphic.backgroundImage).toContain('conic-gradient')
    // 弧取品牌色，不随宿主的字色
    const probe = document.createElement('span')
    probe.style.color = 'var(--xh-fg-brand)'
    root.append(probe)
    const brand = getComputedStyle(probe).color
    probe.remove()
    expect(graphic.backgroundImage).toContain(brand)
    expect(graphic.backgroundImage).not.toContain('rgb(120, 80, 200)')
    expect(getComputedStyle(root).pointerEvents).toBe('none')
  })
})

describe('三点档错相', () => {
  function wave(root: HTMLElement): CSSAnimation {
    const [animation] = root.getAnimations({ subtree: true })
      .filter(a => (a as CSSAnimation).animationName === 'xh-spinner-dots') as CSSAnimation[]
    return animation!
  }

  it('三点不同步明暗：整组不透明度恒定，明暗由一条沿行扫过的遮罩给出，三点依次亮起', async () => {
    const root = await mount(undefined, 'dots')
    const animation = wave(root)
    const frames = (animation.effect as KeyframeEffect).getKeyframes()
    expect(frames.some(frame => 'opacity' in frame)).toBe(false)
    expect(frames.every(frame => Object.keys(frame).some(key => /MaskPosition/i.test(key)))).toBe(true)

    animation.pause()
    const positions = new Set<string>()
    for (const at of [0.2, 0.5, 0.8]) {
      animation.currentTime = Number(animation.effect!.getComputedTiming().duration) * at
      const graphic = getComputedStyle(root, '::before')
      expect(graphic.opacity).toBe('1')
      positions.add(graphic.maskPosition)
    }
    expect(positions.size).toBe(3)
  })

  it('rtl 下扫向跟着书写方向掉头', async () => {
    document.documentElement.dir = 'rtl'
    try {
      const root = await mount(undefined, 'dots')
      // 三枚点左右对称：整层水平翻过来，遮罩的扫向随之掉头
      expect(getComputedStyle(root, '::before').scale).toBe('-1 1')
      document.documentElement.removeAttribute('dir')
      expect(getComputedStyle(root, '::before').scale).toBe('1')
    }
    finally {
      document.documentElement.removeAttribute('dir')
    }
  })

  it('减弱动效下停住，三点满不透明度静止', async () => {
    document.documentElement.dataset.motion = 'reduce'
    try {
      const root = await mount(undefined, 'dots')
      const graphic = getComputedStyle(root, '::before')
      expect(graphic.animationName).toBe('none')
      expect(graphic.maskImage).toBe('none')
      expect(graphic.opacity).toBe('1')
    }
    finally {
      delete document.documentElement.dataset.motion
    }
  })
})

describe('高对比档', () => {
  afterEach(async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  })

  /** 同一档里并排挂一枚不带语气、一枚带语气的转圈。 */
  async function mountPair(variant: 'ring' | 'arc' | 'dots'): Promise<[HTMLElement, HTMLElement]> {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => [
        h(XhSpinner, { label: '加载中', variant }),
        h(XhSpinner, { label: '加载中', variant, tone: 'danger' }),
      ],
    })
    app.mount(host)
    await nextTick()
    const [plain, toned] = host.querySelectorAll<HTMLElement>('[data-scope="spinner"][data-part="root"]')
    return [plain!, toned!]
  }

  /** 系统色关键字在这一档里解出的颜色：探针退出强制换色，读回的就是关键字本身的值。 */
  function systemColor(keyword: string): string {
    const probe = document.createElement('span')
    probe.style.cssText = `forced-color-adjust: none; color: ${keyword}`
    host!.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }

  it.each(['ring', 'arc', 'dots'] as const)('%s 带语气时仍退回 Highlight 弧与 Canvas 缺口，语气色与背景图一并让位', async (variant) => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
    expect(matchMedia('(forced-colors: active)').matches).toBe(true)
    const [plain, toned] = await mountPair(variant)
    const base = getComputedStyle(plain, '::before')
    const tone = getComputedStyle(toned, '::before')

    expect(base.borderRightColor).toBe(systemColor('Highlight'))
    expect(base.borderTopColor).toBe(systemColor('Canvas'))
    expect(tone.borderRightColor).toBe(base.borderRightColor)
    expect(tone.borderTopColor).toBe(base.borderTopColor)
    expect(tone.borderRightStyle).toBe('solid')
    expect(tone.backgroundImage).toBe('none')
  })
})
