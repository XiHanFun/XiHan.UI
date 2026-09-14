import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'

let host: HTMLElement | undefined

function fixture(theme: 'light' | 'dark', parent?: HTMLElement) {
  if (!host) {
    host = document.createElement('div')
    document.body.append(host)
  }
  const boundary = document.createElement('div')
  boundary.dataset.theme = theme
  const surface = document.createElement('section')
  // 仅提供作用域边界，未引入任何组件皮肤或运行时。
  surface.dataset.scope = 'material-glass-test'
  surface.style.cssText = `
    position:relative; padding:16px; width:240px;
    background:var(--xh-material-glass-bg);
    color:var(--xh-material-glass-fg);
    border:1px solid var(--xh-material-glass-border);
    box-shadow:var(--xh-material-glass-shadow);
    backdrop-filter:var(--xh-material-glass-backdrop);
    transition-property:opacity;
    transition-duration:var(--xh-motion-duration-enter);`
  const muted = document.createElement('span')
  muted.style.color = 'var(--xh-material-glass-fg-muted)'
  muted.textContent = '次要说明'
  const highlight = document.createElement('i')
  highlight.style.cssText = 'position:absolute;inset:0 0 auto;height:1px;background:var(--xh-material-glass-highlight);pointer-events:none'
  const separator = document.createElement('hr')
  separator.style.cssText = 'border:0;border-block-start:1px solid var(--xh-material-glass-separator)'
  const focusSurface = document.createElement('button')
  focusSurface.style.cssText = 'background:var(--xh-material-glass-focus-surface);color:inherit'
  focusSurface.textContent = '操作'
  surface.append('主要文字', muted, highlight, separator, focusSurface)
  boundary.append(surface)
  ;(parent ?? host).append(boundary)
  return { boundary, surface, muted, highlight, separator, focusSurface }
}

type Fixture = ReturnType<typeof fixture>

function recipe(view: Fixture) {
  const style = getComputedStyle(view.surface)
  return {
    background: style.backgroundColor,
    backdrop: style.backdropFilter,
    foreground: style.color,
    border: style.borderTopColor,
    shadow: style.boxShadow,
    highlight: getComputedStyle(view.highlight).backgroundColor,
    separator: getComputedStyle(view.separator).borderTopColor,
    muted: getComputedStyle(view.muted).color,
    focusSurface: getComputedStyle(view.focusSurface).backgroundColor,
  }
}

function rgba(color: string): Uint8ClampedArray {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data
}

afterEach(async () => {
  host?.remove()
  host = undefined
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('m3 通透玻璃令牌在浏览器中的组合', () => {
  it.each(['light', 'dark'] as const)('%s：九项材质消费有效，76%% 遮蔽与 24px 磨砂成立', (theme) => {
    const view = fixture(theme)
    const style = recipe(view)
    expect(rgba(style.background)[3]).toBeCloseTo(255 * 0.76, 0)
    expect(style.backdrop).toBe('blur(24px) saturate(1.12)')
    expect(rgba(style.border)[3]).toBeGreaterThan(0)
    expect(rgba(style.highlight)[3]).toBeGreaterThan(0)
    expect(rgba(style.separator)[3]).toBeGreaterThan(0)
    expect(style.shadow).not.toBe('none')
    expect(style.foreground).not.toBe(style.muted)
    expect(rgba(style.foreground)[3]).toBe(255)
    expect(rgba(style.muted)[3]).toBe(255)
    expect(rgba(style.focusSurface)[3]).toBe(255)
  })

  it('局部浅深主题相互独立，切换一处不改兄弟材质', () => {
    const light = fixture('light')
    const dark = fixture('dark')
    const lightBefore = recipe(light)
    const darkBefore = recipe(dark)
    expect(lightBefore.background).not.toBe(darkBefore.background)
    expect(lightBefore.foreground).not.toBe(darkBefore.foreground)
    light.boundary.dataset.theme = 'dark'
    expect(recipe(light)).toEqual(darkBefore)
    expect(recipe(dark)).toEqual(darkBefore)
    light.boundary.dataset.theme = 'light'
    expect(recipe(light)).toEqual(lightBefore)
  })

  it.each(['light', 'dark'] as const)('%s：嵌套 contrast-more 与主题同边界的结果一致', (theme) => {
    const combined = fixture(theme)
    combined.boundary.dataset.contrast = 'more'
    const nested = fixture(theme)
    nested.surface.dataset.contrast = 'more'
    const expected = recipe(combined)
    expect(rgba(expected.background)[3]).toBe(255)
    expect(expected.backdrop).toBe('none')
    expect(expected.shadow).toBe('none')
    expect(rgba(expected.highlight)[3]).toBe(0)
    expect(recipe(nested)).toEqual(expected)
  })

  it.each(['light', 'dark'] as const)('%s：显式减弱动效只改变时长和距离，不改材质颜色', (theme) => {
    const view = fixture(theme)
    const before = recipe(view)
    view.surface.dataset.motion = 'reduce'
    expect(recipe(view)).toEqual(before)
    expect(getComputedStyle(view.surface).transitionDuration).toBe('0.001s')
    expect(getComputedStyle(view.surface).getPropertyValue('--xh-motion-distance-sm').trim()).toBe('0px')
    view.boundary.dataset.contrast = 'more'
    expect(getComputedStyle(view.surface).transitionDuration).toBe('0.001s')
    expect(recipe(view).backdrop).toBe('none')
  })

  it.each(['light', 'dark'] as const)('%s：局部主题切换保留祖先明确启用的增强对比度', (theme) => {
    const expected = fixture(theme)
    expected.boundary.dataset.contrast = 'more'
    const outer = document.createElement('div')
    outer.dataset.contrast = 'more'
    host!.append(outer)
    const nested = fixture(theme, outer)
    expect(recipe(nested)).toEqual(recipe(expected))
  })

  it('深→浅→深多层主题读取最近主题，并继承最近的 more/default 对比度边界', () => {
    const lightDefault = fixture('light')
    const darkDefault = fixture('dark')
    const lightMore = fixture('light')
    lightMore.boundary.dataset.contrast = 'more'
    const darkMore = fixture('dark')
    darkMore.boundary.dataset.contrast = 'more'
    const expectedLightDefault = recipe(lightDefault)
    const expectedDarkDefault = recipe(darkDefault)
    const expectedLightMore = recipe(lightMore)
    const expectedDarkMore = recipe(darkMore)

    const outer = fixture('dark')
    outer.boundary.dataset.contrast = 'more'
    const middle = fixture('light', outer.surface)
    const inner = fixture('dark', middle.surface)
    const sibling = fixture('light', outer.surface)
    expect(recipe(outer)).toEqual(expectedDarkMore)
    expect(recipe(middle)).toEqual(expectedLightMore)
    expect(recipe(inner)).toEqual(expectedDarkMore)
    expect(recipe(sibling)).toEqual(expectedLightMore)

    middle.boundary.dataset.contrast = 'default'
    expect(recipe(middle)).toEqual(expectedLightDefault)
    expect(recipe(inner)).toEqual(expectedDarkDefault)
    expect(recipe(sibling)).toEqual(expectedLightMore)
    expect(recipe(outer)).toEqual(expectedDarkMore)

    inner.surface.dataset.contrast = 'more'
    expect(recipe(inner)).toEqual(expectedDarkMore)
    expect(recipe(middle)).toEqual(expectedLightDefault)
    delete middle.boundary.dataset.contrast
    expect(recipe(middle)).toEqual(expectedLightMore)
    expect(recipe(inner)).toEqual(expectedDarkMore)
    delete inner.surface.dataset.contrast
    expect(recipe(inner)).toEqual(expectedDarkMore)
  })

  it.each(['light', 'dark'] as const)('%s：无主题的 default 子边界恢复默认材质，不改变兄弟', (theme) => {
    const expected = recipe(fixture(theme))
    const view = fixture(theme)
    view.boundary.dataset.contrast = 'more'
    const sibling = document.createElement('section')
    sibling.style.background = 'var(--xh-material-glass-bg)'
    view.boundary.append(sibling)
    const siblingBefore = getComputedStyle(sibling).backgroundColor
    view.surface.dataset.contrast = 'default'
    expect(recipe(view)).toEqual(expected)
    expect(getComputedStyle(sibling).backgroundColor).toBe(siblingBefore)
    expect(rgba(siblingBefore)[3]).toBe(255)
    delete view.surface.dataset.contrast
    expect(rgba(recipe(view).background)[3]).toBe(255)
  })

  for (const contrast of ['default', 'more'] as const) {
    it.each(['light', 'dark'] as const)(`%s/${contrast}：公开 border-subtle 覆盖传到同源材质边框`, (theme) => {
      const view = fixture(theme)
      view.boundary.dataset.contrast = contrast
      const originalGlassBorder = recipe(view).border
      const soft = document.createElement('section')
      soft.style.border = '1px solid var(--xh-material-soft-border)'
      const softSeparator = document.createElement('hr')
      softSeparator.style.borderTop = '1px solid var(--xh-material-soft-separator)'
      const publicBorder = document.createElement('span')
      publicBorder.style.color = 'var(--xh-border-subtle)'
      view.boundary.append(soft, softSeparator, publicBorder)
      view.boundary.style.setProperty('--xh-border-subtle', 'rgb(12, 96, 144)')
      const expected = getComputedStyle(publicBorder).color
      expect(expected).toBe('rgb(12, 96, 144)')
      expect(getComputedStyle(soft).borderTopColor).toBe(expected)
      expect(getComputedStyle(softSeparator).borderTopColor).toBe(expected)
      if (contrast === 'more') {
        expect(recipe(view).border).toBe(expected)
        expect(recipe(view).separator).toBe(expected)
      }
      else {
        // 默认 M3 边框本来是独立的透明边缘色，不误绑定到通用分隔线。
        expect(recipe(view).border).toBe(originalGlassBorder)
      }
    })
  }

  it.each(['light', 'dark'] as const)('%s：系统减少透明对局部主题和作用域生效', async (theme) => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
    })
    expect(matchMedia('(prefers-reduced-transparency: reduce)').matches).toBe(true)
    const view = fixture(theme)
    const style = recipe(view)
    expect(rgba(style.background)[3]).toBe(255)
    expect(style.backdrop).toBe('none')
    expect(rgba(style.highlight)[3]).toBe(0)
    expect(rgba(style.focusSurface)[3]).toBe(255)
  })

  it.each(['light', 'dark'] as const)('%s：系统强制色接管九项材质通道', async (theme) => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    expect(matchMedia('(forced-colors: active)').matches).toBe(true)
    const view = fixture(theme)
    const style = recipe(view)
    const tokens = getComputedStyle(view.surface)
    expect(tokens.getPropertyValue('--xh-material-glass-bg').trim()).toBe('Canvas')
    expect(tokens.getPropertyValue('--xh-material-glass-fg').trim()).toBe('CanvasText')
    expect(tokens.getPropertyValue('--xh-material-glass-fg-muted').trim()).toBe('CanvasText')
    expect(tokens.getPropertyValue('--xh-material-glass-highlight').trim()).toBe('transparent')
    expect(style.backdrop).toBe('none')
    expect(style.shadow).toBe('none')
    expect(rgba(style.background)[3]).toBe(255)
    expect(style.foreground).toBe(style.muted)
    expect(style.border).toBe(style.foreground)
    expect(style.separator).toBe(style.foreground)
    expect(style.focusSurface).toBe(style.background)
  })
})
