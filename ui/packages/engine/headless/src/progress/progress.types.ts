/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 progress 类型契约。

import type { PropTypes, Size, Tone } from '@xihan-ui/core'
import type { NumberFormatSpec } from '@xihan-ui/viz'

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

/** 仪表盘怎么指出当前值：fill 沿弧填到当前值，needle 用一根指针指过去、弧上只留色带。 */
export type ProgressIndicator = 'fill' | 'needle'

/** 一个分段：上界、语气与名字。分段按上界升序排列，第一段从 0 起，后一段从前一段的上界起。 */
export interface ProgressThreshold {
  /** 这一段的上界，在 (0, max] 内。 */
  value: number
  tone: Tone
  /** 分段的名字（如「警戒」）：当前值落在这一段时并进读屏文字。 */
  label?: string
}

/** 量程刻度：大约几个刻度、刻度值怎么写。 */
export interface ProgressScaleOptions {
  /** 刻度数量提示，缺省 5；实际刻度取整到好读的步长。 */
  ticks?: number
  /** 刻度值的数字格式。 */
  format?: NumberFormatSpec
}

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
  /**
   * 分段：升序的上界，每段带语气与名字，画成轨道上的色带；当前值所在的那一段决定填充色。
   * 只在 meter 语义下生效。上界不升序、不是有限数或落在 (0, max] 之外时报错，整组不画。
   */
  thresholds?: readonly ProgressThreshold[]
  /** 目标值：画一道目标刻度。只在 meter 语义下生效；不在 [0, max] 内时报错、不画。 */
  target?: number
  /** 量程刻度与刻度值：true 取缺省，也可以给刻度数量与数字格式。只在 meter 语义下生效。 */
  scale?: boolean | ProgressScaleOptions
  /** 仪表盘的指示方式，缺省 fill。只在 meter 语义下生效，只对 dashboard 形态有意义。 */
  indicator?: ProgressIndicator
  /**
   * 分段显示：把线形轨道切成这么多等宽的格，格与格之间留一道间隙。填充按整格走，不足一格的部分不画；
   * 读屏报的仍是实际值。取不小于 2 的整数，只对线形生效；取值不合法或写在环形上时报错、按没给处理。
   */
  steps?: number
  /** 条纹：填充上铺一层斜纹，进行中沿行向流动，完成后静止；减弱动效下始终静止。只对线形生效。 */
  striped?: boolean
  /**
   * 缓冲值：在填充之后画第二段浅色填充，表示已经就绪、还没用到的那一截（如视频已缓冲到的位置），
   * 越界夹到 [0, max]，低于 value 的部分被填充盖住。只在进度语义的线形下生效；进度未知时不画。
   */
  buffer?: number
  /** 刻度值与读屏文字的语言；未提供时按宿主语言。 */
  locale?: string
  translations?: Partial<ProgressTranslations>
}

/** 轨道上的一段色带：起止是占满值的比例 0–1。 */
export interface ProgressBand {
  readonly key: string
  readonly from: number
  readonly to: number
  readonly tone: Tone
  readonly label: string | null
}

/** 一个量程刻度：值、位置（占满值的比例 0–1）与写好的刻度值。 */
export interface ProgressTick {
  readonly key: string
  readonly value: number
  readonly at: number
  readonly label: string
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
  /** 落定后的分段数：没分段时为 0。 */
  steps: number
  /** 缓冲值占满值的比例；没有缓冲值或不画缓冲时为 null。 */
  buffer: number | null
  getRootProps: () => T['element']
  /** 承载环的 <svg>；线形不渲染它。 */
  getCanvasProps: () => T['element']
  getTrackProps: () => T['element']
  getRangeProps: () => T['element']
  /** 缓冲段：线形画在轨道里、填充之前；没有缓冲值时带 hidden。 */
  getBufferProps: () => T['element']
  /** 环心区域：落位归皮肤，内容归作者。线形不使用。 */
  getLabelProps: () => T['element']
  /** 分段色带；不在 meter 语义下或没有分段时为空。 */
  bands: readonly ProgressBand[]
  /** 量程刻度；没开刻度时为空。 */
  ticks: readonly ProgressTick[]
  /** 目标值占满值的比例；没有目标时为 null。 */
  target: number | null
  /** 落定后的指示方式：只有 meter 语义下的 dashboard 才会是 needle。 */
  indicator: ProgressIndicator
  /** 线形画在轨道里、环形画在 canvas 里。 */
  getThresholdProps: (band: ProgressBand) => T['element']
  /** 线形是轨道外的一道竖线，环形是横穿弧的一道短线。 */
  getTargetProps: () => T['element']
  /** 刻度值的容器：线形排在轨道下方，环形叠在环上。 */
  getScaleProps: () => T['element']
  /** 线形画在 scale 里，环形画在 canvas 里。 */
  getScaleTickProps: (tick: ProgressTick) => T['element']
  getScaleLabelProps: (tick: ProgressTick) => T['element']
  /** 仪表盘的指针，画在 canvas 里。 */
  getNeedleProps: () => T['element']
}

/** 读屏文案。 */
export interface ProgressTranslations {
  /** 当前值落在带名字的分段里时的读屏文字：value 是百分数，label 是分段名，缺省「value, label」。 */
  segmentValueText: (details: { value: string, label: string }) => string
}
