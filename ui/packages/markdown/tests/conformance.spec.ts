import type { RenderedBlock } from '../src'
import { describe, expect, it } from 'vitest'
import * as api from '../src'
import { createStreamRenderer, LIVE_BLOCK_KEY } from '../src'

// ---------------------------------------------------------------------------
// HTML 探针：把输出当标签流扫一遍，断言落在真实标签、属性与文本上
// ---------------------------------------------------------------------------

interface HtmlTag {
  readonly name: string
  readonly closing: boolean
  readonly attrs: Readonly<Record<string, string>>
}

/** 匹配一个真标签：`<` 紧跟字母才是标签开始，引号内的 `>` 不算闭合。 */
function tagRe(): RegExp {
  return /<(\/?)([a-z][\w:.-]*)((?=[\s/>])(?:"[^"]*"|'[^']*'|[^>"'])*)>/gi
}

/** 匹配标签内的一个属性，值可带双引号、单引号或裸写。 */
function attrRe(): RegExp {
  return /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))?)?/g
}

const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: '\'',
  nbsp: '\u00A0',
  colon: ':',
  tab: '\t',
  newline: '\n',
  sol: '/',
  lpar: '(',
  rpar: ')',
}

/** 解码 HTML 实体，只解一层。 */
function decodeEntitiesOnce(input: string): string {
  return input.replace(/&(#x[0-9A-F]+|#\d+|[A-Z][A-Z0-9]*);?/gi, (raw, body: string) => {
    if (body.startsWith('#')) {
      const hex = body[1] === 'x' || body[1] === 'X'
      const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10)
      if (!Number.isFinite(code) || code < 0 || code > 0x10FFFF)
        return raw
      try {
        return String.fromCodePoint(code)
      }
      catch {
        return raw
      }
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? raw
  })
}

/** 把 html 拆成标签列表。 */
function parseTags(html: string): readonly HtmlTag[] {
  const out: HtmlTag[] = []
  for (const m of html.matchAll(tagRe())) {
    const attrs: Record<string, string> = {}
    for (const a of (m[3] ?? '').matchAll(attrRe())) {
      const name = a[1]
      if (!name)
        continue
      attrs[name.toLowerCase()] = decodeEntitiesOnce(a[2] ?? a[3] ?? a[4] ?? '')
    }
    out.push({ name: (m[2] ?? '').toLowerCase(), closing: m[1] === '/', attrs })
  }
  return out
}

/** 取指定名字的开标签。 */
function openTags(html: string, name: string): readonly HtmlTag[] {
  return parseTags(html).filter(t => t.name === name && !t.closing)
}

function countTag(html: string, name: string): number {
  return openTags(html, name).length
}

function hasTag(html: string, name: string): boolean {
  return countTag(html, name) > 0
}

/** 任意一个名字命中即为真。 */
function hasAnyTag(html: string, names: readonly string[]): boolean {
  return names.some(n => hasTag(html, n))
}

/** 每个 tbody 数据行里的 td 个数。 */
function cellsPerRow(html: string): number[] {
  const rows: number[] = []
  for (const tag of parseTags(html)) {
    if (tag.name === 'tr' && !tag.closing)
      rows.push(0)
    if (tag.name === 'td' && !tag.closing && rows.length > 0)
      rows[rows.length - 1]!++
  }
  return rows.filter(n => n > 0)
}

/** 去掉所有标签后的可见文本。 */
function textOf(html: string): string {
  return decodeEntitiesOnce(html.replace(tagRe(), ''))
}

/** 剥掉完整标签后仍残留 `<` 开头的标签起手式，说明吐出了半个标签。 */
function hasTruncatedTag(html: string): boolean {
  return /<[a-z/!?]/i.test(html.replace(tagRe(), ''))
}

// ---------------------------------------------------------------------------
// 渲染入口
// ---------------------------------------------------------------------------

function renderAll(src: string, ended = true): readonly RenderedBlock[] {
  const r = createStreamRenderer()
  const out = r.render(src, ended ? { ended: true } : undefined)
  r.dispose()
  return out
}

/** 整段输入渲染后的全部 html 拼接。 */
function htmlOf(src: string, ended = true): string {
  return renderAll(src, ended).map(b => b.html).join('\n')
}

const VALID_KINDS = ['markdown', 'code', 'math'] as const

/** 校验单块是否满足对外契约。 */
function assertBlockShape(block: RenderedBlock, label: string): void {
  expect(typeof block.key, label).toBe('string')
  expect(block.key.length, label).toBeGreaterThan(0)
  expect(VALID_KINDS, label).toContain(block.kind)
  expect(typeof block.html, label).toBe('string')
  expect(typeof block.complete, label).toBe('boolean')
  expect(hasTruncatedTag(block.html), label).toBe(false)
  if (block.lang !== undefined)
    expect(block.lang, label).toMatch(/^[\w+#.-]{1,24}$/)
}

/** 逐字符喂入，每一帧都校验块契约，返回最后一帧。 */
function streamEveryPrefix(src: string): readonly RenderedBlock[] {
  const r = createStreamRenderer()
  let last: readonly RenderedBlock[] = []
  for (let i = 1; i <= src.length; i++) {
    const frame = r.render(src.slice(0, i))
    const label = `${JSON.stringify(src)} @${i}`
    expect(Array.isArray(frame), label).toBe(true)
    for (const b of frame) assertBlockShape(b, label)
    last = frame
  }
  r.dispose()
  return last
}

// ---------------------------------------------------------------------------
// 块级语法
// ---------------------------------------------------------------------------

describe('段落与空行分块', () => {
  it('单段落成 p', () => {
    const html = htmlOf('一段普通的话。')
    expect(hasTag(html, 'p')).toBe(true)
    expect(textOf(html).trim()).toBe('一段普通的话。')
  })

  it('空行把相邻段落分成不同块', () => {
    const blocks = renderAll('甲。\n\n乙。\n\n丙。')
    expect(blocks).toHaveLength(3)
    expect(textOf(blocks[0]!.html)).toContain('甲')
    expect(textOf(blocks[2]!.html)).toContain('丙')
  })

  it('段内单换行不分段也不产生 br', () => {
    const html = htmlOf('上一行\n下一行')
    expect(countTag(html, 'p')).toBe(1)
    expect(hasTag(html, 'br')).toBe(false)
  })

  it('连续多个空行不产生空块', () => {
    const blocks = renderAll('甲。\n\n\n\n\n乙。')
    expect(blocks).toHaveLength(2)
    expect(blocks.every(b => textOf(b.html).trim().length > 0)).toBe(true)
  })

  it('纯空白输入不产生可见文本', () => {
    for (const src of ['', '   ', '\n', '\n\n\n', '\t \n \t']) {
      const blocks = renderAll(src)
      expect(blocks.every(b => textOf(b.html).trim() === ''), JSON.stringify(src)).toBe(true)
    }
  })

  it('回车换行与单换行等价', () => {
    const html = htmlOf('# 标题\r\n\r\n段落\r\n')
    expect(hasTag(html, 'h1')).toBe(true)
    expect(textOf(html)).toContain('段落')
    expect(textOf(html)).not.toContain('\r')
  })
})

describe('井号标题', () => {
  it('一到六级各成对应标签', () => {
    for (let level = 1; level <= 6; level++) {
      const html = htmlOf(`${'#'.repeat(level)} 标题${level}`)
      expect(hasTag(html, `h${level}`), `level=${level}`).toBe(true)
      expect(textOf(html).trim(), `level=${level}`).toBe(`标题${level}`)
    }
  })

  it('七个井号不是标题', () => {
    const html = htmlOf('####### 不是标题')
    expect(hasAnyTag(html, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'])).toBe(false)
    expect(textOf(html)).toContain('#######')
  })

  it('井号后没有空格不是标题', () => {
    const html = htmlOf('#话题标签')
    expect(hasAnyTag(html, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])).toBe(false)
    expect(textOf(html)).toContain('#话题标签')
  })

  it('空标题成立且内容为空', () => {
    const html = htmlOf('#')
    const html2 = htmlOf('## ')
    expect(hasTag(html, 'h1') || textOf(html).includes('#')).toBe(true)
    expect(hasTag(html2, 'h2')).toBe(true)
    expect(textOf(html2).trim()).toBe('')
  })

  it('结尾的闭合井号不进正文', () => {
    const html = htmlOf('## 标题 ##')
    expect(hasTag(html, 'h2')).toBe(true)
    expect(textOf(html).trim()).toBe('标题')
  })

  it('标题里的行内语法照常解析', () => {
    const html = htmlOf('## 带 **粗** 与 `码`')
    expect(hasTag(html, 'h2')).toBe(true)
    expect(hasAnyTag(html, ['strong', 'b'])).toBe(true)
    expect(hasTag(html, 'code')).toBe(true)
  })

  it('紧邻的标题各自成块', () => {
    const blocks = renderAll('# 甲\n## 乙\n### 丙')
    const html = blocks.map(b => b.html).join('\n')
    expect(countTag(html, 'h1')).toBe(1)
    expect(countTag(html, 'h2')).toBe(1)
    expect(countTag(html, 'h3')).toBe(1)
  })
})

describe('围栏代码块', () => {
  it('反引号围栏成 pre + code', () => {
    const html = htmlOf('```ts\nconst a = 1\n```')
    expect(hasTag(html, 'pre')).toBe(true)
    expect(hasTag(html, 'code')).toBe(true)
    expect(textOf(html)).toContain('const a = 1')
  })

  it('波浪号围栏同样成立', () => {
    const block = renderAll('~~~py\nx = 1\n~~~').at(-1)!
    expect(block.kind).toBe('code')
    expect(block.complete).toBe(true)
    expect(textOf(block.html)).toContain('x = 1')
  })

  it('更长的围栏可以包住更短的围栏', () => {
    const block = renderAll('````md\n```ts\nx\n```\n````').at(-1)!
    expect(block.kind).toBe('code')
    expect(block.complete).toBe(true)
    expect(textOf(block.html)).toContain('```ts')
  })

  it('短围栏关不掉长围栏', () => {
    const block = renderAll('````\n```\n未结束', false).at(-1)!
    expect(block.kind).toBe('code')
    expect(block.complete).toBe(false)
  })

  it('无语言、空内容的围栏成立', () => {
    const block = renderAll('```\n```').at(-1)!
    expect(block.kind).toBe('code')
    expect(block.complete).toBe(true)
    expect(block.lang).toBeUndefined()
    expect(textOf(block.html).trim()).toBe('')
  })

  it('信息串只取第一段作语言，余下的不外泄', () => {
    const block = renderAll('```ts twoslash meta=1\nx\n```').at(-1)!
    expect(block.lang === 'ts' || block.lang === undefined).toBe(true)
    for (const tag of parseTags(block.html)) {
      for (const value of Object.values(tag.attrs))
        expect(value, JSON.stringify(tag)).not.toContain('twoslash')
    }
  })

  it('代码内容原样保留，不被当 markdown 解析', () => {
    const html = htmlOf('```\n# 井号\n- 减号\n*星号* [链接](https://e.example)\n| a | b |\n```')
    expect(hasAnyTag(html, ['h1', 'ul', 'li', 'em', 'a', 'table'])).toBe(false)
    const text = textOf(html)
    expect(text).toContain('# 井号')
    expect(text).toContain('*星号*')
    expect(text).toContain('| a | b |')
  })

  it('代码内的尖括号只当文本', () => {
    const html = htmlOf('```html\n<div class="x">文本</div>\n```')
    expect(hasTag(html, 'div')).toBe(false)
    expect(textOf(html)).toContain('<div class="x">文本</div>')
  })

  it('未闭合的围栏未定型，闭合后定型', () => {
    const r = createStreamRenderer()
    expect(r.render('```ts\nx').at(-1)!.complete).toBe(false)
    expect(r.render('```ts\nx\n```').at(-1)!.complete).toBe(true)
    r.dispose()
  })

  it('围栏前后的块不被吞掉', () => {
    const blocks = renderAll('前言。\n\n```ts\nx\n```\n\n后记。')
    expect(blocks).toHaveLength(3)
    expect(blocks[1]!.kind).toBe('code')
    expect(textOf(blocks[0]!.html)).toContain('前言')
    expect(textOf(blocks[2]!.html)).toContain('后记')
  })

  it('两个围栏紧邻各成一块', () => {
    const blocks = renderAll('```ts\na\n```\n```py\nb\n```')
    const codes = blocks.filter(b => b.kind === 'code')
    expect(codes.length).toBe(2)
  })

  it('行首多个反引号的行内代码不当围栏', () => {
    const blocks = renderAll('````a```` 是写法')
    expect(blocks.every(b => b.kind === 'markdown')).toBe(true)
    const html = blocks.map(b => b.html).join('\n')
    expect(hasTag(html, 'pre')).toBe(false)
    expect(hasTag(html, 'code')).toBe(true)
    expect(textOf(html)).toContain('是写法')
  })

  it('信息串带反引号的一行不当围栏', () => {
    for (const src of ['```a`b', '``` `']) {
      const blocks = renderAll(src)
      expect(blocks.every(b => b.kind === 'markdown'), src).toBe(true)
    }
    expect(renderAll('~~~a`b').at(-1)!.kind).toBe('code')
  })
})

describe('引用块', () => {
  it('单层引用成 blockquote', () => {
    const html = htmlOf('> 引用一句')
    expect(hasTag(html, 'blockquote')).toBe(true)
    expect(textOf(html)).toContain('引用一句')
  })

  it('多行引用合成一段', () => {
    const html = htmlOf('> 第一行\n> 第二行')
    expect(countTag(html, 'blockquote')).toBe(1)
    expect(textOf(html)).toContain('第一行')
    expect(textOf(html)).toContain('第二行')
  })

  it('嵌套引用产生两层', () => {
    const html = htmlOf('> 外层\n> > 内层')
    expect(countTag(html, 'blockquote')).toBe(2)
    expect(textOf(html)).toContain('内层')
  })

  it('空引用不崩', () => {
    const html = htmlOf('>')
    expect(hasTruncatedTag(html)).toBe(false)
  })

  it('引用里的行内与块级语法照常解析', () => {
    const html = htmlOf('> # 引用标题\n> \n> - 项甲\n> - 项乙')
    expect(hasTag(html, 'blockquote')).toBe(true)
    expect(hasTag(html, 'h1')).toBe(true)
    expect(countTag(html, 'li')).toBe(2)
  })

  it('引用里的围栏代码不被外部解析', () => {
    const html = htmlOf('> ```\n> *不是斜体*\n> ```')
    expect(hasTag(html, 'em')).toBe(false)
    expect(textOf(html)).toContain('*不是斜体*')
  })

  it('紧跟其后的围栏不进引用，kind 与 lang 都在', () => {
    const blocks = renderAll('> 甲\n```bash\nnpm i\n```')
    expect(blocks).toHaveLength(2)
    expect(countTag(blocks[0]!.html, 'blockquote')).toBe(1)
    expect(blocks[1]!.kind).toBe('code')
    expect(blocks[1]!.lang).toBe('bash')
    expect(hasTag(blocks[1]!.html, 'blockquote')).toBe(false)
  })

  it('紧跟其后的标题与分隔线不进引用', () => {
    for (const [src, tag] of [['> 甲\n# 标题', 'h1'], ['> 甲\n---', 'hr']] as const) {
      const blocks = renderAll(src)
      expect(blocks, src).toHaveLength(2)
      expect(hasTag(blocks[1]!.html, tag), src).toBe(true)
      expect(hasTag(blocks[0]!.html, tag), src).toBe(false)
    }
  })
})

describe('列表', () => {
  it('三种无序标记都成列表', () => {
    for (const marker of ['-', '*', '+']) {
      const html = htmlOf(`${marker} 甲\n${marker} 乙`)
      expect(hasTag(html, 'ul'), marker).toBe(true)
      expect(countTag(html, 'li'), marker).toBe(2)
    }
  })

  it('有序列表成 ol，点号与右括号都认', () => {
    for (const src of ['1. 一\n2. 二', '1) 一\n2) 二']) {
      const html = htmlOf(src)
      expect(hasTag(html, 'ol'), src).toBe(true)
      expect(countTag(html, 'li'), src).toBe(2)
    }
  })

  it('起始序号不丢', () => {
    const html = htmlOf('3. 三\n4. 四')
    const ol = openTags(html, 'ol')[0]
    expect(ol).toBeDefined()
    expect(ol!.attrs.start ?? '3').toBe('3')
  })

  it('嵌套列表产生内外两层', () => {
    const html = htmlOf('- 甲\n  - 甲一\n  - 甲二\n- 乙')
    expect(countTag(html, 'ul')).toBe(2)
    expect(countTag(html, 'li')).toBe(4)
  })

  it('空列表项成立', () => {
    const html = htmlOf('- \n- 乙')
    expect(countTag(html, 'li')).toBe(2)
  })

  it('换标记符另起一张列表', () => {
    const html = htmlOf('- 甲\n* 乙\n+ 丙')
    expect(countTag(html, 'li')).toBe(3)
    expect(countTag(html, 'ul')).toBeGreaterThanOrEqual(2)
  })

  it('列表项内的行内语法照常解析', () => {
    const html = htmlOf('- **粗** 与 `码`\n- [链接](https://e.example)')
    expect(hasAnyTag(html, ['strong', 'b'])).toBe(true)
    expect(hasTag(html, 'code')).toBe(true)
    expect(hasTag(html, 'a')).toBe(true)
  })

  it('项之间隔空行仍是同一张列表', () => {
    const blocks = renderAll('- 甲\n\n- 乙')
    const html = blocks.map(b => b.html).join('\n')
    expect(countTag(html, 'li')).toBe(2)
    expect(countTag(html, 'ul')).toBe(1)
  })

  it('列表后接段落，段落不进列表', () => {
    const blocks = renderAll('- 甲\n- 乙\n\n收尾段落。')
    expect(textOf(blocks.at(-1)!.html)).toContain('收尾段落')
    expect(countTag(blocks.at(-1)!.html, 'li')).toBe(0)
  })

  it('紧跟其后的围栏不进列表项，kind 与 lang 都在', () => {
    const blocks = renderAll('- 安装依赖\n```bash\nnpm i\n```')
    expect(blocks).toHaveLength(2)
    expect(countTag(blocks[0]!.html, 'li')).toBe(1)
    expect(hasTag(blocks[0]!.html, 'pre')).toBe(false)
    expect(blocks[1]!.kind).toBe('code')
    expect(blocks[1]!.lang).toBe('bash')
    expect(hasTag(blocks[1]!.html, 'li')).toBe(false)
  })

  it('紧跟其后的标题、分隔线与引用不进列表项', () => {
    for (const [src, tag] of [
      ['- 甲\n## 小节\n正文', 'h2'],
      ['- 甲\n---\n- 乙', 'hr'],
      ['- 甲\n> 引用', 'blockquote'],
    ] as const) {
      const blocks = renderAll(src)
      const first = blocks[0]!.html
      expect(countTag(first, 'li'), src).toBe(1)
      expect(hasTag(first, tag), src).toBe(false)
      expect(hasTag(blocks.map(b => b.html).join('\n'), tag), src).toBe(true)
    }
  })

  it('缩进到列表项内的围栏与标题仍属于该项', () => {
    const blocks = renderAll('- 甲\n  ```js\n  x\n  ```\n- 乙')
    expect(blocks).toHaveLength(1)
    expect(countTag(blocks[0]!.html, 'li')).toBe(2)
    expect(hasTag(blocks[0]!.html, 'pre')).toBe(true)
  })
})

describe('分隔线', () => {
  it('三种写法都成 hr', () => {
    for (const src of ['---', '***', '___', '- - -', '* * *', '-----']) {
      expect(hasTag(htmlOf(src), 'hr'), src).toBe(true)
    }
  })

  it('不足三个标记不是分隔线', () => {
    for (const src of ['--', '**', '__']) {
      expect(hasTag(htmlOf(src), 'hr'), src).toBe(false)
    }
  })

  it('分隔线切开前后段落', () => {
    const html = htmlOf('上文。\n\n---\n\n下文。')
    expect(hasTag(html, 'hr')).toBe(true)
    expect(textOf(html)).toContain('上文')
    expect(textOf(html)).toContain('下文')
  })
})

describe('表格', () => {
  const TABLE = '| 姓名 | 年龄 |\n| --- | --- |\n| 甲 | 1 |\n| 乙 | 2 |'

  it('表头与数据行成 table/th/td', () => {
    const html = htmlOf(TABLE)
    expect(hasTag(html, 'table')).toBe(true)
    expect(countTag(html, 'th')).toBe(2)
    expect(countTag(html, 'td')).toBe(4)
    expect(countTag(html, 'tr')).toBe(3)
  })

  it('分隔行不进正文', () => {
    const text = textOf(htmlOf(TABLE))
    expect(text).not.toContain('---')
    expect(text).toContain('姓名')
    expect(text).toContain('乙')
  })

  it('对齐标记不进正文', () => {
    const html = htmlOf('| 左 | 中 | 右 |\n| :-- | :-: | --: |\n| a | b | c |')
    expect(hasTag(html, 'table')).toBe(true)
    expect(countTag(html, 'th')).toBe(3)
    expect(textOf(html)).not.toContain(':-')
  })

  it('缺分隔行就不是表格', () => {
    const html = htmlOf('| 甲 | 乙 |\n| 丙 | 丁 |')
    expect(hasTag(html, 'table')).toBe(false)
    expect(textOf(html)).toContain('| 甲 | 乙 |')
  })

  it('转义竖线留在单元格里', () => {
    const html = htmlOf('| 甲 | 乙 |\n| --- | --- |\n| a \\| b | c |')
    expect(hasTag(html, 'table')).toBe(true)
    expect(textOf(html)).toContain('a | b')
  })

  it('单元格数不齐不崩', () => {
    const html = htmlOf('| 甲 | 乙 | 丙 |\n| --- | --- | --- |\n| 1 |\n| 1 | 2 | 3 | 4 |')
    expect(hasTag(html, 'table')).toBe(true)
    expect(hasTruncatedTag(html)).toBe(false)
  })

  it('单元格内行内语法照常解析', () => {
    const html = htmlOf('| 甲 | 乙 |\n| --- | --- |\n| **粗** | [链](https://e.example) |')
    expect(hasAnyTag(html, ['strong', 'b'])).toBe(true)
    expect(hasTag(html, 'a')).toBe(true)
  })

  it('空单元格成立', () => {
    const html = htmlOf('| 甲 | 乙 |\n| --- | --- |\n|  |  |')
    expect(countTag(html, 'td')).toBe(2)
  })

  it('数据行少写的单元格补成空 td', () => {
    const html = htmlOf('| 名称 | 类型 | 说明 |\n| --- | --- | --- |\n| id | number | 主键 |\n| name |\n| tag | string |')
    expect(cellsPerRow(html)).toEqual([3, 3, 3])
    expect(textOf(html)).toContain('name')
  })

  it('数据行多写的单元格丢掉', () => {
    const html = htmlOf('| 甲 | 乙 |\n| --- | --- |\n| 1 | 2 | 3 | 4 |')
    expect(cellsPerRow(html)).toEqual([2])
    expect(textOf(html)).not.toContain('3')
  })

  it('补出来的空单元格带上该列的对齐', () => {
    const html = htmlOf('| a | b | c |\n| :- | :-: | --: |\n| 1 |')
    const tds = openTags(html, 'td')
    expect(tds).toHaveLength(3)
    expect(tds[1]!.attrs.style).toBe('text-align:center')
    expect(tds[2]!.attrs.style).toBe('text-align:right')
  })

  it('单元格总数超上限就不补空单元格，并在 table 上留标记', () => {
    const k = 400
    const src = `${'| h '.repeat(k)}|\n${'| --- '.repeat(k)}|\n${'|\n'.repeat(k)}`
    const html = htmlOf(src)
    expect(openTags(html, 'table')[0]!.attrs['data-cells-omitted']).toBe('true')
    expect(countTag(html, 'td')).toBeLessThan(k * 2)
    expect(hasTruncatedTag(html)).toBe(false)
  })

  it('寻常规模的表格照常补齐，不留标记', () => {
    const src = `${'| h '.repeat(20)}|\n${'| --- '.repeat(20)}|\n${'| x |\n'.repeat(100)}`
    const html = htmlOf(src)
    expect(openTags(html, 'table')[0]!.attrs['data-cells-omitted']).toBeUndefined()
    expect(countTag(html, 'td')).toBe(20 * 100)
  })
})

// ---------------------------------------------------------------------------
// 行内语法
// ---------------------------------------------------------------------------

describe('行内代码', () => {
  it('单反引号包住的内容成 code', () => {
    const html = htmlOf('前 `x = 1` 后')
    expect(hasTag(html, 'code')).toBe(true)
    expect(textOf(html)).toContain('x = 1')
  })

  it('双反引号可以包住反引号', () => {
    const html = htmlOf('``含 ` 反引号``')
    expect(hasTag(html, 'code')).toBe(true)
    expect(textOf(html)).toContain('含 ` 反引号')
  })

  it('行内代码里的标记不被解析', () => {
    const html = htmlOf('`**不粗** [不是链接](https://e.example)`')
    expect(hasAnyTag(html, ['strong', 'b', 'a'])).toBe(false)
    expect(textOf(html)).toContain('**不粗**')
  })

  it('行内代码里的尖括号只当文本', () => {
    const html = htmlOf('`<b>粗</b>`')
    expect(hasTag(html, 'b')).toBe(false)
    expect(textOf(html)).toContain('<b>粗</b>')
  })

  it('未闭合的反引号不成 code', () => {
    const html = htmlOf('未闭合 `x = 1')
    expect(hasTag(html, 'code')).toBe(false)
    expect(textOf(html)).toContain('`x = 1')
  })

  it('紧邻的两段行内代码各自成立', () => {
    const html = htmlOf('`甲``乙`')
    expect(countTag(html, 'code')).toBeGreaterThanOrEqual(1)
    expect(hasTruncatedTag(html)).toBe(false)
  })

  it('配不上的反引号段整段当字面量，不吃掉后面的独立代码', () => {
    const html = htmlOf('文中提到 ``` 收尾写 `x` 结束')
    expect(countTag(html, 'code')).toBe(1)
    expect(textOf(html).trim()).toBe('文中提到 ``` 收尾写 x 结束')
  })

  it('前后反引号数量不等则全是字面量', () => {
    const three = htmlOf('文本 ```foo``')
    expect(hasTag(three, 'code')).toBe(false)
    expect(textOf(three).trim()).toBe('文本 ```foo``')

    const two = htmlOf('``foo`')
    expect(hasTag(two, 'code')).toBe(false)
    expect(textOf(two).trim()).toBe('``foo`')
  })

  it('落单的双反引号不吞掉后面的单反引号代码', () => {
    const html = htmlOf('see `` here and `code` there')
    expect(countTag(html, 'code')).toBe(1)
    expect(textOf(html).trim()).toBe('see `` here and code there')
  })

  it('多段长短不一的反引号只认真正配对的那段', () => {
    const html = htmlOf('A ```` B ``` C `d`')
    expect(countTag(html, 'code')).toBe(1)
    expect(textOf(html).trim()).toBe('A ```` B ``` C d')
  })
})

describe('强调与删除线', () => {
  it('星号与下划线的加粗斜体', () => {
    expect(hasAnyTag(htmlOf('**粗**'), ['strong', 'b'])).toBe(true)
    expect(hasAnyTag(htmlOf('__粗__'), ['strong', 'b'])).toBe(true)
    expect(hasAnyTag(htmlOf('*斜*'), ['em', 'i'])).toBe(true)
    expect(hasAnyTag(htmlOf('_斜_'), ['em', 'i'])).toBe(true)
  })

  it('三星号同时加粗与斜体', () => {
    const html = htmlOf('***又粗又斜***')
    expect(hasAnyTag(html, ['strong', 'b'])).toBe(true)
    expect(hasAnyTag(html, ['em', 'i'])).toBe(true)
  })

  it('嵌套强调各自成对', () => {
    const html = htmlOf('**粗里有 *斜* 的**')
    expect(hasAnyTag(html, ['strong', 'b'])).toBe(true)
    expect(hasAnyTag(html, ['em', 'i'])).toBe(true)
    expect(textOf(html)).toContain('斜')
  })

  it('删除线成 s 或 del', () => {
    const html = htmlOf('~~删掉~~')
    expect(hasAnyTag(html, ['s', 'del', 'strike'])).toBe(true)
    expect(textOf(html)).toContain('删掉')
  })

  it('未闭合的标记只当文本', () => {
    for (const [src, tags] of [
      ['**未闭合', ['strong', 'b']],
      ['*未闭合', ['em', 'i']],
      ['~~未闭合', ['s', 'del']],
    ] as const) {
      const html = htmlOf(src)
      expect(hasAnyTag(html, tags), src).toBe(false)
      expect(textOf(html), src).toContain('未闭合')
    }
  })

  it('空强调不产出空标签', () => {
    const html = htmlOf('****')
    expect(hasAnyTag(html, ['strong', 'b', 'em', 'i'])).toBe(false)
    expect(textOf(html)).toContain('****')
  })

  it('词中的下划线不成斜体', () => {
    const html = htmlOf('snake_case_name')
    expect(hasAnyTag(html, ['em', 'i'])).toBe(false)
    expect(textOf(html)).toContain('snake_case_name')
  })

  it('词中的星号成斜体', () => {
    expect(hasAnyTag(htmlOf('a*b*c'), ['em', 'i'])).toBe(true)
  })
})

describe('链接与图片', () => {
  it('行内链接带 href 与文本', () => {
    const html = htmlOf('[点这里](https://example.com/a)')
    const a = openTags(html, 'a')[0]
    expect(a).toBeDefined()
    expect(a!.attrs.href).toBe('https://example.com/a')
    expect(textOf(html)).toContain('点这里')
  })

  it('链接标题落到 title 属性', () => {
    const a = openTags(htmlOf('[x](https://example.com "标题")'), 'a')[0]
    expect(a).toBeDefined()
    expect(a!.attrs.title).toBe('标题')
  })

  it('相对路径与锚点照常成链接', () => {
    for (const url of ['/abs/path', './rel/path', 'rel/path', '#anchor', '?q=1']) {
      const a = openTags(htmlOf(`[x](${url})`), 'a')[0]
      expect(a, url).toBeDefined()
      expect(a!.attrs.href, url).toBe(url)
    }
  })

  it('尖括号包裹的目标可含空格', () => {
    const a = openTags(htmlOf('[x](<https://example.com/a b>)'), 'a')[0]
    expect(a).toBeDefined()
    expect(a!.attrs.href).toContain('example.com')
  })

  it('空文本与空目标不崩', () => {
    for (const src of ['[](https://example.com)', '[x]()', '[]()']) {
      const html = htmlOf(src)
      expect(hasTruncatedTag(html), src).toBe(false)
    }
  })

  it('未闭合的链接只当文本', () => {
    const html = htmlOf('[未闭合](https://example.com')
    expect(hasTag(html, 'a')).toBe(false)
    expect(textOf(html)).toContain('[未闭合]')
  })

  it('链接文本里可含方括号', () => {
    const html = htmlOf('[甲 [乙] 丙](https://example.com)')
    expect(hasTag(html, 'a')).toBe(true)
    expect(textOf(html)).toContain('乙')
  })

  it('引用式链接接上定义', () => {
    const html = htmlOf('看[这里][ref]。\n\n[ref]: https://example.com/r "标题"')
    const a = openTags(html, 'a')[0]
    expect(a).toBeDefined()
    expect(a!.attrs.href).toBe('https://example.com/r')
  })

  it('图片带 src 与 alt', () => {
    const img = openTags(htmlOf('![替代文字](https://example.com/a.png)'), 'img')[0]
    expect(img).toBeDefined()
    expect(img!.attrs.src).toBe('https://example.com/a.png')
    expect(img!.attrs.alt).toBe('替代文字')
  })

  it('空 alt 的图片成立', () => {
    const img = openTags(htmlOf('![](https://example.com/a.png)'), 'img')[0]
    expect(img).toBeDefined()
    expect(img!.attrs.alt ?? '').toBe('')
  })

  it('图片可以套在链接里', () => {
    const html = htmlOf('[![图](https://example.com/a.png)](https://example.com/b)')
    expect(hasTag(html, 'img')).toBe(true)
    expect(hasTag(html, 'a')).toBe(true)
  })

  it('自动链接成 http 与 mailto 链接', () => {
    const a1 = openTags(htmlOf('<https://example.com/a?b=1>'), 'a')[0]
    expect(a1).toBeDefined()
    expect(a1!.attrs.href).toBe('https://example.com/a?b=1')

    const a2 = openTags(htmlOf('<mailto:a@example.com>'), 'a')[0]
    expect(a2).toBeDefined()
    expect(a2!.attrs.href).toBe('mailto:a@example.com')
  })

  it('尖括号里不是 URL 就不成链接', () => {
    const html = htmlOf('<不是 URL>')
    expect(hasTag(html, 'a')).toBe(false)
    expect(textOf(html)).toContain('<不是 URL>')
  })
})

describe('转义与硬换行', () => {
  it('反斜杠转义掉标记字符', () => {
    for (const [src, notTags, text] of [
      ['\\*不是斜体\\*', ['em', 'i'], '*不是斜体*'],
      ['\\*\\*不是粗体\\*\\*', ['strong', 'b'], '**不是粗体**'],
      ['\\`不是代码\\`', ['code'], '`不是代码`'],
      ['\\[不是链接\\](https://example.com)', ['a'], '[不是链接]'],
      ['\\# 不是标题', ['h1'], '# 不是标题'],
      ['\\- 不是列表', ['ul', 'li'], '- 不是列表'],
    ] as const) {
      const html = htmlOf(src)
      expect(hasAnyTag(html, notTags), src).toBe(false)
      expect(textOf(html), src).toContain(text)
    }
  })

  it('转义反斜杠自身', () => {
    expect(textOf(htmlOf('甲\\\\乙'))).toContain('甲\\乙')
  })

  it('转义尖括号只当文本', () => {
    const html = htmlOf('\\<b\\>不是标签\\</b\\>')
    expect(hasTag(html, 'b')).toBe(false)
    expect(textOf(html)).toContain('<b>不是标签</b>')
  })

  it('行尾两空格成硬换行', () => {
    const html = htmlOf('上一行  \n下一行')
    expect(hasTag(html, 'br')).toBe(true)
    expect(countTag(html, 'p')).toBe(1)
  })

  it('行尾一个空格不成硬换行', () => {
    expect(hasTag(htmlOf('上一行 \n下一行'), 'br')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 块契约
// ---------------------------------------------------------------------------

describe('块契约', () => {
  const MIXED = '# 标题\n\n段落。\n\n```ts\nconst a = 1\n```\n\n> 引用\n\n- 甲\n- 乙\n\n| a | b |\n| --- | --- |\n| 1 | 2 |'

  it('每块都满足字段约定', () => {
    for (const b of renderAll(MIXED)) assertBlockShape(b, b.key)
  })

  it('渲染器不产出 html 种类', () => {
    const sources = [MIXED, '<div onclick="x">a</div>', '<p>段</p>\n\n正文', '<!-- 注释 -->']
    for (const src of sources) {
      for (const b of renderAll(src)) expect(b.kind, src).not.toBe('html')
    }
  })

  it('未结束时最后一块用生长键且未定型', () => {
    const r = createStreamRenderer()
    const blocks = r.render('甲。\n\n乙还在写')
    expect(blocks.at(-1)!.key).toBe(LIVE_BLOCK_KEY)
    expect(blocks.at(-1)!.complete).toBe(false)
    expect(blocks.slice(0, -1).every(b => b.complete)).toBe(true)
    r.dispose()
  })

  it('定型块的键是下标加内容摘要', () => {
    const blocks = renderAll('甲。\n\n乙。\n\n丙。')
    blocks.forEach((b, i) => {
      expect(b.key, `#${i}`).toMatch(/^\d+:.+/)
      expect(b.key.slice(0, b.key.indexOf(':')), `#${i}`).toBe(String(i))
    })
  })

  it('结束后没有生长键且全部定型', () => {
    const blocks = renderAll('甲。\n\n乙。', true)
    expect(blocks.every(b => b.key !== LIVE_BLOCK_KEY)).toBe(true)
    expect(blocks.every(b => b.complete)).toBe(true)
  })

  it('结束标记重复传入结果不变', () => {
    const r = createStreamRenderer()
    const once = r.render('甲。\n\n乙。', { ended: true })
    const twice = r.render('甲。\n\n乙。', { ended: true })
    expect(twice.map(b => b.key)).toEqual(once.map(b => b.key))
    expect(twice.map(b => b.html)).toEqual(once.map(b => b.html))
    r.dispose()
  })

  it('lang 只在围栏块上出现且过白名单', () => {
    for (const b of renderAll(MIXED)) {
      if (b.kind !== 'code')
        expect(b.lang, b.key).toBeUndefined()
    }
    expect(renderAll('```ts\nx\n```').at(-1)!.lang).toBe('ts')
    expect(renderAll('```不存在的语言名\nx\n```').at(-1)!.lang === undefined
      || /^[\w+#.-]{1,24}$/.test(renderAll('```不存在的语言名\nx\n```').at(-1)!.lang!)).toBe(true)
  })

  it('两台渲染器喂同一份文本结果相同', () => {
    const a = createStreamRenderer().render(MIXED, { ended: true })
    const b = createStreamRenderer().render(MIXED, { ended: true })
    expect(b.map(x => x.html)).toEqual(a.map(x => x.html))
    expect(b.map(x => x.key)).toEqual(a.map(x => x.key))
  })
})

// ---------------------------------------------------------------------------
// 流式截断
// ---------------------------------------------------------------------------

const SYNTAX_CORPUS: readonly string[] = [
  '普通一段。',
  '# 一级标题',
  '###### 六级标题',
  '####### 七个井号',
  '#没有空格',
  '## 标题 ##',
  '```ts\nconst a = 1\n```',
  '~~~py\nx = 1\n~~~',
  '````md\n```ts\nx\n```\n````',
  '```\n无语言\n```',
  '```html\n<div class="x">y</div>\n```',
  '> 引用\n> 续行',
  '> 外层\n> > 内层',
  '> ```\n> *不是斜体*\n> ```',
  '- 甲\n- 乙\n- 丙',
  '* 星号\n+ 加号',
  '- 甲\n  - 甲一\n- 乙',
  '1. 一\n2. 二',
  '3) 三\n4) 四',
  '1. 一\n\n2. 二\n\n3. 三',
  'intro\n| a | b |\n| --- | --- | --- |',
  '---',
  '***',
  '___',
  '- 甲\n```sh\nx\n```',
  '- 甲\n---\n- 乙',
  '- 甲\n## 小节',
  '> 甲\n```\nx\n```',
  '| 甲 | 乙 |\n| :-- | --: |\n| 1 | 2 |',
  '| 甲 | 乙 | 丙 |\n| --- | --- | --- |\n| 1 |',
  '| 甲 | 乙 |\n| --- | --- |\n| a \\| b | c |',
  '````a```` 是写法',
  '行内 `code` 收尾',
  '``含 ` 反引号``',
  '`<b>不是标签</b>`',
  '**粗** 与 *斜* 与 ~~删~~',
  '__粗__ 与 _斜_',
  '***又粗又斜***',
  '**粗里有 *斜* 的**',
  '[链接](https://example.com "标题")',
  '[空目标]()',
  '![图](https://example.com/a.png "图标题")',
  '[![图](https://example.com/a.png)](https://example.com/b)',
  '<https://example.com/a?b=1>',
  '<mailto:a@example.com>',
  '看[这里][ref]。\n\n[ref]: https://example.com/r "标题"',
  '\\*不是强调\\* 与 \\\\ 与 \\#',
  '上一行  \n下一行',
  '甲。\n\n乙。\n\n丙。',
  '# 标题\n\n段落\n\n```ts\nx\n```\n\n> 引用\n\n- 项\n\n| a | b |\n| --- | --- |\n| 1 | 2 |',
]

describe('流式截断', () => {
  it('逐字符喂入的每一帧都不崩、不吐半个标签', () => {
    for (const src of SYNTAX_CORPUS) streamEveryPrefix(src)
  }, 30_000)

  it('逐字符喂完与一次性喂全文一致', () => {
    for (const src of SYNTAX_CORPUS) {
      const bit = streamEveryPrefix(src)
      const once = createStreamRenderer().render(src)
      expect(bit.map(b => b.html), src).toEqual(once.map(b => b.html))
      expect(bit.map(b => b.kind), src).toEqual(once.map(b => b.kind))
      expect(bit.map(b => b.key), src).toEqual(once.map(b => b.key))
    }
  }, 30_000)

  it('任一截断点续喂剩余部分，结果与整段一致', () => {
    for (const src of SYNTAX_CORPUS) {
      const full = createStreamRenderer().render(src, { ended: true })
      for (let cut = 1; cut < src.length; cut++) {
        const r = createStreamRenderer()
        r.render(src.slice(0, cut))
        const out = r.render(src, { ended: true })
        expect(out.map(b => b.html), `${src} @${cut}`).toEqual(full.map(b => b.html))
        r.dispose()
      }
    }
  }, 30_000)

  it('半个标记不会提前渲成标签', () => {
    const r = createStreamRenderer()
    expect(hasAnyTag(r.render('**未完').at(-1)!.html, ['strong', 'b'])).toBe(false)
    expect(hasTag(r.render('[未完](https://exa').at(-1)!.html, 'a')).toBe(false)
    expect(hasTag(r.render('![未完](https://exa').at(-1)!.html, 'img')).toBe(false)
    expect(hasTag(r.render('| 甲 | 乙 |\n| --').at(-1)!.html, 'table')).toBe(false)
    r.dispose()
  })

  it('未闭合的围栏在流中一直是代码块', () => {
    const src = '```ts\nconst a = "*不是斜体*"\n# 不是标题\n'
    const r = createStreamRenderer()
    for (let i = 4; i <= src.length; i++) {
      const last = r.render(src.slice(0, i)).at(-1)!
      expect(last.kind, `@${i}`).toBe('code')
      expect(hasAnyTag(last.html, ['em', 'h1']), `@${i}`).toBe(false)
    }
    r.dispose()
  })
})

// ---------------------------------------------------------------------------
// 块边界的前瞻余量
// ---------------------------------------------------------------------------

/** 按给定 token 序列逐个喂入，末尾补一次结束帧。 */
function streamTokens(tokens: readonly string[]): readonly RenderedBlock[] {
  const r = createStreamRenderer()
  let text = ''
  for (const token of tokens) {
    text += token
    r.render(text)
  }
  const last = r.render(text, { ended: true })
  r.dispose()
  return last
}

/** 逐 token 喂入的结果与一次性喂全文逐项相同。 */
function expectSameAsWhole(tokens: readonly string[], label: string): void {
  const streamed = streamTokens(tokens)
  const once = renderAll(tokens.join(''))
  expect(streamed.map(b => b.html), label).toEqual(once.map(b => b.html))
  expect(streamed.map(b => b.kind), label).toEqual(once.map(b => b.kind))
  expect(streamed.map(b => b.key), label).toEqual(once.map(b => b.key))
}

describe('块边界的前瞻余量', () => {
  it('序号与点号分在两个 token 时有序列表不被切开', () => {
    const tokens = ['1', '. 一\n', '\n', '2', '. 二\n', '\n', '3', '. 三']
    const html = streamTokens(tokens).map(b => b.html).join('\n')
    expect(countTag(html, 'ol')).toBe(1)
    expect(countTag(html, 'li')).toBe(3)
    expectSameAsWhole(tokens, 'ordered')
  })

  it('列表前已定型的块照常冻结', () => {
    const tokens = ['引子。\n', '\n', '1', '. 一\n', '\n', '2', '. 二']
    const blocks = streamTokens(tokens)
    expect(blocks).toHaveLength(2)
    expect(textOf(blocks[0]!.html)).toContain('引子')
    expect(countTag(blocks[1]!.html, 'ol')).toBe(1)
    expect(countTag(blocks[1]!.html, 'li')).toBe(2)
    expectSameAsWhole(tokens, 'para+ordered')
  })

  it('半截的表格分隔行不把上一段永久切开', () => {
    // 半截的 `| --- | ---` 像两列表格，补齐成三列后整段退回段落
    const tokens = ['引子\n', '| 甲 | 乙 |\n', '| --- | ---', ' | --- |']
    const blocks = streamTokens(tokens)
    expect(blocks).toHaveLength(1)
    expect(hasTag(blocks[0]!.html, 'table')).toBe(false)
    expect(textOf(blocks[0]!.html)).toContain('引子')
    expectSameAsWhole(tokens, 'table-delim')
  })

  it('分隔行补齐成表格时上一段照常独立成块', () => {
    const tokens = ['引子\n', '| 甲 | 乙 |\n', '| --- | ---', ' |\n', '| 1 | 2 |']
    const blocks = streamTokens(tokens)
    expect(blocks).toHaveLength(2)
    expect(textOf(blocks[0]!.html)).toContain('引子')
    expect(hasTag(blocks[1]!.html, 'table')).toBe(true)
    expectSameAsWhole(tokens, 'table-ok')
  })
})

// ---------------------------------------------------------------------------
// 导出的纯函数
// ---------------------------------------------------------------------------

const pure = api as unknown as {
  blockKind?: (src: string) => string
  fenceLang?: (src: string) => string | undefined
  isFenceClosed?: (src: string) => boolean
}

describe('纯函数', () => {
  it('三个纯函数都已导出', () => {
    expect(typeof pure.blockKind).toBe('function')
    expect(typeof pure.fenceLang).toBe('function')
    expect(typeof pure.isFenceClosed).toBe('function')
  })

  it('blockKind 认出围栏与普通段落', () => {
    const blockKind = pure.blockKind!
    expect(blockKind('```ts\nx')).toBe('code')
    expect(blockKind('~~~\nx')).toBe('code')
    expect(blockKind('````\nx')).toBe('code')
    expect(blockKind('普通一段')).toBe('markdown')
    expect(blockKind('# 标题')).toBe('markdown')
    expect(blockKind('- 列表')).toBe('markdown')
    expect(blockKind('')).toBe('markdown')
  })

  it('fenceLang 取信息串首段并过白名单', () => {
    const fenceLang = pure.fenceLang!
    expect(fenceLang('```ts\nx')).toBe('ts')
    expect(fenceLang('~~~python\nx')).toBe('python')
    expect(fenceLang('````c++\nx') === 'c++' || fenceLang('````c++\nx') === undefined).toBe(true)
    expect(fenceLang('```\nx')).toBeUndefined()
    expect(fenceLang('```   \nx')).toBeUndefined()
    expect(fenceLang('普通一段')).toBeUndefined()
    expect(fenceLang('```ts" onload="alert(1)\nx')).toBeUndefined()
    expect(fenceLang('```<script>\nx')).toBeUndefined()
    expect(fenceLang(`\`\`\`${'a'.repeat(200)}\nx`)).toBeUndefined()
  })

  it('isFenceClosed 只认同类同长的收尾围栏', () => {
    const isFenceClosed = pure.isFenceClosed!
    expect(isFenceClosed('```ts\nx\n```')).toBe(true)
    expect(isFenceClosed('~~~\nx\n~~~')).toBe(true)
    expect(isFenceClosed('````\n```\n````')).toBe(true)
    expect(isFenceClosed('```ts\nx')).toBe(false)
    expect(isFenceClosed('```\nx\n~~~')).toBe(false)
    expect(isFenceClosed('````\n```')).toBe(false)
    expect(isFenceClosed('普通一段')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 强调的左右侧规则
// ---------------------------------------------------------------------------

/** 取 name 标签里第一段不含标签的文本。 */
function firstInner(html: string, name: string): string {
  return new RegExp(`<${name}>([^<]*)</${name}>`).exec(html)?.[1] ?? ''
}

describe('强调的左右侧规则', () => {
  it('杂散星号不当起始标记吃掉后面的强调', () => {
    for (const [src, word, literal] of [
      ['面积是 5*3 = 15，其中 *宽* 是 3', '宽', '5*3 = 15'],
      ['匹配 *.ts 文件里的 *关键* 部分', '关键', '*.ts'],
      ['a *b and c *d* e', 'd', 'a *b and c'],
    ] as const) {
      const html = htmlOf(src)
      expect(countTag(html, 'em'), src).toBe(1)
      expect(firstInner(html, 'em'), src).toBe(word)
      expect(textOf(html), src).toContain(literal)
    }
  })

  it('紧跟空白的星号不能当收尾标记', () => {
    const html = htmlOf('*未闭合 * 还是没闭合')
    expect(hasAnyTag(html, ['em', 'i'])).toBe(false)
    expect(textOf(html)).toContain('*未闭合 * 还是没闭合')
  })

  it('常量名两端的下划线整体成斜体', () => {
    const html = htmlOf('_MAX_SIZE_ 是上限')
    expect(countTag(html, 'em')).toBe(1)
    expect(firstInner(html, 'em')).toBe('MAX_SIZE')
  })

  it('词中间的下划线不成对', () => {
    for (const src of ['aa_"bb"_cc', 'snake_case_name']) {
      expect(hasAnyTag(htmlOf(src), ['em', 'i']), src).toBe(false)
      expect(textOf(htmlOf(src)), src).toContain(src)
    }
  })

  it('标点两侧的星号照样能开能闭', () => {
    const nested = htmlOf('*(*foo*)*')
    expect(countTag(nested, 'em')).toBe(2)
    expect(textOf(nested)).toContain('(foo)')

    const bold = htmlOf('*(**foo**)*')
    expect(countTag(bold, 'em')).toBe(1)
    expect(countTag(bold, 'strong')).toBe(1)
  })

  it('两侧长度之和是三的倍数就不配对', () => {
    const html = htmlOf('*a**b*')
    expect(countTag(html, 'em')).toBe(1)
    expect(countTag(html, 'strong')).toBe(0)
    expect(firstInner(html, 'em')).toBe('a**b')
  })

  it('多出来的标记字符留在原地当文本', () => {
    const html = htmlOf('**foo bar***')
    expect(countTag(html, 'strong')).toBe(1)
    expect(textOf(html)).toContain('foo bar*')
  })
})

// ---------------------------------------------------------------------------
// 链接不许套链接
// ---------------------------------------------------------------------------

describe('链接不许套链接', () => {
  it('标签里已有链接时外层退回字面方括号', () => {
    const html = htmlOf('见 [文档 [附录](/appendix) 部分](/doc)')
    expect(countTag(html, 'a')).toBe(1)
    expect(openTags(html, 'a')[0]!.attrs.href).toBe('/appendix')
    const text = textOf(html)
    expect(text).toContain('[文档')
    expect(text).toContain('部分](/doc)')
  })

  it('标签里的自动链接同样阻止外层成链接', () => {
    const html = htmlOf('[看 <https://e.example/a> 这里](/doc)')
    expect(countTag(html, 'a')).toBe(1)
    expect(openTags(html, 'a')[0]!.attrs.href).toBe('https://e.example/a')
  })

  it('嵌套三层只留最里面那条链接', () => {
    const html = htmlOf('[甲 [乙 [丙](/1) 丁](/2) 戊](/3)')
    expect(countTag(html, 'a')).toBe(1)
    expect(openTags(html, 'a')[0]!.attrs.href).toBe('/1')
  })

  it('图片套在链接里不受影响', () => {
    const html = htmlOf('[![图](https://e.example/a.png)](https://e.example/b)')
    expect(countTag(html, 'a')).toBe(1)
    expect(countTag(html, 'img')).toBe(1)
    expect(openTags(html, 'a')[0]!.attrs.href).toBe('https://e.example/b')
  })

  it('标签里只有方括号仍是一条链接', () => {
    const html = htmlOf('[甲 [乙] 丙](https://e.example)')
    expect(countTag(html, 'a')).toBe(1)
    expect(textOf(html)).toContain('甲 [乙] 丙')
  })
})

// ---------------------------------------------------------------------------
// 字符引用
// ---------------------------------------------------------------------------

describe('字符引用', () => {
  it('具名与数字引用还原成对应字符', () => {
    const html = htmlOf('AT&amp;T 与 &lt;div&gt; 与 &nbsp; 与 &#65;&#x42; 与 &hellip;')
    const text = textOf(html)
    expect(text).toContain('AT&T')
    expect(text).toContain('<div>')
    expect(text).toContain(' ')
    expect(text).toContain('AB')
    expect(text).toContain('…')
  })

  it('还原出来的尖括号只是文本，不产出标签', () => {
    for (const src of [
      '&lt;script&gt;alert(1)&lt;/script&gt;',
      '&#60;script&#62;alert(1)&#60;/script&#62;',
      '&#x3C;img src=x onerror=alert(1)&#x3E;',
    ]) {
      const html = htmlOf(src)
      expect(hasAnyTag(html, ['script', 'img']), src).toBe(false)
      expect(hasTruncatedTag(html), src).toBe(false)
      expect(textOf(html), src).toContain('<')
    }
  })

  it('认不出的引用原样留着', () => {
    for (const [src, literal] of [
      ['&notreal; 与 &amp 与 &#; 与 &', '&notreal;'],
      ['5 &lt 6', '&lt'],
    ] as const) {
      expect(textOf(htmlOf(src)), src).toContain(literal)
    }
  })

  it('行内代码与围栏里的引用不还原', () => {
    expect(textOf(htmlOf('`&amp;`'))).toContain('&amp;')
    expect(textOf(htmlOf('```\n&amp;\n```'))).toContain('&amp;')
  })
})

// ---------------------------------------------------------------------------
// 跨消息的引用定义
// ---------------------------------------------------------------------------

/** 同一台渲染器上依次渲染多条消息，返回最后一条的 html。 */
function renderMessages(renderer: ReturnType<typeof createStreamRenderer>, messages: readonly string[]): string {
  let html = ''
  for (const message of messages) html = renderer.render(message, { ended: true }).map(b => b.html).join('')
  return html
}

describe('跨消息的引用定义', () => {
  it('单块消息里的定义不流到下一条消息', () => {
    // 一条消息整个就是一个块时也不许留下定义：上一条消息不能决定这一条里 [文字] 的跳转目标
    const r = createStreamRenderer()
    const html = renderMessages(r, [
      '[docs]: https://attacker.example/pwn\n这是回答。',
      '去看 [docs] 了解详情。',
    ])
    expect(hasTag(html, 'a')).toBe(false)
    expect(textOf(html)).toContain('[docs]')
    r.dispose()
  })

  it('单块消息里的图片定义不流到下一条消息', () => {
    // 图片是渲染即发请求，泄漏一条定义就等于种下一个追踪像素
    const r = createStreamRenderer()
    const html = renderMessages(r, [
      '[logo]: https://attacker.example/px.gif\n这是回答。',
      '![logo]',
    ])
    expect(hasTag(html, 'img')).toBe(false)
    expect(textOf(html)).toContain('[logo]')
    r.dispose()
  })

  it('多块消息里的定义不流到下一条消息', () => {
    const r = createStreamRenderer()
    const html = renderMessages(r, [
      '[docs]: https://attacker.example/pwn\n这是回答。\n\n第二块。\n\n第三块。',
      '去看 [docs] 了解详情。',
    ])
    expect(hasTag(html, 'a')).toBe(false)
    expect(textOf(html)).toContain('[docs]')
    r.dispose()
  })

  it('中间隔了几条无关消息也不会复活', () => {
    const r = createStreamRenderer()
    const html = renderMessages(r, [
      '[docs]: https://attacker.example/pwn\n这是回答。',
      '第一条无关的。',
      '第二条无关的。',
      '```ts\nconst a = 1\n```',
      '| 甲 | 乙 |\n| --- | --- |\n| 1 | 2 |',
      '- 甲\n- 乙',
      '去看 [docs] 了解详情。',
    ])
    expect(hasTag(html, 'a')).toBe(false)
    expect(textOf(html)).toContain('[docs]')
    r.dispose()
  })

  it('逐字符喂完一条再换下一条，定义一起作废', () => {
    const r = createStreamRenderer()
    const first = '[docs]: https://attacker.example/pwn\n这是回答。'
    for (let i = 1; i <= first.length; i++) r.render(first.slice(0, i))
    r.render(first, { ended: true })
    const html = r.render('去看 [docs] 了解详情。', { ended: true }).map(b => b.html).join('')
    expect(hasTag(html, 'a')).toBe(false)
    expect(textOf(html)).toContain('[docs]')
    r.dispose()
  })

  it('同一条消息里定义写在引用后面照常生效', () => {
    const r = createStreamRenderer()
    const blocks = r.render('去看 [docs] 了解详情。\n\n[docs]: https://example.com/d', { ended: true })
    const html = blocks.map(b => b.html).join('')
    expect(openTags(html, 'a')[0]?.attrs.href).toBe('https://example.com/d')
    r.dispose()
  })

  it('同一条消息重复渲染不作废缓存', () => {
    const r = createStreamRenderer()
    const src = '去看 [docs] 了解详情。\n\n[docs]: https://example.com/d'
    const once = r.render(src, { ended: true })
    const twice = r.render(src, { ended: true })
    expect(twice.map(b => b.html)).toEqual(once.map(b => b.html))
    expect(twice.map(b => b.key)).toEqual(once.map(b => b.key))
    r.dispose()
  })
})

// ---------------------------------------------------------------------------
// 冻结块的重渲次数
// ---------------------------------------------------------------------------

/** 按 16 字符一段喂完，把每一帧交给 watch。 */
function streamBy16(text: string, watch: (blocks: readonly RenderedBlock[]) => void): readonly RenderedBlock[] {
  const r = createStreamRenderer()
  for (let i = 16; i < text.length; i += 16) watch(r.render(text.slice(0, i)))
  const last = r.render(text, { ended: true })
  r.dispose()
  return last
}

describe('冻结块的重渲次数', () => {
  it('尾部反复出现同名定义，冻结块不跟着重渲', () => {
    // 冻结块此生只渲一次，对象没换就是没重渲过
    const text = '[a]: /1\n\n[a]: /2\n\n'.repeat(60)
    let first: RenderedBlock | undefined
    const done = streamBy16(text, (blocks) => {
      if (first === undefined && blocks.length >= 3)
        first = blocks[0]
    })
    expect(first).toBeDefined()
    expect(done[0]).toBe(first)
  })

  it('定义晚到时只重渲用到那个标签的冻结块', () => {
    const text = '甲段引用 [k]。\n\n乙段没有引用。\n\n丙段。\n\n丁段。\n\n[k]: https://example.com/k\n\n收尾。'
    let referring: RenderedBlock | undefined
    let plain: RenderedBlock | undefined
    const done = streamBy16(text, (blocks) => {
      if (referring === undefined && blocks.length >= 3)
        referring = blocks[0]
      if (plain === undefined && blocks.length >= 4)
        plain = blocks[1]
    })
    expect(hasTag(referring!.html, 'a')).toBe(false)
    expect(openTags(done[0]!.html, 'a')[0]?.attrs.href).toBe('https://example.com/k')
    expect(done[0]!.key).toBe(referring!.key)
    expect(done[1]).toBe(plain)
  })
})
