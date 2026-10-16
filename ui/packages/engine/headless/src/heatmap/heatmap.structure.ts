/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 热力图的标准结构：按当前形态的网格模型铺出整棵部件树。
// Vue / React 不写默认插槽时的缺省树、Web Components 只写 root 时元素生成的节点，都照这一份渲。

import type { StructureNode } from '../shared/structure'
import type { heatmapAnatomy } from './heatmap.anatomy'
import type { HeatmapApi } from './heatmap.types'
import { heatmapMatrixKey } from './heatmap.grid'

type HeatmapPart = (typeof heatmapAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const HEATMAP_STRUCTURE_PARTS = [
  'grid',
  'month-block',
  'row',
  'week-day',
  'month-label',
  'row-label',
  'column-label',
  'cell',
  'tooltip',
  'legend',
  'legend-label',
  'legend-item',
  'empty',
] as const satisfies readonly HeatmapPart[]

/** anatomy 里不进标准结构的部件。 */
export const HEATMAP_STRUCTURE_OMITS = [] as const satisfies readonly HeatmapPart[]

type HeatmapNode = StructureNode<(typeof HEATMAP_STRUCTURE_PARTS)[number]>

/** 结构里要不要铺这几个可选部件。 */
export interface HeatmapStructureOptions {
  /** 详情条，缺省不铺：内容由作者写，没写内容时不该占一个节点。 */
  tooltip?: boolean
  /** 空态，缺省铺。 */
  empty?: boolean
  /** 色阶对照条，缺省铺。 */
  legend?: boolean
}

type HeatmapStructureModel = Pick<HeatmapApi, 'grid' | 'monthGrid' | 'matrixGrid' | 'legendItems' | 'legendText'>

/** 网格那一段：日历形态另带网格之外的月份行，月历形态按月分块，矩阵形态带两条表头。 */
function gridStructure(model: HeatmapStructureModel): HeatmapNode[] {
  const matrix = model.matrixGrid
  if (matrix) {
    const header: HeatmapNode = {
      key: 'header',
      tag: 'div',
      part: 'row',
      children: [
        // 角落占位：与下面各行的行名同宽，列名才对得上列
        { key: 'corner', tag: 'span', part: 'row-label' },
        ...matrix.columns.map((column): HeatmapNode => ({ key: `column:${column.value}`, tag: 'span', part: 'column-label', attrs: { value: column.value }, text: column.label })),
      ],
    }
    const rows = matrix.rows.map((row): HeatmapNode => ({
      key: `row:${row.value}`,
      tag: 'div',
      part: 'row',
      attrs: { value: row.value },
      children: [
        { key: 'label', tag: 'span', part: 'row-label', attrs: { value: row.value }, text: row.label },
        ...matrix.columns.map((column): HeatmapNode => ({
          key: `cell:${column.value}`,
          tag: 'div',
          part: 'cell',
          attrs: { value: column.value },
          data: matrix.cells.get(heatmapMatrixKey(row.value, column.value)) ?? null,
        })),
      ],
    }))
    return [{ key: 'grid', tag: 'div', part: 'grid', children: [header, ...rows] }]
  }

  const month = model.monthGrid
  if (month) {
    const blocks = month.blocks.map((block): HeatmapNode => ({
      key: `block:${block.value}`,
      tag: 'div',
      part: 'month-block',
      attrs: { value: block.value },
      children: [
        { key: 'label', tag: 'span', part: 'month-label', attrs: { value: block.value }, text: block.label },
        // 块内一条星期名坐标轴：不写周序，整条对读屏隐藏
        {
          key: 'axis',
          tag: 'div',
          part: 'row',
          children: month.weekDays.map((day): HeatmapNode => ({ key: `day:${day.weekDay}`, tag: 'span', part: 'week-day', attrs: { value: String(day.weekDay) }, text: day.label })),
        },
        ...block.weeks.map((week): HeatmapNode => ({
          key: `week:${week.week}`,
          tag: 'div',
          part: 'row',
          attrs: { value: String(week.week) },
          children: week.cells.map((cell): HeatmapNode => ({ key: `cell:${cell.date}`, tag: 'div', part: 'cell', attrs: { value: cell.date }, data: cell })),
        })),
      ],
    }))
    return [{ key: 'grid', tag: 'div', part: 'grid', children: blocks }]
  }

  const grid = model.grid
  // 月份行排在网格之外：它只是一条对齐用的坐标轴，行首占位与下面各行的星期名同宽，月份才对得上列
  const axis: HeatmapNode = {
    key: 'axis',
    tag: 'div',
    part: 'row',
    children: [
      { key: 'corner', tag: 'span', part: 'week-day' },
      ...grid.months.map((item): HeatmapNode => ({ key: `month:${item.value}`, tag: 'span', part: 'month-label', attrs: { value: item.value }, text: item.label })),
    ],
  }
  const rows = grid.rows.map((row): HeatmapNode => ({
    key: `row:${row.weekDay}`,
    tag: 'div',
    part: 'row',
    attrs: { value: String(row.weekDay) },
    children: [
      { key: 'week-day', tag: 'span', part: 'week-day', attrs: { value: String(row.weekDay) }, text: grid.weekDays[row.weekDay]?.label ?? '' },
      ...row.cells.map((cell): HeatmapNode => ({ key: `cell:${cell.date}`, tag: 'div', part: 'cell', attrs: { value: cell.date }, data: cell })),
    ],
  }))
  return [axis, { key: 'grid', tag: 'div', part: 'grid', children: rows }]
}

/** 对照条：两端的文字夹着逐档色块，发散色阶下色块另写在中点哪一侧。 */
function legendStructure(model: HeatmapStructureModel): HeatmapNode {
  return {
    key: 'legend',
    tag: 'div',
    part: 'legend',
    children: [
      { key: 'low', tag: 'span', part: 'legend-label', attrs: { value: 'low' }, text: model.legendText.low },
      ...model.legendItems.map((item): HeatmapNode => ({
        key: `item:${item.polarity ?? 'center'}-${item.level}`,
        tag: 'span',
        part: 'legend-item',
        attrs: item.polarity ? { value: String(item.level), polarity: item.polarity } : { value: String(item.level) },
      })),
      { key: 'high', tag: 'span', part: 'legend-label', attrs: { value: 'high' }, text: model.legendText.high },
    ],
  }
}

/**
 * 热力图在 root 里的标准结构，次序是网格、详情条、空态、对照条。
 * 格子节点的 data 是那一格的网格元数据（日历格或矩阵格，矩阵里没有这一格时为 null），给作者的格子内容插槽用。
 */
export function heatmapStructure(model: HeatmapStructureModel, options: HeatmapStructureOptions = {}): HeatmapNode[] {
  const nodes = gridStructure(model)
  if (options.tooltip)
    nodes.push({ key: 'tooltip', tag: 'div', part: 'tooltip' })
  if (options.empty ?? true)
    nodes.push({ key: 'empty', tag: 'div', part: 'empty' })
  if (options.legend ?? true)
    nodes.push(legendStructure(model))
  return nodes
}
