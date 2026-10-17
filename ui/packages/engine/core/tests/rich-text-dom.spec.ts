// @vitest-environment jsdom
// renderRichText：块与行内落成的元素、样式只写合法值、文字不当 HTML 解析、链接判定与字段文字。
import type { RichTextDocument } from '../src/rich-text'
import { describe, expect, it } from 'vitest'
import { renderRichText } from '../src/rich-text/dom'

function render(model: RichTextDocument, field?: (run: { field: string }) => string): HTMLElement {
  const host = document.createElement('div')
  host.append(renderRichText(document, model, field === undefined ? {} : { field }))
  return host
}

describe('renderRichText', () => {
  it('段落、标题、列表、分隔线与换行落成对应的元素', () => {
    const host = render({ blocks: [
      { type: 'heading', level: 1, align: 'center', runs: [{ type: 'text', text: '标题' }] },
      { type: 'paragraph', runs: [{ type: 'text', text: '一' }, { type: 'break' }, { type: 'text', text: '二' }] },
      { type: 'list', ordered: true, start: 3, items: [{ blocks: [{ type: 'paragraph', runs: [{ type: 'text', text: '项' }] }] }] },
      { type: 'divider' },
      { type: 'paragraph', runs: [] },
    ] })
    expect(host.innerHTML).toBe('<h1 style="text-align: center;">标题</h1><p>一<br>二</p><ol start="3"><li><p>项</p></li></ol><hr><p><br></p>')
  })

  it('行内样式用语义标签与 span 的 style，链接只写过了判定的地址', () => {
    const host = render({ blocks: [{ type: 'paragraph', runs: [
      { type: 'text', text: '甲', marks: { bold: true, italic: true, color: '#C00', fontSize: 12, link: 'https://example.com' } },
      { type: 'text', text: '乙', marks: { superscript: true, link: 'javascript:alert(1)', color: 'red' } },
    ] }] })
    const link = host.querySelector('a')!
    expect(link.getAttribute('href')).toBe('https://example.com')
    expect(link.innerHTML).toBe('<strong><em><span style="color: rgb(204, 0, 0); font-size: 12pt;">甲</span></em></strong>')
    expect(host.querySelectorAll('a')).toHaveLength(1)
    expect(host.querySelector('sup')!.outerHTML).toBe('<sup>乙</sup>')
  })

  it('文字一律是文字节点，不当作 HTML 解析', () => {
    const host = render({ blocks: [{ type: 'paragraph', runs: [{ type: 'text', text: '<img src=x onerror=alert(1)>' }] }] })
    expect(host.querySelector('img')).toBeNull()
    expect(host.textContent).toBe('<img src=x onerror=alert(1)>')
  })

  it('行内字段的文字缺省是 {路径}，可以交给回调', () => {
    const model: RichTextDocument = { blocks: [{ type: 'paragraph', runs: [{ type: 'field', field: 'customer.name', marks: { bold: true } }] }] }
    expect(render(model).innerHTML).toBe('<p><strong>{customer.name}</strong></p>')
    expect(render(model, () => '曦寒商贸').textContent).toBe('曦寒商贸')
  })

  it('不认识的块与行内类型跳过', () => {
    const host = render({ blocks: [{ type: 'quote' } as never, { type: 'paragraph', runs: [{ type: 'image' } as never, { type: 'text', text: '留下' }] }] })
    expect(host.innerHTML).toBe('<p>留下</p>')
  })
})
