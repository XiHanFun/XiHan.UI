import type { App, VNode } from 'vue'
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSwitch } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

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

function luminance([r, g, b]: readonly [number, number, number]): number {
  const linear = (channel: number): number => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

function contrast(first: string, second: string): number {
  const values = [luminance(rgb(first)), luminance(rgb(second))].sort((a, b) => b - a) as [number, number]
  return (values[0] + 0.05) / (values[1] + 0.05)
}

function resolveColor(element: Element, value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  element.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function track(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}'][data-part='root']`)
  if (!element)
    throw new Error(`找不到 switch/${id}`)
  return element
}

function thumb(id: string): HTMLElement {
  const element = track(id).querySelector<HTMLElement>(`[data-scope='switch'][data-part='thumb']`)
  if (!element)
    throw new Error(`找不到 switch/${id}/thumb`)
  return element
}

async function mount(nodes: VNode[], attrs: Record<string, string> = {}): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h('div', attrs, nodes) })
  app.mount(host)
  await nextTick()
  await finishMotion()
}

async function finishMotion(): Promise<void> {
  await nextTick()
  for (const animation of document.getAnimations()) {
    try {
      animation.finish()
    }
    catch {}
  }
}

async function holdSpace(element: HTMLElement): Promise<void> {
  await userEvent.keyboard('{Tab}')
  element.focus()
  await userEvent.keyboard('{Space>}')
  await finishMotion()
}

async function releaseSpace(): Promise<void> {
  await userEvent.keyboard('{/Space}')
  await finishMotion()
}

afterEach(async () => {
  try {
    await userEvent.keyboard('{/Space}')
  }
  catch {}
  app?.unmount()
  host?.remove()
  app = null
  host = null
  delete document.documentElement.dataset.theme
  delete document.documentElement.dataset.contrast
  document.body.style.removeProperty('background-color')
  document.body.style.removeProperty('color')
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('switch 实体轨道与 raised 滑块', () => {
  it.each(['light', 'dark'] as const)('%s：开关两态、边界与滑块材质保持可辨', async (theme) => {
    document.documentElement.dataset.theme = theme
    document.body.style.backgroundColor = 'var(--xh-bg-canvas)'
    document.body.style.color = 'var(--xh-fg-default)'
    await mount([
      h(XhSwitch, { 'data-testid': 'off' }),
      h(XhSwitch, { 'data-testid': 'on', 'defaultChecked': true }),
      h(XhSwitch, { 'data-testid': 'readonly', 'defaultChecked': true, 'readOnly': true }),
    ])

    const page = getComputedStyle(document.body).backgroundColor
    const off = getComputedStyle(track('off'))
    const on = getComputedStyle(track('on'))
    const readonly = getComputedStyle(track('readonly'))
    const offBorder = resolveColor(track('off'), 'var(--xh-_switch-track-border)')
    const readonlyBorder = resolveColor(track('readonly'), 'var(--xh-_switch-track-border)')

    expect(contrast(offBorder, page), '未选中轨道边界与页面').toBeGreaterThanOrEqual(3)
    expect(contrast(readonlyBorder, page), '只读轨道边界与页面').toBeGreaterThanOrEqual(3)
    expect(contrast(on.backgroundColor, page), '选中轨道与页面').toBeGreaterThanOrEqual(3)
    expect(off.backgroundColor).not.toBe(on.backgroundColor)
    expect(readonly.backgroundColor).not.toBe(on.backgroundColor)
    expect(off.boxShadow).toContain('inset')
    expect(off.backdropFilter).toBe('none')

    // 滑块是 raised 抬起面：surface-raised 底 + border-default 描边 + raised 影，无顶光
    const knob = getComputedStyle(thumb('off'))
    expect(knob.backgroundColor).toBe(resolveColor(thumb('off'), 'var(--xh-bg-surface-raised)'))
    expect(knob.borderStyle).toBe('solid')
    expect(knob.borderColor).toBe(resolveColor(thumb('off'), 'var(--xh-border-default)'))
    expect(knob.backgroundImage).toBe('none')
    expect(knob.boxShadow).not.toBe('none')
  })

  it('按下时轨道缩放并换底：未选中保持轨道面、选中换到 active 档；禁用轨道改中性面不降 opacity', async () => {
    await mount([
      h(XhSwitch, { 'data-testid': 'live' }),
      h(XhSwitch, { 'data-testid': 'checked', 'defaultChecked': true }),
      h(XhSwitch, { 'data-testid': 'disabled', 'disabled': true }),
      h(XhSwitch, { 'data-testid': 'disabled-on', 'defaultChecked': true, 'disabled': true }),
    ])
    const rest = getComputedStyle(track('live')).backgroundColor
    // 轨道接 Action Control text 档（§9.1 定尺轨道）：家族给按压与过渡，几何仍是 40 × 22 的轨道，滑块贴起始端
    expect(track('live').getAttribute('data-xh-action-control')).toBe('')
    expect(track('live').getAttribute('data-xh-action-profile')).toBe('text')
    expect(track('live').getAttribute('data-xh-action-variant')).toBe('outline')
    expect(track('live').getBoundingClientRect().width).toBe(40)
    expect(track('live').getBoundingClientRect().height).toBe(22)
    expect(getComputedStyle(track('live')).justifyContent).toBe('start')
    expect(thumb('live').getBoundingClientRect().left - track('live').getBoundingClientRect().left).toBe(2)
    expect(getComputedStyle(track('live')).borderTopWidth).toBe('0px')
    expect(getComputedStyle(track('live')).transitionProperty.split(', ')).toContain('scale')
    // 悬停不换面：阶梯只给按下（静息已是 300 档）
    await userEvent.hover(track('live'))
    await finishMotion()
    expect(getComputedStyle(track('live')).backgroundColor).toBe(rest)
    await userEvent.unhover(track('live'))
    await holdSpace(track('live'))
    expect(getComputedStyle(track('live')).scale).toBe('0.97')
    expect(getComputedStyle(track('live')).backgroundColor).toBe(rest)
    expect(getComputedStyle(thumb('live')).boxShadow).toBe('none')
    await releaseSpace()
    await holdSpace(track('checked'))
    expect(getComputedStyle(track('checked')).backgroundColor).toBe(resolveColor(track('checked'), 'var(--xh-bg-brand-active)'))
    await releaseSpace()

    for (const id of ['disabled', 'disabled-on']) {
      const style = getComputedStyle(track(id))
      expect(style.opacity, id).toBe('1')
      expect(style.backgroundColor, id).toBe(resolveColor(track(id), 'var(--xh-bg-subtle)'))
      expect(resolveColor(track(id), 'var(--xh-_switch-track-border)'), id).toBe(resolveColor(track(id), 'var(--xh-border-default)'))
      expect(getComputedStyle(thumb(id)).color, id).toBe(resolveColor(track(id), 'var(--xh-fg-disabled)'))
      expect(getComputedStyle(thumb(id)).boxShadow, id).toBe('none')
    }
  })

  it('标签文字随 size 档取控件字号，禁用标签落 fg-subtle', async () => {
    await mount([
      h(XhSwitch, { 'data-testid': 'sm', 'size': 'sm' }, () => '小'),
      h(XhSwitch, { 'data-testid': 'md' }, () => '中'),
      h(XhSwitch, { 'data-testid': 'lg', 'size': 'lg' }, () => '大'),
      h(XhSwitch, { 'data-testid': 'disabled', 'disabled': true }, () => '禁用'),
    ])
    const labels = [...document.querySelectorAll<HTMLElement>(`[data-scope='switch'][data-part='label']`)]
    const px = (token: string): number => {
      const span = document.createElement('span')
      span.style.fontSize = `var(${token})`
      labels[1]!.append(span)
      const value = Number.parseFloat(getComputedStyle(span).fontSize)
      span.remove()
      return value
    }
    expect(Number.parseFloat(getComputedStyle(labels[0]!).fontSize)).toBe(px('--xh-control-font-sm'))
    expect(Number.parseFloat(getComputedStyle(labels[1]!).fontSize)).toBe(px('--xh-control-font-md'))
    expect(Number.parseFloat(getComputedStyle(labels[2]!).fontSize)).toBe(px('--xh-control-font-lg'))
    expect(getComputedStyle(labels[3]!).color).toBe(resolveColor(labels[3]!, 'var(--xh-fg-subtle)'))
  })

  it('disabled、readonly 与 loading 各自使用正确光标和海拔；滑块静息即 raised，悬停不再升档', async () => {
    await mount([
      h(XhSwitch, { 'data-testid': 'live', 'defaultChecked': true }, () => '实时同步'),
      h(XhSwitch, { 'data-testid': 'disabled', 'defaultChecked': true, 'disabled': true }, () => '已禁用'),
      h(XhSwitch, { 'data-testid': 'readonly', 'defaultChecked': true, 'readOnly': true }, () => '只读'),
      h(XhSwitch, { 'data-testid': 'loading', 'defaultChecked': true, 'loading': true }, () => '提交中'),
      h(XhSwitch, { 'data-testid': 'disabled-loading', 'disabled': true, 'loading': true }, () => '禁用且提交中'),
    ])
    const labels = [...document.querySelectorAll<HTMLElement>(`[data-scope='switch'][data-part='label']`)]
    const roots = labels.map(label => label.querySelector<HTMLElement>(`[data-part='root']`)!)
    const thumbs = roots.map(root => root.querySelector<HTMLElement>(`[data-part='thumb']`)!)

    expect(getComputedStyle(roots[0]!).cursor).toBe('pointer')
    expect(getComputedStyle(roots[1]!).cursor).toBe('not-allowed')
    expect(getComputedStyle(roots[2]!).cursor).toBe('default')
    expect(getComputedStyle(roots[3]!).cursor).toBe('progress')
    expect(getComputedStyle(labels[1]!).cursor).toBe('not-allowed')
    expect(getComputedStyle(labels[2]!).cursor).toBe('default')
    expect(getComputedStyle(labels[3]!).cursor).toBe('progress')
    expect(getComputedStyle(roots[4]!).cursor).toBe('not-allowed')
    expect(getComputedStyle(labels[4]!).cursor).toBe('not-allowed')
    expect(getComputedStyle(roots[1]!).opacity).toBe('1')
    expect(getComputedStyle(roots[2]!).opacity).toBe('1')
    const restShadow = getComputedStyle(thumbs[0]!).boxShadow
    expect(restShadow).not.toBe('none')
    expect(getComputedStyle(thumbs[1]!).boxShadow).toBe('none')
    expect(getComputedStyle(thumbs[2]!).boxShadow).toBe('none')
    expect(getComputedStyle(thumbs[3]!, '::after').animationName).toBe('xh-switch-rotate')
    expect(roots[3]!.getBoundingClientRect().width).toBeCloseTo(roots[0]!.getBoundingClientRect().width, 1)
    expect(roots[3]!.getBoundingClientRect().height).toBeCloseTo(roots[0]!.getBoundingClientRect().height, 1)
    expect(thumbs[3]!.getBoundingClientRect().width).toBeCloseTo(thumbs[0]!.getBoundingClientRect().width, 1)

    await userEvent.hover(roots[0]!)
    await finishMotion()
    expect(getComputedStyle(thumbs[0]!).boxShadow).toBe(restShadow)
    const loadingShadow = getComputedStyle(thumbs[3]!).boxShadow
    await userEvent.hover(roots[3]!)
    await finishMotion()
    expect(getComputedStyle(thumbs[3]!).boxShadow).toBe(loadingShadow)
  })

  it.each(['light', 'dark'] as const)('%s 高对比轴：轨道与滑块仍由实体边界分层', async (theme) => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.contrast = 'more'
    document.body.style.backgroundColor = 'var(--xh-bg-canvas)'
    await mount([
      h(XhSwitch, { 'data-testid': 'off' }),
      h(XhSwitch, { 'data-testid': 'on', 'defaultChecked': true }),
    ])

    const page = getComputedStyle(document.body).backgroundColor
    for (const id of ['off', 'on']) {
      const boundary = resolveColor(track(id), 'var(--xh-_switch-track-border)')
      expect(contrast(boundary, page), `${theme}/${id}`).toBeGreaterThanOrEqual(3)
      expect(getComputedStyle(thumb(id)).borderStyle).toBe('solid')
    }
  })

  it('forced-colors：轨道、滑块、只读与键盘焦点仍有独立几何通道', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    await mount([
      h(XhSwitch, { 'data-testid': 'off' }),
      h(XhSwitch, { 'data-testid': 'readonly', 'readOnly': true }),
    ])

    const off = getComputedStyle(track('off'))
    const readonly = getComputedStyle(track('readonly'))
    const knob = getComputedStyle(thumb('off'))
    expect(off.outlineStyle).toBe('solid')
    expect(off.outlineWidth).toBe('1px')
    expect(readonly.outlineStyle).toBe('dashed')
    expect(knob.borderStyle).toBe('solid')
    expect(knob.backgroundImage).toBe('none')
    expect(knob.boxShadow).toBe('none')

    await userEvent.keyboard('{Tab}')
    track('readonly').focus()
    expect(track('readonly').matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(track('readonly')).outlineStyle).toBe('solid')
  })

  it('键盘聚焦环在明暗与开关两态下都达到 3:1', async () => {
    for (const theme of ['light', 'dark'] as const) {
      document.documentElement.dataset.theme = theme
      document.body.style.backgroundColor = 'var(--xh-bg-canvas)'
      await mount([
        h(XhSwitch, { 'data-testid': 'off' }),
        h(XhSwitch, { 'data-testid': 'on', 'defaultChecked': true }),
      ])

      for (const id of ['off', 'on']) {
        const element = track(id)
        await userEvent.keyboard('{Tab}')
        element.focus()
        expect(element.matches(':focus-visible')).toBe(true)
        const style = getComputedStyle(element)
        expect(contrast(style.outlineColor, style.backgroundColor), `${theme}/${id}`).toBeGreaterThanOrEqual(3)
      }

      app?.unmount()
      host?.remove()
      app = null
      host = null
    }
  })

  it('按住时滑块沿轴拉长；loading、readonly 与 reduce 不产生虚假位移', async () => {
    await mount([
      h(XhSwitch, { 'data-testid': 'live' }),
      h(XhSwitch, { 'data-testid': 'checked', 'defaultChecked': true }),
      h(XhSwitch, { 'data-testid': 'loading', 'loading': true }),
      h(XhSwitch, { 'data-testid': 'readonly', 'readOnly': true }),
      h('span', { 'data-motion': 'reduce' }, [h(XhSwitch, { 'data-testid': 'reduce' })]),
    ])

    const liveWidth = thumb('live').getBoundingClientRect().width
    const liveInset = thumb('live').getBoundingClientRect().left - track('live').getBoundingClientRect().left
    await holdSpace(track('live'))
    expect(thumb('live').getBoundingClientRect().width).toBeGreaterThan(liveWidth)
    expect(thumb('live').getBoundingClientRect().left - track('live').getBoundingClientRect().left).toBeCloseTo(liveInset, 0)
    expect(getComputedStyle(track('live')).scale).not.toBe('none')
    await releaseSpace()

    const checkedWidth = thumb('checked').getBoundingClientRect().width
    const checkedInset = track('checked').getBoundingClientRect().right - thumb('checked').getBoundingClientRect().right
    await holdSpace(track('checked'))
    expect(thumb('checked').getBoundingClientRect().width).toBeGreaterThan(checkedWidth)
    expect(track('checked').getBoundingClientRect().right - thumb('checked').getBoundingClientRect().right).toBeCloseTo(checkedInset, 0)
    await releaseSpace()

    for (const id of ['loading', 'readonly', 'reduce']) {
      const width = thumb(id).getBoundingClientRect().width
      await holdSpace(track(id))
      expect(thumb(id).getBoundingClientRect().width, id).toBeCloseTo(width, 1)
      if (id === 'reduce')
        expect(getComputedStyle(track(id)).scale).toBe('1')
      await releaseSpace()
    }
  })

  it('三尺寸与 compact 密度逐档收放，RTL 仍从 inline-start 移到 inline-end', async () => {
    await mount([
      h(XhSwitch, { 'data-testid': 'sm', 'size': 'sm' }),
      h(XhSwitch, { 'data-testid': 'md' }),
      h(XhSwitch, { 'data-testid': 'lg', 'size': 'lg' }),
      h('span', { 'data-density': 'compact' }, [h(XhSwitch, { 'data-testid': 'compact' })]),
      h('span', { dir: 'ltr' }, [
        h(XhSwitch, { 'data-testid': 'ltr-off' }),
        h(XhSwitch, { 'data-testid': 'ltr-on', 'defaultChecked': true }),
      ]),
      h('span', { dir: 'rtl' }, [
        h(XhSwitch, { 'data-testid': 'rtl-off' }),
        h(XhSwitch, { 'data-testid': 'rtl-on', 'defaultChecked': true }),
      ]),
    ])
    const heights = ['sm', 'md', 'lg'].map(id => track(id).getBoundingClientRect().height)
    const knobs = ['sm', 'md', 'lg'].map(id => thumb(id).getBoundingClientRect().height)

    expect(heights[0]).toBeLessThan(heights[1]!)
    expect(heights[1]).toBeLessThan(heights[2]!)
    expect(knobs[0]).toBeLessThan(knobs[1]!)
    expect(knobs[1]).toBeLessThan(knobs[2]!)
    expect(track('compact').getBoundingClientRect().height).toBeLessThan(track('md').getBoundingClientRect().height)
    expect(thumb('ltr-on').getBoundingClientRect().left).toBeGreaterThan(thumb('ltr-off').getBoundingClientRect().left)
    expect(thumb('rtl-on').getBoundingClientRect().left).toBeLessThan(thumb('rtl-off').getBoundingClientRect().left)
  })
})
