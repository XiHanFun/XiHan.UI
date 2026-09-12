// 在指定宽度的视口里量东西的公共装置。
//
// 换档由 @media (min-width) 决定，而测试宿主的视口是固定的一个宽度，改不动。
// 这里挂一个内嵌 iframe：媒体查询按 iframe 自己的视口求值，宽度由这边的 width 说了算。
// 皮肤与令牌以 <style> 注入主文档，克隆一份进 iframe 的 head 才生效。

let frame: HTMLIFrameElement | null = null

/** 开一个给定视口宽度的 iframe，把皮肤搬进去，返回它的文档。 */
export function openFrame(width: number, height = 1400): Document {
  closeFrame()
  frame = document.createElement('iframe')
  frame.style.cssText = `width: ${width}px; height: ${height}px; border: 0`
  document.body.append(frame)

  const doc = frame.contentDocument
  if (!doc)
    throw new Error('iframe 没有文档')
  for (const node of document.querySelectorAll('style, link[rel="stylesheet"]'))
    doc.head.append(node.cloneNode(true))
  // 竖向滚动条会从视口宽里扣掉一截，量出来的就不是 width 那一档了
  doc.documentElement.style.overflow = 'hidden'
  doc.body.style.margin = '0'
  return doc
}

/** 收掉当前这个 iframe。 */
export function closeFrame(): void {
  frame?.remove()
  frame = null
}

/** 在给定视口里挂一段标记，返回装它的块级外层。 */
export function frameHost(width: number, markup = ''): HTMLElement {
  const doc = openFrame(width)
  const host = doc.createElement('div')
  host.innerHTML = markup
  doc.body.append(host)
  return host
}

/** 取计算样式：元素在 iframe 里，要用它自己那个文档的视图。 */
export function styleOf(el: Element, pseudo?: string): CSSStyleDeclaration {
  const view = el.ownerDocument.defaultView
  if (!view)
    throw new Error('元素不在任何文档里')
  return view.getComputedStyle(el, pseudo)
}
