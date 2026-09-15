/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 matrix code 类型契约。

import type { PropTypes } from '@xihan-ui/core'
import type { Pdf417Level } from './pdf417-encode'
import type { QrLevel } from './qr-encode'

/**
 * 码制。
 *
 * 每种码制各有自己的编码器与几何，组件只按该值分派；同一个 `value` 换一种码制即另一张码。
 * · qr：QR Code（ISO/IEC 18004），有三个码眼与四档纠错；
 * · data-matrix：Data Matrix ECC 200（ISO/IEC 16022，含矩形扩展），L 形定位图形，纠错率随尺寸固定；
 * · pdf417：PDF417（ISO/IEC 15438），堆叠条码，九档纠错，列数可指定；
 * · aztec：Aztec（ISO/IEC 24778），牛眼居中、不需要静区，纠错按百分比。
 */
export type MatrixCodeFormat = 'qr' | 'data-matrix' | 'pdf417' | 'aztec'

/**
 * 纠错级别，取值域随码制：qr 为 L / M / Q / H；pdf417 为 0–8；aztec 为纠错码字至少占的百分比 5–95。
 * data-matrix 的纠错率随尺寸固定，没有级别可选。
 */
export type MatrixCodeLevel = QrLevel | Pdf417Level | number

/** 根的三态：已绘制 / 没有可编码的内容 / 内容无法容纳或码制未知。 */
export type MatrixCodeState = 'ready' | 'empty' | 'error'

/**
 * 码点形状。
 *
 * 读码器按模块中心取样，三种形状的墨都覆盖每个深色模块的几何中心：
 * · square 铺满整格；
 * · dot 是格内最大内切圆，半径半格，格心到墨边正好半格；
 * · rounded 是圆角 0.25 格的圆角方块，切掉的四个角不触及格心。
 */
export type MatrixCodeModuleShape = 'square' | 'dot' | 'rounded'

/**
 * 码眼（三个定位图形）形状。
 *
 * 两种形状都保持 7×7 的同心结构：外环是 7×7 边框、内心是 3×3、中间留一圈白，
 * 不绘制为实心块：读码器沿扫描线寻找的是 1:1:3:1:1 这条深浅比例。
 * rounded 的外框圆角取 1 格；圆角超过 1.707 格时外环四角格的格心会落到墨外。
 */
export type MatrixCodeEyeShape = 'square' | 'rounded'

/**
 * logo 的落位，同时也是其下方的挖空矩形。
 * 单位与 viewBox 相同（1 = 一个模块），四条边都压在模块边界上，不会切开半个模块。
 */
export interface MatrixCodeLogoArea {
  readonly x: number
  readonly y: number
  /** 边长，整数个模块，不超过每边模块数的 1/5。 */
  readonly size: number
}

/**
 * 中心 logo 挖空对码面造成的损伤。
 *
 * 挖空是用底色覆盖一片模块，对读码器等同人为污损：覆盖的模块一律按无法读取计算，
 * 依靠纠错码字恢复。能否恢复取决于 `ratio` 与所选纠错级别的余量：
 * L / M / Q / H 标称可恢复的码字比例依次约为 7% / 15% / 25% / 30%。
 */
export interface MatrixCodeLogoDamage {
  /** 被覆盖的模块数，即挖空边长的平方。 */
  readonly modules: number
  /**
   * 受损码字占该版本总码字数的比例，0-1。
   * 一个码字只要有一位落在挖空中，整个码字都视为受损，因此该数值远大于挖空的面积占比。
   */
  readonly ratio: number
  /**
   * 挖空中是否有功能图形。
   *
   * 只可能是校正图形：挖空边长不超过每边模块数的 1/5，该范围之外的功能图形：
   * 定位图形、分隔带、时序图形、格式信息、版本信息，全部不会触及。这些缺一格就无法定位，
   * 纠错码字也无法恢复，是真正不可触碰的。校正图形不同：7 版起有多个，丢失中间的仍有其他可用；
   * 而 7 版、10 版这类版本的正中格恰好是某个校正图形的中心，禁止覆盖它等于这些版本
   * 无法放置居中 logo，而居中正是 logo 唯一的放置方式。因此这里只如实报告，不拦截。
   */
  readonly hitsFunctionPatterns: boolean
}

export interface MatrixCodeProps {
  /** 码制，默认 qr。提供未知值时不绘制，根落到 `error` 态。 */
  format?: MatrixCodeFormat
  /** 要编码的内容；空串不绘制。QR 按 UTF-8 取字节使用字节模式；Data Matrix 使用 ASCII 模式，Latin-1 以外的字符按 UTF-8 并声明 ECI。 */
  value?: string
  /**
   * GS1 模式：在最前面放置 FNC1，读码器据此把内容解释为 GS1 元素串，即 GS1 QR / GS1 DataMatrix；
   * 变长 AI 之间用内容中的 GS（U+001D）分隔。
   */
  gs1?: boolean
  /**
   * 纠错级别，取值域随码制：qr 为 L / M / Q / H（默认 M）；pdf417 为 0–8（默认按数据量取规范推荐档）；
   * aztec 为纠错码字至少占的百分比 5–95（默认 33）。提供码制不识别的值时不绘制，根落到 `error` 态。
   * data-matrix 没有级别可选，提供时向诊断通道报告一条警告，按未提供处理。
   */
  level?: MatrixCodeLevel
  /**
   * PDF417 的数据列数 1–30，默认在宽高比最接近 3:1 的档位中选择。
   * 只对 pdf417 有意义，其他码制提供时向诊断通道报告一条警告，按未提供处理。
   */
  columns?: number
  /**
   * 从矩形尺寸（含矩形扩展 DMRE）中选择，默认从正方形尺寸中选择。
   * 只对 data-matrix 有意义，其他码制提供时向诊断通道报告一条警告，按未提供处理。
   */
  rectangular?: boolean
  /** 像素宽度，默认 160；高度按模块比例计算，正方形码宽高相等。两者都写为根上的内联尺寸。 */
  pixelSize?: number
  /** 静区宽度，单位为模块数，默认按码制的规范值（qr 4、data-matrix 1）；静区含在 viewBox 中，不占额外尺寸。 */
  margin?: number
  /** 可及名，默认使用 value；提供全空白的名字等同于未提供。 */
  label?: string
  /** 码点形状，默认 square。pdf417 是条不是点，提供时向诊断通道报告一条警告，按未提供处理。 */
  moduleShape?: MatrixCodeModuleShape
  /**
   * 码眼形状，默认 square。时序图形与校正图形不受它影响，一律保持方块：它们是透视校正的几何基准。
   * 只对 qr 有意义，其他码制提供时向诊断通道报告一条警告，按未提供处理。
   */
  eyeShape?: MatrixCodeEyeShape
  /**
   * 码面正中是否留出一块给 logo。
   *
   * 留出的模块会被底色覆盖，对读码器而言等于人为污损：放置 logo 时把 level 提到 Q 或 H，
   * L 与 M 的纠错余量不足以承担这一块。损伤量见 `logoDamage`；超出所选级别的余量时
   * 向诊断通道报告一条 `matrix-code.logo-damage` 警告，码照常绘制。
   * 只对 qr 有意义：Data Matrix 的纠错余量随尺寸固定、没有可选的级别，放置 logo 会报告一条警告并按未放置处理。
   */
  logo?: boolean
}

export interface MatrixCodeApi<T extends PropTypes = PropTypes> {
  /** 解析后的码制。提供未知值时原样透出，使错误信息与 data-format 都指向该值。 */
  format: MatrixCodeFormat
  /** 模块矩阵，[行][列]，true = 深色；未绘制时为空数组。 */
  modules: readonly (readonly boolean[])[]
  /** QR 实际使用的版本；其他码制与未绘制时为 0。 */
  version: number
  /** 模块列数与行数，不含静区；正方形码两者相等，pdf417 的行数已含每个码字行占的 3 个模块高，未绘制时为 0。 */
  columns: number
  rows: number
  /** 解析后的静区宽度，单位为模块数。 */
  margin: number
  /** 根的 viewBox，含静区。 */
  viewBox: string
  /**
   * 除 QR 三个码眼以外的模块合成的 `<path>` 的 d；未绘制时为空串，此时不应生成 path 节点。
   * 码眼永远不在这一条中，与形状无关。
   */
  path: string
  /**
   * QR 三个码眼合成的 `<path>` 的 d；其他码制与未绘制时为空串，此时不应生成第二个 path 节点。
   * 两条分开绘制与形状无关：码眼的颜色可以与码点不同，合成一条就无法单独上色。
   */
  eyePath: string
  /** logo 的落位与挖空矩形；未留位时为 undefined。 */
  logoArea: MatrixCodeLogoArea | undefined
  /** 挖空对码面造成的损伤；未留 logo 位时为 undefined。 */
  logoDamage: MatrixCodeLogoDamage | undefined
  /** 当前状态。 */
  state: MatrixCodeState
  /** 编码失败的原因；其余状态为 undefined。 */
  error: string | undefined
  /** 解析后的可及名；未提供名字时为 undefined，此时根退出无障碍树。 */
  label: string | undefined
  getRootProps: () => T['element']
  /** 铺到 logo 部件上的落位；未留位时宽高都是 0，该块连同其中的图形一起不渲染。 */
  getLogoProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface MatrixCodeTranslations {}
