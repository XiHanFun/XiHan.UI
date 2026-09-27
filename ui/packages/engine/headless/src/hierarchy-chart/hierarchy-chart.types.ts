/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 hierarchy chart 类型契约。

import type {
  ChartTranslations,
} from '../shared/chart'

/** 空间填充的方式：treemap 矩形树图（缺省）、sunburst 旭日图、icicle 冰柱图、pack 圆堆积。 */
export type HierarchyLayout = 'treemap' | 'sunburst' | 'icicle' | 'pack'

/** 矩形树图的铺法：squarify 块尽量接近正方（缺省），binary 二分，slice-dice 按层交替横竖切。 */
export type HierarchyTile = 'squarify' | 'binary' | 'slice-dice'

/** 着色：branch 按第一层分支取分类色、后代逐层变浅（缺省），value 按值取顺序色阶，uniform 统一取色槽 1。 */
export type HierarchyColorBy = 'branch' | 'value' | 'uniform'

/** 下钻路径上的一项：从最顶层到当前的根。 */
export interface HierarchyPathItem {
  /** 节点的身份；最顶层为 null。 */
  readonly key: string | null
  readonly name: string
  readonly current: boolean
}

/** 提示框里的一行：数值与占比。 */
export interface HierarchyTooltipRow {
  readonly key: 'value' | 'parent' | 'root'
  readonly name: string
  readonly value: string
}

/** 提示框的内容：头部是从当前的根到这个节点的路径，下面是数值与两种占比。 */
export interface HierarchyTooltipModel {
  readonly header: string
  readonly rows: readonly HierarchyTooltipRow[]
}

/** 摘要模型：摘要模板拿到的全部事实，数字已按 locale 写好。 */
export interface HierarchySummary {
  /** 当前的根的名字。 */
  readonly root: string
  readonly total: string
  /** 当前的根下面一层的项数。 */
  readonly childCount: number
  /** 下面一层里最大的一项；没有时为 null。 */
  readonly largest: { readonly name: string, readonly value: string, readonly share: string } | null
}

export interface HierarchyChartTranslations extends ChartTranslations {
  /** 数据的最顶层没有名字时的叫法，也是下钻路径的第一项。 */
  rootLabel: string
  /** 下钻路径的可及名。 */
  pathLabel: string
  /** 数据表与提示框的列名 / 行名。 */
  nameLabel: string
  valueLabel: string
  parentShareLabel: string
  rootShareLabel: string
  summary: (model: HierarchySummary) => string
}

/** 换了根时报告的内容。 */
export interface HierarchyRootKeyChangeDetails {
  readonly rootKey: string | null
}

/** 场景里的一个标记在 DOM 里画成什么元素。 */
export type HierarchyMarkTag = 'g' | 'path' | 'text'
