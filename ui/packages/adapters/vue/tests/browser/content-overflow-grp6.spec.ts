// 内容本身撑破行：六个组件里，长串与宽块由内容自己带，任何宽度下都会顶出容器。
// 判据是无条件的——同一份标记在 375 / 768 / 1280 三档都不许把外面的盒撑开，
// 撑不开靠的是断行与横滚兜底，不是任何宽度查询。
//
// 宿主视口固定在一个宽度上改不动，这里改用内嵌 iframe：宽度由这边的 width 说了算。
// 皮肤与令牌以 <style> 注入主文档，克隆一份进 iframe 的 head 才生效。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let frame: HTMLIFrameElement | null = null

/** 在给定宽度的视口里挂一段标记，返回那份文档。 */
function mount(width: number, html: string): Document {
  frame?.remove()
  frame = document.createElement('iframe')
  frame.style.cssText = `width: ${width}px; height: 900px; border: 0`
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

function pick(doc: Document, selector: string): HTMLElement {
  const el = doc.querySelector(selector)
  if (!el)
    throw new Error(`没有挂上 ${selector}`)
  return el as HTMLElement
}

/** 页面自己有没有被顶出横向滚动。 */
function pageOverflow(doc: Document): number {
  return doc.documentElement.scrollWidth - doc.documentElement.clientWidth
}

/** 往行内一轴推到底，返回推得动的距离：0 即这块内容取不回来。 */
function reach(el: HTMLElement): number {
  el.scrollLeft = 99999
  return el.scrollLeft
}

afterEach(() => {
  frame?.remove()
  frame = null
})

const WIDTHS = [375, 768, 1280]

// 中间一个断点都没有的长串
const LONG_RUN = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const ORDER_NO = 'ORD-2026090812345678'

describe('内容撑破行', () => {
  describe('typography', () => {
    it.each(WIDTHS)('%ipx：不可断的长串在段落里断开，不把整块正文顶宽', (w) => {
      const doc = mount(w, `
        <div data-scope="typography" data-part="root" id="root">
          <p data-scope="typography" data-part="paragraph" id="para">前缀 ${LONG_RUN} 后缀</p>
          <div data-scope="typography" data-part="prose" id="prose"><p>前缀 ${LONG_RUN} 后缀</p></div>
        </div>`)

      expect(pick(doc, '#para').scrollWidth).toBe(pick(doc, '#para').clientWidth)
      expect(pick(doc, '#prose').scrollWidth).toBe(pick(doc, '#prose').clientWidth)
      expect(pick(doc, '#root').scrollWidth).toBe(pick(doc, '#root').clientWidth)
      expect(pageOverflow(doc)).toBe(0)
    })

    it.each(WIDTHS)('%ipx：富文本表格里的长单元格断得开，整张表收在正文宽度里', (w) => {
      const doc = mount(w, `
        <div data-scope="typography" data-part="root">
          <div data-scope="typography" data-part="prose" id="prose">
            <table id="tbl"><tbody><tr>
              <td>${ORDER_NO}${ORDER_NO}</td><td>${ORDER_NO}${ORDER_NO}</td>
              <td>${ORDER_NO}${ORDER_NO}</td><td>${ORDER_NO}${ORDER_NO}</td>
            </tr></tbody></table>
          </div>
        </div>`)
      const prose = pick(doc, '#prose')

      expect(prose.scrollWidth).toBe(prose.clientWidth)
      expect(pageOverflow(doc)).toBe(0)
    })
  })

  describe('tool-call', () => {
    function mountCall(w: number): Document {
      return mount(w, `
        <div data-scope="tool-call" data-part="root" style="inline-size: 240px">
          <button data-scope="tool-call" data-part="trigger">查询</button>
          <div data-scope="tool-call" data-part="content" data-state="open" id="content">
            <div data-scope="tool-call" data-part="output" id="output"><pre style="margin:0">{"q":"${LONG_RUN}"}</pre></div>
          </div>
        </div>`)
    }

    it.each(WIDTHS)('%ipx：宽过卡片的结果推得回来看，不是被裁掉且取不回', (w) => {
      const doc = mountCall(w)
      const content = pick(doc, '#content')

      expect(content.scrollWidth).toBeGreaterThan(content.clientWidth)
      expect(reach(content)).toBe(content.scrollWidth - content.clientWidth)
      expect(pageOverflow(doc)).toBe(0)
    })

    it('块轴照旧裁掉，展开动画还在', () => {
      const doc = mountCall(375)
      const content = pick(doc, '#content')
      const style = doc.defaultView!.getComputedStyle(content)

      // 收起靠行高归零，块轴多出来的那一截不能露在外面，也不能变成一条竖滚动
      expect(style.overflowY).toBe('hidden')
      expect(content.scrollHeight).toBe(content.clientHeight)
      expect(style.animationName).toBe('xh-tool-call-expand')
    })
  })

  describe('markdown-stream', () => {
    it.each(WIDTHS)('%ipx：含不可断长单元格的表由块自己横滚，不顶宽整篇正文', (w) => {
      // 十二格：最宽的那一档也放不下，三档量的是同一件事
      const cells = Array.from({ length: 12 }).fill(`<td>${ORDER_NO}</td>`).join('')
      const doc = mount(w, `
        <div data-scope="markdown-stream" data-part="root" id="root">
          <div data-scope="markdown-stream" data-part="content" id="content">
            <div data-scope="markdown-stream" data-part="block" data-kind="table" id="block">
              <table><tbody><tr>${cells}</tr></tbody></table>
            </div>
          </div>
        </div>`)
      const block = pick(doc, '#block')

      expect(block.scrollWidth).toBeGreaterThan(block.clientWidth)
      expect(reach(block)).toBe(block.scrollWidth - block.clientWidth)
      expect(pick(doc, '#root').scrollWidth).toBe(pick(doc, '#root').clientWidth)
      expect(pageOverflow(doc)).toBe(0)
    })

    it('接了横滚之后光标那一格不多出一条竖滚动', () => {
      const doc = mount(375, `
        <div data-scope="markdown-stream" data-part="root">
          <div data-scope="markdown-stream" data-part="content">
            <div data-scope="markdown-stream" data-part="block" data-caret id="caret"><p style="margin:0">正在生成的一段话</p></div>
          </div>
        </div>`)
      const caret = pick(doc, '#caret')

      expect(caret.scrollHeight).toBe(caret.clientHeight)
    })
  })

  describe('page-header', () => {
    it.each(WIDTHS)('%ipx：不可断的长标题断在行内，不把页头撑出容器', (w) => {
      const doc = mount(w, `
        <div data-scope="page-header" data-part="root" id="root">
          <h1 data-scope="page-header" data-part="title" id="title">${LONG_RUN}</h1>
          <p data-scope="page-header" data-part="description">说明文字</p>
        </div>`)
      const root = pick(doc, '#root')

      expect(pick(doc, '#title').getBoundingClientRect().width).toBeLessThanOrEqual(root.clientWidth)
      expect(root.scrollWidth).toBe(root.clientWidth)
      expect(pageOverflow(doc)).toBe(0)
    })
  })

  describe('timeline', () => {
    it.each(WIDTHS)('%ipx：横排四条带长单号，整条轴不被顶出容器', (w) => {
      const items = Array.from({ length: 4 }, (_, i) => `
        <li data-scope="timeline" data-part="item" data-orientation="horizontal">
          <span data-scope="timeline" data-part="indicator"></span>
          <span data-scope="timeline" data-part="connector"></span>
          <div data-scope="timeline" data-part="content">
            <div data-scope="timeline" data-part="title">${ORDER_NO}</div>
            <div data-scope="timeline" data-part="time">10:0${i}</div>
          </div>
        </li>`).join('')
      const doc = mount(w, `<ol data-scope="timeline" data-part="root" data-orientation="horizontal" id="root">${items}</ol>`)
      const root = pick(doc, '#root')

      expect(root.scrollWidth).toBe(root.clientWidth)
      expect(pageOverflow(doc)).toBe(0)
    })
  })

  describe('download-trigger', () => {
    it.each([200, 320])('%ipx 的栏里：长文案不把按钮撑出那一栏', (w) => {
      const doc = mount(375, `
        <div style="inline-size: ${w}px" id="host">
          <button data-scope="download-trigger" data-part="root" id="root"><span id="label">导出当前筛选条件下的全部记录（CSV）</span></button>
        </div>`)
      const host = pick(doc, '#host')
      const root = pick(doc, '#root')

      expect(root.getBoundingClientRect().width).toBeLessThanOrEqual(host.clientWidth)
      expect(host.scrollWidth).toBe(host.clientWidth)
      expect(pageOverflow(doc)).toBe(0)
    })

    it('裁的是文案末尾，开头仍排在按钮的行首内衬处', () => {
      const doc = mount(375, `
        <div style="inline-size: 200px">
          <button data-scope="download-trigger" data-part="root" id="root"><span id="label">导出当前筛选条件下的全部记录（CSV）</span></button>
        </div>`)
      const root = pick(doc, '#root')
      const label = pick(doc, '#label')
      const style = doc.defaultView!.getComputedStyle(root)
      const inset = Number.parseFloat(style.borderLeftWidth) + Number.parseFloat(style.paddingLeft)

      expect(label.getBoundingClientRect().left - root.getBoundingClientRect().left).toBeCloseTo(inset, 1)
    })
  })
})
