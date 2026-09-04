import { describe, expect, it } from 'vitest'
import { scanScopedTags } from './markup'

describe('scanScopedTags', () => {
  it('按属性名取 scope 与 part，与属性顺序无关', () => {
    const html = '<div data-scope="dialog" data-part="root"></div><span data-part="title" data-scope="dialog"></span>'
    expect(scanScopedTags(html)).toEqual([
      { tag: 'div', scope: 'dialog', part: 'root' },
      { tag: 'span', scope: 'dialog', part: 'title' },
    ])
  })

  it('不带解剖标记的标签不收', () => {
    expect(scanScopedTags('<div class="x"><p>文本</p></div>')).toEqual([])
  })

  it('只有一半标记的标签也收，另一半记成空', () => {
    expect(scanScopedTags('<i data-scope="tag"></i><b data-part="root"></b>')).toEqual([
      { tag: 'i', scope: 'tag', part: null },
      { tag: 'b', scope: '', part: 'root' },
    ])
  })

  it('属性值里的 > 与 < 不会把标签提前切断', () => {
    const html = '<div title="a > b" data-scope="tag" data-part="root"></div>'
    expect(scanScopedTags(html)).toEqual([{ tag: 'div', scope: 'tag', part: 'root' }])
  })

  it('注释与片段锚点不当成标签', () => {
    const html = '<!--[--><!-- data-scope="tag" data-part="root" --><!--]-->'
    expect(scanScopedTags(html)).toEqual([])
  })

  it('自闭合写法照收', () => {
    expect(scanScopedTags('<img data-scope="image" data-part="root"/>')).toEqual([
      { tag: 'img', scope: 'image', part: 'root' },
    ])
  })

  it('相似的属性名不误伤', () => {
    expect(scanScopedTags('<div my-data-scope="x" data-scope="tag" data-part="root"></div>')).toEqual([
      { tag: 'div', scope: 'tag', part: 'root' },
    ])
  })
})
