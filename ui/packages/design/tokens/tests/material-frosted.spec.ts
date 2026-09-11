import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrastRatio, parseColorToOklch } from '../src/runtime'

const TOKENS_DIR = join(import.meta.dirname, '..', 'tokens')

interface TokenLeaf {
  type: string
  value: string
}

type TokenMap = Map<string, TokenLeaf>

const REQUIRED_RECIPE = [
  'material.frosted.backdrop',
  'material.frosted.bg',
  'material.frosted.border',
  'material.frosted.fg',
  'material.frosted.fg-muted',
  'material.frosted.focus-surface',
  'material.frosted.highlight',
  'material.frosted.separator',
  'material.frosted.shadow',
] as const

function load(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(TOKENS_DIR, name), 'utf8')) as Record<string, unknown>
}

function flatten(source: unknown, path: string[] = [], out: TokenMap = new Map()): TokenMap {
  if (source && typeof source === 'object' && '$value' in source) {
    const leaf = source as { $type?: string, $value: unknown }
    out.set(path.join('.'), { type: leaf.$type ?? '', value: String(leaf.$value) })
    return out
  }
  for (const [name, child] of Object.entries((source ?? {}) as Record<string, unknown>)) {
    if (!name.startsWith('$'))
      flatten(child, [...path, name], out)
  }
  return out
}

function merged(...files: string[]): TokenMap {
  const out: TokenMap = new Map()
  for (const file of files) {
    for (const [name, token] of flatten(load(file)))
      out.set(name, token)
  }
  return out
}

function resolve(name: string, tokens: TokenMap, stack: string[] = []): string {
  if (stack.includes(name))
    throw new Error(`令牌引用成环：${[...stack, name].join(' → ')}`)
  const token = tokens.get(name)
  if (!token)
    throw new Error(`令牌不存在：${name}`)
  return token.value.replace(/\{([^}]+)\}/g, (_, reference: string) =>
    resolve(reference.trim(), tokens, [...stack, name]))
}

function materialNames(tokens: TokenMap): string[] {
  return [...tokens.keys()].filter(name => name.startsWith('material.frosted.')).sort()
}

function themeTokens(theme: 'light' | 'dark', more = false, extra?: string): TokenMap {
  const files = ['primitive.json', 'semantic.base.json', `semantic.${theme}.json`]
  if (more)
    files.push(`semantic.${theme}.more.json`)
  if (extra)
    files.push(extra)
  return merged(...files)
}

describe('m2 Frosted Surface 材质令牌', () => {
  it('alpha 与 blur 只有一套有序原语，m2 使用 high/md 档', () => {
    const primitive = flatten(load('primitive.json'))
    expect([...primitive.entries()].filter(([name]) => name.startsWith('alpha.')).map(([name, token]) => [name, token.value])).toEqual([
      ['alpha.opaque', '1'],
      ['alpha.high', '0.88'],
      ['alpha.medium', '0.76'],
      ['alpha.low', '0.48'],
      ['alpha.ultra-low', '0.16'],
    ])
    expect([...primitive.entries()].filter(([name]) => name.startsWith('blur.')).map(([name, token]) => [name, token.value])).toEqual([
      ['blur.none', '0px'],
      ['blur.xs', '4px'],
      ['blur.sm', '8px'],
      ['blur.md', '16px'],
      ['blur.lg', '24px'],
      ['blur.xl', '32px'],
      ['blur.2xl', '48px'],
    ])
  })

  it.each(['light', 'dark'] as const)('%s 档配方完整，只有 tint 和边缘光透明', (theme) => {
    const tokens = themeTokens(theme)
    expect(materialNames(tokens)).toEqual(REQUIRED_RECIPE)

    expect(parseColorToOklch(resolve('material.frosted.bg', tokens)).a).toBe(0.88)
    expect(parseColorToOklch(resolve('material.frosted.fg', tokens)).a).toBe(1)
    expect(parseColorToOklch(resolve('material.frosted.fg-muted', tokens)).a).toBe(1)
    expect(parseColorToOklch(resolve('material.frosted.focus-surface', tokens)).a).toBe(1)
    expect(parseColorToOklch(resolve('material.frosted.border', tokens)).a).toBeLessThanOrEqual(0.16)
    expect(parseColorToOklch(resolve('material.frosted.highlight', tokens)).a).toBeLessThanOrEqual(0.52)
    expect(resolve('material.frosted.backdrop', tokens)).toBe('blur(16px) saturate(108%)')
    expect(resolve('material.frosted.shadow', tokens).split(',')).toHaveLength(2)
    expect(resolve('material.frosted.shadow', tokens)).not.toContain('inset')
  })

  it.each(['light', 'dark'] as const)('%s tint 在最不利纯色与高频背景上仍托住不透明文字', (theme) => {
    const tokens = themeTokens(theme)
    const surface = resolve('material.frosted.bg', tokens)
    const foregrounds = [
      resolve('material.frosted.fg', tokens),
      resolve('material.frosted.fg-muted', tokens),
    ]
    const backdrops = [
      '#000000',
      '#ffffff',
      '#808080',
      resolve('bg.page', tokens),
      resolve('color.brand.500', tokens),
    ]

    for (const backdrop of backdrops) {
      for (const foreground of foregrounds)
        expect(contrastRatio(foreground, surface, backdrop), `${theme} ${foreground} / ${backdrop}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it.each(['light', 'dark'] as const)('%s 焦点隔离底是不透明实体，并与品牌环达到 3:1', (theme) => {
    const tokens = themeTokens(theme)
    const focusSurface = resolve('material.frosted.focus-surface', tokens)
    expect(parseColorToOklch(focusSurface).a).toBe(1)
    expect(contrastRatio(resolve('ring.focus', tokens), focusSurface)).toBeGreaterThanOrEqual(3)
  })

  it.each(['light', 'dark'] as const)('%s contrast-more 把材质实体化并在当前轴重申边界', (theme) => {
    const source = flatten(load(`semantic.${theme}.more.json`))
    expect(materialNames(source)).toEqual([
      'material.frosted.backdrop',
      'material.frosted.bg',
      'material.frosted.border',
      'material.frosted.focus-surface',
      'material.frosted.highlight',
      'material.frosted.separator',
    ])
    const tokens = themeTokens(theme, true)
    const bg = resolve('material.frosted.bg', tokens)
    expect(parseColorToOklch(bg).a).toBe(1)
    expect(resolve('material.frosted.backdrop', tokens)).toBe('none')
    expect(contrastRatio(resolve('material.frosted.border', tokens), bg)).toBeGreaterThanOrEqual(4.5)
    expect(parseColorToOklch(resolve('material.frosted.highlight', tokens)).a).toBe(0)
  })

  it('减少透明与打印用同名令牌原位换成实体表面', () => {
    const transparency = flatten(load('semantic.transparency.reduce.json'))
    expect(materialNames(transparency)).toEqual([
      'material.frosted.backdrop',
      'material.frosted.bg',
      'material.frosted.border',
      'material.frosted.focus-surface',
      'material.frosted.highlight',
      'material.frosted.separator',
    ])

    for (const extra of ['semantic.transparency.reduce.json', 'semantic.print.json']) {
      for (const theme of ['light', 'dark'] as const) {
        const tokens = themeTokens(theme, false, extra)
        expect(parseColorToOklch(resolve('material.frosted.bg', tokens)).a).toBe(1)
        expect(resolve('material.frosted.backdrop', tokens)).toBe('none')
        expect(parseColorToOklch(resolve('material.frosted.highlight', tokens)).a).toBe(0)
      }
    }
  })

  it('forced-colors 逐项交给系统色且禁用滤镜与投影', () => {
    const forced = flatten(load('semantic.forced-colors.json'))
    expect(materialNames(forced)).toEqual(REQUIRED_RECIPE)
    expect(forced.get('material.frosted.bg')?.value).toBe('Canvas')
    expect(forced.get('material.frosted.fg')?.value).toBe('CanvasText')
    expect(forced.get('material.frosted.fg-muted')?.value).toBe('CanvasText')
    expect(forced.get('material.frosted.backdrop')?.value).toBe('none')
    expect(forced.get('material.frosted.shadow')?.value).toBe('none')
  })
})
