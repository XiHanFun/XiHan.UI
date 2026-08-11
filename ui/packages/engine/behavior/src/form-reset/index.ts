import type { Disposable } from '@xihan-ui/kernel'
import { isDocument, isShadowRoot } from '@xihan-ui/kernel'

export interface FormResetBridgeOptions {
  /** 组件在文档里的锚点，每次用时现取：重渲会换掉它。 */
  readonly getNode: () => Node | null | undefined
  /** 所属表单被重置、且重置的默认行为没被拦下时回调。 */
  readonly onReset: () => void
}

const INERT: Disposable = { disposed: true, dispose: () => {} }

function elementOf(node: Node | null | undefined): Element | null {
  if (!node)
    return null
  return node.nodeType === 1 ? (node as Element) : node.parentElement
}

/**
 * 监听组件所属表单的重置，翻成一次回调。
 *
 * 监听挂在锚点的 root node 上而不是那个 form 上：form 会被条件渲染换掉、组件也会被搬走，
 * 挂在 form 身上的监听器随之指错人；root node 在组件挂载期间不变，归属在事件那一刻现算。
 * 从锚点取 root 而不是从 scope 取：多数组件的 scope 以 null 建，getRootNode 会兜底回全局 document，
 * 组件长在影子树里时就监听在了一个永远收不到那条事件的节点上。
 */
export function createFormResetBridge(options: FormResetBridgeOptions): Disposable {
  const root = elementOf(options.getNode())?.getRootNode?.()
  if (!root || !(isDocument(root) || isShadowRoot(root)))
    return INERT
  const target = root as Document | ShadowRoot

  const handler = (event: Event): void => {
    const form = event.target
    if (!(form instanceof HTMLFormElement))
      return
    // 比对 closest 的结果而不是 form.contains：appendChild 造得出嵌套表单，
    // 外层重置不该误伤内层表单里的组件
    if (elementOf(options.getNode())?.closest('form') !== form)
      return
    // 同步读：会拦重置的那一方挂在 form 元素自己身上（目标期），必定早于这里的冒泡期监听。
    // 拦下的重置里作者自己的原生控件也没还原，组件单方面还原会拼出半份默认值
    if (event.defaultPrevented)
      return
    options.onReset()
  }

  target.addEventListener('reset', handler)
  let disposed = false
  return {
    get disposed() {
      return disposed
    },
    dispose: () => {
      if (disposed)
        return
      disposed = true
      target.removeEventListener('reset', handler)
    },
  }
}
