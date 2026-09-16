import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RELATIONS, SHARED_RELATION } from '../../scripts/lib/keyframe-relations.mjs'

const UI_ROOT = join(import.meta.dirname, '..', '..', '..')
const MOTION = join(UI_ROOT, 'packages/design/styles/family/motion.css')

/** 去块注释，保留换行。 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ''))
}

/** 从 `{` 出发找到配对的 `}`。 */
function blockEnd(css, open) {
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{')
      depth++
    else if (css[i] === '}' && --depth === 0)
      return i
  }
  return -1
}

/** 名字 → { body, layered }：帧体与是否落在 @layer xihan.motion 内。 */
function keyframes(css) {
  const layers = []
  for (const m of css.matchAll(/@layer\s+xihan\.motion\s*\{/g)) {
    const open = m.index + m[0].length - 1
    layers.push([open, blockEnd(css, open)])
  }
  const out = new Map()
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    const open = m.index + m[0].length - 1
    const end = blockEnd(css, open)
    out.set(m[1], {
      body: css.slice(open + 1, end),
      layered: layers.some(([from, to]) => m.index > from && end < to),
      count: (out.get(m[1])?.count ?? 0) + 1,
    })
  }
  return out
}

describe('family/motion.css 共享关键帧', () => {
  it('登记的每个共享关键帧各定义恰一次，且全部落在 @layer xihan.motion 内', async () => {
    const css = stripComments(await readFile(MOTION, 'utf8'))
    const found = keyframes(css)
    const expected = Object.keys(SHARED_RELATION).sort()

    expect([...found.keys()].sort()).toEqual(expected)
    expect(expected).toHaveLength(10)
    for (const name of expected) {
      expect(found.get(name).count, name).toBe(1)
      expect(found.get(name).layered, `${name} 不在 @layer xihan.motion 里`).toBe(true)
    }
    // 除关键帧之外没有别的规则：家族文件只放定义，不参与级联
    expect(css.match(/\[data-scope/g)).toBeNull()
  })

  it('幅度只引 --xh-motion-distance-sm 与 --xh-motion-scale-enter / -exit，与 check-motion-amplitude 同口径', async () => {
    const css = stripComments(await readFile(MOTION, 'utf8'))
    const found = keyframes(css)
    const allowed = new Set(['--xh-motion-distance-sm', '--xh-motion-scale-enter', '--xh-motion-scale-exit'])

    for (const [name, { body }] of found) {
      for (const m of body.matchAll(/--xh-motion-[\w-]+/g))
        expect(allowed.has(m[0]), `${name} 引用了 ${m[0]}`).toBe(true)
      // 位移与缩放的字面量只剩 0 / 1（退化值），没有带单位的幅度
      for (const decl of body.matchAll(/(?:translate|scale):([^;]+);/g)) {
        const literals = decl[1].replace(/var\([^)]*\)/g, '').replace(/--[\w-]+/g, '').match(/[+-]?\d+(?:\.\d+)?[a-z%]*/gi) ?? []
        for (const lit of literals)
          expect(['0', '1'].includes(lit), `${name} 的 ${decl[0].trim()} 带字面幅度 ${lit}`).toBe(true)
      }
    }
  })

  it('锚定关系登记与规范 §9.4 / §9.5 的分组一致', () => {
    const byRelation = {}
    for (const [name, relation] of Object.entries(SHARED_RELATION)) {
      expect(RELATIONS, `${name} 的 relation ${relation}`).toContain(relation)
      ;(byRelation[relation] ??= []).push(name)
    }
    expect(byRelation['anchored-list'].sort()).toEqual(['xh-overlay-slide-in', 'xh-overlay-slide-out'])
    expect(byRelation['anchored-panel'].sort()).toEqual(['xh-overlay-pop-in', 'xh-pop-out'])
    expect(byRelation.detached).toEqual(['xh-pop-in'])
    expect(byRelation.fade.sort()).toEqual(['xh-fade-in', 'xh-fade-out', 'xh-rise-in'])
    expect(byRelation.disclosure.sort()).toEqual(['xh-disclosure-collapse', 'xh-disclosure-expand'])
  })

  it('disclosure 关键帧两端内缩各走私有槽，没写的那一端按 0 动', async () => {
    const css = stripComments(await readFile(MOTION, 'utf8'))
    const found = keyframes(css)
    const expand = found.get('xh-disclosure-expand').body
    const collapse = found.get('xh-disclosure-collapse').body

    expect(expand).toMatch(/from\s*\{[^}]*grid-template-rows:\s*0fr/)
    expect(expand).toMatch(/to\s*\{[^}]*grid-template-rows:\s*1fr/)
    expect(expand).toContain('padding-block-start: var(--xh-_disclosure-pt, 0)')
    expect(expand).toContain('padding-block-end: var(--xh-_disclosure-pb, 0)')
    expect(collapse).toMatch(/from\s*\{[^}]*grid-template-rows:\s*1fr/)
    expect(collapse).toMatch(/to\s*\{[^}]*grid-template-rows:\s*0fr/)
  })
})
