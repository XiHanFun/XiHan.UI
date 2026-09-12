import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileActionControlRecipe } from '../../../packages/design/styles/build/action-control-recipe.mjs'

const UI_ROOT = join(import.meta.dirname, '..', '..', '..')
const SOURCE = join(UI_ROOT, 'packages/design/styles/recipes/action-control.recipe.json')
const BUTTON = join(UI_ROOT, 'packages/design/styles/css/button.css')

async function source() {
  return JSON.parse(await readFile(SOURCE, 'utf8'))
}

describe('action Control Family Recipe', () => {
  it('四 profile × 四尺寸与六状态均从单一源生成', async () => {
    const recipe = await source()
    const css = compileActionControlRecipe(recipe)

    expect(recipe.order).toEqual(['text', 'icon', 'field-inset', 'floating'])
    expect(recipe.sizes).toEqual(['xs', 'sm', 'md', 'lg'])
    expect(Object.keys(recipe.states)).toEqual(['rest', 'hover', 'pressed', 'focus-visible', 'disabled', 'loading'])
    for (const profile of recipe.order)
      expect(css).toContain(`[data-xh-action-control][data-xh-action-profile='${profile}']`)
    for (const size of recipe.sizes)
      expect(css).toContain(`[data-xh-action-control][data-xh-action-size='${size}']`)
    expect(css).toContain('@media (pointer: coarse)')
    expect(css).toContain('min-inline-size: 44px')
    expect(css).toContain('min-block-size: 44px')
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('scale var(--xh-motion-duration-micro)')
    expect(css).toContain('var(--xh-motion-scale-press)')
  })

  it('三种显示策略完整，粗指针不依赖 hover', async () => {
    const recipe = await source()
    const css = compileActionControlRecipe(recipe)
    expect(recipe.displays).toEqual(['always', 'has-value', 'hover-focus'])
    expect(css).toContain('[data-xh-action-control][data-xh-action-display=\'always\']')
    expect(css).toContain('[data-xh-action-control][data-xh-action-display=\'has-value\']:not([data-xh-action-has-value])')
    expect(css).toContain('@media (hover: hover) and (pointer: fine)')
    const coarse = css.slice(css.indexOf('@media (pointer: coarse)'), css.indexOf('@media (forced-colors: active)'))
    expect(coarse).not.toContain('hover-focus')
    const textTarget = coarse.slice(coarse.indexOf('data-xh-action-profile=\'text\''), coarse.indexOf('data-xh-action-profile=\'icon\''))
    expect(textTarget).toContain('min-block-size: 44px')
    expect(textTarget).not.toContain('min-inline-size')
  })

  it('默认值相同的状态仍保留独立覆盖槽', async () => {
    const css = compileActionControlRecipe(await source())
    // hover 的前景与 rest 默认都取 fg-default，但组件仍可只覆盖 hover，不能被编译优化吞掉。
    expect(css).toContain('color: var(--xh-action-fg-hover, var(--xh-fg-default));')
    expect(css).toContain('opacity: var(--xh-action-opacity-loading, 1);')
    expect(css).toContain('cursor: var(--xh-action-cursor-focus-visible, pointer);')
  })

  it('compact 只复用密度轴语义令牌，RTL 只使用逻辑轴', async () => {
    const recipe = await source()
    const css = compileActionControlRecipe(recipe)
    expect(recipe.compact.strategy).toBe('semantic-token-remap')
    for (const token of recipe.compact.tokens)
      expect(css).toContain(`var(${token})`)
    expect(recipe.direction).toEqual({ axis: 'logical', flow: 'row' })
    expect(css).toMatch(/padding-inline|inline-size|block-size/)
    expect(css).not.toMatch(/(?:^|\s)(?:left|right|width|height|margin-left|margin-right|padding-left|padding-right)\s*:/m)
  })

  it('未知 profile/state/display/size 与重复登记都会显式失败', async () => {
    const mutations = [
      (value) => { value.profiles.legacy = structuredClone(value.profiles.text) },
      (value) => { value.states.selected = structuredClone(value.states.rest) },
      (value) => { value.displays.push('touch-only') },
      (value) => { value.sizes.push('xl') },
      (value) => { value.order[1] = 'text' },
    ]
    for (const mutate of mutations) {
      const recipe = await source()
      mutate(recipe)
      expect(() => compileActionControlRecipe(recipe)).toThrow(/\[action-control-recipe\]/)
    }
  })

  it('button 独立皮肤直接引用 Family Recipe，且不再复制通用状态与粗指针规则', async () => {
    const css = await readFile(BUTTON, 'utf8')
    expect(css.startsWith('/* 独立 Button 皮肤')).toBe(true)
    expect(css).toContain('@import \'../family/action-control.css\';')
    expect(css).not.toContain('@media (pointer: coarse)')
    expect(css).not.toMatch(/\[data-scope='button'\]\[data-part='root'\]:not\(\[data-disabled\]\):not\(\[data-loading\]\):(hover|active)/)
  })

  it('业务侧同名的未命名空间属性不会命中家族选择器', async () => {
    const css = compileActionControlRecipe(await source())
    expect(css).toContain('[data-xh-action-control]')
    expect(css).not.toMatch(/\[data-action-(?:control|profile|display|size|has-value|owner)/)
  })
})
