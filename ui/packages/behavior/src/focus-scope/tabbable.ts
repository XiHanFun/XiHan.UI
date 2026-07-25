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

/** 去掉 <a>：文档里第一个可聚焦元素常是链接，作为初始焦点体验差。 */
export function removeLinks(els: HTMLElement[]): HTMLElement[] {
  return els.filter(el => el.tagName !== 'A')
}

export interface FocusOptions {
  select?: boolean
}

/** 安全聚焦：不滚动；对输入类可选中文本。已聚焦则跳过。 */
export function focusSafely(el: HTMLElement | null | undefined, opts: FocusOptions = {}): void {
  if (!el || el === el.ownerDocument.activeElement)
    return
  el.focus({ preventScroll: true })
  if (opts.select && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement))
    el.select()
}

/** 依次尝试聚焦，成功（变成 activeElement）即返回 true。 */
export function focusFirst(els: HTMLElement[], opts: FocusOptions = {}): boolean {
  for (const el of els) {
    focusSafely(el, opts)
    if (el.ownerDocument.activeElement === el)
      return true
  }
  return false
}
