import { isDocument, isHTMLElement, isShadowRoot } from '../../kernel/guards'

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
].join(',')

function isVisible(el: HTMLElement): boolean {
  const win = el.ownerDocument.defaultView
  let node: HTMLElement | null = el
  while (node) {
    if (node.hidden)
      return false
    const style = win?.getComputedStyle(node)
    if (style && (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse'))
      return false
    node = node.parentElement
  }
  return true
}

/** 容器内按 DOM 顺序排列的可 tab 元素。 */
export function getTabbables(container: HTMLElement): HTMLElement[] {
  const els = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
  return els.filter(el => el.tabIndex >= 0 && isVisible(el))
}

/** 过滤掉 <a> 元素。 */
export function removeLinks(els: HTMLElement[]): HTMLElement[] {
  return els.filter(el => el.tagName !== 'A')
}

export interface FocusOptions {
  select?: boolean
}

function activeElementInRoot(el: HTMLElement): Element | null {
  const root = el.getRootNode()
  return isDocument(root) || isShadowRoot(root)
    ? root.activeElement
    : el.ownerDocument.activeElement
}

function isSelectableTextControl(el: HTMLElement): el is HTMLInputElement | HTMLTextAreaElement {
  return isHTMLElement(el)
    && el.namespaceURI === HTML_NAMESPACE
    && (el.localName === 'input' || el.localName === 'textarea')
}

/** 安全聚焦：不滚动；对输入类可选中文本。已聚焦则跳过。 */
export function focusSafely(el: HTMLElement | null | undefined, opts: FocusOptions = {}): void {
  if (!el || el === activeElementInRoot(el))
    return
  el.focus({ preventScroll: true })
  if (opts.select && isSelectableTextControl(el))
    el.select()
}

/** 依次尝试聚焦，成功（变成 activeElement）即返回 true。 */
export function focusFirst(els: HTMLElement[], opts: FocusOptions = {}): boolean {
  for (const el of els) {
    focusSafely(el, opts)
    if (activeElementInRoot(el) === el)
      return true
  }
  return false
}
