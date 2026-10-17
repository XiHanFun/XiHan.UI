// parseRichTextHtml：块与行内的白名单换算、丢弃清单、空白规则、列表层数与宽松的标签写法。
import { describe, expect, it } from 'vitest'
import { parseRichTextHtml } from '../src/rich-text'

describe('parseRichTextHtml', () => {
  it('段落、标题、列表与分隔线换成对应的块', () => {
    const { document, dropped } = parseRichTextHtml('<h1>标题</h1><p>正文</p><ul><li>甲</li><li>乙</li></ul><ol start="3"><li>丙</li></ol><hr>')
    expect(document.blocks).toEqual([
      { type: 'heading', level: 1, runs: [{ type: 'text', text: '标题' }] },
      { type: 'paragraph', runs: [{ type: 'text', text: '正文' }] },
      { type: 'list', ordered: false, items: [
        { blocks: [{ type: 'paragraph', runs: [{ type: 'text', text: '甲' }] }] },
        { blocks: [{ type: 'paragraph', runs: [{ type: 'text', text: '乙' }] }] },
      ] },
      { type: 'list', ordered: true, start: 3, items: [{ blocks: [{ type: 'paragraph', runs: [{ type: 'text', text: '丙' }] }] }] },
      { type: 'divider' },
    ])
    expect(dropped).toEqual([])
  })

  it('读得懂富文本编辑器产出的 HTML：li 里包 p、带 target 的链接、带底色的 mark 与对齐', () => {
    const html = '<p style="text-align: center">你好，<strong>世界</strong> <a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com">链接</a></p>'
      + '<ul><li><p>第一项</p></li></ul><p><mark data-color="#FFE066" style="background-color: #FFE066; color: inherit">高亮</mark></p><p></p>'
    const { document } = parseRichTextHtml(html)
    expect(document.blocks).toEqual([
      { type: 'paragraph', align: 'center', runs: [
        { type: 'text', text: '你好，' },
        { type: 'text', text: '世界', marks: { bold: true } },
        { type: 'text', text: ' ' },
        { type: 'text', text: '链接', marks: { link: 'https://example.com' } },
      ] },
      { type: 'list', ordered: false, items: [{ blocks: [{ type: 'paragraph', runs: [{ type: 'text', text: '第一项' }] }] }] },
      { type: 'paragraph', runs: [{ type: 'text', text: '高亮', marks: { background: '#FFE066' } }] },
      { type: 'paragraph', runs: [] },
    ])
  })

  it('行内样式：语义标签与 style 叠加，内层覆盖外层', () => {
    const { document } = parseRichTextHtml('<p><span style="color: rgb(255, 0, 0); font-size: 16px; font-family: \'Microsoft YaHei\'">红<em>斜</em></span><sup>2</sup><s>删</s><u>线</u><span style="font-weight: 700; text-decoration: underline line-through">粗</span><code>x</code></p>')
    expect(document.blocks[0]).toEqual({ type: 'paragraph', runs: [
      { type: 'text', text: '红', marks: { color: '#FF0000', fontSize: 12, fontFamily: '\'Microsoft YaHei\'' } },
      { type: 'text', text: '斜', marks: { color: '#FF0000', fontSize: 12, fontFamily: '\'Microsoft YaHei\'', italic: true } },
      { type: 'text', text: '2', marks: { superscript: true } },
      { type: 'text', text: '删', marks: { lineThrough: true } },
      { type: 'text', text: '线', marks: { underline: true } },
      { type: 'text', text: '粗', marks: { bold: true, underline: true, lineThrough: true } },
      { type: 'text', text: 'x', marks: { fontFamily: 'monospace' } },
    ] })
  })

  it('脚本、样式表、内嵌框架与图片连同内容去掉，记入丢弃清单', () => {
    const { document, dropped } = parseRichTextHtml('<p>前<script>alert("<p>x</p>")</script>后</p><style>p{color:red}</style><iframe src="https://x"></iframe><img src="a.png"><img src="b.png">')
    expect(document.blocks).toEqual([{ type: 'paragraph', runs: [{ type: 'text', text: '前后' }] }])
    expect(dropped).toEqual([
      { kind: 'content', name: 'script', count: 1 },
      { kind: 'content', name: 'style', count: 1 },
      { kind: 'content', name: 'iframe', count: 1 },
      { kind: 'content', name: 'img', count: 2 },
    ])
  })

  it('没过判定的链接去掉地址、保留文字，记下协议名', () => {
    const { document, dropped } = parseRichTextHtml('<p><a href="javascript:alert(1)">点我</a><a href="mailto:a@example.com">写信</a></p>')
    expect(document.blocks[0]).toEqual({ type: 'paragraph', runs: [
      { type: 'text', text: '点我' },
      { type: 'text', text: '写信', marks: { link: 'mailto:a@example.com' } },
    ] })
    expect(dropped).toEqual([{ kind: 'link', name: 'javascript', count: 1 }])
  })

  it('表格去掉结构、每格文字成段；不认识的 style 属性与取值记下', () => {
    const { document, dropped } = parseRichTextHtml('<table><tr><td>甲</td><td style="position: absolute; font-size: 1.2em">乙</td></tr></table>')
    expect(document.blocks).toEqual([
      { type: 'paragraph', runs: [{ type: 'text', text: '甲' }] },
      { type: 'paragraph', runs: [{ type: 'text', text: '乙' }] },
    ])
    expect(dropped).toEqual([
      { kind: 'element', name: 'table', count: 1 },
      { kind: 'style', name: 'position', count: 1 },
      { kind: 'style', name: 'font-size', count: 1 },
    ])
  })

  it('空白按 HTML 的规则合并，段落首尾与换行两侧不留空格', () => {
    const { document } = parseRichTextHtml('<p>\n   第一行  <b> 粗 </b>  <br>   第二行\t\n</p>')
    expect(document.blocks[0]).toEqual({ type: 'paragraph', runs: [
      { type: 'text', text: '第一行 ' },
      { type: 'text', text: '粗', marks: { bold: true } },
      { type: 'break' },
      { type: 'text', text: '第二行' },
    ] })
  })

  it('pre 保留空格与换行，记一条 element', () => {
    const { document, dropped } = parseRichTextHtml('<pre>a  b\nc</pre>')
    expect(document.blocks).toEqual([{ type: 'paragraph', runs: [{ type: 'text', text: 'a  b' }, { type: 'break' }, { type: 'text', text: 'c' }] }])
    expect(dropped).toEqual([{ kind: 'element', name: 'pre', count: 1 }])
  })

  it('末尾的单个 br 不多算一行，只有 br 的段落是一个空行', () => {
    const { document } = parseRichTextHtml('<p>文字<br></p><p><br></p>')
    expect(document.blocks).toEqual([
      { type: 'paragraph', runs: [{ type: 'text', text: '文字' }] },
      { type: 'paragraph', runs: [] },
    ])
  })

  it('h4–h6 降成三级标题并记下；超过三层的列表展平到上一层', () => {
    const deep = '<ul><li>1<ul><li>2<ul><li>3<ul><li>4</li></ul></li></ul></li></ul></li></ul>'
    const { document, dropped } = parseRichTextHtml(`<h5>小标题</h5>${deep}`)
    expect(document.blocks[0]).toEqual({ type: 'heading', level: 3, runs: [{ type: 'text', text: '小标题' }] })
    const level3 = (((document.blocks[1] as any).items[0].blocks[1].items[0].blocks[1]).items[0].blocks)
    expect(level3).toEqual([
      { type: 'paragraph', runs: [{ type: 'text', text: '3' }] },
      { type: 'paragraph', runs: [{ type: 'text', text: '4' }] },
    ])
    expect(dropped).toEqual([{ kind: 'element', name: 'h5', count: 1 }, { kind: 'element', name: 'ul', count: 1 }])
  })

  it('字符引用解码，标签宽松：没闭合的 p、新 li 收尾上一项、大小写与单引号属性', () => {
    const { document } = parseRichTextHtml('<P ALIGN=\'right\'>A &amp; B &lt;C&gt; &#x4E2D;&#25991; &nbsp;<p>二<UL><LI>甲<LI>乙</UL>')
    expect(document.blocks).toEqual([
      { type: 'paragraph', align: 'right', runs: [{ type: 'text', text: 'A & B <C> 中文  ' }] },
      { type: 'paragraph', runs: [{ type: 'text', text: '二' }] },
      { type: 'list', ordered: false, items: [
        { blocks: [{ type: 'paragraph', runs: [{ type: 'text', text: '甲' }] }] },
        { blocks: [{ type: 'paragraph', runs: [{ type: 'text', text: '乙' }] }] },
      ] },
    ])
  })

  it('span 带 data-field 时成为行内字段，带上样式与格式', () => {
    const { document } = parseRichTextHtml('<p>客户：<b><span data-field="customer.name" data-format="{&quot;kind&quot;:&quot;map&quot;}">customer.name</span></b></p>')
    expect(document.blocks[0]).toEqual({ type: 'paragraph', runs: [
      { type: 'text', text: '客户：' },
      { type: 'field', field: 'customer.name', format: { kind: 'map' }, marks: { bold: true } },
    ] })
  })

  it('注释、doctype 与整份文档的头部不留下任何东西', () => {
    const { document, dropped } = parseRichTextHtml('<!doctype html><html><head><title>标题</title><meta charset="utf-8"></head><body><!-- 注释 --><p>正文</p></body></html>')
    expect(document.blocks).toEqual([{ type: 'paragraph', runs: [{ type: 'text', text: '正文' }] }])
    expect(dropped).toEqual([])
  })

  it('font 的 color 与 face、基本色名与 rgba 半透明', () => {
    const { document } = parseRichTextHtml('<p><font color="red" face="SimSun">宋</font><span style="color: rgba(0, 0, 255, 0.5)">蓝</span></p>')
    expect(document.blocks[0]).toEqual({ type: 'paragraph', runs: [
      { type: 'text', text: '宋', marks: { color: '#FF0000', fontFamily: 'SimSun' } },
      { type: 'text', text: '蓝', marks: { color: '#0000FF80' } },
    ] })
  })

  it('空串与只有空白的 HTML 得到空文档', () => {
    expect(parseRichTextHtml('').document).toEqual({ blocks: [] })
    expect(parseRichTextHtml('  \n ').document).toEqual({ blocks: [] })
  })
})
