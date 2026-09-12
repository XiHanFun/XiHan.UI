import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileFieldChromeRecipe } from '../../../packages/design/styles/build/field-chrome-recipe.mjs'

const UI_ROOT = join(import.meta.dirname, '..', '..', '..')
const SOURCE = join(UI_ROOT, 'packages/design/styles/recipes/field-chrome.recipe.json')
const TEXT_FIELD = join(UI_ROOT, 'packages/design/styles/css/text-field.css')

async function source() {
  return JSON.parse(await readFile(SOURCE, 'utf8'))
}

describe('field Chrome Family Recipe', () => {
  it('三布局 × 三尺寸与七状态均从单一源生成', async () => {
    const recipe = await source()
    const css = compileFieldChromeRecipe(recipe)

    expect(recipe.layouts).toEqual(['single-line', 'textarea', 'multi-tag'])
    expect(recipe.sizes).toEqual(['sm', 'md', 'lg'])
    expect(recipe.states).toEqual(['rest', 'hover', 'focus', 'invalid', 'readOnly', 'disabled', 'loading'])
    for (const layout of recipe.layouts)
      expect(css).toContain(`[data-xh-field-layout='${layout}']`)
    for (const size of recipe.sizes)
      expect(css).toContain(`[data-xh-field-chrome][data-xh-field-size='${size}']`)
    expect(css).toContain('[data-xh-field-chrome][data-invalid]')
    expect(css).toContain('[data-xh-field-chrome][data-readonly]')
    expect(css).toContain('[data-xh-field-chrome][data-disabled]')
    expect(css).toContain('[data-xh-field-chrome][data-loading]')
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

  it('forced-colors 与两种 reduced-motion 入口都完整', async () => {
    const css = compileFieldChromeRecipe(await source())
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('background-color: Canvas')
    expect(css).toContain('color: GrayText')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain(':where([data-motion=\'reduce\']) [data-xh-field-chrome]')
  })

  it('未知尺寸、布局、状态与重复登记都会明确失败', async () => {
    const mutations = [
      value => value.sizes.push('xl'),
      value => value.layouts.push('segments'),
      value => value.states.push('success'),
      (value) => { value.sizeValues.xl = structuredClone(value.sizeValues.lg) },
      (value) => { value.layouts[1] = 'single-line' },
      (value) => { value.nativeInput.ime = 'legacy-fallback' },
    ]
    for (const mutate of mutations) {
      const recipe = await source()
      mutate(recipe)
      expect(() => compileFieldChromeRecipe(recipe)).toThrow(/\[field-chrome-recipe\]/)
    }
  })

  it('textField 独立皮肤复用两份家族配方且不复制公共状态', async () => {
    const css = await readFile(TEXT_FIELD, 'utf8')
    expect(css).toContain('@import \'../family/field-chrome.css\';')
    expect(css).toContain('@import \'../family/action-control.css\';')
    expect(css).not.toMatch(/\[data-scope='text-field'\]\[data-part='control'\]:(?:hover|focus-within)/)
    expect(css).not.toContain('@media (pointer: coarse)')
    expect(css).not.toContain(':-webkit-autofill')
    expect(css).not.toContain('::placeholder')
  })

  it('业务侧未命名空间的 data-field 不会命中家族选择器', async () => {
    const css = compileFieldChromeRecipe(await source())
    expect(css).toContain('[data-xh-field-chrome]')
    expect(css).not.toMatch(/\[data-field-(?:chrome|owner|input|affix|layout|size)/)
    expect(css).not.toContain('[data-scope=')
  })
})
