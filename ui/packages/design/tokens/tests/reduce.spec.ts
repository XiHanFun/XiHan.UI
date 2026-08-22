// reduce 档是动效降级的唯一通道：皮肤只要把时长与幅度引到这几个语义令牌上，
// 降级就自动穿透，不必逐组件写 @media。这里盯住三件事：覆盖面不漏、取值真的不动、
// 以及它没有顺手把 primitive 一起改掉——duration.* 与 space.* 还被非动效场景共用。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = join(import.meta.dirname, '..')
const TOKENS_DIR = join(ROOT, 'tokens')

function loadJson(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(TOKENS_DIR, name), 'utf8')) as Record<string, unknown>
}

interface FlatToken { name: string, value: string, type: string }

function flatten(obj: unknown, path: string[] = []): FlatToken[] {
  const out: FlatToken[] = []
  if (obj && typeof obj === 'object' && '$value' in (obj as object)) {
    const leaf = obj as { $value: unknown, $type?: string }
    out.push({ name: path.join('-').replace(/\./g, '_'), value: String(leaf.$value), type: leaf.$type ?? '' })
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
const reduce = flatten(loadJson('semantic.reduce.json'))
const css = readFileSync(join(ROOT, 'tokens.css'), 'utf8')

/** 需要降级的档：时长与幅度。缓动不降级——曲线形状不引起前庭不适。 */
const DEGRADABLE = new Set(['duration', 'dimension', 'number'])

describe('semantic.reduce.json', () => {
  it('每一项都对应基线里的同名令牌', () => {
    const baseNames = new Set(base.map(t => t.name))
    for (const t of reduce)
      expect(baseNames.has(t.name), t.name).toBe(true)
  })

  it('每一项的取值都与基线不同（等值覆盖是死重）', () => {
    const baseByName = new Map(base.map(t => [t.name, t.value]))
    for (const t of reduce)
      expect(t.value, t.name).not.toBe(baseByName.get(t.name))
  })

  it('只碰动效令牌', () => {
    for (const t of reduce)
      expect(t.name.startsWith('motion-'), t.name).toBe(true)
  })

  it('基线里每一个可降级的动效令牌都被覆盖到', () => {
    const covered = new Set(reduce.map(t => t.name))
    const shouldCover = base.filter(t => t.name.startsWith('motion-') && DEGRADABLE.has(t.type))
    expect(shouldCover.length).toBeGreaterThan(0)
    for (const t of shouldCover)
      expect(covered.has(t.name), `${t.name} 是可降级的动效令牌，但 reduce 档没有覆盖它`).toBe(true)
  })

  it('时长降到 1ms 而不是 0', () => {
    // 零时长动画仍会派发 animationstart/animationend，但历史实现有差异；
    // 取 1ms 让动画名照常变化、进出场时序与不降级时同构
    for (const t of reduce.filter(t => t.type === 'duration'))
      expect(t.value, t.name).toBe('1ms')
  })

  it('幅度归零、缩放归一', () => {
    for (const t of reduce.filter(t => t.type === 'dimension'))
      expect(t.value, t.name).toBe('0px')
    for (const t of reduce.filter(t => t.type === 'number'))
      expect(t.value, t.name).toBe('1')
  })
})

describe('tokens.css 产物', () => {
  it('带上了 reduce 的 @media 块', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('reduce 块排在基线块之后（同为零特指度，靠书写顺序取胜）', () => {
    const baseline = css.indexOf('--xh-motion-duration-enter')
    const media = css.indexOf('@media (prefers-reduced-motion: reduce)')
    expect(baseline).toBeGreaterThan(-1)
    expect(media).toBeGreaterThan(baseline)
  })

  it('reduce 块里每一条都在产物里对得上', () => {
    const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    for (const t of reduce)
      expect(block, t.name).toContain(`--xh-${t.name}: ${t.value};`)
  })

  it('没有重映射任何 primitive', () => {
    const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    for (const name of ['--xh-duration-fast', '--xh-duration-normal', '--xh-duration-slow', '--xh-space-1', '--xh-space-2'])
      expect(block.includes(`${name}:`), name).toBe(false)
  })

  it('带上了 data-motion=reduce 钩子块，且与 @media 块逐条相同', () => {
    const hookStart = css.indexOf(':where([data-motion=\'reduce\'])')
    const mediaStart = css.indexOf('@media (prefers-reduced-motion: reduce)')
    expect(hookStart).toBeGreaterThan(mediaStart)
    const declsOf = (from: number): string[] => {
      const body = css.slice(css.indexOf('{', from) + 1)
      return body
        .slice(0, body.indexOf('}'))
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.startsWith('--xh-'))
    }
    const mediaDecls = declsOf(css.indexOf(':where(:root)', mediaStart))
    const hookDecls = declsOf(hookStart)
    expect(hookDecls.length).toBe(reduce.length)
    expect(hookDecls).toEqual(mediaDecls)
  })

  it('层序声明仍然只有一条，且在任何 @layer 块之前', () => {
    const statements = css.match(/^@layer [^{]*;$/gm) ?? []
    expect(statements).toHaveLength(1)
    expect(css.indexOf(statements[0]!)).toBeLessThan(css.indexOf('@layer xihan.tokens {'))
  })
})
