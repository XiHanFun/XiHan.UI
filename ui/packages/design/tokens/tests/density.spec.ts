// compact 档是覆盖档：每一项都必须对得上基线里的同名令牌，且解析后的取值真的不同。
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
const baseValues = new Map([...primitive, ...base].map(t => [t.name, t.value]))
const compactValues = new Map([...primitive, ...base, ...compact].map(t => [t.name, t.value]))

/** 别名按当前密度的完整取值表解析；缺失和环都必须让检查失败。 */
function resolveValue(name: string, values: ReadonlyMap<string, string>, path: string[] = []): string {
  if (path.includes(name))
    throw new Error(`令牌循环引用：${[...path, name].join(' → ')}`)
  const value = values.get(name)
  if (value === undefined)
    throw new Error(`令牌引用不存在：${[...path, name].join(' → ')}`)
  return value.replace(/\{([^}]+)\}/g, (_, ref: string) => resolveValue(ref.trim().replace(/\./g, '-'), values, [...path, name]))
}

describe('semantic.compact.json', () => {
  it('每一项都对应基线里的同名令牌', () => {
    const baseNames = new Set(base.map(t => t.name))
    for (const t of compact)
      expect(baseNames.has(t.name), t.name).toBe(true)
  })

  it('每一项解析后的取值都与基线不同', () => {
    for (const t of compact)
      expect(resolveValue(t.name, compactValues), t.name).not.toBe(resolveValue(t.name, baseValues))
  })

  it('原语和语义别名都能沿引用链解析到最终值', () => {
    for (const t of compact)
      expect(resolveValue(t.name, compactValues), t.name).not.toMatch(/\{[^}]+\}/)
  })

  it('相同的指示符别名在两档作用域内分别取各自的中档尺寸', () => {
    expect(baseValues.get('control-indicator-size')).toBe(compactValues.get('control-indicator-size'))
    expect(resolveValue('control-indicator-size', baseValues)).toBe('16px')
    expect(resolveValue('control-indicator-size', compactValues)).toBe('14px')
  })

  it('引用缺失和循环引用都直接报错', () => {
    expect(() => resolveValue('a', new Map([['a', '{missing}']]))).toThrow('令牌引用不存在：a → missing')
    expect(() => resolveValue('a', new Map([['a', '{b}'], ['b', '{a}']]))).toThrow('令牌循环引用：a → b → a')
  })

  it('紧凑档逐项小于基线（收密度不该有放大的项）', () => {
    const px = (v: string): number | null => {
      const m = /^([\d.]+)(px|rem)$/.exec(v)
      if (!m)
        return null
      return Number(m[1]) * (m[2] === 'rem' ? 16 : 1)
    }
    for (const t of compact) {
      const a = px(resolveValue(t.name, compactValues))
      const b = px(resolveValue(t.name, baseValues))
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
