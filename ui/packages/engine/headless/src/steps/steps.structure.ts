/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 步骤条的标准结构：按 collection 一步一个条目铺出整条步骤条。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode } from '../shared/structure'
import type { stepsAnatomy } from './steps.anatomy'
import type { StepNodeMeta, StepsApi } from './steps.types'

type StepsPart = (typeof stepsAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const STEPS_STRUCTURE_PARTS = [
  'list',
  'item',
  'trigger',
  'indicator',
  'title',
  'description',
  'separator',
] as const satisfies readonly StepsPart[]

/** anatomy 里不进标准结构的部件：面板挂在 list 之外、内容归作者，要面板时手写结构。 */
export const STEPS_STRUCTURE_OMITS = [
  'content',
] as const satisfies readonly StepsPart[]

type StepsNode = StructureNode<(typeof STEPS_STRUCTURE_PARTS)[number]>

type StepsStructureModel = Pick<StepsApi, 'collection' | 'readOnly' | 'variant' | 'getItemState'>

/**
 * 序号圆点里的字：走过的步留空，由皮肤画对号；点状形态的圆点不盛内容，一律留空；其余写第几步。
 * 留空也写成空串：换步后上一帧写过的序号要被清掉。
 */
function indicatorText(model: StepsStructureModel, meta: StepNodeMeta): string {
  if (model.variant === 'dot' || model.getItemState({ index: meta.index }).status === 'completed')
    return ''
  return String(meta.index + 1)
}

/** 一步：触发器里依次是序号圆点、标题与说明（有说明才铺），触发器之后是通向下一步的连接线。 */
function itemStructure(model: StepsStructureModel, meta: StepNodeMeta): StepsNode {
  const content: StepsNode[] = [
    { key: 'indicator', tag: 'span', part: 'indicator', text: indicatorText(model, meta) },
    { key: 'title', tag: 'span', part: 'title', text: meta.title },
  ]
  if (meta.description)
    content.push({ key: 'description', tag: 'span', part: 'description', text: meta.description })
  return {
    key: `item:${meta.index}`,
    tag: 'div',
    part: 'item',
    attrs: { value: String(meta.index) },
    children: [
      // 只读展示的触发器只排版，不是按钮
      { key: 'trigger', tag: model.readOnly ? 'div' : 'button', part: 'trigger', children: content },
      { key: 'separator', tag: 'div', part: 'separator' },
    ],
  }
}

/**
 * 步骤条在 root 里的标准结构：一个列表，collection 的每一步一个条目，条目的值是第几步（0 起）。
 * 末一步的连接线照铺，由皮肤收起。没有步骤时什么都不铺：空的列表会白占一个 Tab 位。
 */
export function stepsStructure(model: StepsStructureModel): StepsNode[] {
  if (model.collection.length === 0)
    return []
  return [{ key: 'list', tag: 'div', part: 'list', children: model.collection.map(meta => itemStructure(model, meta)) }]
}
