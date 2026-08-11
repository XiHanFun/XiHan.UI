// hideOutside：给所有非目标、非豁免的 body 直接子元素设 inert，使背景失活。
import type { Scope } from '../../scope'
import type { Cleanup } from '../../types'
import { DATA_INERT_EXEMPT } from '../../constants'

/** 默认豁免选择器；三个 n-* 是迁移期共存的 naive 容器，删掉它们会把那些浮层一并 inert 掉。 */
const DEFAULT_EXEMPT_SELECTORS = [
  `[${DATA_INERT_EXEMPT}]`,
  '.n-modal-container',
  '.n-message-container',
  '.n-notification-container',
]

export interface HideOutsideOptions {
  /** 追加豁免选择器（经 RuntimeConfig 扩展）。 */
  exemptSelectors?: string[]
}

/**
 * 把 body 下除 targets、豁免节点外的直接子元素设为 inert。
 * @param getTargets 每次施加 inert 时求值一次；必须包含所有 branch 节点与栈中位于自己之上
 * 的层，漏传会误伤 portal 出去的嵌套浮层。晚于本次调用才挂载的节点也要能被算进来，
 * 所以取的是函数而不是数组。
 * @returns Cleanup：还原被改动的 inert 状态并停止监控。
 */
export function hideOutside(getTargets: () => Element[], scope: Scope, options: HideOutsideOptions = {}): Cleanup {
  const doc = scope.getDoc()
  const body = doc.body
  const exemptSelector = [...DEFAULT_EXEMPT_SELECTORS, ...(options.exemptSelectors ?? [])].join(',')

  // 记录被改动元素的原始 inert 值，dispose 时还原。
  const touched = new Map<HTMLElement, boolean>()

  const isTargetContainer = (el: Element): boolean =>
    getTargets().some(t => el === t || el.contains(t) || t.contains(el))

  const applyTo = (el: Element): void => {
    if (!(el instanceof HTMLElement))
      return
    if (touched.has(el))
      return
    if (isTargetContainer(el))
      return
    if (el.matches(exemptSelector))
      return
    touched.set(el, el.inert)
    el.inert = true
  }

  for (const child of Array.from(body.children)) applyTo(child)

  // 监控后续新增到 body 的节点。
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of Array.from(record.addedNodes)) {
        if (node instanceof Element)
          applyTo(node)
      }
    }
  })
  observer.observe(body, { childList: true })

  return () => {
    observer.disconnect()
    for (const [el, prev] of touched) el.inert = prev
    touched.clear()
  }
}
