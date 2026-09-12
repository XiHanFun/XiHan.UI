import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileMaterialRecipes } from '../build/material-recipes.mjs'
import { contrastRatio, parseColorToOklch } from '../src/runtime'

const TOKENS_DIR = join(import.meta.dirname, '..', 'tokens')
const MATERIALS = compileMaterialRecipes(JSON.parse(readFileSync(join(TOKENS_DIR, 'material.recipes.json'), 'utf8')))

interface TokenLeaf {
  type: string
  value: string
}

type TokenMap = Map<string, TokenLeaf>

const REQUIRED_RECIPE = [
  'material.soft.backdrop',
  'material.soft.bg',
  'material.soft.border',
  'material.soft.fg',
  'material.soft.fg-muted',
  'material.soft.focus-surface',
  'material.soft.highlight',
  'material.soft.separator',
  'material.soft.shadow',
] as const

function load(name: string): Record<string, unknown> {
  const source = JSON.parse(readFileSync(join(TOKENS_DIR, name), 'utf8')) as Record<string, unknown>
  return MATERIALS[name] ? { ...source, material: MATERIALS[name] } : source
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
  return [...tokens.keys()].filter(name => name.startsWith('material.soft.')).sort()
}

function themeTokens(theme: 'light' | 'dark', more = false, print = false): TokenMap {
  const files = ['primitive.json', 'semantic.base.json', `semantic.${theme}.json`]
  if (more)
    files.push(`semantic.${theme}.more.json`)
  if (print)
    files.push('semantic.print.json')
  return merged(...files)
}

describe('m1 Soft Surface 材质令牌', () => {
  it.each(['light', 'dark'] as const)('%s 档给出完整配方且保持实体', (theme) => {
    const tokens = themeTokens(theme)
    expect(materialNames(tokens)).toEqual(REQUIRED_RECIPE)

    const bg = resolve('material.soft.bg', tokens)
    const focusSurface = resolve('material.soft.focus-surface', tokens)
    const highlight = parseColorToOklch(resolve('material.soft.highlight', tokens))

    expect(parseColorToOklch(bg).a).toBe(1)
    expect(focusSurface).toBe(bg)
    expect(resolve('material.soft.backdrop', tokens)).toBe('none')
    expect(resolve('material.soft.shadow', tokens)).not.toBe('none')
    expect(resolve('material.soft.shadow', tokens)).not.toContain('inset')
    expect(highlight.a).toBeGreaterThan(0)
    expect(highlight.a).toBeLessThanOrEqual(theme === 'light' ? 0.72 : 0.07)
  })

  it.each(['light', 'dark'] as const)('%s 档的正文、次要文字和焦点环都压得住最终表面', (theme) => {
    const tokens = themeTokens(theme)
    const bg = resolve('material.soft.bg', tokens)

    expect(contrastRatio(resolve('material.soft.fg', tokens), bg)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(resolve('material.soft.fg-muted', tokens), bg)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(resolve('ring.focus', tokens), bg)).toBeGreaterThanOrEqual(3)
  })

  it.each(['light', 'dark'] as const)('%s 高对比档在当前轴重新声明边界并取消装饰高光', (theme) => {
    const source = flatten(load(`semantic.${theme}.more.json`))
    expect(materialNames(source)).toEqual([
      'material.soft.border',
      'material.soft.highlight',
      'material.soft.separator',
    ])

    const tokens = themeTokens(theme, true)
    const bg = resolve('material.soft.bg', tokens)
    expect(contrastRatio(resolve('material.soft.border', tokens), bg)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(resolve('material.soft.separator', tokens), bg)).toBeGreaterThanOrEqual(4.5)
    expect(parseColorToOklch(resolve('material.soft.highlight', tokens)).a).toBe(0)
  })

  it('打印档在组件作用域明确清掉材质高光与接触影', () => {
    const source = flatten(load('semantic.print.json'))
    expect(materialNames(source)).toEqual([
      'material.soft.highlight',
      'material.soft.shadow',
    ])

    for (const theme of ['light', 'dark'] as const) {
      const tokens = themeTokens(theme, false, true)
      expect(parseColorToOklch(resolve('material.soft.highlight', tokens)).a).toBe(0)
      expect(resolve('material.soft.shadow', tokens)).toBe('none')
    }
  })

  it('浅色与深色使用各自的实体底和高光，不以同一配方反色', () => {
    const light = themeTokens('light')
    const dark = themeTokens('dark')
    expect(resolve('material.soft.bg', light)).not.toBe(resolve('material.soft.bg', dark))
    expect(resolve('material.soft.highlight', light)).not.toBe(resolve('material.soft.highlight', dark))
  })
})
