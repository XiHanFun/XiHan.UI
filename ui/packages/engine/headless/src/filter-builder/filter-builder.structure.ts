/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 条件树编辑器的标准结构：根组（组头、条目、组尾）、空态与播报。条件行里的控件是组合节点，结构由它们自己生成；
// 行尾的扩展位内容归宿主。Vue / React 不写默认插槽时的缺省树、Web Components 只写 root 时元素生成的节点，都照这一份渲。

import type { StructureChild, StructureNode, StructureSlotted } from '../shared/structure'
import type { filterBuilderAnatomy } from './filter-builder.anatomy'
import type { FilterBuilderApi, FilterBuilderConditionView, FilterBuilderGroupView, FilterBuilderTranslations, FilterOperandControl } from './filter-builder.types'
import { structureInstance } from '../shared/structure-instance'

type FilterBuilderPart = (typeof filterBuilderAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const FILTER_BUILDER_STRUCTURE_PARTS = [
  'group',
  'group-header',
  'logic',
  'group-delete-trigger',
  'group-items',
  'group-footer',
  'add-condition-trigger',
  'add-group-trigger',
  'condition',
  'condition-field',
  'condition-operator',
  'condition-source',
  'condition-operand',
  'range-separator',
  'condition-ignore-case',
  'condition-extra',
  'condition-delete-trigger',
  'condition-error',
  'empty',
  'live-region',
] as const satisfies readonly FilterBuilderPart[]

/** anatomy 里不进标准结构的部件：标题由作者写，放进 xh-field 时用字段的标题。 */
export const FILTER_BUILDER_STRUCTURE_OMITS = ['label'] as const satisfies readonly FilterBuilderPart[]

type FilterBuilderNode = StructureNode<(typeof FILTER_BUILDER_STRUCTURE_PARTS)[number]>
type FilterBuilderChild = StructureChild<(typeof FILTER_BUILDER_STRUCTURE_PARTS)[number]>

/** 操作数位置上的一个控件。 */
function operandInstance(control: FilterOperandControl, key: string): FilterBuilderChild {
  switch (control.instance) {
    case 'select':
      return structureInstance(key, 'select', control.props)
    case 'text-field':
      return structureInstance(key, 'text-field', control.props)
    case 'number-field':
      return structureInstance(key, 'number-field', control.props)
    case 'date-field':
      return structureInstance(key, 'date-field', control.props)
    case 'tags-input':
      return structureInstance(key, 'tags-input', control.props)
  }
}

/** 结构函数的选项：作者有没有给某个条件的扩展位写内容。 */
export interface FilterBuilderStructureOptions {
  readonly slotted?: StructureSlotted
}

function conditionNode(api: FilterBuilderApi, view: FilterBuilderConditionView, translations: FilterBuilderTranslations, options: FilterBuilderStructureOptions): FilterBuilderNode {
  const children: FilterBuilderChild[] = [
    { key: 'field', tag: 'div', part: 'condition-field', children: [structureInstance('control', 'select', api.getFieldControlProps(view.path))] },
    { key: 'operator', tag: 'div', part: 'condition-operator', children: [structureInstance('control', 'select', api.getOperatorControlProps(view.path))] },
  ]
  if (api.hasParameters && view.shape !== 'none')
    children.push({ key: 'source', tag: 'div', part: 'condition-source', children: [structureInstance('control', 'toggle-group', api.getSourceControlProps(view.path))] })
  if (view.shape !== 'none') {
    const controls = api.getOperandControls(view.path)
    const operand: FilterBuilderChild[] = controls.length === 2
      ? [operandInstance(controls[0]!, 'from'), { key: 'separator', tag: 'span', part: 'range-separator', text: translations.rangeSeparator }, operandInstance(controls[1]!, 'to')]
      : controls.map(control => operandInstance(control, 'control'))
    children.push({ key: 'operand', tag: 'div', part: 'condition-operand', children: operand })
  }
  if (view.caseToggle)
    children.push({ key: 'case', tag: 'div', part: 'condition-ignore-case', children: [structureInstance('control', 'switch', api.getIgnoreCaseControlProps(view.path))] })
  // 扩展位只给带 id、作者写了内容的条件：Web Components 侧作者写 slot="condition-extra:<条件 id>"，Vue / React 走同名插槽，参数是条件与路径
  if (view.id !== undefined && options.slotted?.('condition-extra', view.id))
    children.push({ key: 'extra', tag: 'div', part: 'condition-extra', slot: { name: 'condition-extra', key: view.id }, data: { condition: view.condition, path: view.path } })
  children.push({ key: 'remove', tag: 'button', part: 'condition-delete-trigger' })
  if (view.issue !== undefined)
    children.push({ key: 'error', tag: 'p', part: 'condition-error', text: translations.issue(view.issue) })
  return { key: view.key, tag: 'div', part: 'condition', attrs: { value: view.key }, children }
}

function groupNode(api: FilterBuilderApi, view: FilterBuilderGroupView, translations: FilterBuilderTranslations, options: FilterBuilderStructureOptions): FilterBuilderNode {
  const header: FilterBuilderChild[] = [{ key: 'logic', tag: 'div', part: 'logic', children: [structureInstance('control', 'toggle-group', api.getLogicControlProps(view.path))] }]
  if (view.path.length > 0)
    header.push({ key: 'remove', tag: 'button', part: 'group-delete-trigger' })
  const footer: FilterBuilderChild[] = [{ key: 'add', tag: 'button', part: 'add-condition-trigger', text: translations.addCondition }]
  if (view.canAddGroup)
    footer.push({ key: 'add-group', tag: 'button', part: 'add-group-trigger', text: translations.addGroup })
  return {
    key: view.key,
    tag: 'div',
    part: 'group',
    attrs: { value: view.key },
    children: [
      { key: 'header', tag: 'div', part: 'group-header', children: header },
      {
        key: 'items',
        tag: 'div',
        part: 'group-items',
        children: view.items.map(item => (item.kind === 'group' ? groupNode(api, item, translations, options) : conditionNode(api, item, translations, options))),
      },
      { key: 'footer', tag: 'div', part: 'group-footer', children: footer },
    ],
  }
}

/** 条件树编辑器在 root 里的标准结构，次序是根组、空态、播报；有可引用的参数时条件行才铺「值 / 参数」切换。 */
export function filterBuilderStructure(api: FilterBuilderApi, translations: FilterBuilderTranslations, options: FilterBuilderStructureOptions = {}): FilterBuilderNode[] {
  const nodes: FilterBuilderNode[] = [groupNode(api, api.tree, translations, options)]
  if (api.conditions.length === 0)
    nodes.push({ key: 'empty', tag: 'div', part: 'empty', text: translations.empty })
  nodes.push({ key: 'live', tag: 'div', part: 'live-region', text: api.announcement })
  return nodes
}
