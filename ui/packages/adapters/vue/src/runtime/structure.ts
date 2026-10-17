/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按组件的标准结构渲缺省树：每个部件节点换成同名的部件组件（委派部件按「组件名/部件名」找），组合节点换成那个组件的根组件，装饰文字渲成 span，身份属性当 prop 传，子节点进默认插槽。

import type { StructureChild, StructureNode } from '@xihan-ui/headless'
import type { Component, VNode, VNodeChild } from 'vue'
import { isStructureInstance, isStructureLiteral } from '@xihan-ui/headless'
import { h } from 'vue'

/**
 * 部件的内容由作者插槽接管时返回要放进去的内容；返回 undefined 时照结构渲（子节点或文字，带 slot 的节点为空）。
 */
export type StructureContent = (node: StructureNode) => VNodeChild | undefined

/**
 * instances 是结构里组合进来的组件：组件名 → 根组件。组合节点渲那个根组件，props 原样传（`onXxx` 即监听），不写插槽，
 * 内层走它自己的缺省树；与 Web Components 元素的 static dependencies 是同一份清单。
 */
export function renderStructure(
  nodes: readonly StructureChild[],
  components: Readonly<Record<string, Component>>,
  content?: StructureContent,
  instances: Readonly<Record<string, Component>> = {},
): VNode[] {
  return nodes.map((node) => {
    if (isStructureLiteral(node))
      return h('span', { key: node.key }, node.literal)
    if (isStructureInstance(node)) {
      const root = instances[node.instance]
      if (!root)
        throw new Error(`[xh] 标准结构里的组合节点 ${node.instance} 没有对应的组件`)
      return h(root, { key: node.key, ...node.props })
    }
    const name = node.component === undefined ? node.part : `${node.component}/${node.part}`
    const component = components[name]
    if (!component)
      throw new Error(`[xh] 标准结构里的部件 ${name} 没有对应的组件`)
    const override = content?.(node)
    const slot = override !== undefined
      ? () => override
      : node.children
        ? () => renderStructure(node.children!, components, content, instances)
        : node.text !== undefined
          ? () => node.text
          : undefined
    return h(component, { key: node.key, ...node.attrs }, slot)
  })
}
