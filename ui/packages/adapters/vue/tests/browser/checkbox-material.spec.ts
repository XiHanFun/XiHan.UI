import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
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

/** 无顶光：家族的 highlight 通道是一层全透明的渐变，与不画 background-image 等价 */
function noHighlight(style: CSSStyleDeclaration): boolean {
  if (style.backgroundImage === 'none')
    return true
  const stops = /^linear-gradient\((.*)\)$/.exec(style.backgroundImage)?.[1]
  return stops != null && stops.split(/, (?=rgba)/).every(stop => stop.startsWith('rgba(0, 0, 0, 0)'))
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

describe('checkbox 字段家族控制盒与三态', () => {
  it('方框是字段家族的控制盒：不填底 + border-control 描边（与装饰边同色）+ 无影无顶光，勾中后以语气色填充', async () => {
    await mount([
      h(XhCheckbox, { 'data-testid': 'off' }, () => '未勾'),
      h(XhCheckbox, { 'data-testid': 'on', 'defaultChecked': true }, () => '勾中'),
    ])

    const off = labelledBox('off')
    const idle = getComputedStyle(off)
    expect(idle.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(idle.borderColor).toBe(resolveColor(off, 'var(--xh-border-control)'))
    expect(idle.borderColor).toBe(resolveColor(off, 'var(--xh-border-default)'))
    expect(idle.boxShadow).toBe('none')
    expect(noHighlight(idle)).toBe(true)
    const on = getComputedStyle(labelledBox('on'))
    expect(on.backgroundColor).toBe(resolveColor(off, 'var(--xh-bg-brand)'))
    expect(on.borderColor).toBe(resolveColor(off, 'var(--xh-bg-brand)'))
    expect(on.boxShadow).toBe('none')
    expect(labelledBox('on').hasAttribute('data-variant')).toBe(false)
    // 方框接 Action Control icon 档（§9.1 定尺方框）：家族给盒型与过渡，边长仍是 16px 指示符档
    expect(off.getAttribute('data-xh-action-control')).toBe('')
    expect(off.getAttribute('data-xh-action-profile')).toBe('icon')
    expect(off.getAttribute('data-xh-action-variant')).toBe('outline')
    expect(off.getBoundingClientRect().width).toBe(16)
    expect(off.getBoundingClientRect().height).toBe(16)
    expect(idle.transitionProperty.split(', ')).toContain('scale')
  })

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

      // 未勾方框的描边与浮层面板、卡片的装饰边同一档（§8.3），3:1 留给高对比档
      expect(offBorder, `${theme}/${tone}/off`).toBe(resolveColor(box(`${tone}-off`), 'var(--xh-border-default)'))
      expect(contrast(on.backgroundColor, page), `${theme}/${tone}/on`).toBeGreaterThanOrEqual(3)
      expect(contrast(mixed.backgroundColor, page), `${theme}/${tone}/mixed`).toBeGreaterThanOrEqual(3)
      expect(contrast(check, on.backgroundColor), `${theme}/${tone}/check`).toBeGreaterThanOrEqual(3)
      expect(contrast(line, mixed.backgroundColor), `${theme}/${tone}/line`).toBeGreaterThanOrEqual(3)
      expect(on.backgroundColor).toBe(mixed.backgroundColor)
    }

    const off = getComputedStyle(box('brand-off'))
    expect(off.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(noHighlight(off)).toBe(true)
    expect(off.boxShadow).toBe('none')
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

  it('整行 hover 时未勾方框描边升一档，勾中方框不换描边；按下缩放并换底；disabled、readonly 与 invalid 不伪装可操作', async () => {
    await mount([
      h(XhCheckbox, { 'data-testid': 'live' }, () => '接收通知'),
      h(XhCheckbox, { 'data-testid': 'on', 'defaultChecked': true }, () => '已勾中'),
      h(XhCheckbox, { 'data-testid': 'disabled', 'disabled': true }, () => '已禁用'),
      h(XhCheckbox, { 'data-testid': 'disabled-on', 'disabled': true, 'defaultChecked': true }, () => '已禁用且勾中'),
      h(XhCheckbox, { 'data-testid': 'readonly', 'readOnly': true }, () => '只读'),
      h(XhCheckbox, { 'data-testid': 'invalid', 'invalid': true }, () => '必须同意'),
    ])
    const live = labelledBox('live')
    const on = labelledBox('on')
    const disabled = labelledBox('disabled')
    const disabledOn = labelledBox('disabled-on')
    const readonly = labelledBox('readonly')
    const invalid = labelledBox('invalid')
    const invalidBorder = getComputedStyle(invalid).borderColor
    const onBorder = getComputedStyle(on).borderColor

    await userEvent.hover(label('live'))
    await finishMotion()
    expect(getComputedStyle(live).borderColor).toBe(resolveColor(live, 'var(--xh-border-control-hover)'))
    expect(getComputedStyle(live).boxShadow).toBe('none')
    await userEvent.hover(label('on'))
    await finishMotion()
    expect(getComputedStyle(on).borderColor).toBe(onBorder)
    await userEvent.hover(label('invalid'))
    await finishMotion()
    expect(getComputedStyle(invalid).borderColor).toBe(invalidBorder)

    // 指针直接落在方框上：家族悬停块把未勾方框的描边升一档，底不动（§8.3 字段静息 → hover）
    await userEvent.hover(live)
    await expect.poll(() => getComputedStyle(live).borderColor).toBe(resolveColor(live, 'var(--xh-border-control-hover)'))
    expect(getComputedStyle(live).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await userEvent.unhover(live)

    await holdSpace(live)
    expect(getComputedStyle(live).scale).toBe('0.97')
    expect(getComputedStyle(live).backgroundColor).toBe(resolveColor(live, 'var(--xh-bg-subtle-hover)'))
    await releaseSpace()
    await holdSpace(on)
    expect(getComputedStyle(on).scale).toBe('0.97')
    expect(getComputedStyle(on).backgroundColor).toBe(resolveColor(on, 'var(--xh-bg-brand-active)'))
    await releaseSpace()
    // 只读：按住不缩放、底不换（家族的按压块被只读映射钉回静息面）
    await holdSpace(readonly)
    expect(getComputedStyle(readonly).scale).toBe('none')
    expect(getComputedStyle(readonly).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await releaseSpace()

    // 禁用面：border-default + bg-subtle + fg-disabled，不靠 opacity；勾中的禁用方框同样退回中性面，勾由置灰色画出
    for (const target of [disabled, disabledOn]) {
      expect(getComputedStyle(target).cursor).toBe('not-allowed')
      expect(getComputedStyle(target).opacity).toBe('1')
      expect(getComputedStyle(target).backgroundColor).toBe(resolveColor(target, 'var(--xh-bg-subtle)'))
      expect(getComputedStyle(target).borderColor).toBe(resolveColor(target, 'var(--xh-border-default)'))
      expect(getComputedStyle(target).color).toBe(resolveColor(target, 'var(--xh-fg-disabled)'))
      expect(getComputedStyle(target).boxShadow).toBe('none')
    }
    expect(getComputedStyle(label('disabled')).cursor).toBe('not-allowed')
    expect(getComputedStyle(label('disabled')).color).toBe(resolveColor(disabled, 'var(--xh-fg-subtle)'))
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
      // 未勾方框不填底：环压在页面底上，页面底随主题走
      document.body.style.backgroundColor = 'var(--xh-bg-canvas)'
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
        // 未勾方框不填底，环压在它露出的页面底上
        const face = style.backgroundColor === 'rgba(0, 0, 0, 0)' ? getComputedStyle(document.body).backgroundColor : style.backgroundColor
        expect(contrast(style.outlineColor, face), `${theme}/${id}`).toBeGreaterThanOrEqual(3)
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

  it('标签文字随 size 档取控件字号，禁用标签落 fg-subtle', async () => {
    await mount([
      h(XhCheckbox, { 'data-testid': 'sm', 'size': 'sm' }, () => '小'),
      h(XhCheckbox, { 'data-testid': 'md' }, () => '中'),
      h(XhCheckbox, { 'data-testid': 'lg', 'size': 'lg' }, () => '大'),
    ])
    const probe = label('md')
    const px = (token: string): number => {
      const span = document.createElement('span')
      span.style.fontSize = `var(${token})`
      probe.append(span)
      const value = Number.parseFloat(getComputedStyle(span).fontSize)
      span.remove()
      return value
    }
    expect(Number.parseFloat(getComputedStyle(label('sm')).fontSize)).toBe(px('--xh-control-font-sm'))
    expect(Number.parseFloat(getComputedStyle(label('md')).fontSize)).toBe(px('--xh-control-font-md'))
    expect(Number.parseFloat(getComputedStyle(label('lg')).fontSize)).toBe(px('--xh-control-font-lg'))
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
