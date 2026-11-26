/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 统计数值的标准结构：标签、前缀、数值、后缀、涨跌，给了哪段内容才铺哪段。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲。

import type { StructureNode, StructureSlotted } from '../shared/structure'
import type { statisticAnatomy } from './statistic.anatomy'
import type { StatisticTrend } from './statistic.types'

type StatisticPart = (typeof statisticAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const STATISTIC_STRUCTURE_PARTS = [
  'label',
  'prefix',
  'value',
  'suffix',
  'trend',
] as const satisfies readonly StatisticPart[]

/** anatomy 里不进标准结构的部件：没有。 */
export const STATISTIC_STRUCTURE_OMITS = [] as const satisfies readonly StatisticPart[]

type StatisticNode = StructureNode<(typeof STATISTIC_STRUCTURE_PARTS)[number]>

/** 结构里要铺哪几段。 */
export interface StatisticStructureOptions {
  /** 标签文字：给了就铺带这段文字的 label；label 插槽有内容时铺内容归作者的 label。 */
  label?: string
  /** 数值格式化后的文字，即 connect 给出的 valueText：给了才铺 value。 */
  valueText?: string
  /** 涨跌方向：给了就铺 trend，皮肤按方向画箭头。 */
  trend?: StatisticTrend
  /** 涨跌段的比数文字（「同比 12%」）：给了就铺 trend 并写进去；没给方向时只有文字、不画箭头。 */
  trendText?: string
  /** 作者给了哪些插槽的内容：label、prefix、suffix。 */
  slotted?: StructureSlotted
}

/** 一段文字给了且不是空串。空串铺出来是一个占位的空段：标签会白占一整行。 */
function present(text: string | undefined): text is string {
  return text != null && text !== ''
}

/**
 * 统计数值在 root 里的标准结构，次序是标签、前缀、数值、后缀、涨跌，与手写部件的文档序相同。
 * 标签取文字或 label 插槽；前后缀只来自插槽（货币符号、单位、图标）；数值是格式化好的文字；
 * 涨跌给了方向或比数文字才铺，比数文字写在部件里，箭头由皮肤按方向画。
 */
export function statisticStructure(options: StatisticStructureOptions = {}): StatisticNode[] {
  const slotted = (name: string): boolean => options.slotted?.(name) ?? false
  const nodes: StatisticNode[] = []
  if (slotted('label'))
    nodes.push({ key: 'label', tag: 'span', part: 'label', slot: { name: 'label' } })
  else if (present(options.label))
    nodes.push({ key: 'label', tag: 'span', part: 'label', text: options.label })
  if (slotted('prefix'))
    nodes.push({ key: 'prefix', tag: 'span', part: 'prefix', slot: { name: 'prefix' } })
  if (options.valueText != null)
    nodes.push({ key: 'value', tag: 'span', part: 'value', text: options.valueText })
  if (slotted('suffix'))
    nodes.push({ key: 'suffix', tag: 'span', part: 'suffix', slot: { name: 'suffix' } })
  if (present(options.trendText))
    nodes.push({ key: 'trend', tag: 'span', part: 'trend', text: options.trendText })
  else if (options.trend != null)
    nodes.push({ key: 'trend', tag: 'span', part: 'trend' })
  return nodes
}
