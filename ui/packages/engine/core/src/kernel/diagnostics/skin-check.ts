// 皮肤在场探测：页面上出现了某个组件、而它那份皮肤没被引入时报一条诊断。
//
// 按需引皮肤时漏掉一行是静默的——组件的 data-scope / data-part 照常都在、别的皮肤也确实加载了，
// 只有这一个渲染成裸元素。每份组件皮肤在 [data-scope='X'] 上落了一个 --xh-X-skin 标记，
// 取不到就说明那份 CSS 不在场。
import type { Cleanup } from '../types'
import { isDocument, isElement } from '../guards'
import { createPerDocumentRegistry } from '../structure/per-document-registry'
import { reportDiagnostic } from './channel'
import { DIAGNOSTIC_CODES } from './codes'

/** 每个 scope 只探一次：探测要读计算样式，逐实例探会变成真实的强制样式重算。 */
const probedByDocument = createPerDocumentRegistry<Set<string>>(() => new Set<string>())

function probe(element: Element, win: Window): void {
  const scope = element.getAttribute('data-scope')
  const probed = probedByDocument.get(element.ownerDocument)
  if (scope === null || probed.has(scope))
    return

  const marker = win.getComputedStyle(element).getPropertyValue(`--xh-${scope}-skin`).trim()
  probed.add(scope)
  if (marker !== '')
    return

  reportDiagnostic({
    code: DIAGNOSTIC_CODES.stylesMissingSkin,
    level: 'warn',
    scope,
    message: `[styles] ${scope} 的皮肤没引：import '@xihan-ui/styles/${scope}.css'，或改引全量的 '@xihan-ui/styles'`,
  })
}

export interface SkinCheckOptions {
  /** 观察哪棵树，默认整篇文档。 */
  root?: ParentNode & Node
}

/**
 * 启动皮肤在场探测，返回停止函数。只该在开发模式下调用。
 *
 * 先扫一遍已有节点，再用所属 Window 的 MutationObserver 接住后续进来的。
 */
export function startSkinCheck(options: SkinCheckOptions = {}): Cleanup {
  if (!options.root && typeof document === 'undefined')
    return () => undefined

  const root = options.root ?? document
  const doc = isDocument(root) ? root : root.ownerDocument
  const view = doc?.defaultView
  if (!view)
    throw new Error('[xh] startSkinCheck 的 root 必须属于带活动 Window 的 Document')
  if (typeof view?.MutationObserver !== 'function')
    throw new Error('[xh] startSkinCheck 需要 root 所属 Window 提供 MutationObserver')

  for (const element of root.querySelectorAll('[data-scope]')) probe(element, view)

  const observer = new view.MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!isElement(node))
          continue
        if (node.hasAttribute('data-scope'))
          probe(node, view)
        for (const nested of node.querySelectorAll('[data-scope]')) probe(nested, view)
      }
    }
  })
  observer.observe(root, { childList: true, subtree: true })
  return () => observer.disconnect()
}
