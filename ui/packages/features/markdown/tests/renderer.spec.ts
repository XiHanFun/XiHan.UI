import type { RenderedBlock } from '../src'
import { describe, expect, it } from 'vitest'
import { createStreamRenderer, LIVE_BLOCK_KEY } from '../src'

/** 逐字符喂进去，模拟一个 token 一个 token 吐字。 */
function stream(text: string, opts?: { ended?: boolean }): readonly RenderedBlock[] {
  const r = createStreamRenderer()
  let last: readonly RenderedBlock[] = []
  for (let i = 1; i <= text.length; i++) last = r.render(text.slice(0, i))
  if (opts?.ended)
    last = r.render(text, { ended: true })
  return last
}

const ARTICLE = `# 标题

第一段。

\`\`\`ts
const a = 1
\`\`\`

第二段。`

describe('幂等', () => {
  it('逐字符喂完与一次性喂全文，结果一致', () => {
    const once = createStreamRenderer().render(ARTICLE)
    const bit = stream(ARTICLE)
    expect(bit.map(b => b.html)).toEqual(once.map(b => b.html))
    expect(bit.map(b => b.kind)).toEqual(once.map(b => b.kind))
  })

  it('同一份全文渲染两次，结果完全相同', () => {
    const r = createStreamRenderer()
    expect(r.render(ARTICLE)).toEqual(r.render(ARTICLE))
  })
})

describe('稳定 key', () => {
  it('生长中的那一块 key 恒定', () => {
    const r = createStreamRenderer()
    // key 每帧一换的话，用户每收到一个 token 就要被重建一次节点，选区和滚动位置全丢
    expect(r.render('未完的一段').at(-1)!.key).toBe(LIVE_BLOCK_KEY)
    expect(r.render('未完的一段话').at(-1)!.key).toBe(LIVE_BLOCK_KEY)
    expect(r.render('未完的一段话还在长').at(-1)!.key).toBe(LIVE_BLOCK_KEY)
  })

  it('定型块的 key 不随后续输入变化', () => {
    const r = createStreamRenderer()
    r.render('第一段。\n\n第二')
    const first = r.render('第一段。\n\n第二段。')[0]!
    const later = r.render(`第一段。\n\n第二段。\n\n第三段。`)[0]!
    expect(later.key).toBe(first.key)
    expect(later.html).toBe(first.html)
  })

  it('内容不同的块拿到不同的 key', () => {
    const r = createStreamRenderer()
    const blocks = r.render('甲。\n\n乙。\n\n丙。')
    expect(new Set(blocks.map(b => b.key)).size).toBe(blocks.length)
  })

  it('ended 之后最后一块也换成稳定 key', () => {
    const r = createStreamRenderer()
    r.render('收尾的一段')
    const done = r.render('收尾的一段', { ended: true })
    expect(done.at(-1)!.key).not.toBe(LIVE_BLOCK_KEY)
    expect(done.at(-1)!.complete).toBe(true)
  })
})

describe('冻结前缀的缓存', () => {
  it('全文不再以缓存前缀开头时整个缓存作废', () => {
    // 宿主换了一整条消息、或者重放了另一条。拿旧块糊上去会渲出根本不存在的内容
    const r = createStreamRenderer()
    r.render('甲。\n\n乙。\n\n丙')
    const other = r.render('完全不同的另一条。\n\n第二段')
    expect(other[0]!.html).toContain('完全不同的另一条')
    expect(other).toHaveLength(2)
  })

  it('块之间的空行被一起冻结，块边界不会错位', () => {
    const r = createStreamRenderer()
    r.render('甲。\n\n\n\n乙。\n\n丙')
    const blocks = r.render('甲。\n\n\n\n乙。\n\n丙。')
    expect(blocks).toHaveLength(3)
    expect(blocks[0]!.html).toContain('甲')
    expect(blocks[1]!.html).toContain('乙')
    expect(blocks[2]!.html).toContain('丙')
  })
})

describe('围栏代码块', () => {
  it('未闭合时内容不被当 markdown 解析', () => {
    // 这条守的是代码里的 * # [ 不被误渲成强调、标题、链接
    const blocks = createStreamRenderer().render('```ts\nconst a = *1*\n# 不是标题')
    const code = blocks.at(-1)!
    expect(code.kind).toBe('code')
    expect(code.html).toContain('const a = *1*')
    expect(code.html).not.toContain('<em>')
    expect(code.html).not.toContain('<h1>')
  })

  it('未闭合即未定型，闭合那一刻转为已定型', () => {
    // complete 决定消费方要不要现在就上高亮这类一次性的昂贵渲染。
    // 一律当没闭合的话，长回复里早就写完的代码要等整个流结束才亮起来
    const r = createStreamRenderer()
    expect(r.render('```ts\nconst a = 1').at(-1)!.complete).toBe(false)
    expect(r.render('```ts\nconst a = 1\n```').at(-1)!.complete).toBe(true)
  })

  it('语言标注过白名单，脏值一律不透传', () => {
    // 这个值会被消费方拿去拼 class 或 data 属性，而它是模型吐出来的
    const r = createStreamRenderer()
    expect(r.render('```ts\nx\n```').at(-1)!.lang).toBe('ts')
    expect(r.render('```ts" onload="alert(1)\nx\n```').at(-1)!.lang).toBeUndefined()
    expect(r.render('```\nx\n```').at(-1)!.lang).toBeUndefined()
  })

  it('波浪号围栏与更长的围栏同样认', () => {
    const r = createStreamRenderer()
    expect(r.render('~~~py\nx\n~~~').at(-1)!.complete).toBe(true)
    expect(r.render('````md\n```\n````').at(-1)!.complete).toBe(true)
  })
})

describe('块正文原文', () => {
  it('code 块给的是剥掉起止围栏的代码，缩进与空行照原样留着', () => {
    // html 里的代码已经转义过，代码组件要重排行号与着色只能拿未转义的原文
    const r = createStreamRenderer()
    expect(r.render('```ts\nconst a = 1\n```').at(-1)!.source).toBe('const a = 1')
    expect(r.render('```ts\n  if (a) {\n\n    b()\n  }\n```').at(-1)!.source).toBe('  if (a) {\n\n    b()\n  }')
  })

  it('未闭合的 code 块照样给正文，剥掉开围栏即可', () => {
    expect(createStreamRenderer().render('```ts\nconst a =').at(-1)!.source).toBe('const a =')
  })

  it('code 块的正文与 html 里的那份逐字对得上', () => {
    const block = createStreamRenderer().render('```ts\nif (a < b && c > d) {}\n```').at(-1)!
    expect(block.html).toContain('if (a &lt; b &amp;&amp; c &gt; d) {}')
    expect(block.source).toBe('if (a < b && c > d) {}')
  })

  it('math 块给的是剥掉 $$ 的公式，单行与多行两种写法都认', () => {
    const r = createStreamRenderer()
    expect(r.render('$$x^2$$').at(-1)!.source).toBe('x^2')
    expect(r.render('$$\n\\frac{a}{b}\n$$').at(-1)!.source).toBe('\\frac{a}{b}')
    expect(r.render('$$\\sum_{i}\n$$').at(-1)!.source).toBe('\\sum_{i}')
  })

  it('未闭合的 math 块剥掉开定界符就给', () => {
    expect(createStreamRenderer().render('$$\n\\frac{a}').at(-1)!.source).toBe('\\frac{a}')
  })

  it('其余种类的块不带正文原文', () => {
    const blocks = createStreamRenderer().render('# 标题\n\n一段话。\n\n- 甲\n- 乙')
    expect(blocks.every(b => b.kind === 'markdown')).toBe(true)
    expect(blocks.every(b => b.source === undefined)).toBe(true)
  })

  it('缩进代码块算 markdown 块，不带正文原文', () => {
    // blockKind 只把围栏块判成 code，缩进代码块的 html 就是它的全部产出
    const block = createStreamRenderer().render('    const a = 1').at(-1)!
    expect(block.kind).toBe('markdown')
    expect(block.source).toBeUndefined()
  })
})

describe('消毒', () => {
  it('模型吐的内联 HTML 一律转义成文本', () => {
    const blocks = createStreamRenderer().render('<script>alert(1)</script>')
    expect(blocks[0]!.html).not.toContain('<script>')
    expect(blocks[0]!.html).toContain('&lt;script&gt;')
  })

  it('危险协议的链接不成链接', () => {
    const r = createStreamRenderer()
    for (const src of ['[x](javascript:alert(1))', '[x](vbscript:msgbox)', '[x](data:text/html,<b>)']) {
      const html = r.render(src)[0]!.html
      expect(html, src).not.toContain('<a ')
    }
  })

  it('属性注入尝试落不成真属性', () => {
    // 那串字符照样出现在输出里，但引号被转成了实体、整段留在文本节点内。
    // 所以断言不能只搜 onerror 三个字，要盯"有没有变成一个真的属性"
    const html = createStreamRenderer().render('![a](x" onerror="alert(1))')[0]!.html
    expect(html).not.toContain('onerror="')
    expect(html).not.toContain('<img')
    expect(html).toContain('&quot;')
  })

  it('渲染器永不产出 html 种类的块', () => {
    // 模型输出里没有可信的那一半，唯一安全的处理就是当文本
    const blocks = createStreamRenderer().render('<div onclick="x">a</div>\n\n正文')
    expect(blocks.every(b => b.kind !== 'html')).toBe(true)
  })
})

describe('规模', () => {
  it('长文本下块数正确，且定型块只渲一次', () => {
    const paragraphs = Array.from({ length: 200 }, (_, i) => `第 ${i} 段。`)
    const r = createStreamRenderer()
    let blocks: readonly RenderedBlock[] = []
    for (let i = 1; i <= paragraphs.length; i++) blocks = r.render(paragraphs.slice(0, i).join('\n\n'))
    expect(blocks).toHaveLength(200)
    expect(blocks[0]!.html).toContain('第 0 段')
    expect(blocks.at(-1)!.key).toBe(LIVE_BLOCK_KEY)
    // 定型块的 key 全不重样，说明它们各自冻在自己的内容上而不是被后面的覆盖
    expect(new Set(blocks.slice(0, -1).map(b => b.key)).size).toBe(199)
  })
})

describe('dispose', () => {
  it('释放后不再产出，且幂等', () => {
    const r = createStreamRenderer()
    r.render('一段')
    r.dispose()
    expect(r.render('一段')).toEqual([])
    expect(() => r.dispose()).not.toThrow()
  })
})
