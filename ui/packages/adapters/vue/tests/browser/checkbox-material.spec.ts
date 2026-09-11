import type { App, VNode } from 'vue'
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhCheckbox } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const THEMES = ['light', 'dark'] as const
const TONES = ['brand', 'neutral', 'success', 'warning', 'danger', 'info'] as const

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

function box(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}'][data-part='root']`)
  if (!element)
    throw new Error(`找不到 checkbox/${id}`)
  return element
}

function indicator(id: string): HTMLElement {
  const element = box(id).querySelector<HTMLElement>(`[data-scope='checkbox'][data-part='indicator']`)
  if (!element)
    throw new Error(`找不到 checkbox/${id}/indicator`)
  return element
}

function label(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}'][data-part='label']`)
  if (!element)
    throw new Error(`找不到 checkbox/${id}/label`)
  return element
}

function labelledBox(id: string): HTMLElement {
  return label(id).querySelector<HTMLElement>(`[data-scope='checkbox'][data-part='root']`)!
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

async function mount(nodes: VNode[], attrs: Record<string, string> = {}): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h('div', attrs, nodes) })
  app.mount(host)
  await finishMotion()
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

describe('checkbox M1 控制盒与三态', () => {
  it.each(THEMES)('%s：六种 tone 的实体选中面、勾与半选横杠都保持 3:1', async (theme) => {
    document.documentElement.dataset.theme = theme
    document.body.style.backgroundColor = 'var(--xh-bg-canvas)'
    document.body.style.color = 'var(--xh-fg-default)'
    await mount(TONES.flatMap(tone => [
      h(XhCheckbox, { 'data-testid': `${tone}-off`, tone }),
      h(XhCheckbox, { 'data-testid': `${tone}-on`, 'tone': tone, 'defaultChecked': true }),
      h(XhCheckbox, { 'data-testid': `${tone}-mixed`, 'tone': tone, 'defaultChecked': 'indeterminate' }),
    ]))
    const page = getComputedStyle(document.body).backgroundColor

    for (const tone of TONES) {
      const on = getComputedStyle(box(`${tone}-on`))
      const mixed = getComputedStyle(box(`${tone}-mixed`))
      const offBorder = resolveColor(box(`${tone}-off`), 'var(--xh-checkbox-border, var(--xh-border-control))')
      const check = getComputedStyle(indicator(`${tone}-on`), '::before').backgroundColor
      const line = getComputedStyle(indicator(`${tone}-mixed`), '::after').backgroundColor

      expect(contrast(offBorder, page), `${theme}/${tone}/off`).toBeGreaterThanOrEqual(3)
      expect(contrast(on.backgroundColor, page), `${theme}/${tone}/on`).toBeGreaterThanOrEqual(3)
      expect(contrast(mixed.backgroundColor, page), `${theme}/${tone}/mixed`).toBeGreaterThanOrEqual(3)
      expect(contrast(check, on.backgroundColor), `${theme}/${tone}/check`).toBeGreaterThanOrEqual(3)
      expect(contrast(line, mixed.backgroundColor), `${theme}/${tone}/line`).toBeGreaterThanOrEqual(3)
      expect(on.backgroundColor).toBe(mixed.backgroundColor)
    }

    const off = getComputedStyle(box('brand-off'))
    expect(off.backgroundColor).toBe(resolveColor(box('brand-off'), 'var(--xh-material-soft-bg)'))
    expect(off.backgroundImage).not.toBe('none')
    expect(off.boxShadow).not.toBe('none')
    expect(off.backdropFilter).toBe('none')
  })

  it('indicator 常驻并只用 opacity/scale 在 120ms 内切换，勾与短横使用同一光学盒', async () => {
    await mount([
      h(XhCheckbox, { 'data-testid': 'live' }),
      h(XhCheckbox, { 'data-testid': 'mixed', 'defaultChecked': 'indeterminate' }),
    ])
    const live = indicator('live')
    const mixed = indicator('mixed')
    const before = getComputedStyle(live, '::before')
    const line = getComputedStyle(mixed, '::after')
    expect(getComputedStyle(live).display).toBe('flex')
    expect(getComputedStyle(live).opacity).toBe('0')
    expect(getComputedStyle(live).transitionProperty.split(', ').sort()).toEqual(['opacity', 'scale'])
    expect(getComputedStyle(live).transitionDuration.split(', ')).toEqual(['0.12s', '0.12s'])
    expect(before.width).toBe(line.width)
    expect(before.height).toBe(line.height)
    expect(before.maskImage).not.toBe(line.maskImage)

    box('live').click()
    await finishMotion()
    expect(getComputedStyle(live).opacity).toBe('1')
    expect(getComputedStyle(live).scale).toBe('1')
    box('live').click()
    await finishMotion()
    expect(getComputedStyle(live).opacity).toBe('0')
    expect(getComputedStyle(live).scale).not.toBe('1')
  })

  it('整行 hover 回应，active 撤掉海拔；disabled、readonly 与 invalid 不伪装可操作', async () => {
    await mount([
      h(XhCheckbox, { 'data-testid': 'live' }, () => '接收通知'),
      h(XhCheckbox, { 'data-testid': 'disabled', 'disabled': true }, () => '已禁用'),
      h(XhCheckbox, { 'data-testid': 'readonly', 'readOnly': true }, () => '只读'),
      h(XhCheckbox, { 'data-testid': 'invalid', 'invalid': true }, () => '必须同意'),
    ])
    const live = labelledBox('live')
    const disabled = labelledBox('disabled')
    const readonly = labelledBox('readonly')
    const invalid = labelledBox('invalid')
    const restBorder = getComputedStyle(live).borderColor
    const restShadow = getComputedStyle(live).boxShadow
    const invalidBorder = getComputedStyle(invalid).borderColor

    await userEvent.hover(label('live'))
    await finishMotion()
    expect(getComputedStyle(live).borderColor).not.toBe(restBorder)
    expect(getComputedStyle(live).boxShadow).not.toBe(restShadow)
    await userEvent.hover(label('invalid'))
    await finishMotion()
    expect(getComputedStyle(invalid).borderColor).toBe(invalidBorder)

    await holdSpace(live)
    expect(getComputedStyle(live).scale).not.toBe('none')
    expect(getComputedStyle(live).boxShadow).toBe('none')
    await releaseSpace()

    expect(getComputedStyle(disabled).cursor).toBe('not-allowed')
    expect(getComputedStyle(label('disabled')).cursor).toBe('not-allowed')
    expect(getComputedStyle(disabled).opacity).not.toBe('1')
    expect(getComputedStyle(disabled).boxShadow).toBe('none')
    expect(getComputedStyle(readonly).cursor).toBe('default')
    expect(getComputedStyle(label('readonly')).cursor).toBe('default')
    expect(getComputedStyle(readonly).opacity).toBe('1')
    expect(getComputedStyle(readonly).boxShadow).toBe('none')
  })

  it.each(THEMES)('%s 高对比轴：未选中边界与三态仍保持实体分层', async (theme) => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.contrast = 'more'
    document.body.style.backgroundColor = 'var(--xh-bg-canvas)'
    await mount([
      h(XhCheckbox, { 'data-testid': 'off' }),
      h(XhCheckbox, { 'data-testid': 'on', 'defaultChecked': true }),
      h(XhCheckbox, { 'data-testid': 'mixed', 'defaultChecked': 'indeterminate' }),
    ])
    const page = getComputedStyle(document.body).backgroundColor
    const boundary = getComputedStyle(box('off')).borderColor
    expect(contrast(boundary, page)).toBeGreaterThanOrEqual(3)
    expect(getComputedStyle(indicator('on')).opacity).toBe('1')
    expect(getComputedStyle(indicator('mixed')).opacity).toBe('1')
  })

  it('forced-colors：三态、只读、禁用与键盘焦点保留独立通道', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    await mount([
      h(XhCheckbox, { 'data-testid': 'off' }),
      h(XhCheckbox, { 'data-testid': 'on', 'defaultChecked': true }),
      h(XhCheckbox, { 'data-testid': 'mixed', 'defaultChecked': 'indeterminate' }),
      h(XhCheckbox, { 'data-testid': 'readonly', 'readOnly': true }),
      h(XhCheckbox, { 'data-testid': 'disabled', 'defaultChecked': true, 'disabled': true }),
    ])

    expect(getComputedStyle(box('off')).borderStyle).toBe('solid')
    expect(getComputedStyle(box('readonly')).borderStyle).toBe('dashed')
    expect(getComputedStyle(box('on')).outlineStyle).toBe('solid')
    expect(getComputedStyle(box('mixed')).outlineStyle).toBe('solid')
    expect(getComputedStyle(box('off')).backgroundImage).toBe('none')
    expect(getComputedStyle(box('off')).boxShadow).toBe('none')
    expect(getComputedStyle(box('disabled')).opacity).toBe('1')
    expect(
      getComputedStyle(indicator('on'), '::before').backgroundColor,
    ).not.toBe(getComputedStyle(indicator('disabled'), '::before').backgroundColor)

    await userEvent.keyboard('{Tab}')
    box('readonly').focus()
    expect(box('readonly').matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(box('readonly')).outlineStyle).toBe('solid')
  })

  it('键盘 focus 在明暗三态下都达到 3:1，聚焦不改变 16px 控制盒几何', async () => {
    for (const theme of THEMES) {
      document.documentElement.dataset.theme = theme
      await mount([
        h(XhCheckbox, { 'data-testid': 'off' }),
        h(XhCheckbox, { 'data-testid': 'on', 'defaultChecked': true }),
        h(XhCheckbox, { 'data-testid': 'mixed', 'defaultChecked': 'indeterminate' }),
      ])

      for (const id of ['off', 'on', 'mixed']) {
        const element = box(id)
        const before = element.getBoundingClientRect()
        await userEvent.keyboard('{Tab}')
        element.focus()
        expect(element.matches(':focus-visible')).toBe(true)
        const style = getComputedStyle(element)
        expect(contrast(style.outlineColor, style.backgroundColor), `${theme}/${id}`).toBeGreaterThanOrEqual(3)
        const after = element.getBoundingClientRect()
        expect(after.width).toBe(before.width)
        expect(after.height).toBe(before.height)
      }

      app?.unmount()
      host?.remove()
      app = null
      host = null
    }
  })

  it('三尺寸、compact 与 RTL 保持盒/勾比例和可见文字间距，长标签不压缩控制盒', async () => {
    await mount([
      h(XhCheckbox, { 'data-testid': 'sm', 'size': 'sm' }, () => '小'),
      h(XhCheckbox, { 'data-testid': 'md' }, () => '中'),
      h(XhCheckbox, { 'data-testid': 'lg', 'size': 'lg' }, () => '大'),
      h('span', { 'data-density': 'compact' }, [h(XhCheckbox, { 'data-testid': 'compact' }, () => '紧凑')]),
      h('span', { style: 'display:block;inline-size:150px' }, [
        h(XhCheckbox, { 'data-testid': 'long' }, () => '这是一段会自然换行但不能把控制盒压扁的可见标签文字'),
      ]),
      h('span', { dir: 'rtl' }, [h(XhCheckbox, { 'data-testid': 'rtl' }, () => '从右向左')]),
    ])
    const roots = ['sm', 'md', 'lg'].map(labelledBox)
    const glyphs = roots.map(root => getComputedStyle(root.querySelector(`[data-part='indicator']`)!, '::before'))
    const gaps = ['sm', 'md', 'lg'].map(id => Number.parseFloat(getComputedStyle(label(id)).columnGap))

    expect(roots[1]!.getBoundingClientRect().width).toBe(16)
    expect(roots[0]!.getBoundingClientRect().width).toBeLessThan(roots[1]!.getBoundingClientRect().width)
    expect(roots[1]!.getBoundingClientRect().width).toBeLessThan(roots[2]!.getBoundingClientRect().width)
    expect(Number.parseFloat(glyphs[0]!.width)).toBeLessThan(Number.parseFloat(glyphs[1]!.width))
    expect(Number.parseFloat(glyphs[1]!.width)).toBeLessThan(Number.parseFloat(glyphs[2]!.width))
    expect(gaps[0]).toBeLessThan(gaps[1]!)
    expect(gaps[1]).toBeLessThan(gaps[2]!)
    expect(labelledBox('compact').getBoundingClientRect().width).toBe(14)
    expect(labelledBox('compact').getBoundingClientRect().width).toBeLessThan(roots[1]!.getBoundingClientRect().width)
    expect(labelledBox('long').getBoundingClientRect().width).toBe(roots[1]!.getBoundingClientRect().width)
    expect(label('long').getBoundingClientRect().height).toBeGreaterThan(labelledBox('long').getBoundingClientRect().height)
    const rtlText = label('rtl').querySelector<HTMLElement>(`[data-part='text']`)!
    expect(labelledBox('rtl').getBoundingClientRect().left).toBeGreaterThan(rtlText.getBoundingClientRect().left)
  })
})
