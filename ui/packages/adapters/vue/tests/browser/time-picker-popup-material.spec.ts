import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerPreset,
  XhTimePickerPresetGroup,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='time-picker'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少时间选择部件：${name}`)
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

async function mount(theme: 'light' | 'dark', dir: 'ltr' | 'rtl' = 'ltr'): Promise<void> {
  host = document.createElement('div')
  host.dataset.theme = theme
  host.dir = dir
  document.body.append(host)
  app = createApp({ render: () => h(XhTimePickerRoot, {
    dir,
    defaultOpen: true,
    defaultValue: '09:30',
    presets: [{ value: '09:30', label: '上午九点半' }],
  }, () => [
    h(XhTimePickerControl, null, () => [
      h(XhTimePickerSegmentGroup, null, () => [
        h(XhTimePickerSegment, { segment: 'hour' }),
        h('span', ':'),
        h(XhTimePickerSegment, { segment: 'minute' }),
      ]),
      h(XhTimePickerTrigger),
    ]),
    h(XhTimePickerPositioner, null, () => h(XhTimePickerContent, null, () => [
      h(XhTimePickerPresetGroup, null, () => h(XhTimePickerPreset, { value: '09:30' })),
      ...(['hour', 'minute'] as const).map(unit => h(XhTimePickerColumn, { unit }, () =>
        Array.from({ length: unit === 'hour' ? 24 : 60 }, (_, index) => h(XhTimePickerItem, {
          value: String(index).padStart(2, '0'),
        }, () => String(index).padStart(2, '0'))))),
    ])),
  ]) })
  app.mount(host)
  await nextTick()
  await nextTick()
  await expect.poll(() => part('content').getBoundingClientRect().width).toBeGreaterThan(0)
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('时间选择 M2 浮层', () => {
  it.each(['light', 'dark'] as const)('%s：实体输入与单一磨砂浮层分层，局部主题跨 Portal 生效', async (theme) => {
    await mount(theme)
    const control = getComputedStyle(part('control'))
    const content = getComputedStyle(part('content'))
    expect(control.backdropFilter).toBe('none')
    expect(alpha(control.backgroundColor)).toBe(255)
    expect(part('positioner').closest<HTMLElement>('[data-theme]')?.dataset.theme).toBe(theme)
    expect(content.backdropFilter).toContain('blur(16px)')
    expect(alpha(content.backgroundColor)).toBeLessThan(255)
    expect(alpha(content.backgroundColor)).toBeGreaterThan(220)
    expect(content.boxShadow).not.toBe('none')
    const highlight = getComputedStyle(part('content'), '::before')
    expect(alpha(highlight.backgroundColor)).toBeGreaterThan(0)
    expect(highlight.pointerEvents).toBe('none')
    for (const name of ['column', 'preset-group']) {
      const style = getComputedStyle(part(name))
      expect(style.backdropFilter).toBe('none')
      expect(style.boxShadow).toBe('none')
      expect(alpha(style.backgroundColor)).toBe(0)
    }
  })

  it.each(['light', 'dark'] as const)('%s：增强对比度改用实体表面并关闭顶光', async (theme) => {
    await mount(theme)
    part('positioner').dataset.contrast = 'more'
    const content = getComputedStyle(part('content'))
    expect(content.backdropFilter).toBe('none')
    expect(alpha(content.backgroundColor)).toBe(255)
    expect(content.borderTopStyle).toBe('solid')
    expect(alpha(getComputedStyle(part('content'), '::before').backgroundColor)).toBe(0)
  })

  it.each(['ltr', 'rtl'] as const)('%s：快捷选项与数字列使用统一逻辑分隔线', async (dir) => {
    await mount('dark', dir)
    const columns = document.querySelectorAll<HTMLElement>(`[data-scope='time-picker'][data-part='column']`)
    const preset = getComputedStyle(part('preset-group'))
    const secondColumn = getComputedStyle(columns[1]!)
    const expected = document.createElement('span')
    expected.style.color = 'var(--xh-material-frosted-separator)'
    part('content').append(expected)
    const separator = getComputedStyle(expected).color
    expect(preset.borderInlineEndColor).toBe(separator)
    expect(secondColumn.borderInlineStartColor).toBe(separator)
    expect(preset.borderInlineEndWidth).toBe(secondColumn.borderInlineStartWidth)
    expect(preset.borderInlineStartWidth).toBe('0px')
    expected.remove()
  })

  it('四向短位移不缩放，嵌套层不继承父层方向', async () => {
    await mount('light')
    const outer = part('positioner')
    const inner = document.createElement('div')
    inner.dataset.scope = 'time-picker'
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
    for (const state of ['open', 'closed']) {
      content.dataset.state = state
      const style = getComputedStyle(content)
      expect(style.animationName).toBe(state === 'open' ? 'xh-overlay-slide-in' : 'xh-overlay-slide-out')
      expect(style.scale).toBe('none')
    }
  })

  it('减弱动效沿用令牌通道，进出场缩至 1ms 且没有空间位移', async () => {
    await mount('light')
    part('positioner').dataset.motion = 'reduce'
    const content = part('content')
    for (const state of ['open', 'closed']) {
      content.dataset.state = state
      const style = getComputedStyle(content)
      expect(style.animationDuration).toBe('0.001s')
      expect(style.getPropertyValue('--xh-motion-distance-sm').trim()).toBe('0px')
      expect(style.scale).toBe('none')
    }
  })

  it('时分列保持独立滚动，Esc 关闭后归还触发器焦点', async () => {
    await mount('light')
    const content = part('content')
    const columns = document.querySelectorAll<HTMLElement>(`[data-scope='time-picker'][data-part='column']`)
    const hours = columns[0]!
    const minutes = columns[1]!
    expect(hours.scrollHeight).toBeGreaterThan(hours.clientHeight)
    const minuteScroll = minutes.scrollTop
    hours.scrollTop = 80
    expect(hours.scrollTop).toBe(80)
    expect(minutes.scrollTop).toBe(minuteScroll)
    part('item').focus()
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => content.getBoundingClientRect().height).toBe(0)
    expect(document.activeElement).toBe(part('trigger'))
  })
})
