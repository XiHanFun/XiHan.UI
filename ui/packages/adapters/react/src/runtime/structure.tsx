/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按组件的标准结构渲缺省树：每个部件节点换成同名的部件组件（委派部件按「组件名/部件名」找），组合节点换成那个组件的根组件，装饰文字渲成 span，出口处原样放作者内容，身份属性当 prop 传，子节点当 children。

import type { StructureChild, StructureNode, StructureOutletNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { isStructureInstance, isStructureLiteral, isStructureOutlet } from '@xihan-ui/headless'
import { createElement, Fragment } from 'react'
import { XhFieldBoundary } from '../components/field/boundary'

/**
 * 部件的内容由作者的渲染函数接管时返回要放进去的内容；返回 undefined 时照结构渲（子节点或文字，带 slot 的节点为空）。
 */
export type StructureContent = (node: StructureNode) => ReactNode | undefined

/** 出口处的作者内容；返回 undefined 时那个位置什么都不放。 */
export type StructureOutletContent = (node: StructureOutletNode) => ReactNode | undefined

/**
 * instances 是结构里组合进来的组件：组件名 → 根组件。组合节点渲那个根组件，props 原样传（`onXxx` 即回调），不给 children，
 * 内层走它自己的缺省树；与 Web Components 元素的 static dependencies 是同一份清单。
 * 组合进来的组件包在字段边界里：它的状态与名字由外层经 props 给，外层放进字段时，字段只接线外层，不认领它。
 */
export function renderStructure(
  nodes: readonly StructureChild[],
  components: Readonly<Record<string, (props: never) => ReactNode>>,
  content?: StructureContent,
  instances: Readonly<Record<string, (props: never) => ReactNode>> = {},
  outlet?: StructureOutletContent,
): ReactNode[] {
  return nodes.map((node) => {
    if (isStructureLiteral(node))
      return createElement('span', { key: node.key }, node.literal)
    if (isStructureOutlet(node)) {
      const authored = outlet?.(node)
      return authored === undefined ? null : createElement(Fragment, { key: node.key }, authored)
    }
    if (isStructureInstance(node)) {
      const root = instances[node.instance]
      if (!root)
        throw new Error(`[xh] 标准结构里的组合节点 ${node.instance} 没有对应的组件`)
      return createElement(XhFieldBoundary, { key: node.key }, createElement(root as (props: Record<string, unknown>) => ReactNode, node.props))
    }
    const name = node.component === undefined ? node.part : `${node.component}/${node.part}`
    const component = components[name]
    if (!component)
      throw new Error(`[xh] 标准结构里的部件 ${name} 没有对应的组件`)
    const override = content?.(node)
    const children = override !== undefined
      ? override
      : node.children
        ? renderStructure(node.children, components, content, instances, outlet)
        : node.text
    return createElement(component as (props: Record<string, unknown>) => ReactNode, { key: node.key, ...node.attrs }, children)
  })
}
