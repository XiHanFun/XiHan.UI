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
  return paints(nodes)
}

/**
 * 插槽产出是不是只有纯文本。
 *
 * 注释与空白文本节点一律跳过——它们是模板换行与假分支留下的，不影响判断；
 * 片段递归到底。有一个元素节点就不算纯文本。
 *
 * 拿它决定「要不要替作者补一层承载节点」：作者写下的是一段字，包进去才吃得到那层的规则；
 * 作者自己写了节点就一个都不动。
 */
export function slotIsPlainText(nodes: readonly VNode[] | undefined): boolean {
  return paints(nodes) && textual(nodes)
}

function textual(nodes: readonly VNode[] | undefined): boolean {
  return (nodes ?? []).every((node) => {
    if (node.type === Comment || node.type === Text)
      return true
    if (node.type === Fragment)
      return !Array.isArray(node.children) || textual(node.children as VNode[])
    return false
  })
}

function paints(nodes: readonly VNode[] | undefined): boolean {
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
