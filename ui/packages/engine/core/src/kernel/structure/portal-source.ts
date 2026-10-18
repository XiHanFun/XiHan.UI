/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// Portal 外壳的逻辑来源：浮层内容搬进外壳后，沿逻辑祖先链走到外壳时跳回它在原 DOM 里的来源节点。
// 登记由视觉桥在建桥时写入、释放时撤销，与视觉桥抄视觉轴用的是同一个来源。
// 登记表挂在 Document 上，页面上装了几份 core 时取到的是同一张。

import type { Cleanup } from '../types'
import { createPageSharedRegistry } from './page-shared-registry'

const registry = createPageSharedRegistry('portal-sources@1', () => new WeakMap<Element, Element>())

/** 登记外壳的来源；返回的清理只在外壳仍指向这个来源时撤销登记。 */
export function bindPortalSource(shell: Element, source: Element): Cleanup {
  const sources = registry.get(shell.ownerDocument)
  sources.set(shell, source)
  return () => {
    if (sources.get(shell) === source)
      sources.delete(shell)
  }
}

/**
 * 逻辑父元素：Portal 外壳的逻辑父元素是它的来源，其余节点就是 parentElement，到文档根为 null。
 *
 * 沿它往上走，浮层搬进 Portal 落点的内容也能走回来源所在的子树，找到原来包着浮层的作用域。
 * 外壳与来源的对应由 Portal 视觉桥在建桥时登记、释放时撤销。
 *
 * @example
 * ```ts
 * // 从节点往上找最近的作用域，浮层里的节点也能找到包着浮层来源的那一层
 * function closestScope(node: Element): Element | null {
 *   for (let el: Element | null = node; el; el = logicalParentElement(el)) {
 *     if (el.matches('my-scope'))
 *       return el
 *   }
 *   return null
 * }
 * ```
 */
export function logicalParentElement(node: Element): Element | null {
  return registry.get(node.ownerDocument).get(node) ?? node.parentElement
}

/**
 * ancestor 是否在逻辑上包含 node：DOM 上包含，或沿 logicalParentElement 穿过 Portal 外壳后包含。
 * ancestor 是 node 自己时也算包含，与 Node.contains 一致。
 *
 * 作用域变化时用它挑出要通知的订阅者：搬进 Portal 的浮层内容在 DOM 上已不在作用域里，逻辑上仍在。
 *
 * @example
 * ```ts
 * for (const [listener, host] of subscribers) {
 *   if (logicallyContains(scope, host))
 *     listener()
 * }
 * ```
 */
export function logicallyContains(ancestor: Node, node: Element): boolean {
  for (let el: Element | null = node; el; el = logicalParentElement(el)) {
    if (ancestor.contains(el))
      return true
  }
  return false
}
