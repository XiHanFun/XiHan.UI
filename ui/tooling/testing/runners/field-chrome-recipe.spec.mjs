import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileFieldChromeRecipe } from '../../../packages/design/styles/build/field-chrome-recipe.mjs'

const UI_ROOT = join(import.meta.dirname, '..', '..', '..')
const SOURCE = join(UI_ROOT, 'packages/design/styles/recipes/field-chrome.recipe.json')
const TEXT_FIELD = join(UI_ROOT, 'packages/design/styles/css/text-field.css')
const COLOR_FIELD = join(UI_ROOT, 'packages/design/styles/css/color-field.css')

function block(css, selector) {
  const start = css.indexOf(`\n  ${selector} {\n`)
  if (start < 0)
    throw new Error(`未找到规则块：${selector}`)
  const end = css.indexOf('\n  }', start)
  return css.slice(start, end)
}

function variantSlots(body) {
  return body.match(/--xh-_field-variant-[a-z-]+: [^;]+;/g) ?? []
}

async function source() {
  return JSON.parse(await readFile(SOURCE, 'utf8'))
}

describe('field Chrome Family Recipe', () => {
  it('三布局 × 三尺寸 × 三形态与七状态均从单一源生成', async () => {
    const recipe = await source()
    const css = compileFieldChromeRecipe(recipe)

    expect(recipe.layouts).toEqual(['single-line', 'textarea', 'multi-tag'])
    expect(recipe.sizes).toEqual(['sm', 'md', 'lg'])
    expect(recipe.variants).toEqual(['outline', 'subtle', 'ghost'])
    expect(recipe.defaultVariant).toBe('outline')
    expect(recipe.states).toEqual(['rest', 'hover', 'focus', 'invalid', 'readOnly', 'disabled', 'loading'])
    for (const layout of recipe.layouts)
      expect(css).toContain(`[data-xh-field-layout='${layout}']`)
    for (const size of recipe.sizes)
      expect(css).toContain(`[data-xh-field-chrome][data-xh-field-size='${size}']`)
    for (const variant of recipe.variants)
      expect(css).toContain(`[data-xh-field-chrome][data-variant='${variant}']`)
    expect(css).toContain('[data-xh-field-chrome][data-invalid]')
    expect(css).toContain('[data-xh-field-chrome][data-readonly]')
    expect(css).toContain('[data-xh-field-chrome][data-disabled]')
    expect(css).toContain('[data-xh-field-chrome][data-loading]')

    // 缺省（不带 data-variant）与显式 outline 输出同一组形态槽
    const base = variantSlots(block(css, '[data-xh-field-chrome]'))
    const outline = variantSlots(block(css, '[data-xh-field-chrome][data-variant=\'outline\']'))
    expect(base.length).toBeGreaterThan(0)
    expect(base).toEqual(outline)
  })

  it('形态矩阵按真源不变量生成', async () => {
    const recipe = await source()
    const css = compileFieldChromeRecipe(recipe)

    expect(css).not.toContain('--xh-elevation-')
    for (const variant of recipe.variants) {
      const value = recipe.variantValues[variant]
      expect(value.focus.borderColor).toBe('var(--xh-border-control-focus)')
      expect(value.disabled).toEqual({ backgroundColor: 'var(--xh-bg-subtle)', borderColor: 'var(--xh-border-default)' })
    }
    for (const variant of ['subtle', 'ghost']) {
      const value = recipe.variantValues[variant]
      expect(value.rest.borderColor).toBe('transparent')
      expect(value.hover.borderColor).not.toBe('transparent')
      expect(value.focus.borderColor).not.toBe('transparent')
    }
    const hover = block(css, '[data-xh-field-chrome]:not([data-disabled]):not([data-readonly]):not([data-invalid]):not([data-loading]):hover')
    expect(hover).toContain('var(--xh-_field-variant-border-hover)')
    const disabled = block(css, '[data-xh-field-chrome][data-disabled]')
    expect(disabled).toContain('var(--xh-_field-variant-border-disabled)')
    expect(disabled).not.toContain('box-shadow')
    expect(block(css, '[data-xh-field-chrome][data-readonly]')).not.toContain('box-shadow')
  })

  it('输入能力覆盖装饰段、占位、自动填充、textarea 与原生 IME', async () => {
    const recipe = await source()
    const css = compileFieldChromeRecipe(recipe)
    expect(css).toContain('[data-xh-field-affix]')
    expect(css).toContain('[data-xh-field-input]::placeholder')
    expect(css).toContain('[data-xh-field-input]:autofill')
    expect(css).toContain('[data-xh-field-input]:-webkit-autofill')
    expect(css).toContain('[data-xh-field-input][data-xh-field-layout=\'textarea\']')
    expect(css).toContain('[data-xh-field-auto-size]')
    expect(recipe.nativeInput.ime).toBe('preserve-native-composition')
    expect(css).not.toContain('ime-mode')
  })

  it('compact 只复用密度语义令牌，RTL 只使用逻辑轴', async () => {
    const recipe = await source()
    const css = compileFieldChromeRecipe(recipe)
    expect(recipe.compact.strategy).toBe('semantic-token-remap')
    for (const token of recipe.compact.tokens)
      expect(css).toContain(`var(${token})`)
    expect(recipe.direction).toEqual({ axis: 'logical', flow: 'row' })
    expect(css).toMatch(/padding-inline|inline-size|block-size|text-align: start/)
    expect(css).not.toMatch(/(?:^|\s)(?:left|right|width|height|margin-left|margin-right|padding-left|padding-right)\s*:/m)
  })

  it('forced-colors 输出完整；减弱动效交给令牌，换色淡变在减弱档下保留', async () => {
    const css = compileFieldChromeRecipe(await source())
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('background-color: Canvas')
    expect(css).toContain('color: GrayText')
    // 外壳只过渡颜色，时长取 micro：减弱档下它保留为淡变，配方不另写 transition: none 把淡变关掉
    expect(css).not.toContain('prefers-reduced-motion')
    expect(css).not.toContain('data-motion')
    expect(css).not.toMatch(/transition:\s*none/)
  })

  it('未知尺寸、布局、状态与重复登记都会明确失败', async () => {
    const mutations = [
      value => value.sizes.push('xl'),
      value => value.layouts.push('segments'),
      value => value.states.push('success'),
      (value) => { value.sizeValues.xl = structuredClone(value.sizeValues.lg) },
      (value) => { value.layouts[1] = 'single-line' },
      (value) => { value.nativeInput.ime = 'legacy-fallback' },
      value => value.variants.push('solid'),
      (value) => { value.variantValues.subtle.focus.borderColor = 'var(--xh-_tone)' },
      (value) => { value.variantValues.ghost.hover.borderColor = 'transparent' },
      (value) => { value.stateValues.rest.shadow = 'var(--xh-elevation-raised)' },
      (value) => { delete value.variantValues.ghost.loading },
    ]
    for (const mutate of mutations) {
      const recipe = await source()
      mutate(recipe)
      expect(() => compileFieldChromeRecipe(recipe)).toThrow(/\[field-chrome-recipe\]/)
    }
  })

  it.each([
    ['text-field', TEXT_FIELD],
    ['color-field', COLOR_FIELD],
  ])('%s 独立皮肤复用家族配方且不复制公共状态与形态', async (id, path) => {
    const css = await readFile(path, 'utf8')
    expect(css).toContain('@import \'../family/field-chrome.css\';')
    expect(css).toContain('@import \'../family/action-control.css\';')
    expect(css).not.toMatch(new RegExp(`\\[data-scope='${id}'\\]\\[data-part='control'\\]:(?:hover|focus-within)`))
    expect(css).not.toContain('@media (pointer: coarse)')
    expect(css).not.toContain(':-webkit-autofill')
    expect(css).not.toContain('::placeholder')
    // 形态与海拔只由家族真源决定，皮肤不再声明私有 bg/border/shadow 槽与 variant 规则
    expect(css).not.toMatch(/--xh-_(?:text|color)-field-(?:bg|border|shadow)/)
    expect(css).not.toContain('[data-variant=')
    expect(css).not.toContain('--xh-elevation-raised')
  })

  it('业务侧未命名空间的 data-field 不会命中家族选择器', async () => {
    const css = compileFieldChromeRecipe(await source())
    expect(css).toContain('[data-xh-field-chrome]')
    expect(css).not.toMatch(/\[data-field-(?:chrome|owner|input|affix|layout|size)/)
    expect(css).not.toContain('[data-scope=')
  })
})
