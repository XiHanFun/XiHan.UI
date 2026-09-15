/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 bar code 类型契约。

import type { PropTypes } from '@xihan-ui/core'
import type { BarFormat } from './bar-encode'

/**
 * 码制。
 *
 * · code128：Code 128（ISO/IEC 15417），任意 ASCII，开启 `gs1` 即 GS1-128；
 * · ean13 / ean8 / upca / upce：零售商品码（ISO/IEC 15420），定长数字，校验位可省略或提供；
 * · itf14：外箱用的交叉二五码（ISO/IEC 16390），14 位数字；
 * · code39：Code 39（ISO/IEC 16388），大写字母、数字与七个符号。
 */
export type BarCodeFormat = BarFormat

/** 根的三态：已绘制 / 没有可编码的内容 / 内容不符合码制规则或码制未知。 */
export type BarCodeState = 'ready' | 'empty' | 'error'

/** 人读文字中的一段，坐标为根 viewBox 内的像素。 */
export interface BarCodeTextRun {
  readonly x: number
  /** 基线。 */
  readonly y: number
  readonly anchor: 'start' | 'middle' | 'end'
  readonly text: string
}

export interface BarCodeProps {
  /** 码制，默认 code128。提供未知值时不绘制，根落到 `error` 态。 */
  format?: BarCodeFormat
  /** 要编码的内容；空串不绘制。定长数字码制接受不带或带校验位的两种长度，带校验位时校验。 */
  value?: string
  /**
   * GS1-128：起始符后放置 FNC1，内容中的 GS（U+001D）编码为变长 AI 之间的分隔。
   * 只对 code128 有意义，其他码制提供时向诊断通道报告一条警告，按未提供处理。
   */
  gs1?: boolean
  /** 条下方是否打印人读文字，默认打印。 */
  text?: boolean
  /**
   * 附加 mod 43 校验字符。只对 code39 有意义：其余码制的校验位是规范必带的，
   * 提供时向诊断通道报告一条警告，按未提供处理。
   */
  checksum?: boolean
  /** 最窄条的像素宽度（X 尺寸），默认 2；整张码的宽度由它乘以模块数得出。 */
  barWidth?: number
  /** 条的像素高度，默认 64；不含守卫条的延长段、人读文字与承载条。 */
  height?: number
  /** 两侧静区，单位为模块数；默认按码制的规范值（code128 / itf14 / code39 10，ean13 11，upca / upce 9，ean8 7）。 */
  margin?: number
  /**
   * 上下承载条：itf14 印在瓦楞纸上防止短读的两根横条，默认绘制；
   * 只对 itf14 有意义，其他码制提供时向诊断通道报告一条警告，按未提供处理。
   */
  bearerBars?: boolean
  /** 可及名，默认使用 value；提供全空白的名字等同于未提供。 */
  label?: string
}

export interface BarCodeApi<T extends PropTypes = PropTypes> {
  /** 解析后的码制。提供未知值时原样透出，使错误信息与 data-format 都指向该值。 */
  format: BarCodeFormat
  /** 条空交替的宽度（模块），首元素为条；未绘制时为空数组。 */
  runs: readonly number[]
  /** 不含静区的模块数；未绘制时为 0。 */
  modules: number
  /** 实际编入码中的内容，含补齐的校验位；未绘制时为空串。 */
  encoded: string
  /** 解析后的静区宽度，单位为模块数。 */
  margin: number
  /** 根的像素宽高，也是 viewBox 的尺寸。 */
  pixelWidth: number
  pixelHeight: number
  /** 根的 viewBox。 */
  viewBox: string
  /** 全部条（含守卫条的延长段与承载条）合成的 `<path>` 的 d；未绘制时为空串，此时不应生成 path 节点。 */
  path: string
  /** 人读文字，每段一个 `<text>`；关闭 `text` 或未绘制时为空数组。 */
  text: readonly BarCodeTextRun[]
  /** 人读文字的字号，像素。 */
  fontSize: number
  /** 当前状态。 */
  state: BarCodeState
  /** 编码失败的原因；其余状态为 undefined。 */
  error: string | undefined
  /** 解析后的可及名；未提供名字时为 undefined，此时根退出无障碍树。 */
  label: string | undefined
  getRootProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface BarCodeTranslations {}
