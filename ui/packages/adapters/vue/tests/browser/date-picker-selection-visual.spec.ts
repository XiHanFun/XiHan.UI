// DatePicker 的 preset 与内嵌时间项统一以末端对号表示持久选值；日期格仍由 Calendar 自己负责。
import type { DatePickerPresetState } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerPositioner,
  XhDatePickerPreset,
  XhDatePickerPresetGroup,
  XhDatePickerRoot,
  XhDatePickerTimePanel,
  XhDatePickerTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const PRESETS = [
  { value: '2026-09-11', label: '发布日' },
  { value: '2026-09-12', label: '次日' },
]

let app: App | null = null
let host: HTMLElement | null = null

function byTestId(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!element)
    throw new Error(`找不到 ${id}`)
  return element
}

function timeItem(unit: 'hour' | 'minute', value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    `[data-scope='date-picker'][data-part='time-column'][data-unit='${unit}'] `
    + `[data-part='time-item'][data-value='${value}']`,
  )
  if (!element)
    throw new Error(`找不到 date-picker/${unit}/${value}`)
  return element
}

function checkStyle(element: HTMLElement): CSSStyleDeclaration {
  return getComputedStyle(element, '::after')
}

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d')!
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

function center(rect: DOMRect): number {
  return rect.left + rect.width / 2
}

function textRect(element: HTMLElement): DOMRect {
  const range = document.createRange()
  range.selectNodeContents(element)
  return range.getBoundingClientRect()
}

function markerRect(element: HTMLElement): { left: number, right: number } {
  const hostRect = element.getBoundingClientRect()
  const marker = checkStyle(element)
  const left = hostRect.left + Number.parseFloat(marker.left)
  return { left, right: left + Number.parseFloat(marker.width) }
}

async function mountDatePicker(
  dir: 'ltr' | 'rtl' = 'ltr',
  disabled = false,
  density?: 'comfortable' | 'compact',
): Promise<void> {
  host = document.createElement('div')
  host.dir = dir
  if (density)
    host.dataset.density = density
  document.body.append(host)
  app = createApp({
    render: () => h(XhDatePickerRoot, {
      dir,
      disabled,
      open: true,
      showTime: true,
      value: ['2026-09-11T09:30'],
      presets: PRESETS,
    }, () => [
      h(XhDatePickerControl, null, () => h(XhDatePickerTrigger)),
      h(XhDatePickerPositioner, null, () => [
        h(XhDatePickerContent, { style: { '--xh-date-picker-content-fg': 'rgb(52, 73, 94)' } }, () => [
          h(XhDatePickerPresetGroup, null, {
            default: ({ presets }: { presets: readonly DatePickerPresetState[] }) => presets.map(preset => h(XhDatePickerPreset, {
              'key': preset.value,
              'value': preset.value,
              'data-testid': preset.value === '2026-09-11' ? 'selected-preset' : 'plain-preset',
            })),
          }),
          h(XhDatePickerTimePanel),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('日期选择器快捷项与时间项的统一选中反馈', () => {
  it('preset 与 time-item 只用对号表示持久选值，正文和静止底保持普通态', async () => {
    await mountDatePicker()
    const selectedPreset = byTestId('selected-preset')
    const plainPreset = byTestId('plain-preset')
    const selectedTime = timeItem('hour', '09')
    const plainTime = timeItem('hour', '08')
    selectedPreset.style.transition = 'none'
    selectedTime.style.transition = 'none'
    await userEvent.tab()
    timeItem('minute', '15').focus()
    await nextTick()

    const pairs: Array<[HTMLElement, HTMLElement]> = [[selectedPreset, plainPreset], [selectedTime, plainTime]]
    for (const [selected, plain] of pairs) {
      expect(selected.getAttribute('data-state')).toBe('checked')
      expect(alpha(getComputedStyle(selected).backgroundColor)).toBe(0)
      expect(getComputedStyle(selected).color).toBe(getComputedStyle(plain).color)
      expect(getComputedStyle(selected).fontWeight).toBe(getComputedStyle(plain).fontWeight)
      expect(checkStyle(selected).opacity).toBe('1')
      expect(checkStyle(selected).maskImage).not.toBe('none')
      expect(checkStyle(plain).opacity).toBe('0')
    }
  })

  it('hover 与键盘焦点只增加中性底，对号继续可见且焦点底不渐变', async () => {
    await mountDatePicker()
    const plainTime = timeItem('hour', '08')
    plainTime.style.transition = 'none'
    await userEvent.hover(plainTime)
    const neutral = getComputedStyle(plainTime).backgroundColor
    expect(alpha(neutral)).toBe(255)

    const selectedTime = timeItem('hour', '09')
    selectedTime.style.transition = 'none'
    await userEvent.hover(selectedTime)
    expect(getComputedStyle(selectedTime).backgroundColor).toBe(neutral)
    expect(checkStyle(selectedTime).opacity).toBe('1')

    await userEvent.tab()
    const preset = byTestId('plain-preset')
    preset.focus()
    expect(preset.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(preset).backgroundColor).toBe(neutral)
    expect(getComputedStyle(preset).transitionProperty).toBe('color')

    const selectedPreset = byTestId('selected-preset')
    selectedPreset.focus()
    expect(getComputedStyle(selectedPreset).backgroundColor).toBe(neutral)
    expect(getComputedStyle(selectedPreset).transitionProperty).toBe('color')
    expect(checkStyle(selectedPreset).opacity).toBe('1')

    const focusedTime = timeItem('minute', '15')
    focusedTime.focus()
    expect(focusedTime.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(focusedTime).transitionProperty).toBe('color')
  })

  it.each(['ltr', 'rtl'] as const)('%s：时间数字保持数学居中，对号只翻到逻辑末端', async (dir) => {
    await mountDatePicker(dir)
    const selected = timeItem('hour', '09')
    const plain = timeItem('hour', '08')

    const selectedText = textRect(selected)
    const plainText = textRect(plain)
    expect(center(selectedText)).toBeCloseTo(center(selected.getBoundingClientRect()), 0)
    expect(center(plainText)).toBeCloseTo(center(plain.getBoundingClientRect()), 0)
    expect(selected.getBoundingClientRect().width).toBeCloseTo(plain.getBoundingClientRect().width, 0)

    const selectedCheck = checkStyle(selected)
    const presetCheck = checkStyle(byTestId('selected-preset'))
    const logicalEnd = dir === 'ltr' ? 'right' : 'left'
    const logicalStart = dir === 'ltr' ? 'left' : 'right'
    expect(Number.parseFloat(selectedCheck.getPropertyValue(logicalEnd)))
      .toBeLessThan(Number.parseFloat(selectedCheck.getPropertyValue(logicalStart)))
    expect(Number.parseFloat(presetCheck.getPropertyValue(logicalEnd)))
      .toBeLessThan(Number.parseFloat(presetCheck.getPropertyValue(logicalStart)))

    const timeMarker = markerRect(selected)
    const preset = byTestId('selected-preset')
    const presetMarker = markerRect(preset)
    const presetText = textRect(preset)
    if (dir === 'ltr') {
      expect(selectedText.right).toBeLessThanOrEqual(timeMarker.left)
      expect(presetText.right).toBeLessThanOrEqual(presetMarker.left)
    }
    else {
      expect(timeMarker.right).toBeLessThanOrEqual(selectedText.left)
      expect(presetMarker.right).toBeLessThanOrEqual(presetText.left)
    }
  })

  it('compact 下两类对号仍使用同族 16px 字形档，数字保持居中', async () => {
    await mountDatePicker('ltr', false, 'compact')
    const selectedTime = timeItem('hour', '09')
    const timeMarker = checkStyle(selectedTime)
    const presetMarker = checkStyle(byTestId('selected-preset'))

    expect(Number.parseFloat(timeMarker.width)).toBe(16)
    expect(Number.parseFloat(timeMarker.height)).toBe(16)
    expect(Number.parseFloat(presetMarker.width)).toBe(16)
    expect(center(textRect(selectedTime))).toBeCloseTo(center(selectedTime.getBoundingClientRect()), 0)
  })

  it('禁用时 preset 与时间列都停止 hover，正文和对号统一进入失效态', async () => {
    await mountDatePicker('ltr', true)
    const preset = byTestId('selected-preset')
    const selectedTime = timeItem('hour', '09')
    const rest = getComputedStyle(selectedTime).backgroundColor

    expect(preset.getAttribute('aria-disabled')).toBe('true')
    expect(getComputedStyle(preset).cursor).toBe('not-allowed')
    expect(getComputedStyle(selectedTime).cursor).toBe('not-allowed')
    expect(checkStyle(preset).backgroundColor).toBe(getComputedStyle(preset).color)
    expect(checkStyle(selectedTime).backgroundColor).toBe(getComputedStyle(selectedTime).color)
    await userEvent.hover(selectedTime)
    expect(getComputedStyle(selectedTime).backgroundColor).toBe(rest)
  })

  it('forced-colors 下对号保留系统色，禁用选中项使用 GrayText', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    await mountDatePicker('ltr', true)
    for (const selected of [byTestId('selected-preset'), timeItem('hour', '09')]) {
      const marker = checkStyle(selected)
      expect(selected.getAttribute('data-state')).toBe('checked')
      expect(marker.opacity).toBe('1')
      expect(marker.forcedColorAdjust).toBe('none')
      expect(alpha(marker.backgroundColor)).toBe(255)
      expect(marker.backgroundColor).toBe(getComputedStyle(selected).color)
      expect(getComputedStyle(selected).outlineStyle).toBe('solid')
    }
  })
})
