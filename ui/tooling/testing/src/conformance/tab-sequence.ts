import { getTabbables } from '@xihan-ui/core'

/**
 * 自身或祖先被设为 inert。属性是浏览器与 connect 写的形态；jsdom 不实现 inert，
 * Core 的引用计数表 `el.inert = true` 落成 expando，所以两种形态都认。
 */
function isInert(el: Element): boolean {
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (node.hasAttribute('inert') || (node as HTMLElement).inert === true)
      return true
  }
  return false
}

/**
 * 文档的 Tab 序：Core 的 getTabbables 已排掉 tabindex=-1、disabled、hidden / display:none /
 * visibility:hidden，这里再排掉 inert 子树。
 */
export function documentTabbables(doc: Document): HTMLElement[] {
  return getTabbables(doc.body).filter(el => !isInert(el)) as HTMLElement[]
}

/**
 * Tab 的平台默认动作：从 `from` 起按文档序把焦点移到下一个（backward 为上一个）可 tab 元素，
 * 两端没有下一个就出界到 body。
 *
 * `from` 只当作文档位置用，不要求它此刻还可聚焦：keydown 处理器可能已经把它藏起来
 * （浮层收起）、摘出 Tab 序或搬到别处，浏览器照样从它所在的位置往下数。它已经离开文档时
 * 没有位置可数，按出界处理。返回落点，出界为 null。
 */
export function moveFocusInTabSequence(doc: Document, from: Element, backward: boolean): HTMLElement | null {
  const candidates = documentTabbables(doc).filter(el => el !== from)
  let target: HTMLElement | undefined
  if (from === doc.body || from === doc.documentElement) {
    // 没有焦点元素时从文档两端起步：Tab 落第一个，Shift+Tab 落最后一个
    target = backward ? candidates.at(-1) : candidates[0]
  }
  else if (from.isConnected) {
    const follows = (el: Element): boolean => (from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
    target = backward ? candidates.filter(el => !follows(el)).at(-1) : candidates.find(follows)
  }
  if (target) {
    target.focus()
    return target
  }
  // 出界：浏览器把焦点交回文档，activeElement 回到 body
  const active = doc.activeElement
  if (active && active !== doc.body)
    (active as HTMLElement).blur?.()
  return null
}
