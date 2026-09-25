import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let frame: HTMLIFrameElement | null = null

afterEach(() => {
  host?.remove()
  host = null
  frame?.remove()
  frame = null
})

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='page-header'][data-part='${name}']`)!
}

/**
 * 在给定宽度的 iframe 里挂一条页头，返回它的文档。
 * 宿主视口改不动，媒体查询按 iframe 自己的视口求值；皮肤与令牌以 <style> 注入主文档，克隆一份进去才生效。
 */
function mountAt(width: number): Document {
  frame = document.createElement('iframe')
  frame.style.cssText = `width: ${width}px; height: 400px; border: 0`
  document.body.append(frame)
  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  for (const node of document.querySelectorAll('style, link[rel="stylesheet"]'))
    doc.head.append(node.cloneNode(true))
  doc.body.style.margin = '0'
  doc.body.innerHTML = `
    <header data-scope="page-header" data-part="root">
      <div data-scope="page-header" data-part="back-trigger">←</div>
      <h1 data-scope="page-header" data-part="title">订单详情</h1>
      <p data-scope="page-header" data-part="description">创建于 2026 年 7 月 31 日</p>
      <div data-scope="page-header" data-part="extra">编辑</div>
    </header>
  `
  return doc
}

function partIn(doc: Document, name: string): HTMLElement {
  return doc.querySelector<HTMLElement>(`[data-scope='page-header'][data-part='${name}']`)!
}

describe('page-header 信息层级', () => {
  it('窄屏标题与说明上下排列，操作区换到下一行', () => {
    host = document.createElement('div')
    host.innerHTML = `
      <header data-scope="page-header" data-part="root" style="inline-size:720px">
        <div data-scope="page-header" data-part="breadcrumb">首页 / 订单</div>
        <div data-scope="page-header" data-part="back-trigger">←</div>
        <div data-scope="page-header" data-part="media">◎</div>
        <h1 data-scope="page-header" data-part="title">订单 SO-20260731-004</h1>
        <p data-scope="page-header" data-part="description">创建于 2026 年 7 月 31 日</p>
        <div data-scope="page-header" data-part="extra">编辑</div>
        <div data-scope="page-header" data-part="footer">已支付</div>
      </header>
    `
    document.body.append(host)

    const title = part('title').getBoundingClientRect()
    const description = part('description').getBoundingClientRect()
    const extraElement = part('extra')
    const extra = extraElement.getBoundingClientRect()
    const footer = part('footer').getBoundingClientRect()

    expect(title.bottom).toBeLessThanOrEqual(description.top)
    expect(matchMedia('not all and (min-width: 640px)').matches).toBe(true)
    expect(extra.top).toBeGreaterThanOrEqual(description.bottom)
    expect(getComputedStyle(extraElement).gridColumn).toBe('1 / -1')
    expect(footer.top).toBeGreaterThanOrEqual(extra.bottom)
  })

  // 断点 sm = 640px 归宽档：其余皮肤在 640 用 min-width 接管，页头若在同一宽度仍按窄档排，就与它们差一档
  it('639px 仍是窄档，640px 起换成宽档', () => {
    const narrow = mountAt(639)
    expect(getComputedStyle(partIn(narrow, 'extra')).gridColumn).toBe('1 / -1')
    expect(getComputedStyle(partIn(narrow, 'title')).gridColumn).toBe('2')
    frame!.remove()

    const wide = mountAt(640)
    expect(getComputedStyle(partIn(wide, 'extra')).gridColumn).toBe('4')
    expect(getComputedStyle(partIn(wide, 'title')).gridColumn).toBe('3')
    expect(partIn(wide, 'extra').getBoundingClientRect().top)
      .toBeLessThan(partIn(wide, 'description').getBoundingClientRect().bottom)
  })

  it('省略返回位与媒体位时标题不保留空轨道间距', () => {
    host = document.createElement('div')
    host.innerHTML = `
      <header data-scope="page-header" data-part="root" style="inline-size:320px">
        <h1 data-scope="page-header" data-part="title">订单详情</h1>
      </header>
    `
    document.body.append(host)

    const root = part('root').getBoundingClientRect()
    const title = part('title').getBoundingClientRect()
    expect(title.left).toBe(root.left)
  })
})
