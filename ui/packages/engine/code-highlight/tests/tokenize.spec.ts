import { describe, expect, it } from 'vitest'
import { createHighlighter, HIGHLIGHT_MAX_LENGTH, langSpecOf, tokenizeCode } from '../src'

/**
 * 判据按「粗粒度词法着色必须保证什么」写：
 * 记号拼回去必须与原文逐字相等、种类只有那几种、半截代码不许崩也不许整段变色、
 * 耗时对长度线性。着得好不好看不在这层判。
 */

const JS = langSpecOf('ts')!

function textOf(code: string, lang = 'ts'): string {
  return tokenizeCode(code, langSpecOf(lang)!).map(t => t.text).join('')
}

/** 取某一类记号的文本。 */
function pick(code: string, kind: string, lang = 'ts'): string[] {
  return tokenizeCode(code, langSpecOf(lang)!).filter(t => t.kind === kind).map(t => t.text)
}

describe('无损', () => {
  it('记号拼回去与原文逐字相等——这是这一层最硬的约束', () => {
    const samples = [
      'const a = 1',
      '// 只有注释',
      '"未闭合的字符串',
      '/* 未闭合的块注释',
      'a\n\nb\t c',
      '中文变量 = "值" // 说明',
      '',
      '\n\n\n',
      '0x1F + 3.14e-2',
      // eslint-disable-next-line no-template-curly-in-string -- 这是被着色的代码原文，不是模板串
      '`模板 ${x} 串`',
    ]
    for (const code of samples)
      expect(textOf(code), JSON.stringify(code)).toBe(code)
  })

  it('随机字符串也拼得回去', () => {
    const alphabet = 'ab{}()"\'`/*#-=<>\n\t 01_$中'
    let state = 7
    for (let round = 0; round < 200; round++) {
      let code = ''
      for (let i = 0; i < 60; i++) {
        state = (state * 1103515245 + 12345) >>> 0
        code += alphabet[state % alphabet.length]
      }
      expect(textOf(code), JSON.stringify(code)).toBe(code)
    }
  })

  it('种类只有约定的那几种', () => {
    const allowed = new Set(['plain', 'comment', 'string', 'number', 'keyword', 'punctuation'])
    for (const token of tokenizeCode('const x = "s" /* c */ + 0x1 // t', JS))
      expect(allowed).toContain(token.kind)
  })
})

describe('认得出的东西', () => {
  it('关键字、字符串、数字、注释、标点各归各类', () => {
    expect(pick('const x = 1', 'keyword')).toEqual(['const'])
    expect(pick('const x = 1', 'number')).toEqual(['1'])
    expect(pick('a = "hi"', 'string')).toEqual(['"hi"'])
    expect(pick('a // 说明', 'comment')).toEqual(['// 说明'])
    expect(pick('a.b', 'punctuation')).toEqual(['.'])
  })

  it('普通标识符不着色，不与关键字混为一谈', () => {
    expect(pick('constant + x', 'keyword')).toEqual([])
  })

  it('注释里的关键字不算关键字', () => {
    expect(pick('// const x', 'keyword')).toEqual([])
    expect(pick('/* const */', 'keyword')).toEqual([])
  })

  it('字符串里的注释标记不开注释', () => {
    expect(pick('"// 不是注释"', 'string')).toEqual(['"// 不是注释"'])
    expect(pick('"// 不是注释"', 'comment')).toEqual([])
  })

  it('转义的引号不收尾字符串', () => {
    expect(pick('"a\\"b" + c', 'string')).toEqual(['"a\\"b"'])
  })

  it('不认转义的语言里反斜杠不吃字符', () => {
    // SQL 的字符串没有反斜杠转义，两个单引号之间就是一整段
    expect(pick('\'a\\\' + b', 'string', 'sql')).toEqual(['\'a\\\''])
  })

  it('行注释吃到行尾就停，不吃换行', () => {
    expect(pick('a // 说明\nb', 'comment')).toEqual(['// 说明'])
  })

  it('各语言用各自的注释与括法', () => {
    expect(pick('# 注释', 'comment', 'python')).toEqual(['# 注释'])
    expect(pick('-- 注释', 'comment', 'sql')).toEqual(['-- 注释'])
    expect(pick('<!-- 注释 -->', 'comment', 'html')).toEqual(['<!-- 注释 -->'])
    // JSON 没有行注释，井号只是普通标点
    expect(pick('# x', 'comment', 'json')).toEqual([])
  })
})

describe('半截代码', () => {
  it('未闭合的字符串一路吃到结尾，不崩也不吞掉后面的换行', () => {
    const tokens = tokenizeCode('const s = "还没写完\n下一行', JS)
    expect(tokens.map(t => t.text).join('')).toBe('const s = "还没写完\n下一行')
    expect(tokens.some(t => t.kind === 'string' && t.text.includes('\n下一行'))).toBe(true)
  })

  it('未闭合的块注释一路吃到结尾', () => {
    expect(pick('a /* 还没写完', 'comment')).toEqual(['/* 还没写完'])
  })

  it('逐字符喂进去每一步都不崩，且每一步都无损', () => {
    const full = 'function f() {\n  return "a" + /* c */ 1 // done\n}'
    for (let i = 1; i <= full.length; i++) {
      const part = full.slice(0, i)
      expect(textOf(part), `@${i}`).toBe(part)
    }
  })
})

describe('端口约定', () => {
  const highlighter = createHighlighter()

  it('认不出的语言返回 null，由调用方渲成纯文本', () => {
    expect(highlighter.highlight('const x = 1', 'brainfuck')).toBe(null)
    expect(highlighter.highlight('const x = 1', '')).toBe(null)
  })

  it('空代码返回 null', () => {
    expect(highlighter.highlight('', 'ts')).toBe(null)
  })

  it('超长代码不着色：粗粒度着色的收益抵不过白扫一趟', () => {
    expect(highlighter.highlight('a'.repeat(HIGHLIGHT_MAX_LENGTH + 1), 'ts')).toBe(null)
    expect(highlighter.highlight('a'.repeat(100), 'ts')).not.toBe(null)
  })

  it('语言标注不分大小写、容忍首尾空白', () => {
    expect(highlighter.highlight('x', ' TypeScript ')).not.toBe(null)
  })
})

describe('规模', () => {
  /** 三轮取最快，躲开 GC 抖动。 */
  function fastest(run: () => void): number {
    let best = Number.POSITIVE_INFINITY
    for (let i = 0; i < 3; i++) {
      const started = performance.now()
      run()
      best = Math.min(best, performance.now() - started)
    }
    return best
  }

  it('耗时对长度线性：翻十倍不该翻几十倍', () => {
    const unit = 'const value = "text" + 0x1F // 注释\n'
    // 两个样本都要高于计时器分辨率，比值量的才是复杂度而不是噪声
    const small = unit.repeat(2000)
    const large = unit.repeat(20_000)
    // 热身一趟，把 JIT 编译排除在测量之外
    tokenizeCode(small, JS)
    const a = fastest(() => tokenizeCode(small, JS))
    const b = fastest(() => tokenizeCode(large, JS))
    // 小样本没量出耗时就当场判失败，不拿兜底值当除数折算出假的超线性
    expect(a).toBeGreaterThan(0.05)
    // CI 并发跑二十多个包的用例，同一份语料比开发机慢一个数量级，上限按倍数放宽
    expect(b).toBeLessThan(process.env.CI ? 2000 : 200)
    // 线性判据只在本机断言：两个样本前后脚分别计时，CI 上争抢强度在这中间会变，
    // 小样本跑得越短越容易抢到干净的一段，比值被抬高的是分母。CI 上改成报数。
    if (process.env.CI)
      console.warn(`[perf] 大样本 ${b.toFixed(1)}ms · 比值 ${(b / a).toFixed(1)}（上限 30）`)
    else
      expect(b / a).toBeLessThan(30)
  })

  it('全是未闭合引号也不退化', () => {
    const nasty = '"'.repeat(20_000)
    expect(fastest(() => tokenizeCode(nasty, JS))).toBeLessThan(200)
  })

  it('全是块注释开头也不退化', () => {
    const nasty = '/*'.repeat(20_000)
    expect(fastest(() => tokenizeCode(nasty, JS))).toBeLessThan(200)
  })
})
