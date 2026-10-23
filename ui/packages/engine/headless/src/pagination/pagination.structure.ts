/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分页的标准结构：上一页、按当前页折叠后的页码序列（被折叠的一段铺为省略位）、下一页。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。
// 翻页钮与省略位不放文字：字形由皮肤在空按钮上画，可及名由 translations 给。

import type { StructureChild, StructureNode } from '../shared/structure'
import type { paginationAnatomy } from './pagination.anatomy'
import type { PaginationApi } from './pagination.types'

type PaginationPart = (typeof paginationAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const PAGINATION_STRUCTURE_PARTS = [
  'prev-trigger',
  'item',
  'ellipsis-trigger',
  'next-trigger',
] as const satisfies readonly PaginationPart[]

/**
 * anatomy 里不进标准结构的部件：信息区、跳页框、首末页钮、每页条数与省略位的展开面板都是按需加的，
 * 要用时作者整棵手写。
 */
export const PAGINATION_STRUCTURE_OMITS = [
  'summary',
  'jumper',
  'first-trigger',
  'last-trigger',
  'page-size-select',
  'positioner',
  'content',
] as const satisfies readonly PaginationPart[]

type PaginationStructureNode = StructureNode<(typeof PAGINATION_STRUCTURE_PARTS)[number]>

/** 分页在 root 里的标准结构：页码按值带 key，翻页后按值复用节点；省略位按它所在的一侧带 key。 */
export function paginationStructure(model: Pick<PaginationApi, 'pageItems'>): StructureChild<PaginationStructureNode['part']>[] {
  const items = model.pageItems.map((item): PaginationStructureNode => item.type === 'ellipsis'
    ? { key: `ellipsis:${item.side}`, tag: 'button', part: 'ellipsis-trigger', attrs: { side: item.side } }
    : { key: `item:${item.value}`, tag: 'button', part: 'item', attrs: { value: String(item.value) }, text: String(item.value) })
  return [
    { key: 'prev', tag: 'button', part: 'prev-trigger' },
    ...items,
    { key: 'next', tag: 'button', part: 'next-trigger' },
  ]
}
