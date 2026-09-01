// 四条轴笛卡尔积 16 格，每格一份「解析后的语义令牌最终取值」快照。
// 这一层不渲染组件、不开浏览器，只把 tokens.css 的取值块按层叠顺序算一遍，秒级，可以每次改动都跑。
//
// 它守的是漂移。逐条断言只钉得住写下那天想到的那几支：改一支原语、动一个覆盖档、
// 给某一档补一个令牌，牵动的往往是没人想到会被牵动的那几支，而那些没有断言看着。
// 快照钉的是全部——任何一支在任何一格里的最终取值变了，都会 diff 出来。
//
// 取值块全是零特指度的 :where()，谁在后面谁赢，块序本身就是取值的一部分：
// 深色 + 高对比那一格先被浅色高对比块覆盖一次，再被深色高对比块盖回来。
// 所以这里不按「档」去合并 JSON 源，而是照 tokens.css 里的书写顺序逐块套用：
// 合并顺序自己写一套的话，写错了会把错的取值固化进快照，之后再没人发现。
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = join(import.meta.dirname, '..')
const TOKENS_DIR = join(ROOT, 'tokens')
const SNAPSHOT_DIR = join(import.meta.dirname, '__snapshots__')

const css = readFileSync(join(ROOT, 'tokens.css'), 'utf8')

/* ---------- 轴 ---------- */

const AXES = {
  theme: ['light', 'dark'],
  density: ['comfortable', 'compact'],
  contrast: ['default', 'more'],
  motion: ['default', 'reduce'],
} as const

type Axis = keyof typeof AXES
type Combination = { [K in Axis]: typeof AXES[K][number] }

/**
 * 属性选择器到轴的映射。tokens.css 里出现表外的 data-* 时直接抛：
 * 认不出的属性如果当成「不命中」放过去，那一档的取值就永远不进这 16 格，
 * 快照会一直绿着，而它守的那份取值根本没人算过。
 */
const ATTR_TO_AXIS: Record<string, Axis> = {
  'data-theme': 'theme',
  'data-density': 'density',
  'data-contrast': 'contrast',
  'data-motion': 'motion',
}

function combinations(): Combination[] {
  const out: Combination[] = []
  for (const theme of AXES.theme) {
    for (const density of AXES.density) {
      for (const contrast of AXES.contrast) {
        for (const motion of AXES.motion)
          out.push({ theme, density, contrast, motion })
      }
    }
  }
  return out
}

function idOf(c: Combination): string {
  return `theme-${c.theme}_density-${c.density}_contrast-${c.contrast}_motion-${c.motion}`
}

function titleOf(c: Combination): string {
  return `theme=${c.theme} density=${c.density} contrast=${c.contrast} motion=${c.motion}`
}

/* ---------- 解析 tokens.css ---------- */

interface Declaration { name: string, value: string }

interface Block {
  /** 在 tokens.css 里的第几个取值块，从 1 起。块被增删或换位时这个编号会动，快照头里跟着动 */
  index: number
  selector: string
  /** 选择器列表逐项拆成的 data-* 要求，任一项全部满足即命中；空对象表示无条件命中 */
  matchers: Array<Partial<Record<Axis, string>>>
  decls: Declaration[]
  /** 取值块里的非自定义属性，目前只有 color-scheme */
  plain: Declaration[]
}

/** 把 `:where([data-theme='dark'][data-contrast='more'])` 这样一条拆成轴要求。 */
function toMatcher(selector: string): Partial<Record<Axis, string>> {
  const req: Partial<Record<Axis, string>> = {}
  for (const [, attr, value] of selector.matchAll(/\[([\w-]+)=['"]([^'"]+)['"]\]/g)) {
    const axis = ATTR_TO_AXIS[attr!]
    if (!axis)
      throw new Error(`tokens.css 里的 ${attr} 不在本文件的轴表里：${selector}`)
    req[axis] = value!
  }
  if (Object.keys(req).length === 0 && !selector.includes(':root'))
    throw new Error(`认不出的选择器：${selector}`)
  return req
}

interface Parsed { blocks: Block[], mediaConditions: string[] }

/**
 * 逐行扫 tokens.css。产物的形状是固定的：一行一条声明，选择器与开花括号同行，
 * 注释独占整行，所以这里不引 CSS 解析器。
 *
 * @media 块整块跳过：减弱动效那一档在这 16 格里走的是 data-motion 钩子，
 * @media 那份与钩子块同源同值（由 reduce.spec 逐条对齐）。跳过的条件会被记下来判断是不是只有这一个。
 */
function parse(source: string): Parsed {
  const blocks: Block[] = []
  const mediaConditions: string[] = []
  let inComment = false
  let inMedia = 0
  let depth = 0
  let counted = 0
  let current: Block | null = null

  for (const raw of source.split('\n')) {
    const line = raw.trim()
    if (inComment) {
      if (line.includes('*/'))
        inComment = false
      continue
    }
    if (line.startsWith('/*')) {
      if (!line.includes('*/'))
        inComment = true
      continue
    }
    if (!line)
      continue

    if (line.startsWith('@media') && line.endsWith('{')) {
      mediaConditions.push(line.slice('@media'.length, -1).trim())
      inMedia = depth + 1
      depth++
      continue
    }
    if (line.startsWith('@layer')) {
      if (line.endsWith('{'))
        depth++
      continue
    }
    if (line === '}') {
      if (current) {
        blocks.push(current)
        current = null
        continue
      }
      depth--
      if (inMedia > depth)
        inMedia = 0
      continue
    }
    if (line.endsWith('{')) {
      const selector = line.slice(0, -1).trim()
      if (inMedia) {
        // @media 里的块整块跳过，但花括号照样要配平
        current = { index: -1, selector, matchers: [], decls: [], plain: [] }
        continue
      }
      counted++
      current = {
        index: counted,
        selector,
        matchers: selector.split(',').map(s => toMatcher(s.trim())),
        decls: [],
        plain: [],
      }
      continue
    }

    // 产物里一条声明就是「名: 值;」，只隔一个空格。排版变了这里会抛，不会静默漏掉一条
    const decl = /^([\w-]+): (.+);$/.exec(line)
    if (!decl)
      throw new Error(`认不出的一行：${line}`)
    if (!current)
      throw new Error(`取值块之外的声明：${line}`)
    const entry = { name: decl[1]!, value: decl[2]! }
    if (entry.name.startsWith('--'))
      current.decls.push(entry)
    else
      current.plain.push(entry)
  }

  // @media 里那些块占了 index -1，不参与层叠
  return { blocks: blocks.filter(b => b.index > 0), mediaConditions }
}

const { blocks, mediaConditions } = parse(css)

/* ---------- 层叠 ---------- */

interface Resolved {
  /** 自定义属性名 → 该组合下的原始声明值（可能还带 var() 引用） */
  raw: Map<string, string>
  /** 命中的取值块，按书写顺序 */
  applied: Block[]
  colorScheme: string | null
}

function cascade(combo: Combination): Resolved {
  const raw = new Map<string, string>()
  const applied: Block[] = []
  let colorScheme: string | null = null

  for (const block of blocks) {
    const hit = block.matchers.some(req =>
      Object.entries(req).every(([axis, value]) => combo[axis as Axis] === value),
    )
    if (!hit)
      continue
    applied.push(block)
    for (const d of block.decls)
      raw.set(d.name, d.value)
    for (const d of block.plain) {
      if (d.name === 'color-scheme')
        colorScheme = d.value
    }
  }

  return { raw, applied, colorScheme }
}

/** var(--xh-a) 逐层展开到字面值。环引用会把栈撑爆，所以自己带一份路径判环。 */
function resolveValue(value: string, raw: Map<string, string>, seen: string[] = []): string {
  return value.replace(/var\(\s*(--[\w-]+)\s*\)/g, (_, name: string) => {
    if (seen.includes(name))
      throw new Error(`令牌引用成环：${[...seen, name].join(' → ')}`)
    const next = raw.get(name)
    if (next === undefined)
      throw new Error(`引用了未声明的 ${name}`)
    return resolveValue(next, raw, [...seen, name])
  })
}

/* ---------- 语义层的名单 ---------- */

function loadJson(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(TOKENS_DIR, name), 'utf8')) as Record<string, unknown>
}

interface FlatToken { name: string, value: string }

function flatten(obj: unknown, path: string[] = []): FlatToken[] {
  if (obj && typeof obj === 'object' && '$value' in (obj as object)) {
    const name = `--xh-${path.join('-').replace(/\./g, '_')}`
    return [{ name, value: String((obj as { $value: unknown }).$value) }]
  }
  const out: FlatToken[] = []
  for (const [key, child] of Object.entries((obj ?? {}) as Record<string, unknown>)) {
    if (key.startsWith('$'))
      continue
    if (child && typeof child === 'object')
      out.push(...flatten(child, [...path, key]))
  }
  return out
}

const SEMANTIC_SOURCES = [
  'semantic.base.json',
  'semantic.compact.json',
  'semantic.light.json',
  'semantic.light.more.json',
  'semantic.dark.json',
  'semantic.dark.more.json',
  'semantic.reduce.json',
  'semantic.print.json',
]

/**
 * 快照只收语义层。原语是这一层的输入，它变了会顺着引用体现在语义令牌的最终取值上；
 * 组件槽与私有槽不在这个包里，它们在皮肤里各自声明。
 *
 * reduce 与 print 两档只重映射别处已有的名字，取的是名字的并集，所以它们进不进这个名单
 * 都不改变快照内容。放进来是为了让「只在这一档里存在」的名字当场判红：那种名字在
 * @media 不命中的时候整支没有取值，皮肤引到它的那条声明会静默失效。
 */
const SEMANTIC_NAMES = [...new Set(
  SEMANTIC_SOURCES.flatMap(file => flatten(loadJson(file)).map(t => t.name)),
)].sort()

/* ---------- 快照文本 ---------- */

/**
 * 一支令牌在快照里的一行。取值没变但接线换了（改引到另一支同值的令牌）同样是漂移，
 * 所以最终值之后把原始声明也带上。
 *
 * 字形令牌例外：它的值是构建期内联的 SVG data URI，一支四百多字符，铺进 16 份快照没法读，
 * 换成内容摘要——SVG 改一笔摘要就变，漂移一样拦得住，原始声明就不再重复一遍。
 */
function formatLine(name: string, declared: string, resolved: string): string {
  if (resolved.startsWith('url("data:')) {
    const digest = createHash('sha256').update(resolved).digest('hex').slice(0, 12)
    return `${name}: url("data:image/svg+xml,…")  sha256:${digest}`
  }
  return declared === resolved ? `${name}: ${resolved}` : `${name}: ${resolved}  ← ${declared}`
}

function snapshotText(combo: Combination): string {
  const { raw, applied, colorScheme } = cascade(combo)
  const lines = [
    `# ${titleOf(combo)}`,
    `# color-scheme: ${colorScheme ?? '（未声明）'}`,
    '# 命中的取值块，按 tokens.css 的书写顺序：',
    ...applied.map(b => `#   [${b.index}] ${b.selector}`),
    '',
  ]
  for (const name of SEMANTIC_NAMES) {
    const declared = raw.get(name)
    if (declared === undefined)
      throw new Error(`${titleOf(combo)}：语义令牌 ${name} 在这一格里没有取值`)
    lines.push(formatLine(name, declared, resolveValue(declared, raw)))
  }
  return `${lines.join('\n')}\n`
}

/* ---------- 用例 ---------- */

describe('16 组合的语义令牌快照', () => {
  for (const combo of combinations()) {
    it(titleOf(combo), async () => {
      await expect(snapshotText(combo)).toMatchFileSnapshot(join(SNAPSHOT_DIR, `${idOf(combo)}.txt`))
    })
  }
})

describe('快照的前提', () => {
  it('每一格的令牌名集合完全相同', () => {
    for (const combo of combinations()) {
      const { raw } = cascade(combo)
      const missing = SEMANTIC_NAMES.filter(name => !raw.has(name))
      expect(missing, titleOf(combo)).toEqual([])
    }
  })

  it('每一支都解析得到字面值，不残留 var()', () => {
    for (const combo of combinations()) {
      const { raw } = cascade(combo)
      for (const name of SEMANTIC_NAMES)
        expect(resolveValue(raw.get(name)!, raw), `${titleOf(combo)} ${name}`).not.toContain('var(')
    }
  })

  it('被跳过的 @media 只有减弱动效与打印这两个', () => {
    // 别的 @media 块会成为解析盲区：那一档的取值不进这 16 格，快照照样绿。
    // 这两个各有一份逐条对齐的用例看着（reduce.spec / print.spec），
    // 第三个冒出来时这里判红，逼着它要么进轴、要么也配一份自己的用例。
    expect(mediaConditions).toEqual(['(prefers-reduced-motion: reduce)', 'print'])
  })

  it('不带 data-theme 的默认档与浅色档逐条同名同值', () => {
    // 这 16 格每一格都钉死了 data-theme，所以无条件命中的那个语义块（页面没标主题时生效的那一档）
    // 一定会被后面的 light 或 dark 块整块盖掉，它自己的取值进不了任何一份快照。
    // 两块由同一份 semantic.light.json 发出、本该逐条相同，这条断言盯的就是它们分叉——
    // 分叉之后没标主题的页面会取到一套没人算过的值，而快照全绿。
    const semantic = blocks.filter(b => b.decls.some(d => SEMANTIC_NAMES.includes(d.name)))
    const fallback = semantic.filter(b => b.matchers.every(m => Object.keys(m).length === 0)).at(-1)
    const light = semantic.find(b => b.matchers.some(m => m.theme === 'light'))

    expect(fallback, '没找到无条件命中的语义取值块').toBeDefined()
    expect(light, '没找到浅色档').toBeDefined()

    const pairs = (b: Block) => b.decls.map(d => `${d.name}: ${d.value}`).sort()
    expect(pairs(fallback!)).toEqual(pairs(light!))
    expect(fallback!.plain.map(d => `${d.name}: ${d.value}`))
      .toEqual(light!.plain.map(d => `${d.name}: ${d.value}`))
  })
})

// 深色 + 高对比是唯一被覆盖两次的一格：浅色高对比块无条件命中（它只写 [data-contrast='more']），
// 深色高对比块排在它后面把边界一族盖回来。层叠顺序解析错了，这一格会静默取到浅色档的边界色，
// 而 16 份快照仍然各不相同、看不出问题。
describe('深色 × 高对比取的是深色高对比档', () => {
  const darkMore = flatten(loadJson('semantic.dark.more.json'))
  const cell = { density: 'comfortable', contrast: 'more', motion: 'default' } as const

  it('这一格的边界取值与浅色高对比档逐条不同', () => {
    const dark = cascade({ ...cell, theme: 'dark' })
    const light = cascade({ ...cell, theme: 'light' })
    expect(darkMore.length).toBeGreaterThan(0)
    for (const t of darkMore)
      expect(dark.raw.get(t.name), t.name).not.toBe(light.raw.get(t.name))
  })

  it('这一格的边界取值逐条对上 semantic.dark.more.json', () => {
    const { raw } = cascade({ ...cell, theme: 'dark' })
    for (const t of darkMore) {
      const expected = `var(--xh-${t.value.slice(1, -1).replace(/\./g, '-')})`
      expect(raw.get(t.name), t.name).toBe(expected)
    }
  })
})
