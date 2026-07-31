import { tests as specExamples } from 'commonmark-spec'
import { describe, expect, it } from 'vitest'
import { createStreamRenderer } from '../src'
import baseline from './commonmark-baseline.json'

/**
 * 对着 CommonMark 官方 652 条用例的一致率棘轮。
 *
 * 本包实现的是「AI 聊天输出够用的 Markdown 子集」，不是 CommonMark 实现，因此这里
 * **不追求满分**。它回答的是手写用例回答不了的那个问题：这个子集到底覆盖到哪儿、
 * 离规范差多少——手写用例只能证明"想到的都对"，证不出"没想到的偏了多少"。
 *
 * 判据是逐节通过数与基线**逐字相等**：掉了说明改回归了，涨了说明基线过期该重记。
 * 一节一记而不是记个总数，是为了让"这边修好两条、那边悄悄坏掉两条"露出来。
 *
 * 官方用例来自 devDependency `commonmark-spec`（CC-BY-SA-4.0），只在测试期读取，不进产物。
 */

interface SpecExample {
  markdown: string
  html: string
  section: string
  number: number
}

type Baseline = Record<string, { pass: number, total: number }>

const EXAMPLES = specExamples as unknown as SpecExample[]
const BASELINE = baseline as Baseline

/**
 * 按设计就不打算过的两节，它们的分数低是结论不是缺陷。
 * 解析器写死 html:false —— 原生 HTML 一律不透传，这是消毒面收在解析器内部的代价，
 * 也是这个包最重要的一条安全约束，不会为了跑分改掉。
 */
const BY_DESIGN: Readonly<Record<string, string>> = {
  'HTML blocks': '原生 HTML 块不透传',
  'Raw HTML': '行内原生 HTML 不透传',
}

/**
 * 只抹掉纯序列化差异，不抹语义差异。
 * 空元素的自闭合斜杠在 HTML5 里没有意义，官方用例沿用的是 XHTML 写法；
 * 除此之外一律照原样比——normalize 放宽一寸，这个数字就虚一分。
 */
function normalizeHtml(html: string): string {
  return html
    // 属性段用字符串裁而不是回溯掉尾部的 `/`：`[^>]*?\s*\/` 那种写法能与 \s* 抢字符，
    // 本包最不该出现的正是这种会超线性回溯的正则
    .replace(/<(br|hr|img|input|wbr)([^>]*)>/gi, (_, tag: string, attrs: string) =>
      `<${tag}${attrs.endsWith('/') ? attrs.slice(0, -1).trimEnd() : attrs}>`)
    .replace(/[ \t]+$/gm, '')
    .trim()
}

function render(markdown: string): string {
  const renderer = createStreamRenderer()
  const out = renderer.render(markdown, { ended: true })
  renderer.dispose()
  return out.map(block => block.html).join('\n')
}

/** 渲染崩了也算没过：一致率关心的是产出对不对，崩溃另有安全用例把守。 */
function passes(example: SpecExample): boolean {
  try {
    return normalizeHtml(render(example.markdown)) === normalizeHtml(example.html)
  }
  catch {
    return false
  }
}

function tally(): Baseline {
  const bySection: Baseline = {}
  for (const example of EXAMPLES) {
    const entry = bySection[example.section] ?? { pass: 0, total: 0 }
    entry.total += 1
    if (passes(example))
      entry.pass += 1
    bySection[example.section] = entry
  }
  return bySection
}

const ACTUAL = tally()

function sum(source: Baseline, field: 'pass' | 'total'): number {
  return Object.values(source).reduce((n, s) => n + s[field], 0)
}

describe('官方用例一致率（CommonMark 0.31.2）', () => {
  it('官方用例一条不落地跑到', () => {
    expect(sum(ACTUAL, 'total')).toBe(EXAMPLES.length)
    expect(EXAMPLES.length).toBe(652)
  })

  it('基线里的节与规范的节一一对应', () => {
    // 规范升版会增删小节，对不上时先看是不是 commonmark-spec 升级了
    expect(Object.keys(ACTUAL).sort()).toEqual(Object.keys(BASELINE).sort())
  })

  for (const section of Object.keys(BASELINE)) {
    const expected = BASELINE[section]!
    const note = BY_DESIGN[section]
    it(`${section}：${expected.pass}/${expected.total}${note ? `（按设计不支持：${note}）` : ''}`, () => {
      const actual = ACTUAL[section]!
      expect(actual.total, '规范用例条数变了，先确认 commonmark-spec 版本').toBe(expected.total)
      // 掉了是回归；涨了是好事，但基线得跟着重记，否则棘轮就松了
      expect(actual.pass, actual.pass > expected.pass
        ? '通过数涨了，请更新 tests/commonmark-baseline.json'
        : '通过数掉了，是回归').toBe(expected.pass)
    })
  }

  it('按设计不支持的那几节仍然不支持', () => {
    // 哪天真透传了原生 HTML，这条会红——那意味着消毒面被打开了，必须是有意为之
    for (const section of Object.keys(BY_DESIGN)) {
      const actual = ACTUAL[section]
      expect(actual, `${section} 不在规范里了？`).toBeDefined()
      expect(actual!.pass, `${section} 通过数变了，确认是不是把 HTML 透传打开了`).toBe(BASELINE[section]!.pass)
    }
  })

  it('总体一致率不低于基线', () => {
    const pass = sum(ACTUAL, 'pass')
    const total = sum(ACTUAL, 'total')
    const base = sum(BASELINE, 'pass')
    expect(pass, `一致率 ${pass}/${total}（${(pass / total * 100).toFixed(1)}%），基线 ${base}`).toBe(base)
  })
})
