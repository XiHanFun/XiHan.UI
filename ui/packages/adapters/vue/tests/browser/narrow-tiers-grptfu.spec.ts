// 窄档两件：file-upload 条目在窄容器里换行、table 根的高度上限由视口收口。
//
// 条目那件不写任何查询，挂一个定宽 div 就能量；表格那件量的是视口高度，
// 宿主视口改不动，只能内嵌一个自己说了算的 iframe。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let frame: HTMLIFrameElement | null = null

interface ItemMetrics {
  /** 条目自身宽度 */
  width: number
  /** 内容宽度：超过 width 就是横向溢出 */
  scrollWidth: number
  /** 各部件占了几行 */
  lines: number
  /** 文件名可用宽度 */
  nameWidth: number
  /** 文件名与预览图是否同一行 */
  nameSharesPreviewLine: boolean
}

/** 在给定宽度的容器里挂一个上传条目，量它的排布。 */
function itemAt(width: number, state = 'uploading'): ItemMetrics {
  host?.remove()
  host = document.createElement('div')
  host.style.cssText = `width: ${width}px`
  host.innerHTML = `
    <div data-scope="file-upload" data-part="root">
      <div data-scope="file-upload" data-part="list">
        <div data-scope="file-upload" data-part="item" data-state="${state}">
          <span data-scope="file-upload" data-part="item-preview" data-file-type="image/png"></span>
          <span data-scope="file-upload" data-part="item-name">annual-report-final-v3.pdf</span>
          <span data-scope="file-upload" data-part="item-size-text">12.4 MB</span>
          <div data-scope="file-upload" data-part="item-progress" data-state="uploading"></div>
          <button data-scope="file-upload" data-part="item-delete-trigger"></button>
        </div>
      </div>
    </div>`
  document.body.append(host)

  const item = host.querySelector('[data-part="item"]') as HTMLElement
  const preview = host.querySelector('[data-part="item-preview"]') as HTMLElement
  const name = host.querySelector('[data-part="item-name"]') as HTMLElement
  const kids = [...item.children] as HTMLElement[]
  // 同一行的部件高矮不一、各自居中对齐，顶边并不齐；对齐的是竖直中点，用它认行
  const line = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    return Math.round(r.top + r.height / 2)
  }

  return {
    width: item.getBoundingClientRect().width,
    scrollWidth: item.scrollWidth,
    lines: new Set(kids.map(line)).size,
    nameWidth: name.getBoundingClientRect().width,
    nameSharesPreviewLine: line(name) === line(preview),
  }
}

/** 在给定高度的视口里挂一个表格根，返回它算出来的高度上限（px）。 */
function tableMaxHeightIn(viewportHeight: number): number {
  frame?.remove()
  frame = document.createElement('iframe')
  frame.style.cssText = `width: 640px; height: ${viewportHeight}px; border: 0`
  document.body.append(frame)

  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  for (const node of document.querySelectorAll('style, link[rel="stylesheet"]'))
    doc.head.append(node.cloneNode(true))
  doc.body.style.margin = '0'
  doc.body.innerHTML = `<div data-scope="table" data-part="root"></div>`

  const root = doc.querySelector('[data-part="root"]')
  if (!root)
    throw new Error('没有挂上表格根')
  return Number.parseFloat(doc.defaultView!.getComputedStyle(root).maxBlockSize)
}

afterEach(() => {
  host?.remove()
  host = null
  frame?.remove()
  frame = null
})

describe('上传条目的窄档换行', () => {
  // 令牌 --xh-control-min-w = 12rem：文件名缩到这里就该让后面的部件换行
  const NAME_FLOOR = 192

  it.each([768, 480])('%ipx 容器仍是一行', (width) => {
    const m = itemAt(width)
    expect(m.lines).toBe(1)
    expect(m.nameWidth).toBeGreaterThan(NAME_FLOOR)
  })

  it.each([375, 320, 280])('%ipx 容器里文件名不再被压到下限以下', (width) => {
    const m = itemAt(width)
    expect(m.lines).toBeGreaterThan(1)
    expect(m.nameWidth).toBeGreaterThanOrEqual(NAME_FLOOR)
    expect(m.nameSharesPreviewLine).toBe(true)
  })

  // 换行之前，进度条与删除钮那几个定宽件把文件名一路挤到零宽；
  // 再窄一档它们连自己都放不下，整行横向溢出
  it.each([768, 480, 375, 320, 280, 240, 220, 200, 180])('%ipx 容器不横向溢出', (width) => {
    for (const state of ['uploading', 'error', 'done']) {
      const m = itemAt(width, state)
      expect(m.scrollWidth).toBeLessThanOrEqual(Math.ceil(m.width))
      expect(m.nameWidth).toBeGreaterThan(0)
    }
  })
})

describe('表格高度上限随视口收口', () => {
  // 令牌 --xh-viewport-h-lg = 24rem
  const TOKEN_MAX = 384

  it('视口比这个定值高时，上限就是定值', () => {
    expect(tableMaxHeightIn(600)).toBeCloseTo(TOKEN_MAX, 0)
  })

  // 横屏手机的可视高度在 375 上下，比定值矮：不收口的话表格自己就比屏幕高，
  // 它的内部滚动与吸顶表头都失去意义
  it.each([375, 320])('视口只有 %ipx 高时，上限收到视口', (height) => {
    expect(tableMaxHeightIn(height)).toBeCloseTo(height, 0)
  })
})
