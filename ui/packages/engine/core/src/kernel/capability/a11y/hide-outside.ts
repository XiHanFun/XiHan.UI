// hideOutside：沿每个 target 到 body 的祖先链逐层把其余兄弟设 inert，使背景失活。
import type { RuntimeConfig } from '../../runtime-config'
import type { Cleanup } from '../../types'
import { DATA_INERT_EXEMPT } from '../../constants'
import { isElement, isHTMLElement } from '../../guards'
import { getInertRegistry } from './inert-registry'

/** 默认豁免选择器。 */
const DEFAULT_EXEMPT_SELECTORS = [`[${DATA_INERT_EXEMPT}]`]

export interface HideOutsideOptions {
  /** 追加豁免选择器（经 RuntimeConfig 扩展）。 */
  exemptSelectors?: string[]
}

/**
 * 从 body 沿各 target 的祖先链往下走，把链上每一层里既不在链上、也不豁免的兄弟设为 inert。
 * inert 经 per-document 引用计数表施加，多层同时罩住同一元素时按计数叠加，
 * 最后一次撤销才写回该元素被接管前的原始值，因此各层的拆除顺序不影响还原结果。
 * @param getTargets 每次重算时求值一次；必须包含所有 branch 节点与栈中位于自己之上
 * 的层，漏传会误伤 portal 出去的嵌套浮层。晚于本次调用才挂载的节点也要能被算进来，
 * 所以取的是函数而不是数组。
 * @param config 提供同一运行时的 Scope 与 LayerRegistry；层栈变化会触发重算。
 * @param options 背景失活选项。
 * @returns Cleanup：撤销本次施加的全部 inert 要求并停止监控，重复调用只生效一次。
 */
export function hideOutside(
  getTargets: () => Element[],
  config: Pick<RuntimeConfig, 'scope' | 'layerRegistry'>,
  options: HideOutsideOptions = {},
): Cleanup {
  const { scope, layerRegistry } = config
  const doc = scope.getDoc()
  if (layerRegistry.ownerDocument !== doc)
    throw new Error('[xh] hideOutside 的 layerRegistry 必须属于 Scope 的 Document')
  const win = scope.getWin()
  const body = doc.body
  if (!body)
    throw new Error('[xh] hideOutside 的 Document 没有 body')
  const MutationObserver = win.MutationObserver
  if (typeof MutationObserver !== 'function')
    throw new Error('[xh] hideOutside 所属 Window 不支持 MutationObserver')
  const inert = getInertRegistry(doc)
  const exemptSelector = [...DEFAULT_EXEMPT_SELECTORS, ...(options.exemptSelectors ?? [])].join(',')

  // 本次调用当前持有 inert 要求的元素。
  const held = new Set<HTMLElement>()
  // 上次重算向下走过的容器；只有它们的直接子节点增删才会改变结果。
  let walked = new Set<Node>()

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

  /** 文档里当前带豁免标记的元素。 */
  const exemptNodes = (): Element[] =>
    Array.from(body.querySelectorAll(exemptSelector))

  /** 各节点到 body 的祖先链的并集。 */
  const chainOf = (nodes: readonly Element[]): Set<Element> => {
    const chain = new Set<Element>()
    for (const node of nodes) {
      let cursor: Element | null = node
      while (cursor && !chain.has(cursor)) {
        chain.add(cursor)
        if (cursor === body)
          break
        cursor = cursor.parentElement
      }
    }
    return chain
  }

  /** 按当前 targets 重算应罩住的集合，与已持有的集合做差分，多退少补。 */
  const sync = (): void => {
    const targets = getTargets()
    if (targets.some(target => !isElement(target) || target.ownerDocument !== doc))
      throw new Error('[xh] hideOutside 的 target 必须属于 Scope 的 Document')
    // 豁免节点与 target 一样要留出通路：它们的祖先只递归、不整块 inert
    const exempt = exemptNodes()
    const chain = chainOf([...targets, ...exempt])
    const stop = new Set<Element>([...targets, ...exempt])
    const next = new Set<HTMLElement>()
    const nextWalked = new Set<Node>()

    const walk = (parent: Element): void => {
      nextWalked.add(parent)
      for (const child of Array.from(parent.children)) {
        if (chain.has(child)) {
          // 走到 target 本身即止，其内部一律不动
          if (!stop.has(child))
            walk(child)
        }
        else if (isHTMLElement(child) && !child.matches(exemptSelector)) {
          next.add(child)
        }
      }
    }
    if (!stop.has(body))
      walk(body)

    for (const el of Array.from(held)) {
      if (!next.has(el))
        release(el)
    }
    for (const el of next) acquire(el)
    walked = nextWalked
  }

  /** 增删的节点里是否带豁免标记（含其后代）。 */
  const touchesExempt = (nodes: NodeList): boolean =>
    Array.from(nodes).some(node =>
      isElement(node) && (node.matches(exemptSelector) || node.querySelector(exemptSelector) != null),
    )

  // 祖先链任一层增删子节点、豁免节点增删、层栈变动都重算一次；其余链外子树要么整块已
  // inert、要么在 target 内，它们的变动改不了结果，回调里筛一遍就跳过。
  // 构造器严格取自 Scope Window：跨 iframe 时使用 ambient 构造器不会收到目标文档的变更。
  const observer = new MutationObserver((records) => {
    if (records.some(record =>
      walked.has(record.target) || touchesExempt(record.addedNodes) || touchesExempt(record.removedNodes),
    )) {
      sync()
    }
  })
  let unsubscribe: Cleanup = () => {}
  try {
    observer.observe(body, { childList: true, subtree: true })
    unsubscribe = layerRegistry.subscribe(() => sync())
    sync()
  }
  catch (error) {
    observer.disconnect()
    unsubscribe()
    for (const el of Array.from(held)) release(el)
    throw error
  }

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
