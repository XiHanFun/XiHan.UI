import type { App } from 'vue'
import type { DatePickerRootSlotProps } from '../../src/components/date-picker/date-picker'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerConfirmTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerPositioner,
  XhDatePickerPresetGroup,
  XhDatePickerRoot,
  XhDatePickerTimePanel,
  XhDatePickerTrigger,
  XhDatePickerWeekRow,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='date-picker'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少日期选择部件：${name}`)
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

type Shape = 'single' | 'range' | 'show-time' | 'presets'

async function mount(theme: 'light' | 'dark', shape: Shape = 'single', keyboardOpen = false): Promise<void> {
  host = document.createElement('div')
  host.dataset.theme = theme
  document.body.append(host)
  app = createApp({ render: () => h(XhDatePickerRoot, {
    defaultOpen: !keyboardOpen,
    defaultValue: ['2026-09-12'],
    locale: 'zh-CN',
    selectionMode: shape === 'range' ? 'range' : 'single',
    showTime: shape === 'show-time',
    presets: shape === 'presets' ? [{ value: '2026-09-12', label: '发布日' }] : undefined,
  }, {
    default: ({ panels }: DatePickerRootSlotProps) => [
      h(XhDatePickerControl, null, () => h(XhDatePickerTrigger, null, () => '选择日期')),
      h(XhDatePickerPositioner, null, () => h(XhDatePickerContent, null, () => [
        ...(shape === 'presets' ? [h(XhDatePickerPresetGroup)] : []),
        ...panels.map(panel => h(XhDatePickerCalendar, { index: panel.index }, () => [
          h(XhDatePickerHeader, null, () => h(XhDatePickerHeading)),
          h(XhDatePickerGrid, null, () => h(XhDatePickerGridBody, null, () => panel.weeks.map(week =>
            h(XhDatePickerWeekRow, null, () => week.map(day =>
              h(XhDatePickerCell, { value: day.value }, () => h(XhDatePickerCellTrigger, null, () => String(day.day))),
            )),
          ))),
        ])),
        ...(shape === 'show-time' ? [h(XhDatePickerTimePanel), h(XhDatePickerConfirmTrigger, null, () => '确定')] : []),
      ])),
    ],
  }) })
  app.mount(host)
  await nextTick()
  await nextTick()
  if (keyboardOpen) {
    part('trigger').focus()
    await userEvent.keyboard('{Enter}')
  }
  await expect.poll(() => part('content').getBoundingClientRect().width).toBeGreaterThan(0)
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('日期选择 M2 浮层', () => {
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
    const calendar = getComputedStyle(part('calendar'))
    expect(calendar.backdropFilter).toBe('none')
    expect(calendar.boxShadow).toBe('none')
    expect(alpha(calendar.backgroundColor)).toBe(0)
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

  it.each(['range', 'presets', 'show-time'] as const)('%s：内部结构使用统一材质分隔线', async (shape) => {
    await mount('dark', shape)
    const target = shape === 'range'
      ? document.querySelectorAll<HTMLElement>(`[data-scope='date-picker'][data-part='calendar']`)[1]!
      : part(shape === 'presets' ? 'preset-group' : 'time-column')
    const expected = document.createElement('span')
    expected.style.color = 'var(--xh-material-frosted-separator)'
    part('content').append(expected)
    const color = getComputedStyle(expected).color
    const style = getComputedStyle(target)
    const visibleBorders = ['Top', 'Right', 'Bottom', 'Left'].filter(side =>
      Number.parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0,
    )
    expect(visibleBorders.length).toBeGreaterThan(0)
    for (const side of visibleBorders)
      expect(style.getPropertyValue(`border-${side.toLowerCase()}-color`)).toBe(color)
    expected.remove()
  })

  it('四向短位移不缩放，嵌套层不继承父层方向', async () => {
    await mount('light')
    const outer = part('positioner')
    const inner = document.createElement('div')
    inner.dataset.scope = 'date-picker'
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

  it.each(['single', 'range', 'show-time'] as const)('%s：键盘关闭后保持完整几何直至退场完成，再归还焦点', async (shape) => {
    await mount('light', shape, true)
    const content = part('content')
    await Promise.all(content.getAnimations().map(animation => animation.finished))
    content.style.setProperty('--xh-motion-duration-exit', '1s')
    const before = { width: content.offsetWidth, height: content.offsetHeight }
    const calendars = [...content.querySelectorAll<HTMLElement>(`[data-part='calendar']`)]
    const offsets = calendars.map(calendar => [calendar.offsetLeft, calendar.offsetTop])
    const cell = content.querySelector<HTMLElement>(`[data-scope='calendar'][data-part='cell-trigger'][tabindex='0']`)
    if (!cell)
      throw new Error('日历没有可聚焦日期')
    cell.focus()
    await userEvent.keyboard('{Escape}')
    await nextTick()
    expect(content.dataset.state).toBe('closed')
    expect(content.hidden).toBe(true)
    expect(content.offsetWidth).toBe(before.width)
    expect(content.offsetHeight).toBe(before.height)
    expect(calendars.map(calendar => [calendar.offsetLeft, calendar.offsetTop])).toEqual(offsets)
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-out')
    const exitAnimations = content.getAnimations()
    expect(exitAnimations.length).toBeGreaterThan(0)
    exitAnimations.forEach(animation => animation.finish())
    await expect.poll(() => content.getBoundingClientRect().height).toBe(0)
    await expect.poll(() => document.activeElement === part('trigger')).toBe(true)
  })
})
