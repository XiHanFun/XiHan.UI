// 有层产物 index.css 与无层产物 index.unlayered.css 分别量的公共装置。
//
// 渲染出的标记序列化后，装进只引其中一份产物的 iframe，量几何与计算样式。

import layeredUrl from '@xihan-ui/styles/index.css?url'
import unlayeredUrl from '@xihan-ui/styles/index.unlayered.css?url'
import tokensUrl from '@xihan-ui/tokens/tokens.css?url'

const SHEETS = {
  layered: layeredUrl,
  unlayered: unlayeredUrl,
} as const

export type Sheet = keyof typeof SHEETS

export const SHEET_NAMES = Object.keys(SHEETS) as Sheet[]

let frame: HTMLIFrameElement | null = null

/** 把标记装进只引一份产物的 960px 宽 iframe（标准模式），样式表装载完再交出文档。 */
export async function stageSheet(markup: string, sheet: Sheet): Promise<Document> {
  closeSheetFrame()
  frame = document.createElement('iframe')
  frame.style.cssText = 'width: 960px; height: 600px; border: 0'
  document.body.append(frame)
  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  // 空白 iframe 的文档没有 doctype，跑在怪异模式里：只放图片或行内块的行不算支柱，行高撑不起行盒，与真实页面不同
  doc.open()
  doc.write('<!doctype html><html><head></head><body></body></html>')
  doc.close()
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
