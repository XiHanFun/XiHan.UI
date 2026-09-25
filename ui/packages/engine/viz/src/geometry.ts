/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 几何基本类型：点与矩形。

/** 平面上的点 [x, y]；径向场合按各函数的说明解读为 [角度, 半径]。 */
export type Point = readonly [number, number]

/** 轴对齐矩形，宽高非负。 */
export interface Rect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}
