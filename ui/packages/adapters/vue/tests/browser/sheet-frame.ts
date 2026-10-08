// 有层产物 index.css 与无层产物 index.unlayered.css 分别量的公共装置。
//
// 同一份 Vue 渲染出的标记序列化后，装进只引其中一份产物的 iframe，量几何与计算样式。

import type { App, VNode } from 'vue'
import layeredUrl from '@xihan-ui/styles/index.css?url'
import unlayeredUrl from '@xihan-ui/styles/index.unlayered.css?url'
import tokensUrl from '@xihan-ui/tokens/tokens.css?url'
import { expect } from 'vitest'
import { createApp, nextTick } from 'vue'

const SHEETS = {
  layered: layeredUrl,
  unlayered: unlayeredUrl,
} as const

export type Sheet = keyof typeof SHEETS

export const SHEET_NAMES = Object.keys(SHEETS) as Sheet[]

let frame: HTMLIFrameElement | null = null

/** 用 Vue 挂出带 connect 全部属性的真实 DOM，序列化成静态标记后卸载。 */
export async function serialize(render: () => VNode): Promise<string> {
  const host = document.createElement('div')
  document.body.append(host)
  const app: App = createApp({ render })
  app.mount(host)
  await nextTick()
  await nextTick()
  const markup = host.innerHTML
  app.unmount()
  host.remove()
  return markup
}

/** 把标记装进只引一份产物的 960px 宽 iframe，样式表装载完再交出文档。 */
export async function stageSheet(markup: string, sheet: Sheet): Promise<Document> {
  closeSheetFrame()
  frame = document.createElement('iframe')
  frame.style.cssText = 'width: 960px; height: 600px; border: 0'
  document.body.append(frame)
  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  doc.documentElement.setAttribute('data-theme', 'light')
  doc.documentElement.setAttribute('dir', 'ltr')
  doc.documentElement.setAttribute('lang', 'zh-CN')

  const loaded: Promise<void>[] = []
  for (const href of [tokensUrl, SHEETS[sheet]]) {
    const link = doc.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    loaded.push(new Promise((resolve, reject) => {
      link.addEventListener('load', () => resolve())
      link.addEventListener('error', () => reject(new Error(`样式表装不上：${href}`)))
    }))
    doc.head.append(link)
  }
  const still = doc.createElement('style')
  still.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'
  doc.head.append(still)
  doc.body.style.margin = '0'
  doc.body.innerHTML = markup
  await Promise.all(loaded)
  return doc
}

/** 收掉当前这个 iframe。 */
export function closeSheetFrame(): void {
  frame?.remove()
  frame = null
}

/** 取文档里某个 scope / part 的全部节点。 */
export function sheetParts(doc: Document, scope: string, part: string): HTMLElement[] {
  return [...doc.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${part}"]`)]
}

/** 元素内容盒的行向起止（扣掉边框与内距）。 */
export function contentBox(el: HTMLElement): { start: number, end: number } {
  const rect = el.getBoundingClientRect()
  const style = el.ownerDocument.defaultView!.getComputedStyle(el)
  return {
    start: rect.left + Number.parseFloat(style.borderLeftWidth) + Number.parseFloat(style.paddingLeft),
    end: rect.right - Number.parseFloat(style.borderRightWidth) - Number.parseFloat(style.paddingRight),
  }
}

/** 元素内文字逐行的盒子，按排版顺序。 */
export function textLines(el: HTMLElement): DOMRect[] {
  const range = el.ownerDocument.createRange()
  range.selectNodeContents(el)
  return [...range.getClientRects()].filter(rect => rect.width > 0)
}

/** 文字逐行居中：每一行的中点落在内容盒的中点上。 */
export function expectTextCentered(el: HTMLElement): void {
  const box = contentBox(el)
  const middle = (box.start + box.end) / 2
  const lines = textLines(el)
  expect(lines.length, `「${el.textContent}」里没有文字`).toBeGreaterThan(0)
  for (const [index, line] of lines.entries())
    expect(Math.abs(line.left + line.width / 2 - middle), `「${el.textContent}」第 ${index + 1} 行没有居中`).toBeLessThanOrEqual(1)
}
