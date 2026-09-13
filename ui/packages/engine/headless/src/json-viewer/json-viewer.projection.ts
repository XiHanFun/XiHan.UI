/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 json viewer.projection 相关实现。

import type { JsonViewerNode } from './json-viewer.types'

/** 可见行按父路径分组后的渲染投影。Map 与各组数组均由每次调用独立创建。 */
export type JsonViewerNodesByParent = Map<string | null, JsonViewerNode[]>

/**
 * 按父路径分组，保留父路径首次出现顺序、组内输入顺序和节点对象身份。
 * 未要求父节点必须存在：截断数据或局部投影仍按节点声明的 parent 如实分组。
 */
export function groupJsonViewerNodesByParent(nodes: readonly JsonViewerNode[]): JsonViewerNodesByParent {
  const out: JsonViewerNodesByParent = new Map()
  for (const node of nodes) {
    const list = out.get(node.parent)
    if (list)
      list.push(node)
    else
      out.set(node.parent, [node])
  }
  return out
}
