/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 颜色度量：WCAG 相对亮度与对比度、OKLab 色差、Machado–Oliveira–Fernandes 2009 色觉障碍模拟。

import type { Rgba } from './space'
import { invalidArgument } from '../errors'
import { fromLinearRgb, toLinearRgb, toOklab } from './space'

/** WCAG 2.x 相对亮度（0–1），不看透明度。 */
export function relativeLuminance(color: Rgba): number {
  const [r, g, b] = toLinearRgb(color)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** 半透明前景按 alpha 叠到不透明背景上。 */
function composite(foreground: Rgba, background: Rgba): Rgba {
  const a = foreground.a
  if (a >= 1)
    return foreground
  return {
    r: foreground.r * a + background.r * (1 - a),
    g: foreground.g * a + background.g * (1 - a),
    b: foreground.b * a + background.b * (1 - a),
    a: 1,
  }
}

/**
 * WCAG 2.x 对比度（1–21），与参数先后无关。
 * 前景半透明时先叠到背景上再算；背景必须不透明，否则结果取决于背景之下还有什么。
 */
export function contrastRatio(foreground: Rgba, background: Rgba): number {
  if (background.a < 1)
    throw invalidArgument('对比度的背景必须不透明', { background })
  const a = relativeLuminance(composite(foreground, background))
  const b = relativeLuminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** OKLab 欧氏距离 × 100（ΔE_OK），不看透明度。 */
export function deltaEOk(a: Rgba, b: Rgba): number {
  const x = toOklab(a)
  const y = toOklab(b)
  return Math.hypot(x.l - y.l, x.a - y.a, x.b - y.b) * 100
}

export type CvdKind = 'protan' | 'deutan' | 'tritan'

/**
 * 严重度 1.0 的模拟矩阵，作用在线性 sRGB 上（Machado, Oliveira, Fernandes 2009）。
 * 每行之和为 1，灰阶在模拟下不变。
 */
const CVD_MATRICES: Readonly<Record<CvdKind, readonly number[]>> = {
  protan: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deutan: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
  tritan: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039],
}

/**
 * 模拟红色弱（protan）、绿色弱（deutan）、蓝色弱（tritan）者看到的颜色。
 * severity 取 0–1，缺省 1（完全色盲）；小于 1 时在原色与完全模拟之间按线性光插值。
 */
export function simulateCvd(color: Rgba, kind: CvdKind, severity = 1): Rgba {
  const matrix = CVD_MATRICES[kind]
  if (!matrix)
    throw invalidArgument('未知的色觉障碍类型', { kind })
  if (!(severity >= 0 && severity <= 1))
    throw invalidArgument('严重度必须在 [0, 1] 内', { severity })
  const [r, g, b] = toLinearRgb(color)
  const m = (i: number): number => matrix[i] as number
  const simulated = [
    m(0) * r + m(1) * g + m(2) * b,
    m(3) * r + m(4) * g + m(5) * b,
    m(6) * r + m(7) * g + m(8) * b,
  ] as const
  const mix = (original: number, target: number): number => original + (target - original) * severity
  return fromLinearRgb(mix(r, simulated[0]), mix(g, simulated[1]), mix(b, simulated[2]), color.a)
}
