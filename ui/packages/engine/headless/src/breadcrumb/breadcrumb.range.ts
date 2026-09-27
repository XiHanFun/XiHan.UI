/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 面包屑折叠的纯函数：把一串层级按上限折成「首段 + 省略位 + 末段」。不碰 DOM。

import type { BreadcrumbCollapsedRange, BreadcrumbItem, BreadcrumbNode, BreadcrumbNodeMeta } from './breadcrumb.types'

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
 * 被折叠的那一段层级：层数超过 maxItems 才折，折的是中间那一段，[start, end) 按路径下标计。
 *
 * 两条不变量：
 * 1. 首层与末层恒不折（层数 ≥ 2 时）。
 * 2. 折叠后展开的层数恒等于 maxItems，省略位不占其中的名额。
 *
 * @param count 路径的层数
 * @param maxItems 最多展开几层；不给、非正数或不小于层数即不折
 */
export function breadcrumbCollapsedRange(count: number, maxItems?: number): BreadcrumbCollapsedRange | null {
  if (maxItems == null || !Number.isFinite(maxItems))
    return null
  const max = Math.trunc(maxItems)
  if (max <= 0 || count <= max)
    return null
  // 首段至少留一层，末段吃掉剩下的名额；max 为 1 时首段让位给末段那一层
  const leading = Math.min(LEADING_COUNT, max - 1)
  const trailing = max - leading
  return { start: leading, end: count - trailing }
}

/**
 * 折叠序列：被折叠的那一段换成一个省略位，省略位自带被折叠的层级。
 *
 * @param nodes 按路径顺序排好的层级
 * @param maxItems 最多展开几层；不给、非正数或不小于层数即全列
 */
export function buildBreadcrumbItems(
  nodes: readonly BreadcrumbNodeMeta[],
  maxItems?: number,
): BreadcrumbItem[] {
  const range = breadcrumbCollapsedRange(nodes.length, maxItems)
  if (!range)
    return nodes.map(node => ({ type: 'node', node }))
  return [
    ...nodes.slice(0, range.start).map((node): BreadcrumbItem => ({ type: 'node', node })),
    { type: 'ellipsis', nodes: nodes.slice(range.start, range.end) },
    ...nodes.slice(range.end).map((node): BreadcrumbItem => ({ type: 'node', node })),
  ]
}
