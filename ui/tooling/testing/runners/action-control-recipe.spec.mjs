import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileActionControlRecipe } from '../../../packages/design/styles/build/action-control-recipe.mjs'

const UI_ROOT = join(import.meta.dirname, '..', '..', '..')
const SOURCE = join(UI_ROOT, 'packages/design/styles/recipes/action-control.recipe.json')
const BUTTON = join(UI_ROOT, 'packages/design/styles/css/button.css')

const VARIANTS = ['solid', 'subtle', 'outline', 'ghost']
const STATES = ['rest', 'hover', 'pressed', 'focus-visible', 'disabled', 'loading']

async function source() {
  return JSON.parse(await readFile(SOURCE, 'utf8'))
}

/** 取某个顶层选择器的规则体（不含花括号）。 */
function block(css, selector) {
  const start = css.indexOf(`\n  ${selector} {`)
  if (start < 0)
    throw new Error(`找不到规则：${selector}`)
  return css.slice(start, css.indexOf('\n  }', start))
}

describe('action Control Family Recipe', () => {
  it('六 profile × 四尺寸与六状态均从单一源生成', async () => {
    const recipe = await source()
    const css = compileActionControlRecipe(recipe)

    expect(recipe.order).toEqual(['text', 'icon', 'field-inset', 'floating', 'row', 'disclosure-trigger'])
    expect(recipe.sizes).toEqual(['xs', 'sm', 'md', 'lg'])
    expect(Object.keys(recipe.states)).toEqual(STATES)
    for (const profile of recipe.order)
      expect(css).toContain(`[data-xh-action-control][data-xh-action-profile='${profile}']`)
    for (const size of recipe.sizes)
      expect(css).toContain(`[data-xh-action-control][data-xh-action-size='${size}']`)
    expect(css).toContain('@media (pointer: coarse)')
    expect(css).toContain('min-inline-size: 44px')
    expect(css).toContain('min-block-size: 44px')
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('scale var(--xh-motion-duration-release) var(--xh-motion-ease-release)')
    expect(css).toContain('var(--xh-motion-scale-press)')
    // 按压面同时认指针 :active 与 Headless 投影的 data-pressed（键盘 / 触屏），同一档
    const pressed = css.slice(css.indexOf(':not([data-loading]):is(:active, [data-pressed]) {'), css.indexOf('[data-xh-action-control][data-disabled]'))
    expect(css).not.toMatch(/:not\(\[data-loading\]\):active/)
    expect(pressed).toContain('transition-duration: var(--xh-motion-duration-press);')
    expect(pressed).toContain('transition-timing-function: var(--xh-motion-ease-press);')
  })

  it('四形态 × 六态只含颜色三通道，states 只留与形态无关的通道', async () => {
    const recipe = await source()
    expect(recipe.variants).toEqual(VARIANTS)
    expect(recipe.defaultVariant).toBe('subtle')
    expect(Object.keys(recipe.matrix)).toEqual(VARIANTS)
    for (const variant of VARIANTS) {
      expect(Object.keys(recipe.matrix[variant])).toEqual(STATES)
      for (const state of STATES)
        expect(Object.keys(recipe.matrix[variant][state])).toEqual(['backgroundColor', 'color', 'borderColor'])
    }
    for (const state of STATES) {
      const fields = Object.keys(recipe.states[state])
      expect(fields).not.toContain('backgroundColor')
      expect(fields).not.toContain('color')
      expect(fields).not.toContain('borderColor')
    }
  })

  it('无 data-xh-action-variant 时等价 subtle：根规则与 subtle 形态规则逐字相同', async () => {
    const recipe = await source()
    const css = compileActionControlRecipe(recipe)
    const root = block(css, '[data-xh-action-control]')
    const subtle = block(css, '[data-xh-action-control][data-xh-action-variant=\'subtle\']')
    const declared = line => line.trim().startsWith('--xh-_action-variant-')
    const rootVariantLines = root.split('\n').filter(declared)
    const subtleLines = subtle.split('\n').filter(declared)
    expect(rootVariantLines).toHaveLength(18)
    expect(rootVariantLines).toEqual(subtleLines)
    expect(root).toContain('--xh-_action-variant-bg-rest: var(--xh-_tone-subtle, var(--xh-bg-subtle));')
    expect(root).toContain('--xh-_action-variant-bg-hover: var(--xh-_tone-subtle-hover, var(--xh-bg-subtle-hover));')
    expect(root).toContain('--xh-_action-variant-bg-pressed: var(--xh-_tone-subtle-active, var(--xh-bg-subtle-active));')
    for (const variant of VARIANTS)
      expect(css).toContain(`[data-xh-action-control][data-xh-action-variant='${variant}'] {`)
  })

  it('ghost / outline 的悬停与按下面走承载面阶梯，画布缺省 100 → 200；subtle 200 → 300', async () => {
    const recipe = await source()
    const css = compileActionControlRecipe(recipe)
    for (const variant of ['ghost', 'outline']) {
      const body = block(css, `[data-xh-action-control][data-xh-action-variant='${variant}']`)
      expect(body).toContain('--xh-_action-variant-bg-rest: transparent;')
      expect(body).toContain('--xh-_action-variant-bg-hover: var(--xh-_tone-subtle, var(--xh-action-host-bg-hover, var(--xh-bg-subtle)));')
      expect(body).toContain('--xh-_action-variant-bg-pressed: var(--xh-_tone-subtle-hover, var(--xh-action-host-bg-pressed, var(--xh-bg-subtle-hover)));')
      /* 300 只留给淡底承载的 pressed，由容器经 --xh-action-host-bg-pressed 下发，家族里不直接写。 */
      expect(body).not.toContain('--xh-bg-subtle-active')
      /* focus-visible 与 loading 保持 rest 面，不再退回家族默认的淡底。 */
      expect(body).toContain('--xh-_action-variant-bg-focus-visible: transparent;')
      expect(body).toContain('--xh-_action-variant-bg-loading: transparent;')
    }
    const outline = block(css, '[data-xh-action-control][data-xh-action-variant=\'outline\']')
    expect(outline).toContain('--xh-_action-variant-border-rest: var(--xh-_tone-border-control, var(--xh-border-control));')
    expect(outline).toContain('--xh-_action-variant-border-hover: var(--xh-_tone-border-control, var(--xh-border-control-hover));')
    expect(outline).toContain('--xh-_action-variant-border-disabled: var(--xh-border-subtle);')
    const subtle = block(css, '[data-xh-action-control][data-xh-action-variant=\'subtle\']')
    expect(subtle).toContain('--xh-_action-variant-bg-pressed: var(--xh-_tone-subtle-active, var(--xh-bg-subtle-active));')
    expect(subtle).not.toContain('--xh-action-host-bg-')
    expect(recipe.host).toEqual({
      $description: expect.any(String),
      hover: 'var(--xh-bg-subtle)',
      pressed: 'var(--xh-bg-subtle-hover)',
    })
  })

  it('row / disclosure-trigger 铺满一行、只换面不缩放，粗指针只扩块轴', async () => {
    const recipe = await source()
    const css = compileActionControlRecipe(recipe)
    for (const profile of ['row', 'disclosure-trigger']) {
      expect(recipe.profiles[profile].layout).toMatchObject({ square: false, fill: true, press: 'surface' })
      const body = block(css, `[data-xh-action-control][data-xh-action-profile='${profile}']`)
      expect(body).toContain('inline-size: 100%;')
      expect(body).toContain('block-size: auto;')
      expect(body).toContain('min-block-size: var(--xh-action-visual-size, var(--xh-_action-profile-visual-size));')
      expect(body).toContain('padding-block: var(--xh-action-padding-block, var(--xh-_action-profile-padding-block));')
      expect(body).toContain(`justify-content: ${recipe.profiles[profile].layout.justify};`)
    }
    const generic = css.indexOf('[data-xh-action-control]:not([data-disabled]):not([data-loading]):is(:active, [data-pressed]) {')
    const surface = css.indexOf('[data-xh-action-control]:is([data-xh-action-profile=\'row\'], [data-xh-action-profile=\'disclosure-trigger\']):not([data-disabled]):not([data-loading]):is(:active, [data-pressed]) {')
    expect(generic).toBeGreaterThan(-1)
    expect(surface).toBeGreaterThan(generic)
    expect(css.slice(surface, css.indexOf('\n  }', surface))).toContain('scale: none;')
    for (const profile of ['text', 'icon', 'field-inset', 'floating']) {
      expect(recipe.profiles[profile].layout).toMatchObject({ fill: false, press: 'scale' })
      for (const size of recipe.sizes)
        expect(recipe.profiles[profile].sizes[size].paddingBlock).toBe('0')
    }
    const coarse = css.slice(css.indexOf('@media (pointer: coarse)'), css.indexOf('@media (forced-colors: active)'))
    const textTarget = coarse.slice(coarse.indexOf('data-xh-action-profile=\'text\''), coarse.indexOf('data-xh-action-profile=\'icon\''))
    expect(textTarget).toContain('[data-xh-action-profile=\'row\']')
    expect(textTarget).toContain('[data-xh-action-profile=\'disclosure-trigger\']')
    const squareTarget = coarse.slice(coarse.indexOf('data-xh-action-profile=\'icon\''))
    expect(squareTarget).not.toContain('[data-xh-action-profile=\'row\']')
    expect(squareTarget).not.toContain('[data-xh-action-profile=\'disclosure-trigger\']')
  })

  it('深色主题品牌实心上收进家族 solid 形态', async () => {
    const css = compileActionControlRecipe(await source())
    const body = block(css, ':is([data-theme=\'dark\'] *, [data-theme=\'dark\'])[data-xh-action-control][data-xh-action-variant=\'solid\']:is(:not([data-tone]), [data-tone=\'brand\'])')
    expect(body).toContain('--xh-_action-variant-bg-rest: var(--xh-action-brand-solid);')
    expect(body).toContain('--xh-_action-variant-bg-hover: var(--xh-action-brand-solid-hover);')
    expect(body).toContain('--xh-_action-variant-bg-pressed: var(--xh-action-brand-solid-active);')
    expect(body).toContain('--xh-_action-variant-fg-rest: var(--xh-action-on-brand-solid);')
    expect(body).toContain('--xh-_action-variant-fg-pressed: var(--xh-action-on-brand-solid);')
    expect(body).not.toContain('-disabled')
    /* 形态规则在前、深色实心在后，形态规则才不会盖掉主题覆盖。 */
    expect(css.indexOf('[data-xh-action-variant=\'ghost\'] {')).toBeLessThan(css.indexOf('[data-theme=\'dark\']'))
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

  it('粗指针热区的 ::after 规则整个由 :where() 包住，皮肤对同一伪元素的覆盖不受源序影响', async () => {
    const css = compileActionControlRecipe(await source())
    const coarse = css.slice(css.indexOf('@media (pointer: coarse)'), css.indexOf('@media (forced-colors: active)'))
    const selectors = coarse.split('\n').filter(line => line.trimEnd().endsWith('{')).map(line => line.trim().slice(0, -1).trim()).filter(s => !s.startsWith('@'))
    expect(selectors.length).toBe(2)
    for (const selector of selectors) {
      // (0,0,1)：伪元素自身的那一分之外全部归零。消费方产物里家族被重复内联、副本落在皮肤之后时，
      // 皮肤那条 (0,2,1) 的覆盖也不会被反超
      expect(selector).toMatch(/^:where\([^{}]+\)::after$/)
      expect(selector).toContain('[data-xh-action-control]')
    }
  })

  it('默认值相同的状态仍保留独立覆盖槽，颜色槽缺省指向形态矩阵', async () => {
    const css = compileActionControlRecipe(await source())
    // hover 的前景与 rest 默认都取 fg-default，但组件仍可只覆盖 hover，不能被编译优化吞掉。
    expect(css).toContain('color: var(--xh-action-fg-hover, var(--xh-_action-variant-fg-hover));')
    expect(css).toContain('background-color: var(--xh-action-bg-pressed, var(--xh-_action-variant-bg-pressed));')
    expect(css).toContain('border: var(--xh-stroke-thin) solid var(--xh-action-border-rest, var(--xh-_action-variant-border-rest));')
    expect(css).toContain('border-color: var(--xh-action-border-hover, var(--xh-_action-variant-border-hover));')
    expect(css).toContain('opacity: var(--xh-action-opacity-loading, 1);')
    // disabled 同时降级前景与表面，不再只靠 opacity
    expect(css).toContain('color: var(--xh-action-fg-disabled, var(--xh-_action-variant-fg-disabled));')
    expect(css).toContain('opacity: var(--xh-action-opacity-disabled, 1);')
    expect(css).toContain('cursor: var(--xh-action-cursor-focus-visible, pointer);')
  })

  it('compact 只复用密度轴语义令牌，RTL 只使用逻辑轴', async () => {
    const recipe = await source()
    const css = compileActionControlRecipe(recipe)
    expect(recipe.compact.strategy).toBe('semantic-token-remap')
    expect(recipe.compact.tokens).toEqual(expect.arrayContaining(['--xh-list-option-py-sm', '--xh-list-option-py-md', '--xh-list-option-py-lg']))
    for (const token of recipe.compact.tokens)
      expect(css).toContain(`var(${token})`)
    expect(recipe.direction).toEqual({ axis: 'logical', flow: 'row' })
    expect(css).toMatch(/padding-inline|inline-size|block-size/)
    expect(css).not.toMatch(/(?:^|\s)(?:left|right|width|height|margin-left|margin-right|padding-left|padding-right)\s*:/m)
  })

  it('未知 profile/state/display/size/variant 与非法布局都会显式失败', async () => {
    const mutations = [
      (value) => { value.profiles.legacy = structuredClone(value.profiles.text) },
      (value) => { value.states.selected = structuredClone(value.states.rest) },
      (value) => { value.displays.push('touch-only') },
      (value) => { value.sizes.push('xl') },
      (value) => { value.order[1] = 'text' },
      (value) => { value.matrix.tinted = structuredClone(value.matrix.subtle) },
      (value) => { value.variants.push('tinted') },
      (value) => { value.defaultVariant = 'plain' },
      (value) => { value.matrix.ghost.selected = structuredClone(value.matrix.ghost.rest) },
      (value) => { value.matrix.ghost.rest.opacity = '1' },
      (value) => { value.states.rest.backgroundColor = 'transparent' },
      /* fill 却缩放，或不 fill 却只换面 */
      (value) => { value.profiles.row.layout.press = 'scale' },
      (value) => { value.profiles.text.layout.press = 'surface' },
      (value) => { value.profiles.icon.layout.fill = true },
      (value) => { value.profiles.row.layout.justify = 'end' },
      /* 丢承载面槽，或与 host 块写得不一样 */
      (value) => { value.matrix.ghost.hover.backgroundColor = 'var(--xh-bg-subtle)' },
      (value) => { value.host.pressed = 'var(--xh-bg-subtle-active)' },
      (value) => { value.darkBrandSolid.backgroundColor.disabled = 'var(--xh-bg-subtle)' },
      (value) => { value.version = 1 },
    ]
    for (const mutate of mutations) {
      const recipe = await source()
      mutate(recipe)
      expect(() => compileActionControlRecipe(recipe)).toThrow(/\[action-control-recipe\]/)
    }
  })

  it('button 独立皮肤直接引用 Family Recipe，且不再复制通用状态与粗指针规则', async () => {
    const css = await readFile(BUTTON, 'utf8')
    expect(css).toContain('/* 独立 Button 皮肤')
    expect(css).toContain('@import \'../family/action-control.css\';')
    expect(css).not.toContain('@media (pointer: coarse)')
    expect(css).not.toMatch(/\[data-scope='button'\]\[data-part='root'\]:not\(\[data-disabled\]\):not\(\[data-loading\]\):(hover|active)/)
  })

  it('业务侧同名的未命名空间属性不会命中家族选择器', async () => {
    const css = compileActionControlRecipe(await source())
    expect(css).toContain('[data-xh-action-control]')
    expect(css).not.toMatch(/\[data-action-(?:control|profile|display|size|has-value|owner|variant)/)
  })
})
