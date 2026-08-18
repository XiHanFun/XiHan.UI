// hideOutside：给所有非目标、非豁免的 body 直接子元素设 inert，使背景失活。
import type { Scope } from '../../scope'
import type { Cleanup } from '../../types'
import { DATA_INERT_EXEMPT } from '../../constants'
import { isHTMLElement } from '../../guards'
import { getLayerRegistry } from '../../structure/layer-registry'
import { getInertRegistry } from './inert-registry'

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
 * inert 经 per-document 引用计数表施加，多层同时罩住同一元素时按计数叠加，
 * 最后一次撤销才写回该元素被接管前的原始值，因此各层的拆除顺序不影响还原结果。
 * @param getTargets 每次重算时求值一次；必须包含所有 branch 节点与栈中位于自己之上
 * 的层，漏传会误伤 portal 出去的嵌套浮层。晚于本次调用才挂载的节点也要能被算进来，
 * 所以取的是函数而不是数组。
 * @returns Cleanup：撤销本次施加的全部 inert 要求并停止监控，重复调用只生效一次。
 */
export function hideOutside(getTargets: () => Element[], scope: Scope, options: HideOutsideOptions = {}): Cleanup {
  const doc = scope.getDoc()
  const body = doc.body
  const inert = getInertRegistry(doc)
  const exemptSelector = [...DEFAULT_EXEMPT_SELECTORS, ...(options.exemptSelectors ?? [])].join(',')

  // 本次调用当前持有 inert 要求的元素。
  const held = new Set<HTMLElement>()

  const shouldHide = (el: HTMLElement, targets: readonly Element[]): boolean => {
    if (targets.some(t => el === t || el.contains(t) || t.contains(el)))
      return false
    return !el.matches(exemptSelector)
  }

  const acquire = (el: HTMLElement): void => {
    if (held.has(el))
      return
    held.add(el)
    inert.acquire(el)
  }

  const release = (el: HTMLElement): void => {
    if (!held.delete(el))
      return
    inert.release(el)
  }

  /** 按当前 targets 重算应罩住的集合，与已持有的集合做差分，多退少补。 */
  const sync = (): void => {
    const targets = getTargets()
    const next = new Set<HTMLElement>()
    for (const child of Array.from(body.children)) {
      if (isHTMLElement(child) && shouldHide(child, targets))
        next.add(child)
    }
    for (const el of Array.from(held)) {
      if (!next.has(el))
        release(el)
    }
    for (const el of next) acquire(el)
  }

  sync()

  // body 增删子节点、层栈变动都重算一次，让乱序拆除后的结果收敛。
  const observer = new MutationObserver(() => sync())
  observer.observe(body, { childList: true })
  const unsubscribe = getLayerRegistry(doc).subscribe(() => sync())

  let disposed = false
  return () => {
    if (disposed)
      return
    disposed = true
    observer.disconnect()
    unsubscribe()
    for (const el of Array.from(held)) release(el)
  }
}
