import type { Cleanup } from '@xihan-ui/core'
import { createPerDocumentRegistry, DATA_FOCUS_GUARD } from '@xihan-ui/core'

interface GuardState {
  count: number
  start?: HTMLSpanElement
  end?: HTMLSpanElement
}

const registry = createPerDocumentRegistry<GuardState>(() => ({ count: 0 }))

function createGuard(doc: Document): HTMLSpanElement {
  const el = doc.createElement('span')
  el.setAttribute(DATA_FOCUS_GUARD, '')
  // 可 Tab 到达但对屏幕阅读器隐藏，避免读出一个空白可聚焦项
  el.setAttribute('aria-hidden', 'true')
  el.tabIndex = 0
  el.style.cssText = 'outline:none;opacity:0;position:fixed;pointer-events:none'
  return el
}

/**
 * 在 body 首尾各插一个可聚焦哨兵，兜住 Tab 走出文档时的 focusin/focusout。
 * 全局共享一对 + 引用计数；只在边界不变式被破坏时才写 DOM。
 */
export function acquireFocusGuards(doc: Document): Cleanup {
  const state = registry.get(doc)
  if (state.count === 0) {
    state.start = createGuard(doc)
    state.end = createGuard(doc)
    doc.body.insertAdjacentElement('afterbegin', state.start)
    doc.body.insertAdjacentElement('beforeend', state.end)
  }
  else {
    if (state.start && doc.body.firstElementChild !== state.start)
      doc.body.insertAdjacentElement('afterbegin', state.start)
    if (state.end && doc.body.lastElementChild !== state.end)
      doc.body.insertAdjacentElement('beforeend', state.end)
  }
  state.count += 1
  let released = false
  return () => {
    if (released)
      return
    released = true
    state.count -= 1
    if (state.count === 0) {
      state.start?.remove()
      state.end?.remove()
      state.start = undefined
      state.end = undefined
    }
  }
}
