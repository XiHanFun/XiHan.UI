import type { RenderedBlock } from '../src'
import { describe, expect, it } from 'vitest'
import { createStreamRenderer } from '../src'

const KB = 1024
/** 流式喂入时每次追加的字符数。 */
const TOKEN = 16

// ---------------------------------------------------------------------------
// 语料生成，只做字符串重复拼接
// ---------------------------------------------------------------------------

/** 把 unit 重复到不少于 size 个字符。 */
function repeatTo(unit: string, size: number): string {
  return unit.repeat(Math.max(1, Math.ceil(size / unit.length)))
}

/** 只有左方括号、永远配不上右方括号的一整段。 */
function unclosedBrackets(size: number): string {
  return '['.repeat(size)
}

/** 长度交替的反引号段，段段配不上收尾。 */
function unpairedTicks(size: number): string {
  return repeatTo('``a `b ', size)
}

/** 一串注定收不了尾的加粗起始标记。 */
function danglingEmphasis(size: number): string {
  return repeatTo('**a ', size)
}

/** K 列表头加 K 个只写一个竖线的空行。 */
function sparseTable(size: number): string {
  const k = Math.max(2, Math.floor(size / 12))
  return `${'| h '.repeat(k)}|\n${'| --- '.repeat(k)}|\n${'|\n'.repeat(k)}`
}

/** 一串开了圆括号就断掉的行内链接。 */
function truncatedLinks(size: number): string {
  return repeatTo('[a](', size)
}

/** 断掉的行内链接的中文变体。 */
function truncatedLinksCjk(size: number): string {
  return repeatTo('[标题](还没写完的地址', size)
}

/** 大段空格后面还跟着硬换行与正文，空格墙不在串尾。 */
function spaceWall(size: number): string {
  return `${' '.repeat(Math.max(1, size - 8))}x  \ny`
}

/** 深度嵌套的方括号，前面挂一张非空的引用定义表。 */
function nestedBrackets(size: number): string {
  const n = Math.max(1, Math.floor(size / 2))
  return `[a]: /x "t"\n[b]: /y\n\n${'['.repeat(n)}${']'.repeat(n)}`
}

// ---------------------------------------------------------------------------
// 计时
// ---------------------------------------------------------------------------

/** 跑 rounds 轮，取最快一轮的耗时（毫秒）。 */
function fastest(run: () => void, rounds: number): number {
  let best = Number.POSITIVE_INFINITY
  for (let i = 0; i < rounds; i++) {
    const start = performance.now()
    run()
    best = Math.min(best, performance.now() - start)
  }
  return best
}

/** 一次性喂全文渲染一遍的耗时。 */
function timeOnce(text: string): number {
  return fastest(() => {
    createStreamRenderer().render(text, { ended: true })
  }, 3)
}

/** 按 TOKEN 长度逐段追加喂入、最后收尾的总耗时。 */
function timeStream(text: string): number {
  return fastest(() => {
    const renderer = createStreamRenderer()
    for (let i = TOKEN; i < text.length; i += TOKEN) renderer.render(text.slice(0, i))
    renderer.render(text, { ended: true })
  }, 2)
}

interface Case {
  /** 语料生成器。 */
  readonly gen: (size: number) => string
  /** 大档语料的耗时上限（毫秒）。 */
  readonly budgetMs: number
  /** 小档语料的字符数。 */
  readonly small?: number
  /** 大档语料的字符数。 */
  readonly large?: number
}

/** 绝对上限的宽放倍数：CI 并发跑二十多个包的用例，同一批语料比开发机慢一个数量级。 */
const BUDGET_SLACK = process.env.CI ? 10 : 1

/** 两档语料各计一次时长，断言大档耗时与两档耗时比都在上限内。 */
function expectScaling(
  item: Case,
  scale: { small: number, large: number, maxRatio: number },
  time: (text: string) => number,
): void {
  const small = item.gen(item.small ?? scale.small)
  const large = item.gen(item.large ?? scale.large)
  const fast = time(small)
  const slow = time(large)
  expect(slow).toBeLessThan(item.budgetMs * BUDGET_SLACK)
  expect(slow / Math.max(fast, 0.05)).toBeLessThan(scale.maxRatio)
}

// ---------------------------------------------------------------------------
// 一次性喂全文，两档语料 64 KB / 128 KB
// ---------------------------------------------------------------------------

const ONCE_SCALE = { small: 64 * KB, large: 128 * KB, maxRatio: 3 }

describe('一次性喂全文的超线性形状', () => {
  it('未闭合 `[` 重复', () => {
    expectScaling({ gen: unclosedBrackets, budgetMs: 40 }, ONCE_SCALE, timeOnce)
  }, 60_000)

  it('未配对反引号段', () => {
    expectScaling({ gen: unpairedTicks, budgetMs: 90 }, ONCE_SCALE, timeOnce)
  }, 60_000)

  it('注定失败的强调标记', () => {
    expectScaling({ gen: danglingEmphasis, budgetMs: 120 }, ONCE_SCALE, timeOnce)
  }, 60_000)

  it('表头 K 列加 K 个只写一个竖线的空行', () => {
    expectScaling({ gen: sparseTable, budgetMs: 90 }, ONCE_SCALE, timeOnce)
  }, 60_000)

  it('截断的行内链接', () => {
    expectScaling({ gen: truncatedLinks, budgetMs: 60 }, ONCE_SCALE, timeOnce)
  }, 60_000)

  it('截断的行内链接（中文标签与地址）', () => {
    expectScaling({ gen: truncatedLinksCjk, budgetMs: 50 }, ONCE_SCALE, timeOnce)
  }, 60_000)

  it('不在串尾的空格墙', () => {
    expectScaling({ gen: spaceWall, budgetMs: 60, small: 256 * KB, large: 512 * KB }, ONCE_SCALE, timeOnce)
  }, 60_000)

  it('嵌套方括号加非空定义表', () => {
    expectScaling({ gen: nestedBrackets, budgetMs: 70 }, ONCE_SCALE, timeOnce)
  }, 60_000)
})

// ---------------------------------------------------------------------------
// 流式按 token 喂，两档语料 2 KB / 8 KB
// ---------------------------------------------------------------------------

const STREAM_SCALE = { small: 2 * KB, large: 8 * KB, maxRatio: 30 }

describe('流式按 token 喂的超线性形状', () => {
  it('未闭合 `[` 重复', () => {
    expectScaling({ gen: unclosedBrackets, budgetMs: 350 }, STREAM_SCALE, timeStream)
  }, 60_000)

  it('未配对反引号段', () => {
    expectScaling({ gen: unpairedTicks, budgetMs: 1000 }, STREAM_SCALE, timeStream)
  }, 60_000)

  it('注定失败的强调标记', () => {
    expectScaling({ gen: danglingEmphasis, budgetMs: 1400 }, STREAM_SCALE, timeStream)
  }, 60_000)

  it('表头 K 列加 K 个只写一个竖线的空行', () => {
    expectScaling({ gen: sparseTable, budgetMs: 600 }, STREAM_SCALE, timeStream)
  }, 60_000)

  it('截断的行内链接', () => {
    expectScaling({ gen: truncatedLinks, budgetMs: 700 }, STREAM_SCALE, timeStream)
  }, 60_000)

  it('截断的行内链接（中文标签与地址）', () => {
    expectScaling({ gen: truncatedLinksCjk, budgetMs: 700 }, STREAM_SCALE, timeStream)
  }, 60_000)

  it('不在串尾的空格墙', () => {
    expectScaling({ gen: spaceWall, budgetMs: 600, small: 16 * KB, large: 64 * KB }, STREAM_SCALE, timeStream)
  }, 60_000)

  it('嵌套方括号加非空定义表', () => {
    expectScaling({ gen: nestedBrackets, budgetMs: 1400 }, STREAM_SCALE, timeStream)
  }, 60_000)
})

// ---------------------------------------------------------------------------
// 差分：随机语料逐字符喂入的结果，与一次性喂全文的结果对拍
// ---------------------------------------------------------------------------

/** 32 位种子 PRNG。 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 行内标记碎片。 */
const INLINE_PIECES = ['*', '**', '***', '_', '__', '~~', '`', '``', '[', ']', '(', ')', '!', '\\', '<', '>', ':', '"']

/** 块级标记碎片。 */
const BLOCK_PIECES = ['#', '##', '- ', '1. ', '> ', '| ', '|', '---', '$$', '```', '+', '[a]: /u']

/** 空白与正文碎片。 */
const TEXT_PIECES = [' ', '  ', '\t', '\n', '\n\n', 'a', 'b', '中', 'x y', 'http://a/b']

/** 随机语料的碎片表。 */
const PIECES: readonly string[] = [...INLINE_PIECES, ...BLOCK_PIECES, ...TEXT_PIECES]

/** 把一组块压成可比较的字符串。 */
function fingerprint(blocks: readonly RenderedBlock[]): string {
  return blocks.map(b => `${b.key}|${b.kind}|${b.complete}|${b.lang ?? ''}|${b.html}`).join(' ')
}

describe('差分', () => {
  it('随机语料逐字符流式喂入的结果，与一次性喂全文一致', () => {
    const random = mulberry32(20260729)
    const mismatches: string[] = []
    for (let n = 0; n < 300; n++) {
      const count = 6 + Math.floor(random() * 24)
      let text = ''
      for (let i = 0; i < count; i++) text += PIECES[Math.floor(random() * PIECES.length)]!

      const renderer = createStreamRenderer()
      for (let i = 1; i <= text.length; i++) renderer.render(text.slice(0, i))
      const incremental = fingerprint(renderer.render(text, { ended: true }))
      const whole = fingerprint(createStreamRenderer().render(text, { ended: true }))
      if (incremental !== whole)
        mismatches.push(JSON.stringify(text))
    }
    expect(mismatches).toEqual([])
  }, 60_000)
})
