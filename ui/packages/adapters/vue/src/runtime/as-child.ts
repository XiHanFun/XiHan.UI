import type { VNode } from 'vue'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/kernel'
import { cloneVNode, Comment, Fragment, Text } from 'vue'

/**
 * asChild：部件不再渲染自己的包裹元素，把该挂的属性合到作者给的那个子节点上。
 *
 * 触发器类部件默认渲染 <button>，作者想用自己的按钮当触发器时，只能往 <button> 里再套一个
 * <button>——那是非法嵌套，浏览器会拆开它，事件与焦点都不对。asChild 是唯一的正解。
 */

/** 滤掉注释与纯文本，片段展开，只留能挂属性的节点。 */
function attributable(nodes: readonly VNode[]): VNode[] {
  const out: VNode[] = []
  for (const node of nodes) {
    if (node.type === Comment || node.type === Text)
      continue
    if (node.type === Fragment && Array.isArray(node.children))
      out.push(...attributable(node.children as VNode[]))
    else
      out.push(node)
  }
  return out
}

/** 子节点已带角色标记：组件节点的根由它自己渲染，元素节点看有没有写 data-scope。 */
function carriesOwnAnatomy(node: VNode): boolean {
  return typeof node.type !== 'string' || node.props?.['data-scope'] != null
}

/**
 * 元素 ref 解包：子节点是组件时 ref 拿到的是组件实例，触发器要的是它的根元素。
 * 组件多根时 $el 是占位注释，那种子节点本就不适合当触发器，原样交出去由定位层报错。
 */
function unwrapElement(value: unknown): unknown {
  if (value && typeof value === 'object' && '$el' in value)
    return (value as { $el: unknown }).$el
  return value
}

/**
 * 把部件属性合到作者的子节点上。
 * @param nodes 默认插槽产出
 * @param props 部件该挂的属性（含 ref）
 * @param scope 部件所属组件名，只用于诊断文案
 * @returns 合并后的节点；子节点不合规时返回 null，由调用方退回默认渲染
 */
export function mergeIntoChild(nodes: readonly VNode[] | undefined, props: Record<string, unknown>, scope: string): VNode | null {
  const candidates = attributable(nodes ?? [])
  if (candidates.length !== 1) {
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.warn,
      level: 'warn',
      scope,
      message: `asChild 需要恰好一个子节点，实际是 ${candidates.length} 个；已退回默认渲染。`,
    })
    return null
  }
  const child = candidates[0]!

  // 子节点自带解剖标记时不覆盖它，只落接线属性；否则整套属性都给它
  const merged: Record<string, unknown> = {}
  const keepAnatomy = !carriesOwnAnatomy(child)
  for (const [key, value] of Object.entries(props)) {
    if (!keepAnatomy && (key === 'data-scope' || key === 'data-part'))
      continue
    merged[key] = value
  }
  if (typeof merged.ref === 'function') {
    const inner = merged.ref as (el: unknown) => void
    merged.ref = (value: unknown) => inner(unwrapElement(value))
  }
  // 第三个参数让两边的 ref 都保留：作者自己的 ref 与部件的 ref 各拿各的
  return cloneVNode(child, merged, true)
}
