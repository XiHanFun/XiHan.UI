// 面包屑折叠的纯函数：把一串层级按上限折成「首段 + 省略位 + 末段」。不碰 DOM。

import type { BreadcrumbItem, BreadcrumbNode, BreadcrumbNodeMeta } from './breadcrumb.types'

/** 折叠时首段恒显的层数。 */
const LEADING_COUNT = 1

/** 把 collection 里的节点补齐成元信息：label 退回 value，current 归一成布尔。 */
export function normalizeBreadcrumbNodes(nodes: readonly BreadcrumbNode[]): BreadcrumbNodeMeta[] {
  return nodes.map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    href: node.href,
    icon: node.icon,
    current: !!node.current,
  }))
}

/**
 * 折叠序列：层数超过 maxItems 才折，折的是中间那一段。
 *
 * 两条不变量：
 * 1. 首层与末层恒在序列里（层数 ≥ 2 时）。
 * 2. 折叠后展开的层数恒等于 maxItems，省略位不占其中的名额。
 *
 * @param nodes 按路径顺序排好的层级
 * @param maxItems 最多展开几层；不给、非正数或不小于层数即全列
 */
export function buildBreadcrumbItems(
  nodes: readonly BreadcrumbNodeMeta[],
  maxItems?: number,
): BreadcrumbItem[] {
  const all = (): BreadcrumbItem[] => nodes.map(node => ({ type: 'node', node }))
  if (maxItems == null || !Number.isFinite(maxItems))
    return all()
  const max = Math.trunc(maxItems)
  if (max <= 0 || nodes.length <= max)
    return all()

  // 首段至少留一层，末段吃掉剩下的名额；max 为 1 时首段让位给末段那一层
  const leading = Math.min(LEADING_COUNT, max - 1)
  const trailing = max - leading
  return [
    ...nodes.slice(0, leading).map((node): BreadcrumbItem => ({ type: 'node', node })),
    { type: 'ellipsis', nodes: nodes.slice(leading, nodes.length - trailing) },
    ...nodes.slice(nodes.length - trailing).map((node): BreadcrumbItem => ({ type: 'node', node })),
  ]
}
