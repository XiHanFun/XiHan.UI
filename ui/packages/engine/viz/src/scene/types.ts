/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 场景：与渲染器无关的标记列表。标记只带几何参数与语义着色引用，不含任何颜色值；SVG 与 Canvas 消费同一份场景。

import type { Rect } from '../geometry'
import type { KeyedPoint } from '../interpolate/points'
import type { SymbolName } from '../shape/symbol'

/** 标记对应的数据：系列与它在原始数据里的位置。 */
export interface DatumRef {
  readonly seriesId: string
  readonly index: number
}

/**
 * 语义着色引用：分类色槽、色阶位置、语气、涨跌、符号与纹理序号。
 * 渲染器把它解析成令牌（SVG 由样式解析，Canvas 读计算样式），场景本身不含颜色值。
 */
export interface MarkPaint {
  /** 分类色槽 1–8。 */
  readonly slot?: number
  /** 顺序 / 发散色阶位置 0–1。 */
  readonly t?: number
  /** 语义系列的语气名。 */
  readonly tone?: string
  readonly trend?: 'rise' | 'fall'
  readonly symbol?: SymbolName
  /** 纹理序号 1–8，与色槽一一对应。 */
  readonly pattern?: number
}

export interface MarkA11y {
  readonly label: string
  readonly focusable: boolean
}

interface MarkBase {
  /** 场景内唯一；过渡与按键复用节点都靠它，习惯写成 `${seriesId}:${datumKey}`。 */
  readonly key: string
  /** 对应的部件名。 */
  readonly part: string
  readonly datum?: DatumRef
  readonly paint?: MarkPaint
  readonly a11y?: MarkA11y
  /** 0–1，缺省 1；过渡中的淡入淡出。 */
  readonly opacity?: number
  /** 正在退场：仍然画出，但不参与命中与键盘遍历。 */
  readonly exiting?: boolean
}

/** 矩形；给了 cornerRadius 时只圆远离基线的一端。 */
export interface RectMark extends MarkBase {
  readonly kind: 'rect'
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly cornerRadius?: number
  readonly orientation?: 'vertical' | 'horizontal'
  readonly baseline?: 'start' | 'end'
}

/** 扇区或环段，角度 0 在 12 点方向、顺时针为正。 */
export interface ArcMark extends MarkBase {
  readonly kind: 'arc'
  readonly cx: number
  readonly cy: number
  readonly innerRadius: number
  readonly outerRadius: number
  readonly startAngle: number
  readonly endAngle: number
  readonly padAngle?: number
  readonly padRadius?: number
  readonly cornerRadius?: number
}

/** 曲线的名字；标记只引用名字，保持可序列化。 */
export type CurveName
  = | 'linear'
    | 'linearClosed'
    | 'monotoneX'
    | 'monotoneY'
    | 'step'
    | 'stepBefore'
    | 'stepAfter'
    | 'catmullRom'
    | 'catmullRomClosed'
    | 'basis'
    | 'bumpX'
    | 'bumpY'

/** 折线：按数据键给出的点，过渡时按键对齐插值后重新生成路径。 */
export interface LineMark extends MarkBase {
  readonly kind: 'line'
  readonly points: readonly KeyedPoint[]
  readonly curve: CurveName
}

/** 面积：点带基线 y0。 */
export interface AreaMark extends MarkBase {
  readonly kind: 'area'
  readonly points: readonly KeyedPoint[]
  readonly curve: CurveName
}

/** 符号，(x, y) 是中心，size 是面积（px²）。 */
export interface SymbolMark extends MarkBase {
  readonly kind: 'symbol'
  readonly x: number
  readonly y: number
  readonly size: number
  readonly symbol: SymbolName
}

/** 现成的路径；过渡时只做淡入淡出。 */
export interface PathMark extends MarkBase {
  readonly kind: 'path'
  readonly d: string
}

export interface TextMark extends MarkBase {
  readonly kind: 'text'
  readonly x: number
  readonly y: number
  readonly text: string
  readonly anchor: 'start' | 'middle' | 'end'
  readonly baseline: 'top' | 'middle' | 'bottom' | 'alphabetic'
  /** 旋转角（度），绕 (x, y)。 */
  readonly rotate?: number
}

/** 分组：子标记整体平移 (x, y)。 */
export interface GroupMark extends MarkBase {
  readonly kind: 'group'
  readonly x?: number
  readonly y?: number
  readonly children: readonly Mark[]
}

export type Mark = RectMark | ArcMark | LineMark | AreaMark | SymbolMark | PathMark | TextMark | GroupMark

export type SceneLayer = 'back' | 'data' | 'front'

export interface SceneLayers {
  /** 网格与参考带。 */
  readonly back: readonly Mark[]
  /** 系列。 */
  readonly data: readonly Mark[]
  /** 注释、准线、焦点环。 */
  readonly front: readonly Mark[]
}

export interface Scene {
  /** 只在几何变化时递增；渲染器据此跳过没有变化的重渲。 */
  readonly version: number
  /** 过渡中的中间帧带着进度 0–1；静止的场景没有这个字段。 */
  readonly frame?: number
  readonly layers: SceneLayers
  readonly bounds: Rect
}
