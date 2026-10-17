// checkRichTextDocument、serializeRichTextHtml 与 richTextPlainText：问题码与路径、转义与往返、纯文字。
import type { RichTextDocument } from '../src/rich-text'
import { describe, expect, it } from 'vitest'
import { checkRichTextDocument, parseRichTextHtml, richTextPlainText, serializeRichTextHtml } from '../src/rich-text'

const sample: RichTextDocument = {
  blocks: [
    { type: 'heading', level: 2, align: 'center', runs: [{ type: 'text', text: '通知 <1>' }] },
    { type: 'paragraph', runs: [
      { type: 'text', text: '尊敬的 ' },
      { type: 'field', field: 'customer.name', format: { kind: 'map' }, marks: { bold: true } },
      { type: 'text', text: '：' },
      { type: 'break' },
      { type: 'text', text: '"引号" & \'单引号\'', marks: { color: '#C00', fontSize: 12, fontFamily: 'SimSun, "Song"', link: 'https://example.com/?a=1&b=2' } },
      { type: 'text', text: 'H', marks: { subscript: true, italic: true, underline: true, lineThrough: true, background: '#FFFF0080' } },
    ] },
    { type: 'list', ordered: true, start: 5, items: [
      { blocks: [{ type: 'paragraph', runs: [{ type: 'text', text: '第五' }] }, { type: 'list', ordered: false, items: [{ blocks: [{ type: 'paragraph', runs: [{ type: 'text', text: '子项' }] }] }] }] },
      { blocks: [{ type: 'paragraph', runs: [] }] },
    ] },
    { type: 'divider' },
    { type: 'paragraph', runs: [] },
  ],
}

describe('checkRichTextDocument', () => {
  it('合规的文档没有问题', () => {
    expect(checkRichTextDocument(sample)).toEqual([])
    expect(checkRichTextDocument({ blocks: [] })).toEqual([])
  })

  it('不是文档形状时报 invalid-document', () => {
    expect(checkRichTextDocument(null)).toEqual([{ code: 'invalid-document', path: [] }])
    expect(checkRichTextDocument({ blocks: 'x' })).toEqual([{ code: 'invalid-document', path: ['blocks'] }])
  })

  it('不认识的块、行内类型、样式与多余的键都报出来', () => {
    const issues = checkRichTextDocument({
      version: 2,
      blocks: [
        { type: 'quote', runs: [] },
        { type: 'paragraph', runs: [{ type: 'image', src: 'a.png' }, { type: 'text', text: 'a', marks: { shadow: true } }], indent: 1 },
      ],
    })
    expect(issues).toEqual([
      { code: 'unknown-key', path: ['version'] },
      { code: 'unknown-block', path: ['blocks', 0, 'type'] },
      { code: 'unknown-key', path: ['blocks', 1, 'indent'] },
      { code: 'unknown-inline', path: ['blocks', 1, 'runs', 0, 'type'] },
      { code: 'unknown-mark', path: ['blocks', 1, 'runs', 1, 'marks', 'shadow'] },
    ])
  })

  it('缺字段、取值不对、不安全的链接、上下标冲突与过深的列表', () => {
    const deep = (depth: number): unknown => ({ type: 'list', ordered: false, items: depth === 0 ? [] : [{ blocks: [deep(depth - 1)] }] })
    const issues = checkRichTextDocument({
      blocks: [
        { type: 'heading', level: 4, runs: [] },
        { type: 'paragraph', align: 'middle' },
        { type: 'paragraph', runs: [
          { type: 'text', text: 1, marks: { color: 'red', fontSize: 0, bold: 'yes', link: 'javascript:alert(1)', superscript: true, subscript: true } },
          { type: 'field', field: ' ' },
          { type: 'break', extra: 1 },
        ] },
        { type: 'list', ordered: 'yes', start: -1, items: [] },
        deep(3),
        {},
      ],
    })
    expect(issues).toEqual([
      { code: 'invalid-value', path: ['blocks', 0, 'level'] },
      { code: 'missing', path: ['blocks', 1, 'runs'] },
      { code: 'invalid-value', path: ['blocks', 1, 'align'] },
      { code: 'invalid-value', path: ['blocks', 2, 'runs', 0, 'text'] },
      { code: 'invalid-value', path: ['blocks', 2, 'runs', 0, 'marks', 'color'] },
      { code: 'invalid-value', path: ['blocks', 2, 'runs', 0, 'marks', 'fontSize'] },
      { code: 'invalid-value', path: ['blocks', 2, 'runs', 0, 'marks', 'bold'] },
      { code: 'unsafe-link', path: ['blocks', 2, 'runs', 0, 'marks', 'link'] },
      { code: 'conflicting-marks', path: ['blocks', 2, 'runs', 0, 'marks'] },
      { code: 'invalid-value', path: ['blocks', 2, 'runs', 1, 'field'] },
      { code: 'unknown-key', path: ['blocks', 2, 'runs', 2, 'extra'] },
      { code: 'invalid-value', path: ['blocks', 3, 'ordered'] },
      { code: 'invalid-value', path: ['blocks', 3, 'start'] },
      { code: 'list-too-deep', path: ['blocks', 4, 'items', 0, 'blocks', 0, 'items', 0, 'blocks', 0, 'items', 0, 'blocks', 0] },
      { code: 'missing', path: ['blocks', 5, 'type'] },
    ])
  })
})

describe('serializeRichTextHtml', () => {
  it('文字与属性值都转义，样式与链接只写合法的值', () => {
    const html = serializeRichTextHtml({ blocks: [{ type: 'paragraph', runs: [
      { type: 'text', text: '<script>alert(1)</script>' },
      { type: 'text', text: 'x', marks: { link: 'javascript:alert(1)', color: 'red', fontFamily: 'A"B' } },
    ] }] })
    expect(html).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;<span style="font-family: A&quot;B">x</span></p>')
  })

  it('写出的 HTML 读回得到同一份模型', () => {
    const html = serializeRichTextHtml(sample)
    const parsed = parseRichTextHtml(html)
    expect(parsed.dropped).toEqual([])
    expect(parsed.document).toEqual(sample)
  })
})

describe('richTextPlainText', () => {
  it('块之间换行，列表加序号与缩进，字段写成占位或交给回调', () => {
    expect(richTextPlainText(sample)).toBe([
      '通知 <1>',
      '尊敬的 {customer.name}：',
      '"引号" & \'单引号\'H',
      '5. 第五',
      '  • 子项',
      '6. ',
      '———',
      '',
    ].join('\n'))
    expect(richTextPlainText({ blocks: [{ type: 'paragraph', runs: [{ type: 'field', field: 'n' }] }] }, { field: run => run.field.toUpperCase() })).toBe('N')
  })
})
