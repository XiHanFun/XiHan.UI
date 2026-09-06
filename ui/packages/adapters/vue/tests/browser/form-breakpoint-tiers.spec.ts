// 表单网格的逐档列数：视口每宽到一档就换成那一档的列数。
//
// 换档由 @media (min-width) 决定，测试宿主的视口固定在一个宽度上，四档一个都不会命中。
// 这里改用内嵌 iframe：媒体查询按 iframe 自己的视口求值，宽度由这边的 width 说了算，
// 与宿主视口无关。皮肤与令牌以 <style> 注入主文档，克隆一份进 iframe 的 head 才生效。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let frame: HTMLIFrameElement | null = null

/** 在给定宽度的视口里挂一个表单根，返回它算出来的列数。 */
function columnsAt(width: number, attrs: string): number {
  frame?.remove()
  frame = document.createElement('iframe')
  frame.style.cssText = `width: ${width}px; height: 200px; border: 0`
  document.body.append(frame)

  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  for (const node of document.querySelectorAll('style, link[rel="stylesheet"]'))
    doc.head.append(node.cloneNode(true))
  doc.body.style.margin = '0'
  doc.body.innerHTML = `<div data-scope="form" data-part="root" data-layout="grid" ${attrs}></div>`

  const root = doc.querySelector('[data-part="root"]')
  if (!root)
    throw new Error('没有挂上表单根')
  const template = doc.defaultView!.getComputedStyle(root).gridTemplateColumns
  return template.split(/\s+/).filter(Boolean).length
}

afterEach(() => {
  frame?.remove()
  frame = null
})

describe('逐档列数', () => {
  // 四档的下边界各取一个刚过线的宽度，再各取一个刚不到线的
  const TIERS: [string, number, number][] = [
    ['sm', 640, 2],
    ['md', 768, 3],
    ['lg', 1024, 4],
    ['xl', 1280, 2],
  ]

  it.each(TIERS)('%s 档自 %ipx 起接管', (tier, min, cols) => {
    const attrs = `data-columns="1" data-columns-${tier}="${cols}"`
    expect(columnsAt(min - 1, attrs)).toBe(1)
    expect(columnsAt(min, attrs)).toBe(cols)
  })

  it('没写的档沿用比它窄的那一档', () => {
    const attrs = 'data-columns="1" data-columns-sm="2"'
    expect(columnsAt(639, attrs)).toBe(1)
    expect(columnsAt(640, attrs)).toBe(2)
    expect(columnsAt(900, attrs)).toBe(2)
    expect(columnsAt(1400, attrs)).toBe(2)
  })

  it('宽档可以收回一列', () => {
    const attrs = 'data-columns="3" data-columns-lg="1"'
    expect(columnsAt(500, attrs)).toBe(3)
    expect(columnsAt(1024, attrs)).toBe(1)
  })

  it('同时命中好几档时由源码序里最宽的那一档生效', () => {
    const attrs = 'data-columns-md="2" data-columns-xl="4"'
    expect(columnsAt(768, attrs)).toBe(2)
    expect(columnsAt(1280, attrs)).toBe(4)
  })

  it('一个档都没写就是一列', () => {
    expect(columnsAt(1400, '')).toBe(1)
  })
})
