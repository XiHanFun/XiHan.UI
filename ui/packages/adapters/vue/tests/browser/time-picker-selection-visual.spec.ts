// TimePicker 的 preset 与各数字列都会从当前值恢复持久选中；焦点/hover 是独立的临时高亮。
// 对号伪元素、数字几何和 forced-colors 只能在真实 Chromium 中验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
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
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const PRESETS = [
  { value: '09:30', label: '上午九点半' },
  { value: '12:00', label: '午休' },
]

let app: App | null = null
let host: HTMLElement | null = null

function byTestId(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!element)
    throw new Error(`找不到 ${id}`)
  return element
}

async function mountTimePicker(dir: 'ltr' | 'rtl' = 'ltr', disableSelected = false): Promise<void> {
  host = document.createElement('div')
  host.dir = dir
  document.body.append(host)
  app = createApp({
    render: () => h(XhTimePickerRoot, {
      dir,
      open: true,
      value: '09:30',
      presets: PRESETS,
      isTimeUnavailable: (value: string, unit: string) =>
        unit === 'hour' && (value === '10' || (disableSelected && value === '09')),
    }, () => [
      h(XhTimePickerControl, null, () => [
        h(XhTimePickerSegmentGroup, null, () => [
          h(XhTimePickerSegment, { segment: 'hour' }),
          h('span', null, () => ':'),
          h(XhTimePickerSegment, { segment: 'minute' }),
        ]),
      ]),
      h(XhTimePickerPositioner, null, () => [
        h(XhTimePickerContent, null, () => [
          h(XhTimePickerPresetGroup, null, () => PRESETS.map(preset =>
            h(XhTimePickerPreset, {
              'key': preset.value,
              'value': preset.value,
              'data-testid': preset.value === '09:30' ? 'selected-preset' : 'plain-preset',
            }),
          )),
          h(XhTimePickerColumn, { unit: 'hour' }, () => ['08', '09', '10'].map(value =>
            h(XhTimePickerItem, {
              'key': value,
              'value': value,
              'data-testid': `hour-${value}`,
            }, () => h('span', { 'data-testid': `hour-${value}-text` }, value)),
          )),
          h(XhTimePickerColumn, { unit: 'minute' }, () => ['15', '30', '45'].map(value =>
            h(XhTimePickerItem, {
              'key': value,
              'value': value,
              'data-testid': `minute-${value}`,
            }, () => h('span', null, () => value)),
          )),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

  document.querySelectorAll<HTMLElement>(`[data-scope='time-picker']:is([data-part='preset'], [data-part='item'])`)
    .forEach(element => element.style.transition = 'none')
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

function checkStyle(element: HTMLElement): CSSStyleDeclaration {
  return getComputedStyle(element, '::after')
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('time-picker 统一选中反馈', () => {
  it('preset 与数字项只用对号表示持久选值，正文和静止底保持普通态', async () => {
    await mountTimePicker()
    const selectedPreset = byTestId('selected-preset')
    const plainPreset = byTestId('plain-preset')
    const selectedItem = byTestId('hour-09')
    const plainItem = byTestId('hour-08')

    await userEvent.tab()
    byTestId('minute-15').focus()
    await nextTick()

    const pairs: Array<[HTMLElement, HTMLElement]> = [
      [selectedPreset, plainPreset],
      [selectedItem, plainItem],
    ]
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

  it('选中叠加 hover/键盘焦点时只增加中性底，对号继续可见', async () => {
    await mountTimePicker()
    const selected = byTestId('hour-09')
    const plain = byTestId('hour-08')

    await userEvent.hover(plain)
    const neutral = getComputedStyle(plain).backgroundColor
    expect(alpha(neutral)).toBe(255)

    await userEvent.hover(selected)
    expect(getComputedStyle(selected).backgroundColor).toBe(neutral)
    expect(checkStyle(selected).opacity).toBe('1')

    await userEvent.tab()
    const preset = byTestId('plain-preset')
    preset.focus()
    expect(preset.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(preset).backgroundColor).toBe(neutral)
  })

  it.each(['ltr', 'rtl'] as const)('%s：数字保持数学居中，对号只翻转到逻辑末端', async (dir) => {
    await mountTimePicker(dir)
    const selected = byTestId('hour-09')
    const plain = byTestId('hour-08')
    const selectedText = byTestId('hour-09-text')
    const plainText = byTestId('hour-08-text')

    expect(center(selectedText.getBoundingClientRect())).toBeCloseTo(center(selected.getBoundingClientRect()), 0)
    expect(center(plainText.getBoundingClientRect())).toBeCloseTo(center(plain.getBoundingClientRect()), 0)
    expect(selected.getBoundingClientRect().width).toBeCloseTo(plain.getBoundingClientRect().width, 0)

    const selectedCheck = checkStyle(selected)
    const presetCheck = checkStyle(byTestId('selected-preset'))
    const logicalEnd = dir === 'ltr' ? 'right' : 'left'
    const logicalStart = dir === 'ltr' ? 'left' : 'right'
    expect(Number.parseFloat(selectedCheck.getPropertyValue(logicalEnd)))
      .toBeLessThan(Number.parseFloat(selectedCheck.getPropertyValue(logicalStart)))
    expect(Number.parseFloat(presetCheck.getPropertyValue(logicalEnd)))
      .toBeLessThan(Number.parseFloat(presetCheck.getPropertyValue(logicalStart)))

    const itemRect = selected.getBoundingClientRect()
    const textRect = selectedText.getBoundingClientRect()
    const checkLeft = itemRect.left + Number.parseFloat(selectedCheck.left)
    const checkRight = checkLeft + Number.parseFloat(selectedCheck.width)
    if (dir === 'ltr')
      expect(textRect.right).toBeLessThanOrEqual(checkLeft)
    else
      expect(checkRight).toBeLessThanOrEqual(textRect.left)
  })

  it('forced-colors 下对号仍有系统色，禁用选中项使用 GrayText', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    await mountTimePicker('ltr', true)
    const selected = byTestId('hour-09')
    const selectedCheck = checkStyle(selected)
    const grayText = document.createElement('span')
    grayText.style.cssText = 'color:GrayText;forced-color-adjust:none'
    document.body.append(grayText)

    expect(selected.getAttribute('data-state')).toBe('checked')
    expect(selected.hasAttribute('data-disabled')).toBe(true)
    expect(selectedCheck.opacity).toBe('1')
    expect(selectedCheck.forcedColorAdjust).toBe('none')
    expect(alpha(selectedCheck.backgroundColor)).toBe(255)
    expect(selectedCheck.backgroundColor).toBe(getComputedStyle(grayText).color)
    expect(getComputedStyle(selected).outlineStyle).toBe('solid')
    grayText.remove()
  })
})
