/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标尺刻度：按缩放后每单位的屏幕像素，从 1-2-5 序列里取主刻度间隔，再在主刻度之间分小格。
// 单位由调用方决定（打印用 mm，画布用 px），这里只按数值计算。

export interface RulerOptions {
  /** 标尺起点的值（标尺单位）。 */
  readonly start: number
  /** 标尺终点的值（标尺单位）。 */
  readonly end: number
  /** 每单位对应的屏幕像素（已含缩放）。 */
  readonly pixelsPerUnit: number
  /** 主刻度之间至少隔多少屏幕像素，缺省 64。 */
  readonly minMajorSpacing?: number
  /** 小刻度之间至少隔多少屏幕像素，缺省 6。 */
  readonly minMinorSpacing?: number
  /** 主刻度间隔的有效数字序列，缺省 [1, 2, 5]。 */
  readonly steps?: readonly number[]
}

export interface RulerTick {
  /** 刻度的值（标尺单位）。 */
  readonly value: number
  /** 距标尺起点的屏幕像素。 */
  readonly offset: number
  /** 是否主刻度（带标签的那种）。 */
  readonly major: boolean
}

export interface RulerTicks {
  /** 主刻度间隔（标尺单位）。 */
  readonly step: number
  /** 小刻度间隔；没有小刻度时与 step 相同。 */
  readonly minorStep: number
  readonly ticks: readonly RulerTick[]
}

const SUBDIVISIONS = [10, 5, 2] as const

/** 求 [start, end] 范围内的刻度，主刻度落在 step 的整数倍上。 */
export function rulerTicks(options: RulerOptions): RulerTicks {
  const { start, end, pixelsPerUnit } = options
  const minMajor = options.minMajorSpacing ?? 64
  const minMinor = options.minMinorSpacing ?? 6
  const steps = options.steps ?? [1, 2, 5]
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end)
    throw new RangeError(`[designer-kit] ruler range must be finite with start <= end, got ${start}–${end}`)
  if (!(pixelsPerUnit > 0) || !Number.isFinite(pixelsPerUnit))
    throw new RangeError(`[designer-kit] pixelsPerUnit must be a positive finite number, got ${pixelsPerUnit}`)
  if (!(minMajor > 0) || !(minMinor > 0))
    throw new RangeError('[designer-kit] ruler spacing must be positive')
  if (steps.length === 0 || steps.some(step => !(step > 0)))
    throw new RangeError('[designer-kit] ruler steps must be positive numbers')

  const ordered = [...steps].sort((a, b) => a - b)
  const target = minMajor / pixelsPerUnit
  let exponent = Math.floor(Math.log10(target)) - 1
  let step = 0
  while (step === 0) {
    const scale = 10 ** exponent
    const found = ordered.find(candidate => candidate * scale >= target - 1e-12 * scale)
    if (found !== undefined)
      step = round(found * scale)
    else
      exponent++
  }

  const divisions = SUBDIVISIONS.find(count => (step / count) * pixelsPerUnit >= minMinor) ?? 1
  const minorStep = step / divisions
  const first = Math.ceil(start / minorStep - 1e-9)
  const last = Math.floor(end / minorStep + 1e-9)
  const ticks: RulerTick[] = []
  for (let index = first; index <= last; index++) {
    const value = round(index * minorStep)
    ticks.push({ value, offset: (value - start) * pixelsPerUnit, major: ((index % divisions) + divisions) % divisions === 0 })
  }
  return { step, minorStep, ticks }
}

/** 去掉浮点累积误差：保留 12 位有效数字。 */
function round(value: number): number {
  return value === 0 ? 0 : Number(value.toPrecision(12))
}
