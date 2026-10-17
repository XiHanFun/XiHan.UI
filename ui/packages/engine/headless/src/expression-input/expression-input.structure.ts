/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 表达式输入框的标准结构：字段外框里的输入框与镜像层、补全浮层与问题列表。
// 补全条目、镜像层的分段与问题行随数据生成；Vue / React 不写默认插槽时的缺省树、Web Components 只写 root 时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureTakeoverPosition } from '../shared/structure'
import type { expressionInputAnatomy } from './expression-input.anatomy'
import type { ExpressionInputApi, ExpressionInputItem } from './expression-input.types'

type ExpressionInputPart = (typeof expressionInputAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const EXPRESSION_INPUT_STRUCTURE_PARTS = [
  'label',
  'control',
  'input',
  'highlight',
  'highlight-segment',
  'issues',
  'issue',
  'positioner',
  'content',
  'item',
  'item-prefix',
  'item-text',
  'item-suffix',
  'item-description',
  'empty',
] as const satisfies readonly ExpressionInputPart[]

/** anatomy 里不进标准结构的部件。 */
export const EXPRESSION_INPUT_STRUCTURE_OMITS = [] as const satisfies readonly ExpressionInputPart[]

type ExpressionInputStructurePart = (typeof EXPRESSION_INPUT_STRUCTURE_PARTS)[number]

/** Web Components 侧作者可以在 root 里单独写的部件：没有，整棵树随数据生成。 */
export const EXPRESSION_INPUT_STRUCTURE_TAKEOVER = {} as const satisfies Readonly<Partial<Record<ExpressionInputStructurePart, StructureTakeoverPosition>>>

type ExpressionInputNode = StructureNode<ExpressionInputStructurePart>

export interface ExpressionInputStructureOptions {
  /** 标题文字；不给时不铺 label 部件，名字由外层的字段或作者的 aria 属性给。 */
  label?: string
  /** 多行：输入框铺成 textarea。 */
  multiline?: boolean
}

type ExpressionInputStructureModel = Pick<ExpressionInputApi, 'items' | 'segments' | 'issues' | 'emptyText' | 'kindText'>

function itemStructure(model: ExpressionInputStructureModel, item: ExpressionInputItem): ExpressionInputNode {
  return {
    key: `item:${item.key}`,
    tag: 'div',
    part: 'item',
    attrs: { value: item.key },
    children: [
      { key: 'kind', tag: 'span', part: 'item-prefix', attrs: { value: item.key }, text: model.kindText(item.kind) },
      { key: 'label', tag: 'span', part: 'item-text', attrs: { value: item.key }, text: item.label },
      ...(item.detail === null ? [] : [{ key: 'detail', tag: 'span', part: 'item-suffix', attrs: { value: item.key }, text: item.detail } satisfies ExpressionInputNode]),
      ...(item.description === null ? [] : [{ key: 'description', tag: 'span', part: 'item-description', attrs: { value: item.key }, text: item.description } satisfies ExpressionInputNode]),
    ],
  }
}

export function expressionInputStructure(model: ExpressionInputStructureModel, options: ExpressionInputStructureOptions = {}): ExpressionInputNode[] {
  return [
    ...(options.label === undefined ? [] : [{ key: 'label', tag: 'label', part: 'label', text: options.label } satisfies ExpressionInputNode]),
    {
      key: 'control',
      tag: 'div',
      part: 'control',
      children: [
        { key: 'input', tag: options.multiline ? 'textarea' : 'input', part: 'input' },
        {
          key: 'highlight',
          tag: 'div',
          part: 'highlight',
          children: model.segments.map((segment, index): ExpressionInputNode => ({ key: `segment:${index}`, tag: 'span', part: 'highlight-segment', attrs: { index: String(index) }, text: segment.text })),
        },
      ],
    },
    {
      key: 'issues',
      tag: 'div',
      part: 'issues',
      children: model.issues.map((issue): ExpressionInputNode => ({ key: `issue:${issue.index}`, tag: 'p', part: 'issue', attrs: { index: String(issue.index) }, text: issue.text })),
    },
    {
      key: 'positioner',
      tag: 'div',
      part: 'positioner',
      children: [
        { key: 'content', tag: 'div', part: 'content', children: model.items.map(item => itemStructure(model, item)) },
        { key: 'empty', tag: 'div', part: 'empty', text: model.emptyText },
      ],
    },
  ]
}
