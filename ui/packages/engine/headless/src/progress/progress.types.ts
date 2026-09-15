/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 progress 类型契约。

import type { PropTypes, Size, Tone } from '@xihan-ui/core'

/** 形态：线形是一条横轨，环形与仪表盘把同一份进度绘制为一个圆。 */
export type ProgressVariant = 'line' | 'circle' | 'dashboard'

/** 仪表盘的缺口朝向。 */
export type ProgressGapPosition = 'top' | 'right' | 'bottom' | 'left'

/**
 * 报告的是一件事的进度，还是已知区间中的一个量。
 * progress 使用 role=progressbar；meter 使用 role=meter：磁盘占用、电量、评分这类量
 * 没有完成的概念，也不存在未知态。
 */
export type ProgressSemantics = 'progress' | 'meter'

export interface ProgressProps {
  /** 当前进度值，越界会被夹到 [0, max]；非有限值按 0 处理。 */
  value?: number
  /**
   * 进度未知：进度条改为往复动画，读屏侧不报数。
   * 置真时 aria-valuenow 整体不发出：ARIA 规定不确定进度以该属性缺席表达。
   */
  indeterminate?: boolean
  /** 满值上限，默认 100；非有限值或不为正时回退为 100。 */
  max?: number
  /** 形态，默认 line。circle 绘制整环，dashboard 在环上留出一个缺口。 */
  variant?: ProgressVariant
  /**
   * 环的线宽，使用 viewBox 单位（整个环绘制在 100×100 中），默认 6。
   * 只对 circle / dashboard 生效：它修改的是几何（半径随之向内收缩），因此是 prop 而不是令牌；
   * 线形的厚度仍使用 --xh-progress-thickness。
   */
  strokeWidth?: number
  /** 缺口角度，默认 75。只对 dashboard 生效。 */
  gapDegree?: number
  /** 缺口朝向，默认 bottom。只对 dashboard 生效。 */
  gapPosition?: ProgressGapPosition
  /** 读屏播报的文字，覆盖默认的数值播报（进度不是百分比时使用，如「第 3 步，共 8 步」）。 */
  valueText?: string
  /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色 */
  tone?: Tone
  /** 尺寸：sm / md / lg。线形影响轨道厚度，环形影响直径 */
  size?: Size
  /** 报告的是进度还是量，默认 progress。meter 档发出 role="meter"，且 indeterminate 不再生效。 */
  semantics?: ProgressSemantics
}

export interface ProgressApi<T extends PropTypes = PropTypes> {
  /** 落定后的形态。 */
  variant: ProgressVariant
  /** 落定后的语义。 */
  semantics: ProgressSemantics
  /** 进度比例，[0,1]。 */
  ratio: number
  /** 进度百分比，取整。 */
  percent: number
  getRootProps: () => T['element']
  /** 承载环的 <svg>；线形不渲染它。 */
  getCanvasProps: () => T['element']
  getTrackProps: () => T['element']
  getRangeProps: () => T['element']
  /** 环心区域：落位归皮肤，内容归作者。线形不使用。 */
  getLabelProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface ProgressTranslations {}
