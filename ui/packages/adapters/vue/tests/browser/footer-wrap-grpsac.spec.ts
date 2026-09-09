// approval 的动作行：一行排不下就折行。
//
// 这一行靠右排，排不下时溢出的是行首那一侧——scrollWidth 量不到它，页面也不会长出横滚，
// 那截按钮就那么漫到卡片外面去，既看不全也点不着。判据因此不看页面溢出，
// 看每颗钮的行首边有没有落在动作行之内。
//
// 判据不接断点：折行在窄视口与窄容器两种情形下同时成立，所以三档一起量，
// 窄档不许漫出、宽档不许改样。
//
// 测试宿主的视口固定在一个宽度上改不动，这里改用内嵌 iframe：宽度由这边的 width 说了算。
// 皮肤与令牌以 <style> 注入主文档，克隆一份进 iframe 的 head 才生效。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let frame: HTMLIFrameElement | null = null

/** 在给定宽度的视口里挂一段标记，返回那份文档。 */
function mount(width: number, html: string): Document {
  frame?.remove()
  frame = document.createElement('iframe')
  frame.style.cssText = `width: ${width}px; height: 700px; border: 0`
  document.body.append(frame)

  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  for (const node of document.querySelectorAll('style, link[rel="stylesheet"]'))
    doc.head.append(node.cloneNode(true))
  doc.body.style.margin = '0'
  doc.body.innerHTML = html
  return doc
}

afterEach(() => {
  frame?.remove()
  frame = null
})

function markup(approve: string, deny: string): string {
  return `<div data-scope="approval" data-part="root">
    <div data-scope="approval" data-part="header">
      <span data-scope="approval" data-part="title">删除生产数据库</span>
    </div>
    <div data-scope="approval" data-part="footer" id="footer">
      <button data-scope="approval" data-part="deny-trigger" type="button">${deny}</button>
      <button data-scope="approval" data-part="approve-trigger" type="button">${approve}</button>
    </div>
  </div>`
}

function buttons(doc: Document): DOMRect[] {
  return [...doc.querySelectorAll('#footer button')].map(node => node.getBoundingClientRect())
}

/** 两颗钮占了几行：按盒顶的不同取值算。 */
function rows(doc: Document): number {
  return new Set(buttons(doc).map(rect => Math.round(rect.top))).size
}

/** 动作行自己的行首边。 */
function footerStart(doc: Document): number {
  return doc.querySelector('#footer')!.getBoundingClientRect().left
}

const TIERS = [320, 375, 768]

describe('approval：两颗钮排不下就折行', () => {
  const LONG = markup('批准并通知申请人', '驳回并要求补充材料')

  it.each(TIERS)('%ipx 下长动作名不漫出动作行', (width) => {
    const doc = mount(width, LONG)
    for (const rect of buttons(doc))
      expect(rect.left).toBeGreaterThanOrEqual(footerStart(doc) - 0.5)
  })

  it('320px 下两颗长钮排不进一行，各占一行', () => {
    expect(rows(mount(320, LONG))).toBe(2)
  })

  it('375px 下这两颗钮排得下，仍并排一行', () => {
    expect(rows(mount(375, LONG))).toBe(1)
  })

  it('英文长动作名同样不漫出动作行', () => {
    const doc = mount(320, markup('Approve and notify', 'Deny and request changes'))
    for (const rect of buttons(doc))
      expect(rect.left).toBeGreaterThanOrEqual(footerStart(doc) - 0.5)
  })

  it.each(TIERS)('%ipx 下排得下的短文案仍并排一行', (width) => {
    const doc = mount(width, markup('批准', '拒绝'))
    expect(rows(doc)).toBe(1)
    for (const rect of buttons(doc))
      expect(rect.left).toBeGreaterThanOrEqual(footerStart(doc) - 0.5)
  })

  it('判定在途时圆环与两颗钮一起折行，不把钮挤出去', () => {
    const doc = mount(320, LONG.replace('data-part="root"', 'data-part="root" data-loading'))
    for (const rect of buttons(doc))
      expect(rect.left).toBeGreaterThanOrEqual(footerStart(doc) - 0.5)
  })
})
