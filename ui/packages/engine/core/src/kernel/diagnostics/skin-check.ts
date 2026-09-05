// 皮肤在场探测：页面上出现了某个组件、而它那份皮肤没被引入时报一条诊断。
//
// 按需引皮肤时漏掉一行是静默的——组件的 data-scope / data-part 照常都在、别的皮肤也确实加载了，
// 只有这一个渲染成裸元素。每份组件皮肤在 [data-scope='X'] 上落了一个 --xh-X-skin 标记，
// 取不到就说明那份 CSS 不在场。
import type { Cleanup } from '../types'
import { reportDiagnostic } from './channel'
import { DIAGNOSTIC_CODES } from './codes'

/** 每个 scope 只探一次：探测要读计算样式，逐实例探会变成真实的强制样式重算。 */
const probed = new Set<string>()

function probe(element: Element): void {
  const scope = element.getAttribute('data-scope')
  if (scope === null || probed.has(scope))
    return
  probed.add(scope)

  const marker = getComputedStyle(element).getPropertyValue(`--xh-${scope}-skin`).trim()
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
 * 先扫一遍已有节点，再用 MutationObserver 接住后续进来的；没有 MutationObserver 的环境只扫这一遍。
 */
export function startSkinCheck(options: SkinCheckOptions = {}): Cleanup {
  if (typeof document === 'undefined')
    return () => undefined

  const root = options.root ?? document
  for (const element of root.querySelectorAll('[data-scope]')) probe(element)

  // 构造器从被观测节点自己的文档取：跨 iframe 时全局的那个来自另一个 window，
  // 拿它去观测别的文档里的节点，回调一次都不会来。
  // root 可能就是 Document（它自己的 ownerDocument 是 null），所以两种都认
  const doc = root.nodeType === 9 ? (root as unknown as Document) : root.ownerDocument
  const view = doc?.defaultView
  if (typeof view?.MutationObserver !== 'function')
    return () => undefined

  const observer = new view.MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element))
          continue
        if (node.hasAttribute('data-scope'))
          probe(node)
        for (const nested of node.querySelectorAll('[data-scope]')) probe(nested)
      }
    }
  })
  observer.observe(root, { childList: true, subtree: true })
  return () => observer.disconnect()
}
