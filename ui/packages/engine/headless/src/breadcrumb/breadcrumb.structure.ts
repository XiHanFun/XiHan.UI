/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 面包屑的标准结构：一个有序列表，层与层之间铺分隔符，被折叠的一段铺为一个折叠位。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureChild, StructureNode, StructureSlotted } from '../shared/structure'
import type { breadcrumbAnatomy } from './breadcrumb.anatomy'
import type { BreadcrumbApi, BreadcrumbNodeMeta } from './breadcrumb.types'

type BreadcrumbPart = (typeof breadcrumbAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const BREADCRUMB_STRUCTURE_PARTS = [
  'list',
  'item',
  'link',
  'link-icon',
  'separator',
  'ellipsis',
  'ellipsis-trigger',
] as const satisfies readonly BreadcrumbPart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const BREADCRUMB_STRUCTURE_OMITS = [] as const satisfies readonly BreadcrumbPart[]

type BreadcrumbStructureNode = StructureNode<(typeof BREADCRUMB_STRUCTURE_PARTS)[number]>

/** 结构里要铺哪几处作者内容。 */
export interface BreadcrumbStructureOptions {
  /**
   * 作者给了哪些插槽的内容：separator（分隔符，按它后面那一项的值带 key：层的值，折叠位是 ellipsis）、
   * ellipsis（折叠位按钮里的内容）。
   */
  slotted?: StructureSlotted
}

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一层的链接：写着 value 与 href，当前页写着 current；有图标时图标在前、文字在后。 */
function link(node: BreadcrumbNodeMeta): BreadcrumbStructureNode {
  const attrs: Record<string, string> = { value: node.value }
  if (node.href != null)
    attrs.href = node.href
  if (node.current)
    attrs.current = ''
  const base = { key: 'link', tag: 'a', part: 'link', attrs } as const
  if (node.icon == null)
    return { ...base, text: node.label }
  return {
    ...base,
    children: [
      { key: 'icon', tag: 'span', part: 'link-icon', text: node.icon },
      { key: 'label', literal: node.label },
    ],
  }
}

/**
 * 面包屑在 root 里的标准结构：有序列表里按折叠后的序列一项一个 li，层与层之间铺分隔符（内容归作者或交给皮肤），
 * 被折叠的一段铺为折叠位，里面是展开完整路径的按钮。
 */
export function breadcrumbStructure(model: Pick<BreadcrumbApi, 'items'>, options: BreadcrumbStructureOptions = {}): StructureChild<BreadcrumbStructureNode['part']>[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const children = model.items.flatMap((item, index): BreadcrumbStructureNode[] => {
    const id = item.type === 'ellipsis' ? 'ellipsis' : item.node.value
    const out: BreadcrumbStructureNode[] = []
    if (index > 0) {
      out.push(slotted('separator', id)
        ? { key: `separator:${id}`, tag: 'li', part: 'separator', slot: { name: 'separator', key: id } }
        : { key: `separator:${id}`, tag: 'li', part: 'separator' })
    }
    if (item.type === 'ellipsis') {
      out.push({
        key: 'ellipsis',
        tag: 'li',
        part: 'ellipsis',
        children: [slotted('ellipsis')
          ? { key: 'trigger', tag: 'button', part: 'ellipsis-trigger', slot: { name: 'ellipsis' }, data: item.nodes }
          : { key: 'trigger', tag: 'button', part: 'ellipsis-trigger' }],
      })
    }
    else {
      out.push({ key: `item:${item.node.value}`, tag: 'li', part: 'item', children: [link(item.node)] })
    }
    return out
  })
  return [{ key: 'list', tag: 'ol', part: 'list', children }]
}
