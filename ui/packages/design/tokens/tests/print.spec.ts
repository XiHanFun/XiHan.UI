// print 档是打印时取消投影的唯一通道：皮肤把 box-shadow 引到三支海拔角色上，取消就自动穿透，
// 不必逐组件写 @media，也不必去跟皮肤里那条 box-shadow 比特指度——拆层版本里两者按特指度
// 重新竞争，皮肤选择器最深到六个属性，靠层序取胜的写法在那一份里会静默失效。
// 这里盯住三件事：覆盖面不漏、落点只在库节点、以及它没有顺手把 shadow.* 原语一起改掉。
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
const print = flatten(loadJson('semantic.print.json'))
const css = readFileSync(join(ROOT, 'tokens.css'), 'utf8')

const MEDIA = '@media print'

/** 打印块的正文：从 @media print 起到它那层花括号闭合为止。 */
function printBlock(): string {
  const start = css.indexOf(MEDIA)
  expect(start, '产物里没有 @media print 块').toBeGreaterThan(-1)
  const open = css.indexOf('{', start)
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{')
      depth++
    else if (css[i] === '}' && --depth === 0)
      return css.slice(start, i + 1)
  }
  throw new Error('@media print 块的花括号没有闭合')
}

describe('semantic.print.json', () => {
  it('每一项都对应基线里的同名令牌', () => {
    const baseNames = new Set(base.map(t => t.name))
    for (const t of print)
      expect(baseNames.has(t.name), t.name).toBe(true)
  })

  it('每一项的取值都与基线不同（等值覆盖是死重）', () => {
    const baseByName = new Map(base.map(t => [t.name, t.value]))
    for (const t of print)
      expect(t.value, t.name).not.toBe(baseByName.get(t.name))
  })

  it('只碰海拔角色令牌', () => {
    // 打印档改的是「这块面在纸上还画不画投影」。越界改到颜色或尺寸上，屏幕档就有一整套
    // 从没人看过的取值——它只在打印时生效，没有任何一格快照算得到它
    for (const t of print)
      expect(t.name.startsWith('elevation-'), t.name).toBe(true)
  })

  it('基线里每一支海拔角色都被覆盖到', () => {
    const covered = new Set(print.map(t => t.name))
    const shouldCover = base.filter(t => t.name.startsWith('elevation-'))
    expect(shouldCover.length).toBeGreaterThan(0)
    for (const t of shouldCover)
      expect(covered.has(t.name), `${t.name} 是海拔角色，但打印档没有取消它`).toBe(true)
  })

  it('取消写成 none 而不是零偏移的空阴影', () => {
    // `0 0 0 0 transparent` 仍然是一层阴影，合成器照样为它开一层；none 是整条不画
    for (const t of print)
      expect(t.value, t.name).toBe('none')
  })
})

describe('tokens.css 产物', () => {
  it('带上了 print 的 @media 块', () => {
    expect(css).toContain(MEDIA)
  })

  it('print 块排在基线块之后（同为零特指度，靠书写顺序取胜）', () => {
    const baseline = css.indexOf('--xh-elevation-raised')
    expect(baseline).toBeGreaterThan(-1)
    expect(css.indexOf(MEDIA)).toBeGreaterThan(baseline)
  })

  it('print 块里每一条都在产物里对得上', () => {
    const block = printBlock()
    for (const t of print)
      expect(block, t.name).toContain(`--xh-${t.name}: ${t.value};`)
  })

  it('落点只有 [data-scope]，不碰 :root', () => {
    // 打在 :root 上就替宿主页面决定了打印样式：宿主自己引用这几支令牌的地方会跟着一起没投影
    const block = printBlock()
    const selectors = [...block.matchAll(/^\s*([^\s@{][^{]*)\{/gm)].map(m => m[1]!.trim())
    expect(selectors).toEqual([':where([data-scope])'])
  })

  it('没有重映射任何 primitive', () => {
    const block = printBlock()
    for (const name of ['--xh-shadow-sm', '--xh-shadow-md', '--xh-shadow-lg', '--xh-shadow-xl'])
      expect(block.includes(`${name}:`), name).toBe(false)
  })
})
