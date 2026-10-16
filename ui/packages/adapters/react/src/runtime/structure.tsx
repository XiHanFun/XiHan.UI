/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按组件的标准结构渲缺省树：每个部件节点换成同名的部件组件（委派部件按「组件名/部件名」找），身份属性当 prop 传，子节点当 children。

import type { StructureNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { createElement } from 'react'

/**
 * 部件的内容由作者的渲染函数接管时返回要放进去的内容；返回 undefined 时照结构渲（子节点或文字，带 slot 的节点为空）。
 */
export type StructureContent = (node: StructureNode) => ReactNode | undefined

export function renderStructure(
  nodes: readonly StructureNode[],
  components: Readonly<Record<string, (props: never) => ReactNode>>,
  content?: StructureContent,
): ReactNode[] {
  return nodes.map((node) => {
    const name = node.component === undefined ? node.part : `${node.component}/${node.part}`
    const component = components[name]
    if (!component)
      throw new Error(`[xh] 标准结构里的部件 ${name} 没有对应的组件`)
    const override = content?.(node)
    const children = override !== undefined
      ? override
      : node.children
        ? renderStructure(node.children, components, content)
        : node.text
    return createElement(component as (props: Record<string, unknown>) => ReactNode, { key: node.key, ...node.attrs }, children)
  })
}
