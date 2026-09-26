/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 图表内核的类型契约：各图表组件共用的数据身份、详情载荷、文案、度量与状态片段。

import type { Tone } from '@xihan-ui/core'
import type { DatumRef, FontSpec, Mark, TableModel } from '@xihan-ui/viz'

/** 自变量键：类目名、数值或日期。 */
export type ChartKey = string | number | Date

/** 场景里的一个标记：适配器按它画 SVG 元素，属性由各图表的 getMarkProps 给出。 */
export type ChartMark = Mark

/** 一行数据；图表只读不写。 */
export type ChartRow = Readonly<Record<string, unknown>>

/** 一个数据标记对应的数据：系列与它在原始数据里的位置。 */
export type ChartDatumRef = DatumRef

/**
 * 悬停、聚焦或点击到某个数据时报告的内容。
 * values 是该标记用到的通道值（按通道名：x、y、value……），formatted 是同一组值按图表格式写成的文字。
 */
export interface ChartDatumDetails {
  readonly seriesId: string
  readonly seriesName: string
  /** 分类色槽 1–8；语义系列为 null。 */
  readonly slot: number | null
  /** 语义系列的语气；分类系列为 null。 */
  readonly tone: Tone | null
  /** 在原始数据中的位置。 */
  readonly index: number
  readonly key: ChartKey
  readonly values: Readonly<Record<string, unknown>>
  readonly formatted: Readonly<Record<string, string>>
  readonly datum: ChartRow
  /** 在绘图区里的坐标（px），提示框与十字准线据此对齐。 */
  readonly point: { readonly x: number, readonly y: number }
  /** 按自变量汇报时（axis 提示）同一个键上的全部可见系列，按图例次序。 */
  readonly items?: readonly ChartDatumDetails[]
}

/** 摘要里的一个点：键与数值都已按图表的格式写成文字。 */
export interface ChartSummaryPoint {
  readonly key: string
  readonly value: string
}

/** 一个系列的摘要。 */
export interface ChartSummarySeries {
  readonly id: string
  readonly name: string
  /** 存在的值个数（缺失不计）。 */
  readonly count: number
  readonly min: ChartSummaryPoint | null
  readonly max: ChartSummaryPoint | null
  readonly first: ChartSummaryPoint | null
  readonly last: ChartSummaryPoint | null
  /** 首末变化率（last / first − 1）；首值为 0 或不足两个值时为 null。 */
  readonly change: number | null
}

/** 摘要模型：摘要模板拿到的全部事实，数字与日期已按 locale 写好。 */
export interface ChartSummary {
  readonly seriesCount: number
  /** 自变量的范围；没有数据时为 null。 */
  readonly range: { readonly first: string, readonly last: string, readonly count: number } | null
  readonly series: readonly ChartSummarySeries[]
}

/**
 * 各图表共有的内建文案，缺省英文。
 * datumLabel 是数据标记的可及名，是函数，按语言由作者整条替换；摘要模板由各组件按自己的模型另给。
 */
export interface ChartTranslations {
  /** 绘图区的角色说明。 */
  chartRoleDescription: string
  /** 系列分组的角色说明。 */
  seriesRoleDescription: string
  /** 图例工具条的可及名。 */
  legendLabel: string
  /** 缺失值在提示框与数据表里的写法。 */
  missingValue: string
  /** 没有数据时空态的文字。 */
  emptyText: string
  /** 合并后的「其他」。 */
  otherLabel: string
  /** 数据表的标题。 */
  tableCaption: string
  /** 数据标记的可及名。 */
  datumLabel: (details: ChartDatumDetails) => string
}

/**
 * 几何计算要用的像素值。真源是 CSS 自定义属性：缺省取自令牌，挂载后从根的计算样式读取，
 * 作者覆盖组件槽即可改变几何，不需要布局属性。
 */
export interface ChartMetrics {
  /** 柱的最大厚度。 */
  readonly barMax: number
  /** 相邻填充之间的表面间隙，也是点外描边环的宽度。 */
  readonly gap: number
  readonly lineWidth: number
  /** 点的直径。 */
  readonly pointSize: number
  /** 数据标记的最小命中尺寸。 */
  readonly hitMin: number
  readonly tickLength: number
  /** 刻度线与刻度标签之间的间距。 */
  readonly labelGap: number
  /** 轴标签与数据标签的字体。 */
  readonly font: FontSpec
}

/** 视口尺寸（px）。 */
export interface ChartSize {
  readonly width: number
  readonly height: number
}

/** 当前激活的数据来自哪一路：指针悬停或键盘聚焦。 */
export type ChartActiveSource = 'pointer' | 'keyboard'

/** 指针悬停命中的数据与指针在绘图区里的位置。 */
export interface ChartHover {
  readonly ref: ChartDatumRef
  readonly x: number
  readonly y: number
}

/** 图例显隐变化时报告的内容。 */
export interface ChartHiddenSeriesChangeDetails {
  readonly hiddenSeries: string[]
}

/** 激活的自变量键变化时报告的内容；收起时为 null。 */
export interface ChartActiveKeyChangeDetails {
  readonly activeKey: ChartKey | null
}

/** 各图表组件共有的属性。 */
export interface ChartCommonProps {
  /** 隐藏的系列（受控）；饼图的「系列」是扇区。 */
  hiddenSeries?: string[]
  /** 初始隐藏的系列（非受控）。 */
  defaultHiddenSeries?: string[]
  /** 图例切换显隐时通知。 */
  onHiddenSeriesChange?: (details: ChartHiddenSeriesChangeDetails) => void
  /**
   * 激活的自变量键（受控）。多张图接到同一份状态上时，十字准线与提示框随之联动：
   * 两个量纲不共用一根 y 轴，而是两张图在同一个键上一起指示。
   */
  activeKey?: ChartKey | null
  /** 指针或键盘把激活的键换掉时通知；收起时为 null。 */
  onActiveKeyChange?: (details: ChartActiveKeyChangeDetails) => void
  /** 数据重取中：保留上一帧，整体降低不透明度，根上 aria-busy。 */
  pending?: boolean
  /** 数字、日期格式与内建文案的语言；未提供时按宿主语言。 */
  locale?: string
  /** 悬停或聚焦到某个数据时通知；收起时为 null。同一个数据不重复通知。 */
  onDatumActive?: (details: ChartDatumDetails | null) => void
  /** 指针点击、Enter 或 Space 按在某个数据上时通知。 */
  onDatumPress?: (details: ChartDatumDetails) => void
}

/** 管线的无障碍产物：摘要文字与数据表模型，服务端即可输出。 */
export interface ChartA11yModel {
  readonly summary: string
  readonly table: TableModel
}
