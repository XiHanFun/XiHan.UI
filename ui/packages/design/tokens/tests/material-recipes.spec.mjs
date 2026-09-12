import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { attachMaterialRecipes, compileMaterialRecipes, emitMaterialRecipes } from '../build/material-recipes.mjs'

const TOKENS_DIR = join(import.meta.dirname, '..', 'tokens')
const TOKENS_ROOT = join(TOKENS_DIR, '..')
const STYLES_ROOT = join(TOKENS_ROOT, '..', 'styles')
const TARGETS = [
  'semantic.base.json',
  'semantic.light.json',
  'semantic.dark.json',
  'semantic.light.more.json',
  'semantic.dark.more.json',
  'semantic.transparency.reduce.json',
  'semantic.forced-colors.json',
  'semantic.print.json',
]
const PRE_RECIPE_HASHES = {
  'semantic.base.json': '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
  'semantic.light.json': '59574a08dbc4a412b79ff7f5804ebd20cbb39a185887d35f21ae7cb6715c0b3b',
  'semantic.dark.json': '23e921cbcf0f3058c31af4d6a74641e8cd1df8224434679cf5e9a5756ead7fa8',
  'semantic.light.more.json': 'a3cad43d0f9dadb619545ff674039262e895f7ff59578604e06545921338ce09',
  'semantic.dark.more.json': 'a3cad43d0f9dadb619545ff674039262e895f7ff59578604e06545921338ce09',
  'semantic.transparency.reduce.json': '46f12c91f4055ba4646b8c996a2adffaa439f85ab7d076b1932a28c38fca075e',
  'semantic.forced-colors.json': 'ab9a7cb86320f659dc1e58acdfa9e75de7be6ebdf78e6e239fa958a7834dec6a',
  'semantic.print.json': '377c65deb18b401f9f12da9fbadf59fd45b638aa2502dbdba3dee8b2f1a072c6',
}

function flatten(value, prefix = '', result = []) {
  if (value && typeof value === 'object' && '$value' in value) {
    result.push([prefix, value.$type ?? '', String(value.$value)])
    return result
  }
  for (const [name, child] of Object.entries(value ?? {})) {
    if (!name.startsWith('$'))
      flatten(child, prefix ? `${prefix}.${name}` : name, result)
  }
  return result
}

function hashLegacyRecipe(material, file) {
  const rows = flatten(material)
    .filter(([name]) => !name.startsWith('solid.') && !(file === 'semantic.forced-colors.json' && name.startsWith('soft.')))
    .sort(([left], [right]) => left.localeCompare(right))
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex')
}

function merge(base, override) {
  if (!override || typeof override !== 'object' || Array.isArray(override))
    return override ?? base
  const result = { ...base }
  for (const [name, value] of Object.entries(override))
    result[name] = merge(base?.[name], value)
  return result
}

async function loadSource() {
  return JSON.parse(await readFile(join(TOKENS_DIR, 'material.recipes.json'), 'utf8'))
}

describe('material Recipe 生成', () => {
  it('m0-M4 的基础配方逐项声明全部原子通道', async () => {
    const source = await loadSource()
    expect(source.order.map(name => source.profiles[name].id)).toEqual(['M4', 'M3', 'M0', 'M1', 'M2'])

    for (const name of source.order) {
      for (const theme of ['light', 'dark']) {
        const recipe = source.profiles[name][theme]
        expect(Object.keys(recipe).sort(), `${name}/${theme}`).toEqual([
          'alpha',
          'backdrop',
          ...(name === 'frosted' ? ['compact'] : []),
          'edge',
          'focusSurface',
          'foreground',
          'highlight',
          'mutedForeground',
          'separator',
          'shadows',
          'tint',
        ].sort())
        expect(Object.keys(recipe.backdrop).sort()).toEqual(['blur', 'contrast', 'saturation'])
        expect(Object.keys(recipe.shadows).sort()).toEqual(['ambient', 'contact', 'sheet'])
      }
    }
  })

  it('辅助模式与基础配方合成后仍保有完整原子通道', async () => {
    const source = await loadSource()
    expect(Object.keys(source.auxiliary).sort()).toEqual(['contrast-more', 'forced-colors', 'print', 'transparency-reduce'])
    for (const mode of Object.keys(source.auxiliary)) {
      for (const name of source.order) {
        for (const theme of ['light', 'dark']) {
          const recipe = merge(source.profiles[name][theme], source.auxiliary[mode][name])
          for (const field of ['backdrop', 'edge', 'highlight', 'shadows', 'separator', 'foreground', 'mutedForeground', 'focusSurface'])
            expect(recipe[field], `${mode}/${theme}/${name}/${field}`).toBeDefined()
          expect(recipe.background ?? (recipe.tint && recipe.alpha), `${mode}/${theme}/${name}/background`).toBeTruthy()
          expect(Object.keys(recipe.backdrop).sort()).toEqual(['blur', 'contrast', 'saturation'])
          expect(Object.keys(recipe.shadows).sort()).toEqual(['ambient', 'contact', 'sheet'])
        }
      }
    }
  })

  it('编译后的 M1-M4 公开值与 Recipe 引入前逐项一致，M0 新增完整九通道', async () => {
    const source = await loadSource()
    const compiled = compileMaterialRecipes(source)
    for (const file of TARGETS)
      expect(hashLegacyRecipe(compiled[file], file), file).toBe(PRE_RECIPE_HASHES[file])

    expect(flatten(compiled['semantic.base.json'].solid).map(([name]) => name).sort()).toEqual([
      'backdrop',
      'bg',
      'border',
      'fg',
      'fg-muted',
      'focus-surface',
      'highlight',
      'separator',
      'shadow',
    ])
    for (const theme of ['semantic.light.json', 'semantic.dark.json'])
      expect(compiled[theme].solid).toBeUndefined()

    expect(compiled['semantic.light.json'].glass.bg.$value).toBe('oklch(0.99 0.003 258 / {alpha.medium})')
    expect(compiled['semantic.light.json'].glass.backdrop.$value).toBe('blur({blur.lg}) saturate(112%)')
    expect(compiled['semantic.light.json'].elevated.shadow.$value.split(', ')).toHaveLength(3)
  })

  it('blur、saturation 与 contrast 按原子顺序确定性合成', async () => {
    const source = await loadSource()
    for (const theme of ['light', 'dark']) {
      source.profiles.solid[theme].backdrop = {
        blur: '{blur.xs}',
        saturation: '110%',
        contrast: '96%',
      }
    }
    const compiled = compileMaterialRecipes(source)
    expect(compiled['semantic.base.json'].solid.backdrop.$value)
      .toBe('blur({blur.xs}) saturate(110%) contrast(96%)')
  })

  it('单组件 CSS 与 full bundle 只消费同一份生成令牌', async () => {
    const tokenPackage = JSON.parse(await readFile(join(TOKENS_ROOT, 'package.json'), 'utf8'))
    const fullEntry = await readFile(join(STYLES_ROOT, 'index.css'), 'utf8')
    expect(tokenPackage.exports['./tokens.css']).toBe('./tokens.css')
    expect(fullEntry.match(/@import '@xihan-ui\/tokens\/tokens\.css';/g)).toHaveLength(1)

    const representatives = {
      soft: 'card.css',
      frosted: 'popover.css',
      glass: 'prompt-input.css',
      elevated: 'dialog.css',
    }
    for (const [recipe, file] of Object.entries(representatives)) {
      const css = await readFile(join(STYLES_ROOT, 'css', file), 'utf8')
      expect(fullEntry, file).toContain(`@import './css/${file}';`)
      expect(css, file).toContain(`--xh-material-${recipe}-bg`)
      expect(css, file).toContain(`--xh-material-${recipe}-border`)
      expect(css, file).not.toMatch(new RegExp(`--xh-_material-${recipe}-(?:bg|border)`))
    }
  })

  it.each([
    ['未登记 profile', (source) => { source.profiles.extra = structuredClone(source.profiles.solid) }],
    ['未知辅助 mode', (source) => { source.auxiliary.legacy = {} }],
    ['未知辅助 profile', (source) => { source.auxiliary.print.legacy = {} }],
    ['缺失辅助 profile', (source) => { delete source.auxiliary.print.solid }],
    ['未知 recipe 键', (source) => { source.profiles.solid.light.opacity = '1' }],
    ['未知 backdrop 键', (source) => { source.profiles.solid.light.backdrop.brightness = '100%' }],
    ['未知 shadow 键', (source) => { source.profiles.solid.light.shadows.glow = 'none' }],
    ['未知 compact 键', (source) => { source.profiles.frosted.light.compact.radius = '0px' }],
  ])('%s 会显式失败', async (_, mutate) => {
    const source = await loadSource()
    mutate(source)
    expect(() => compileMaterialRecipes(source)).toThrow(/\[material-recipes\]/)
  })

  it('semantic 源不保留 material 副本，重复接入会显式失败', async () => {
    for (const file of TARGETS) {
      const document = JSON.parse(await readFile(join(TOKENS_DIR, file), 'utf8'))
      expect(document.material, file).toBeUndefined()
    }
    expect(() => attachMaterialRecipes({ material: {} }, {}, 'drift.json'))
      .toThrow(/仍含 material 副本/)
  })

  it('连续两次内存编译字节一致', async () => {
    const first = await emitMaterialRecipes(TOKENS_DIR)
    const second = await emitMaterialRecipes(TOKENS_DIR)
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
  })
})
