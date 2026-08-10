import type { VNode } from 'vue'
import { Comment, Fragment, Text } from 'vue'

/**
 * 插槽产出里有没有真会画出东西的节点。
 *
 * 只看数组长度会判错：`v-if` 为假时假分支仍留下一个注释节点，空的 `v-for` 留下一个没有子节点的片段，
 * 模板里的换行与缩进留下纯空白文本节点——三者都占着数组的位置，一个像素都不画。
 * 所以逐个节点看类型，片段递归到底。
 *
 * 与 field 的 attributable 判的不是一回事：那边挑「能挂属性的节点」，纯文本一律滤掉；
 * 这边问「有没有内容」，非空文本算内容。两者不能互相替代。
 */
export function slotPaints(nodes: readonly VNode[] | undefined): boolean {
  return nodes?.some((node) => {
    if (node.type === Comment)
      return false
    if (node.type === Text)
      return String(node.children ?? '').trim() !== ''
    if (node.type === Fragment)
      return Array.isArray(node.children) && slotPaints(node.children as VNode[])
    return true
  }) ?? false
}
