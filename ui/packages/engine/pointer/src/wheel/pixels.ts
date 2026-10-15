/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 滚轮滚动量换成像素：WheelEvent 按行或按页计量时，按一行、一页各折多少像素换算。

/** WheelEvent 上参与换算的三个字段；WheelEvent 本身可以直接传入。 */
export interface WheelDelta {
  readonly deltaX: number
  readonly deltaY: number
  /** 0 按像素、1 按行、2 按页；其它值按像素处理。 */
  readonly deltaMode: number
}

export interface WheelPixelOptions {
  /** 一行折成的像素，缺省 16。 */
  readonly line?: number
  /** 一页折成的像素，缺省 400；滚动的是某个容器时可传它的可见长度。 */
  readonly page?: number
}

/** 滚动量换成像素：返回横向与纵向的像素位移，正向与 deltaX / deltaY 相同。 */
export function wheelPixels(delta: WheelDelta, options: WheelPixelOptions = {}): { x: number, y: number } {
  const unit = delta.deltaMode === 1 ? options.line ?? 16 : delta.deltaMode === 2 ? options.page ?? 400 : 1
  return { x: delta.deltaX * unit, y: delta.deltaY * unit }
}
