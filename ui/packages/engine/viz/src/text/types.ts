/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 文字度量的共用类型：字体、量出的尺寸与度量器协议。

export interface FontSpec {
  readonly family: string
  /** 字号（px）。 */
  readonly size: number
  readonly weight: number
  /** 行高（px）。 */
  readonly lineHeight: number
  /** 字形：normal（缺省）或 italic；估算器不区分，Canvas 度量器写进 font 串。 */
  readonly style?: 'normal' | 'italic'
}

export interface TextSize {
  readonly width: number
  readonly ascent: number
  readonly descent: number
}

/**
 * 文字度量器。version 在度量结果可能变化时（精确度量器就绪、字体加载完成）递增，
 * 依赖度量的布局据此重算。
 */
export interface TextMeasurer {
  readonly version: number
  readonly measure: (text: string, font: FontSpec) => TextSize
}
