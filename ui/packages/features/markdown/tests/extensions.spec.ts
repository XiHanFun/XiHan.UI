import type { RenderedBlock } from '../src'
import { describe, expect, it } from 'vitest'
import { createStreamRenderer, LIVE_BLOCK_KEY } from '../src'

function done(src: string, options?: Parameters<typeof createStreamRenderer>[0]): readonly RenderedBlock[] {
  return createStreamRenderer(options).render(src, { ended: true })
}

function html(src: string): string {
  return done(src).map(block => block.html).join('\n')
}

/** 流中这一刻的最后一块。 */
function liveHtml(src: string): string {
  const last = createStreamRenderer().render(src).at(-1)!
  expect(last.key).toBe(LIVE_BLOCK_KEY)
  return last.html
}

/** 逐字喂完再收尾，与一次性渲整篇比。 */
function streamed(src: string): readonly RenderedBlock[] {
  const r = createStreamRenderer()
  for (let i = 1; i <= src.length; i++) r.render(src.slice(0, i))
  return r.render(src, { ended: true })
}

describe('任务列表', () => {
  it('项首的 [ ] 与 [x] 换成只读勾选框，li 带 data-task', () => {
    const out = html('- [ ] 待办\n- [x] 已办')
    expect(out).toContain('<li data-task="open"><input type="checkbox" disabled> 待办</li>')
    expect(out).toContain('<li data-task="done"><input type="checkbox" disabled checked> 已办</li>')
  })

  it('松列表的勾选框落在第一段里', () => {
    expect(html('- [x] 甲\n\n- [ ] 乙')).toContain('<li data-task="done">\n<p><input type="checkbox" disabled checked> 甲</p>')
  })

  it('方括号里不是空格或 x 的不算任务', () => {
    expect(html('- [y] 普通')).not.toContain('checkbox')
  })
})

describe('脚注', () => {
  const src = '正文引用[^a]，再引用[^b]，又回到[^a]。\n\n[^a]: 第一条说明\n[^b]: 第二条说明'

  it('角标按首次引用编号，链到定义；只有首次引用带回链 id', () => {
    const out = html(src)
    expect(out).toContain('<sup data-footnote-ref><a href="#md-fn-a" id="md-fnref-a">1</a></sup>')
    expect(out).toContain('<sup data-footnote-ref><a href="#md-fn-b" id="md-fnref-b">2</a></sup>')
    expect(out.match(/id="md-fnref-a"/g)).toHaveLength(1)
  })

  it('定义渲成带序号与回链的脚注列表', () => {
    const out = html(src)
    expect(out).toContain('<section data-footnotes>')
    expect(out).toContain('<li id="md-fn-a" value="1"><p>第一条说明 <a href="#md-fnref-a" data-footnote-backref aria-label="Back to reference 1">↩</a></p></li>')
    expect(out).toContain('<li id="md-fn-b" value="2">')
  })

  it('idPrefix 让同一页上的几段正文各用各的锚点', () => {
    const out = done(src, { idPrefix: 'msg7-' }).map(block => block.html).join('\n')
    expect(out).toContain('href="#msg7-fn-a"')
    expect(out).toContain('id="msg7-fn-a"')
  })

  it('逐字喂与一次性渲整篇结果相同（冻结块的编号与回链 id 不丢）', () => {
    const long = `${'第一段[^x]。\n\n第二段[^y]。\n\n'.repeat(3)}[^x]: 甲\n\n[^y]: 乙`
    expect(streamed(long).map(block => block.html)).toEqual(done(long).map(block => block.html))
  })

  it('定义先于引用出现时照样分号', () => {
    expect(html('[^z]: 先写定义\n\n后引用[^z]')).toContain('>1</a></sup>')
  })
})

describe('裸地址自动成链', () => {
  it('http(s):// 与 www. 起头的裸地址成链，www. 补上协议', () => {
    expect(html('见 https://example.com/a?b=1 与 www.example.org')).toContain('<a href="https://example.com/a?b=1">https://example.com/a?b=1</a>')
    expect(html('见 www.example.org。')).toContain('<a href="http://www.example.org">www.example.org</a>。')
  })

  it('末尾的标点与多出来的右圆括号不算进地址', () => {
    expect(html('（见 https://example.com/x）')).toContain('<a href="https://example.com/x">')
    expect(html('(see https://example.com/a_(b))')).toContain('<a href="https://example.com/a_(b)">https://example.com/a_(b)</a>)')
    expect(html('去 https://example.com.')).toContain('<a href="https://example.com">https://example.com</a>.')
  })

  it('链接文字里的地址不再套一层链接', () => {
    const out = html('[https://example.com](https://example.com)')
    expect(out).toBe('<p><a href="https://example.com">https://example.com</a></p>')
  })

  it('词中间的 www 与没有域名的协议头不成链', () => {
    expect(html('awww.example.com')).not.toContain('<a')
    expect(html('https:// 什么都没有')).not.toContain('<a')
  })

  it('bareLinks 为 false 时按 CommonMark 留作文本', () => {
    expect(done('https://example.com', { bareLinks: false })[0]!.html).toBe('<p>https://example.com</p>')
  })

  it('危险协议照样过白名单：裸地址只认 http(s) 与 www.', () => {
    expect(html('javascript:alert(1)')).not.toContain('<a')
  })
})

describe('行内公式', () => {
  it('$…$ 渲成带下标的挂点，原文进 inlines', () => {
    const [block] = done('质能方程 $E=mc^2$ 很有名')
    expect(block!.html).toBe('<p>质能方程 <span data-md-inline="0" data-md-math="inline">E=mc^2</span> 很有名</p>')
    expect(block!.inlines).toEqual([{ kind: 'math', source: 'E=mc^2', display: false }])
  })

  it('行内写的 $$…$$ 记为 display', () => {
    const [block] = done('见 $$\\sum_i x_i$$ 一式')
    expect(block!.inlines).toEqual([{ kind: 'math', source: '\\sum_i x_i', display: true }])
  })

  it('金额里的美元符号不成公式', () => {
    const [block] = done('花了 $5 和 $10')
    expect(block!.inlines).toBeUndefined()
    expect(block!.html).toBe('<p>花了 $5 和 $10</p>')
  })

  it('开符号后是空白、闭符号前是空白都不成公式；转义的美元符号是字面量', () => {
    expect(done('$ x $')[0]!.inlines).toBeUndefined()
    expect(done('\\$x$')[0]!.inlines).toBeUndefined()
  })

  it('公式原文里的尖括号照样转义', () => {
    expect(html('$a<b$')).toContain('>a&lt;b</span>')
  })
})

describe('行内引用', () => {
  it('[@来源] 渲成挂点，降级内容是来源 id', () => {
    const [block] = done('共享原语减少不一致[@report]。')
    expect(block!.html).toBe('<p>共享原语减少不一致<span data-md-inline="0" data-md-citation="report">[report]</span>。</p>')
    expect(block!.inlines).toEqual([{ kind: 'citation', sourceIds: ['report'] }])
  })

  it('一处多源按书写顺序给出 sourceIds', () => {
    const [block] = done('结论[@a; @b, @c]')
    expect(block!.inlines).toEqual([{ kind: 'citation', sourceIds: ['a', 'b', 'c'] }])
  })

  it('同一块里的公式与引用共用一套下标', () => {
    const [block] = done('$x$ 与[@s]')
    expect(block!.inlines).toEqual([
      { kind: 'math', source: 'x', display: false },
      { kind: 'citation', sourceIds: ['s'] },
    ])
    expect(block!.html).toContain('data-md-inline="1" data-md-citation="s"')
  })

  it('没有挂点的块不带 inlines', () => {
    expect(done('普通段落')[0]!.inlines).toBeUndefined()
  })

  it('来源 id 里的引号落不成属性', () => {
    expect(html('[@a"onclick=x]')).not.toMatch(/data-md-citation="a"onclick/)
  })
})

describe('生长块的行内容错', () => {
  it('未闭合的加粗、斜体与删除线先按闭合显示', () => {
    expect(liveHtml('这是**重点')).toBe('<p>这是<strong>重点</strong></p>')
    expect(liveHtml('这是*倾斜')).toBe('<p>这是<em>倾斜</em></p>')
    expect(liveHtml('这是~~删掉')).toBe('<p>这是<del>删掉</del></p>')
    expect(liveHtml('**粗里*斜')).toBe('<p><strong>粗里<em>斜</em></strong></p>')
  })

  it('开符号后面还没有字时先不显示', () => {
    expect(liveHtml('你好 **')).toBe('<p>你好</p>')
    expect(liveHtml('**')).toBe('')
  })

  it('未闭合的行内代码补上收尾，里面的星号不当强调', () => {
    expect(liveHtml('用 `a * b')).toBe('<p>用 <code>a * b</code></p>')
    expect(liveHtml('用 `')).toBe('<p>用</p>')
  })

  it('写到一半的链接只显示文字，地址写完才成链接', () => {
    expect(liveHtml('见[文档')).toBe('<p>见文档</p>')
    expect(liveHtml('见[文档](https://exa')).toBe('<p>见文档</p>')
    expect(liveHtml('见[**文档**](https://exa')).toBe('<p>见<strong>文档</strong></p>')
  })

  it('写到一半的图片、引用与脚注整段先不显示', () => {
    expect(liveHtml('图![示意](https://exa')).toBe('<p>图</p>')
    expect(liveHtml('结论[@rep')).toBe('<p>结论</p>')
    expect(liveHtml('结论[^no')).toBe('<p>结论</p>')
  })

  it('行尾孤零零的美元符号先不显示', () => {
    expect(liveHtml('价格 $')).toBe('<p>价格</p>')
  })

  it('只改最后一行，列表与标题照常', () => {
    expect(liveHtml('- 一项\n- **二')).toBe('<ul>\n<li>一项</li>\n<li><strong>二</strong></li>\n</ul>')
    expect(liveHtml('## 标题 _斜')).toBe('<h2>标题 <em>斜</em></h2>')
  })

  it('代码块与公式块不做容错', () => {
    expect(createStreamRenderer().render('```\n**x').at(-1)!.html).toContain('**x')
  })

  it('流结束后按原文严格解析：没闭合的符号原样显示', () => {
    expect(done('这是**重点')[0]!.html).toBe('<p>这是**重点</p>')
  })

  it('下划线在词中间不算强调，不补收尾', () => {
    expect(liveHtml('变量 snake_case')).toBe('<p>变量 snake_case</p>')
  })
})
