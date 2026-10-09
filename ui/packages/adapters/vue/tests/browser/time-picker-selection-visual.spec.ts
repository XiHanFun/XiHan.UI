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

/** 语义令牌在该元素里解到的圆角、长度与颜色。 */
function resolveRadius(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.borderRadius = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).borderTopLeftRadius
  probe.remove()
  return value
}

function resolveLength(token: string, scope: HTMLElement): number {
  const probe = document.createElement('span')
  probe.style.display = 'block'
  probe.style.inlineSize = `var(${token})`
  scope.append(probe)
  const value = Number.parseFloat(getComputedStyle(probe).inlineSize)
  probe.remove()
  return value
}

function resolveColor(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

describe('time-picker 统一选中反馈', () => {
  it('快捷项与数字项都以对号表示持久选值：快捷项面与字保持静息，数字项透明底、字重升到中等', async () => {
    await mountTimePicker()
    const selectedPreset = byTestId('selected-preset')
    const plainPreset = byTestId('plain-preset')
    const selectedItem = byTestId('hour-09')
    const plainItem = byTestId('hour-08')

    await userEvent.tab()
    byTestId('minute-15').focus()
    await nextTick()

    expect(selectedPreset.getAttribute('data-state')).toBe('checked')
    // 快捷项是一颗淡底小钮：选中不换面，面与未选中的同一档
    expect(getComputedStyle(selectedPreset).backgroundColor).toBe(resolveColor('--xh-bg-subtle', selectedPreset))
    expect(getComputedStyle(selectedPreset).backgroundColor).toBe(getComputedStyle(plainPreset).backgroundColor)
    expect(getComputedStyle(selectedPreset).fontWeight).toBe(getComputedStyle(plainPreset).fontWeight)
    expect(getComputedStyle(selectedPreset).color).toBe(getComputedStyle(plainPreset).color)
    expect(checkStyle(selectedPreset).opacity).toBe('1')
    expect(checkStyle(plainPreset).opacity).toBe('0')

    expect(selectedItem.getAttribute('data-state')).toBe('checked')
    // 对号集合的选中：透明底 + 末端对号 + 中等字重，不上品牌淡底、不变字色
    expect(alpha(getComputedStyle(selectedItem).backgroundColor)).toBe(0)
    expect(getComputedStyle(selectedItem).color).toBe(getComputedStyle(plainItem).color)
    expect(getComputedStyle(selectedItem).fontWeight).toBe('500')
    expect(getComputedStyle(plainItem).fontWeight).toBe('400')
    expect(checkStyle(selectedItem).opacity).toBe('1')
    expect(checkStyle(selectedItem).maskImage).not.toBe('none')
    expect(checkStyle(plainItem).opacity).toBe('0')
  })

  it('数字项的对号与 Select 等列表同一把尺（指示符档），24 高的快捷小钮取小号指示符；compact 下随之收小', async () => {
    const size = (): number[] => [byTestId('selected-preset'), byTestId('hour-09')].map(el => Number.parseFloat(checkStyle(el).width))
    const indicator = (): number => Number.parseFloat(getComputedStyle(byTestId('hour-09')).getPropertyValue('--xh-control-indicator-size'))
    const small = (): number => Number.parseFloat(getComputedStyle(byTestId('hour-09')).getPropertyValue('--xh-control-indicator-sm'))
    await mountTimePicker()
    expect(size()).toEqual([small(), indicator()])
    app?.unmount()
    host?.remove()
    document.documentElement.dataset.density = 'compact'
    try {
      await mountTimePicker()
      expect(indicator()).toBeLessThan(16)
      expect(size()).toEqual([small(), indicator()])
    }
    finally {
      delete document.documentElement.dataset.density
    }
  })

  it('hover 与键盘焦点增加中性状态底，选中叠加 hover 与普通项同档，按下再深一档且不缩放', async () => {
    await mountTimePicker()
    const selected = byTestId('hour-09')
    const plain = byTestId('hour-08')
    selected.style.transition = 'none'
    plain.style.transition = 'none'

    await userEvent.hover(plain)
    const neutral = getComputedStyle(plain).backgroundColor
    // 中性底是墨色按比例透明：铺了就不是 0，不再是实色
    expect(alpha(neutral)).toBeGreaterThan(0)

    await userEvent.hover(selected)
    // selected + hover = 家族 hover 档 + 对号：与未选中项的悬停面同一档中性面
    expect(getComputedStyle(selected).backgroundColor).toBe(neutral)
    expect(checkStyle(selected).opacity).toBe('1')
    // 集合行按下只换面：比悬停再深一档，不缩放整格
    selected.dataset.pressed = ''
    expect(getComputedStyle(selected).backgroundColor).not.toBe(neutral)
    // 中性底是墨色按比例透明：铺了就不是 0，不再是实色
    expect(alpha(getComputedStyle(selected).backgroundColor)).toBeGreaterThan(0)
    expect(getComputedStyle(selected).scale).toBe('none')
    delete selected.dataset.pressed

    await userEvent.tab()
    const preset = byTestId('plain-preset')
    preset.focus()
    expect(preset.matches(':focus-visible')).toBe(true)
    // 快捷项坐在自己的淡底上：高亮走淡底阶梯的 200 档
    expect(getComputedStyle(preset).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', preset))
    // 高亮时字换正文色：底升到 200 之后，次级前景在暗色下不足 4.5:1
    const fg = document.createElement('span')
    fg.style.color = 'var(--xh-fg-default)'
    preset.append(fg)
    expect(getComputedStyle(preset).color).toBe(getComputedStyle(fg).color)
    fg.remove()
    // 键盘焦点出现时底色与环当帧到位，不压在家族背景过渡的中间帧上
    expect(getComputedStyle(preset).transitionProperty).toBe('none')
  })

  it('数字格的命中区补满列内间距：两格之间的缝落在上下两格上', async () => {
    await mountTimePicker()
    // 选中的 09 停在列顶：量它与下面那一格之间的缝
    const upper = byTestId('hour-09')
    const lower = byTestId('hour-10')
    const gap = lower.getBoundingClientRect().top - upper.getBoundingClientRect().bottom
    expect(gap).toBeGreaterThan(0)
    const x = upper.getBoundingClientRect().left + upper.getBoundingClientRect().width / 2
    const hit = (y: number): Element | null => document.elementFromPoint(x, y)?.closest("[data-part='item']") ?? null
    expect(hit(upper.getBoundingClientRect().bottom + gap / 2 - 1)).toBe(upper)
    expect(hit(lower.getBoundingClientRect().top - gap / 2 + 1)).toBe(lower)
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
