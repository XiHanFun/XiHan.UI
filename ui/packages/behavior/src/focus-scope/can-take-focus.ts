import type { Scope } from '@xihan-ui/core'

/**
 * 这个节点此刻真的接得住焦点吗。
 *
 * 焦点域的 initialFocus 一旦返回非空就当场认定焦点已安排好、不再重试，所以候选节点
 * 还带着 hidden / display:none 或还没写上 tabindex 时必须回 null，把机会留给下一帧。
 * tabindex 既是能否聚焦的硬条件，也是适配器接线完成的信号——Light DOM 宿主把属性
 * 写到作者节点上比机器挂载晚一个微任务，这一条正是用来等它的。
 */
export function canTakeFocus(el: HTMLElement | null, scope: Scope): boolean {
  if (!el || !el.hasAttribute('tabindex'))
    return false
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (node.hidden)
      return false
    if (scope.getComputedStyle(node).display === 'none')
      return false
  }
  return true
}
