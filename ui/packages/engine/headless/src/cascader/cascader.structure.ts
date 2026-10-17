/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 级联选择的标准结构：标题、盒（触发钮与可选的清空钮）、浮层里的搜索框、候选与当前展开的各列。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { cascaderAnatomy } from './cascader.anatomy'
import type { CascaderApi, CascaderColumn, CascaderNodeMeta } from './cascader.types'

type CascaderPart = (typeof cascaderAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const CASCADER_STRUCTURE_PARTS = [
  'label',
  'control',
  'trigger',
  'value-text',
  'tag-list',
  'indicator',
  'clear-trigger',
  'positioner',
  'content',
  'input',
  'search-list',
  'search-item',
  'column',
  'item',
  'item-text',
  'item-description',
  'item-indicator',
  'branch-loading',
  'branch-error',
  'branch-retry-trigger',
  'empty',
  'loading',
] as const satisfies readonly CascaderPart[]

/** anatomy 里不进标准结构的部件：表单影子由组件按选中路径自己装配，分组、条目行尾与底部操作区由作者手写结构时自己摆。 */
export const CASCADER_STRUCTURE_OMITS = [
  'hidden-input',
  'group',
  'group-label',
  'item-suffix',
  'footer',
] as const satisfies readonly CascaderPart[]

type CascaderStructurePart = (typeof CASCADER_STRUCTURE_PARTS)[number]

/** 委派给 tag 的部件：多选标签与 +N 那一枚，名字取元素委派声明里的。 */
type CascaderTagPart = 'tag' | 'overflow-tag'

type CascaderNode = StructureNode<CascaderStructurePart | CascaderTagPart>

/** 结构里要不要铺这几个可选部件。 */
export interface CascaderStructureOptions {
  /** 标题文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 盒里带不带清空按钮，缺省不带。 */
  clearable?: boolean
  /** 开没开搜索：开了在浮层顶部铺搜索框与候选列表。 */
  searchable?: boolean
  /** 作者给了哪些插槽的内容，只认 label。 */
  slotted?: StructureSlotted
}

type CascaderStructureModel = Pick<CascaderApi, 'multiple' | 'tags' | 'columns' | 'searchResults' | 'searching' | 'columnLoadState' | 'translations'>

const NOTHING_SLOTTED: StructureSlotted = () => false

/** 一个条目：文字、有副文本时一行副文本、选中标记。 */
function itemStructure(node: CascaderNodeMeta): CascaderNode {
  const children: CascaderNode[] = [{ key: 'text', tag: 'span', part: 'item-text', text: node.label }]
  if (node.description != null)
    children.push({ key: 'description', tag: 'span', part: 'item-description', text: node.description })
  children.push({ key: 'indicator', tag: 'span', part: 'item-indicator' })
  return { key: `item:${node.value}`, tag: 'div', part: 'item', attrs: { value: node.value }, children }
}

/** 一列：本列的条目；这一列属于懒分支时末尾再铺在途、失败与重试三块，露哪一块归连接层。 */
function columnStructure(model: CascaderStructureModel, column: CascaderColumn): CascaderNode {
  const children = column.items.map(itemStructure)
  if (model.columnLoadState(column.level) != null) {
    const t = model.translations
    children.push(
      { key: 'branch-loading', tag: 'div', part: 'branch-loading', text: t.loading },
      { key: 'branch-error', tag: 'div', part: 'branch-error', text: t.branchError },
      { key: 'branch-retry-trigger', tag: 'button', part: 'branch-retry-trigger', text: t.retry },
    )
  }
  return { key: `column:${column.level}`, tag: 'div', part: 'column', attrs: { level: String(column.level) }, children }
}

/**
 * 级联选择在 root 里的标准结构，次序是标题、盒、浮层。
 * 盒里触发钮在前、清空钮在后（按钮不能套按钮）；触发钮里依次是值串、多选的标签行（只作展示，摆不下的折进 +N）、展开箭头。
 * 浮层里开了搜索时先是搜索框与候选列表（每条候选是整条路径连缀成的一行），再是当前展开的各列，末尾是空态与在途占位；
 * 空态的字按视图取无匹配或无数据，露哪一种归连接层。
 */
export function cascaderStructure(model: CascaderStructureModel, options: CascaderStructureOptions = {}): CascaderNode[] {
  const slotted = options.slotted ?? NOTHING_SLOTTED
  const t = model.translations
  const trigger: CascaderNode = {
    key: 'trigger',
    tag: 'button',
    part: 'trigger',
    children: [
      { key: 'value-text', tag: 'span', part: 'value-text' },
      ...(model.multiple
        ? [{
          key: 'tag-list',
          tag: 'span',
          part: 'tag-list',
          children: [
            ...model.tags.map((tag): CascaderNode => ({ key: `tag:${tag.key}`, tag: 'span', component: 'tag', part: 'tag', attrs: { value: tag.key }, text: tag.label })),
            { key: 'overflow-tag', tag: 'span', component: 'tag', part: 'overflow-tag' },
          ],
        } satisfies CascaderNode]
        : []),
      { key: 'indicator', tag: 'span', part: 'indicator' },
    ],
  }
  const content: CascaderNode[] = []
  if (options.searchable) {
    content.push(
      { key: 'input', tag: 'input', part: 'input' },
      {
        key: 'search-list',
        tag: 'div',
        part: 'search-list',
        children: model.searchResults.map((result): CascaderNode => ({ key: `search-item:${result.key}`, tag: 'div', part: 'search-item', attrs: { value: result.key }, text: result.labels.join(' / ') })),
      },
    )
  }
  content.push(
    ...model.columns.map(column => columnStructure(model, column)),
    { key: 'empty', tag: 'div', part: 'empty', text: model.searching ? t.noMatch : t.empty },
    { key: 'loading', tag: 'div', part: 'loading', text: t.loading },
  )

  const nodes: CascaderNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (options.label != null)
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  nodes.push(
    {
      key: 'control',
      tag: 'div',
      part: 'control',
      children: options.clearable ? [trigger, { key: 'clear-trigger', tag: 'button', part: 'clear-trigger' }] : [trigger],
    },
    { key: 'positioner', tag: 'div', part: 'positioner', children: [{ key: 'content', tag: 'div', part: 'content', children: content }] },
  )
  return nodes
}
