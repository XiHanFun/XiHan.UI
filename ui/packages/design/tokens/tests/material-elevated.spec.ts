import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileMaterialRecipes } from '../build/material-recipes.mjs'
import { contrastRatio, parseColorToOklch } from '../src/runtime'

const folder = join(import.meta.dirname, '..', 'tokens')
const materials = compileMaterialRecipes(JSON.parse(readFileSync(join(folder, 'material.recipes.json'), 'utf8')))
type Values = Map<string, string>

function collect(value: unknown, prefix: string, result: Values): void {
  if (!value || typeof value !== 'object')
    return
  if ('$value' in value) {
    result.set(prefix, String(value.$value))
    return
  }
  for (const [key, child] of Object.entries(value)) {
    if (!key.startsWith('$'))
      collect(child, prefix ? `${prefix}.${key}` : key, result)
  }
}

function load(...files: string[]): Values {
  const values: Values = new Map()
  for (const file of files) {
    const source = JSON.parse(readFileSync(join(folder, file), 'utf8'))
    collect(materials[file] ? { ...source, material: materials[file] } : source, '', values)
  }
  return values
}

function resolve(name: string, values: Values): string {
  const value = values.get(name)
  if (value === undefined)
    throw new Error(`缺少材质令牌：${name}`)
  return value.replace(/\{([^}]+)\}/g, (_, key: string) => resolve(key, values))
}

describe('高层玻璃 M4 材质', () => {
  it.each(['light', 'dark'] as const)('%s：以高遮蔽正文区保护复杂背景上的文字', (theme) => {
    const values = load('primitive.json', 'semantic.base.json', `semantic.${theme}.json`)
    const surface = resolve('material.elevated.bg', values)
    expect(parseColorToOklch(surface).a).toBe(theme === 'light' ? 0.94 : 0.92)
    expect(resolve('material.elevated.backdrop', values)).toBe('blur(32px) saturate(108%)')
    expect(resolve('material.elevated.shadow', values).split(',')).toHaveLength(3)
    expect(resolve('material.elevated.shadow', values)).not.toContain('inset')
    for (const name of ['border', 'separator', 'highlight'])
      expect(parseColorToOklch(resolve(`material.elevated.${name}`, values)).a).toBeGreaterThan(0)

    const backgrounds = [
      '#000000',
      '#ffffff',
      '#808080',
      '#ff0000',
      '#00ff00',
      '#0000ff',
      resolve('bg.page', values),
      resolve('color.brand.500', values),
    ]
    for (const name of ['fg', 'fg-muted']) {
      const foreground = resolve(`material.elevated.${name}`, values)
      expect(parseColorToOklch(foreground).a).toBe(1)
      for (const background of backgrounds)
        expect(contrastRatio(foreground, surface, background), `${theme}/${name}/${background}`).toBeGreaterThanOrEqual(4.5)
    }

    const focusSurface = resolve('material.elevated.focus-surface', values)
    expect(parseColorToOklch(focusSurface).a).toBe(1)
    expect(contrastRatio(resolve('ring.focus', values), focusSurface)).toBeGreaterThanOrEqual(3)
  })

  for (const theme of ['light', 'dark'] as const) {
    it.each([`semantic.${theme}.more.json`, 'semantic.transparency.reduce.json', 'semantic.print.json'])('%s：辅助模式在原位实体化', (extra) => {
      const values = load('primitive.json', 'semantic.base.json', `semantic.${theme}.json`, extra)
      const surface = resolve('material.elevated.bg', values)
      expect(parseColorToOklch(surface).a).toBe(1)
      expect(resolve('material.elevated.backdrop', values)).toBe('none')
      expect(parseColorToOklch(resolve('material.elevated.highlight', values)).a).toBe(0)
      for (const name of ['fg', 'fg-muted'])
        expect(contrastRatio(resolve(`material.elevated.${name}`, values), surface)).toBeGreaterThanOrEqual(4.5)
      if (extra.endsWith('.more.json'))
        expect(contrastRatio(resolve('material.elevated.border', values), surface)).toBeGreaterThanOrEqual(4.5)
      if (extra === 'semantic.print.json')
        expect(resolve('material.elevated.shadow', values)).toBe('none')
    })
  }

  it('强制色采用系统色，取消滤镜和投影', () => {
    const values = load('semantic.forced-colors.json')
    for (const name of ['bg', 'focus-surface'])
      expect(resolve(`material.elevated.${name}`, values)).toBe('Canvas')
    for (const name of ['fg', 'fg-muted', 'border', 'separator'])
      expect(resolve(`material.elevated.${name}`, values)).toBe('CanvasText')
    for (const name of ['backdrop', 'shadow'])
      expect(resolve(`material.elevated.${name}`, values)).toBe('none')
  })
})
