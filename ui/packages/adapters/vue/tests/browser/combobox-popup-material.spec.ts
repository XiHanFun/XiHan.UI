import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxLoading,
  XhComboboxPositioner,
  XhComboboxRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='combobox'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少组合框部件：${name}`)
  return element
}

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

async function mount(theme: 'light' | 'dark', loading = false): Promise<void> {
  host = document.createElement('div')
  host.dataset.theme = theme
  document.body.append(host)
  app = createApp({ render: () => h(XhComboboxRoot, {
    collection: [],
    defaultOpen: true,
    loading,
  }, () => [
    h(XhComboboxControl, null, () => h(XhComboboxInput)),
    h(XhComboboxPositioner, null, () => [
      h(XhComboboxContent),
      h(XhComboboxEmpty, null, () => '没有匹配候选'),
      h(XhComboboxLoading, null, () => '正在查询候选'),
    ]),
  ]) })
  app.mount(host)
  await nextTick()
  await nextTick()
  await expect.poll(() => part('content').getBoundingClientRect().width).toBeGreaterThan(0)
  part('content').getAnimations().forEach(animation => animation.finish())
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('组合框 M2 浮层', () => {
  it.each(['light', 'dark'] as const)('%s：局部主题跨 Portal 生效，输入与浮层分层', async (theme) => {
    await mount(theme)
    const control = getComputedStyle(part('control'))
    const content = getComputedStyle(part('content'))
    expect(alpha(control.backgroundColor)).toBe(255)
    expect(control.backdropFilter).toBe('none')
    expect(part('positioner').closest<HTMLElement>('[data-theme]')?.dataset.theme).toBe(theme)
    expect(content.backdropFilter).toContain('blur(16px)')
    expect(alpha(content.backgroundColor)).toBeLessThan(255)
    expect(alpha(content.backgroundColor)).toBeGreaterThan(220)
    expect(content.boxShadow).not.toBe('none')
    const highlight = getComputedStyle(part('content'), '::before')
    expect(alpha(highlight.backgroundColor)).toBeGreaterThan(0)
    expect(highlight.pointerEvents).toBe('none')
  })

  it.each([false, true])('loading=%s：状态文字绘制在磨砂面之上且不产生第二层表面', async (loading) => {
    await mount('dark', loading)
    const status = part(loading ? 'loading' : 'empty')
    const content = part('content')
    expect(status.hidden).toBe(false)
    expect(part(loading ? 'empty' : 'loading').hidden).toBe(true)
    expect(status.parentElement).toBe(content.parentElement)
    expect(content.getAttribute('role')).toBe('listbox')
    expect(status.getAttribute('role')).toBe('status')
    const style = getComputedStyle(status)
    expect(alpha(style.backgroundColor)).toBe(0)
    expect(style.borderTopWidth).toBe('0px')
    expect(style.boxShadow).toBe('none')
    expect(style.backdropFilter).toBe('none')
    const expected = document.createElement('span')
    expected.style.color = 'var(--xh-material-frosted-fg-muted)'
    status.append(expected)
    expect(style.color).toBe(getComputedStyle(expected).color)
    expected.remove()
    // 状态平时不接收指针；临时开启命中，验证其绘制次序未被滤镜表面盖住。
    status.style.pointerEvents = 'auto'
    const rect = status.getBoundingClientRect()
    expect(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)).toBe(status)
  })

  it.each(['light', 'dark'] as const)('%s：增强对比度使用实体背景与清晰边界', async (theme) => {
    await mount(theme)
    part('positioner').dataset.contrast = 'more'
    const content = getComputedStyle(part('content'))
    expect(content.backdropFilter).toBe('none')
    expect(alpha(content.backgroundColor)).toBe(255)
    expect(content.borderTopStyle).toBe('solid')
    expect(alpha(getComputedStyle(part('content'), '::before').backgroundColor)).toBe(0)
  })

  it('四向短位移不缩放，嵌套面板不继承外层方向', async () => {
    await mount('light')
    const outer = part('positioner')
    const inner = document.createElement('div')
    inner.dataset.scope = 'combobox'
    inner.dataset.part = 'positioner'
    outer.dataset.placement = 'bottom-start'
    outer.append(inner)
    const sides = ['up', 'down', 'left', 'right']
    for (const [placement, expected] of [
      ['top-start', ['0', '1', '0', '0']],
      ['bottom-start', ['1', '0', '0', '0']],
      ['left-start', ['0', '0', '0', '1']],
      ['right-start', ['0', '0', '1', '0']],
    ] as const) {
      inner.dataset.placement = placement
      const style = getComputedStyle(inner)
      expect(sides.map(side => style.getPropertyValue(`--xh-_overlay-enter-${side}`).trim())).toEqual(expected)
    }
    const content = part('content')
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-in')
    expect(getComputedStyle(content).scale).toBe('none')
    content.dataset.state = 'closed'
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-out')
  })

  it('减弱动效进退场为 1ms 且位移归零', async () => {
    await mount('light')
    part('positioner').dataset.motion = 'reduce'
    for (const state of ['open', 'closed']) {
      part('content').dataset.state = state
      const style = getComputedStyle(part('content'))
      expect(style.animationDuration).toBe('0.001s')
      expect(style.getPropertyValue('--xh-motion-distance-sm').trim()).toBe('0px')
      expect(style.scale).toBe('none')
    }
  })

  it('可用宽度低于锚点下界时仍能收窄', async () => {
    await mount('light')
    const content = part('content')
    content.style.setProperty('--xh-_combobox-available-w', '160px')
    content.style.setProperty('--xh-_combobox-anchor-w', '360px')
    expect(content.getBoundingClientRect().width).toBeLessThanOrEqual(160)
  })
})
