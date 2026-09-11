import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrastRatio, parseColorToOklch } from '../src/runtime'

const folder = join(import.meta.dirname, '..', 'tokens')
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
  for (const file of files)
    collect(JSON.parse(readFileSync(join(folder, file), 'utf8')), '', values)
  return values
}

function resolve(name: string, values: Values): string {
  const value = values.get(name)
  if (value === undefined)
    throw new Error(`缺少材质令牌：${name}`)
  return value.replace(/\{([^}]+)\}/g, (_, key: string) => resolve(key, values))
}

describe('浮动玻璃 M3 材质', () => {
  it.each(['light', 'dark'] as const)('%s：完整配方与复杂背景上的不透明文字', (theme) => {
    const values = load('primitive.json', 'semantic.base.json', `semantic.${theme}.json`)
    const surface = resolve('material.glass.bg', values)
    expect(parseColorToOklch(surface).a).toBe(0.76)
    expect(resolve('material.glass.backdrop', values)).toBe('blur(24px) saturate(112%)')
    expect(resolve('material.glass.shadow', values).split(',')).toHaveLength(2)
    expect(resolve('material.glass.shadow', values)).not.toContain('inset')
    for (const name of ['border', 'separator', 'highlight'])
      expect(parseColorToOklch(resolve(`material.glass.${name}`, values)).a).toBeGreaterThan(0)
    const backgrounds = ['#000000', '#ffffff', '#808080', '#ff0000', '#00ff00', '#0000ff', resolve('bg.page', values), resolve('color.brand.500', values)]
    for (const name of ['fg', 'fg-muted']) {
      const foreground = resolve(`material.glass.${name}`, values)
      expect(parseColorToOklch(foreground).a).toBe(1)
      for (const background of backgrounds)
        expect(contrastRatio(foreground, surface, background), `${theme}/${name}/${background}`).toBeGreaterThanOrEqual(4.5)
    }
    const focusSurface = resolve('material.glass.focus-surface', values)
    expect(parseColorToOklch(focusSurface).a).toBe(1)
    expect(contrastRatio(resolve('ring.focus', values), focusSurface)).toBeGreaterThanOrEqual(3)
  })

  for (const theme of ['light', 'dark']) {
    it.each([`semantic.${theme}.more.json`, 'semantic.transparency.reduce.json', 'semantic.print.json'])('%s：辅助模式明确换为实体', (extra) => {
      const values = load('primitive.json', 'semantic.base.json', `semantic.${theme}.json`, extra)
      const surface = resolve('material.glass.bg', values)
      expect(parseColorToOklch(surface).a).toBe(1)
      expect(resolve('material.glass.backdrop', values)).toBe('none')
      expect(parseColorToOklch(resolve('material.glass.highlight', values)).a).toBe(0)
      for (const name of ['fg', 'fg-muted'])
        expect(contrastRatio(resolve(`material.glass.${name}`, values), surface)).toBeGreaterThanOrEqual(4.5)
      if (extra.endsWith('.more.json'))
        expect(contrastRatio(resolve('material.glass.border', values), surface)).toBeGreaterThanOrEqual(4.5)
      if (extra === 'semantic.print.json')
        expect(resolve('material.glass.shadow', values)).toBe('none')
    })
  }

  it('强制色采用系统色，取消滤镜和投影', () => {
    const values = load('semantic.forced-colors.json')
    for (const name of ['bg', 'focus-surface'])
      expect(resolve(`material.glass.${name}`, values)).toBe('Canvas')
    for (const name of ['fg', 'fg-muted', 'border', 'separator'])
      expect(resolve(`material.glass.${name}`, values)).toBe('CanvasText')
    for (const name of ['backdrop', 'shadow'])
      expect(resolve(`material.glass.${name}`, values)).toBe('none')
  })
})
