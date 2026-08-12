// compact 档是覆盖档：每一项都必须对得上基线里的同名令牌，且取值真的不同。
// 拼错组名/键名会发出一个没人消费的新自定义属性，静默无效——这里把它挡下来。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const TOKENS_DIR = join(import.meta.dirname, '../tokens')

function loadJson(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(TOKENS_DIR, name), 'utf8')) as Record<string, unknown>
}

interface FlatToken { name: string, value: string }

function flatten(obj: unknown, path: string[] = []): FlatToken[] {
  const out: FlatToken[] = []
  if (obj && typeof obj === 'object' && '$value' in (obj as object)) {
    out.push({ name: path.join('-').replace(/\./g, '_'), value: String((obj as { $value: unknown }).$value) })
    return out
  }
  for (const [key, child] of Object.entries((obj ?? {}) as Record<string, unknown>)) {
    if (key.startsWith('$'))
      continue
    if (child && typeof child === 'object')
      out.push(...flatten(child, [...path, key]))
  }
  return out
}

const base = flatten(loadJson('semantic.base.json'))
const compact = flatten(loadJson('semantic.compact.json'))
const primitive = flatten(loadJson('primitive.json'))

describe('semantic.compact.json', () => {
  it('每一项都对应基线里的同名令牌', () => {
    const baseNames = new Set(base.map(t => t.name))
    for (const t of compact)
      expect(baseNames.has(t.name), t.name).toBe(true)
  })

  it('每一项的取值都与基线不同（等值覆盖是死重）', () => {
    const baseByName = new Map(base.map(t => [t.name, t.value]))
    for (const t of compact)
      expect(t.value, t.name).not.toBe(baseByName.get(t.name))
  })

  it('引用全部解析得到原语', () => {
    const primitiveNames = new Set(primitive.map(t => t.name))
    for (const t of compact) {
      for (const [, ref] of t.value.matchAll(/\{([^}]+)\}/g))
        expect(primitiveNames.has(ref!.replace(/\./g, '-')), `${t.name} → ${ref}`).toBe(true)
    }
  })

  it('紧凑档逐项小于基线（收密度不该有放大的项）', () => {
    const px = (v: string): number | null => {
      const m = /^([\d.]+)(px|rem)$/.exec(v)
      if (!m)
        return null
      return Number(m[1]) * (m[2] === 'rem' ? 16 : 1)
    }
    const spacePx = new Map(primitive.filter(t => t.name.startsWith('space-')).map(t => [t.name, px(t.value)]))
    const resolvePx = (v: string): number | null => {
      const ref = /^\{([^}]+)\}$/.exec(v)
      if (ref)
        return spacePx.get(ref[1]!.replace(/\./g, '-')) ?? null
      return px(v)
    }
    const baseByName = new Map(base.map(t => [t.name, t.value]))
    for (const t of compact) {
      const a = resolvePx(t.value)
      const b = resolvePx(baseByName.get(t.name)!)
      expect(a, `${t.name} 解析`).not.toBeNull()
      expect(b, `${t.name} 基线解析`).not.toBeNull()
      expect(a!, t.name).toBeLessThan(b!)
    }
  })
})

describe('tokens.css 产物', () => {
  it('包含 compact 取值块且排在基线合并块之后', () => {
    const css = readFileSync(join(TOKENS_DIR, '..', 'tokens.css'), 'utf8')
    const baseIdx = css.indexOf(`:where([data-density='comfortable'])`)
    const compactIdx = css.indexOf(`:where([data-density='compact'])`)
    expect(baseIdx).toBeGreaterThan(-1)
    expect(compactIdx).toBeGreaterThan(baseIdx)
    for (const t of compact)
      expect(css).toContain(`--xh-${t.name}:`)
  })
})
