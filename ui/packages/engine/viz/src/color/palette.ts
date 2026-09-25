/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 色板校验：分类色板的六项检查（色相顺序、明度带、彩度下限、色觉障碍分离、正常视觉色差、对比度）与有序色阶检查。

import type { CvdKind } from './metrics'
import type { Rgba } from './space'
import { invalidArgument } from '../errors'
import { contrastRatio, deltaEOk, simulateCvd } from './metrics'
import { toOklch } from './space'

export type PaletteMode = 'light' | 'dark'
export type PaletteCheckId = 'order' | 'lightness' | 'chroma' | 'cvd' | 'distinct' | 'contrast' | 'hue' | 'monotonic'
/** pass 通过；warn 只在有非颜色通道（标签、符号、数据表）补偿时合法；fail 不合格；skip 缺少输入未检查。 */
export type PaletteStatus = 'pass' | 'warn' | 'fail' | 'skip'

export interface PaletteFinding {
  /** 涉及的色槽，从 1 起。 */
  readonly slots: readonly number[]
  readonly value: number
  readonly status: 'warn' | 'fail'
  /** 色觉障碍检查里是哪一种模拟。 */
  readonly cvd?: CvdKind
}

export interface PaletteCheck {
  readonly id: PaletteCheckId
  readonly status: PaletteStatus
  /** 该项最差的测量值（明度带为偏离带中心最远的 L，其余为最小值或最大偏差）；未检查时为 null。 */
  readonly worst: number | null
  readonly findings: readonly PaletteFinding[]
}

export interface PaletteReport {
  readonly mode: PaletteMode
  /** 没有任何一项 fail。 */
  readonly ok: boolean
  readonly checks: readonly PaletteCheck[]
}

export interface CategoricalPaletteOptions {
  readonly mode: PaletteMode
  /** 色板所在的承载面。 */
  readonly surface: Rgba
  /**
   * adjacent：相邻色槽两两检查（折线、柱这类只有相邻系列会挨着的形态）；
   * all：前 3 个色槽全部两两检查（散点、气泡、小多图，任意两个标记都可能相邻）。
   */
  readonly pairs: 'adjacent' | 'all'
  /** 另一模式下的同一套色板；给了才检查两套的色相顺序是否一致。 */
  readonly reference?: readonly Rgba[]
}

export interface OrdinalRampOptions {
  readonly mode: PaletteMode
  readonly surface: Rgba
}

/** OKLCH 明度带：亮色 0.43–0.77，暗色 0.48–0.67。 */
const LIGHTNESS_BAND: Readonly<Record<PaletteMode, readonly [number, number]>> = { light: [0.43, 0.77], dark: [0.48, 0.67] }
const CHROMA_FLOOR = 0.1
/** 色觉障碍模拟下的 ΔE：≥ 8 通过，6–8 需要非颜色通道补偿，< 6 不合格。 */
const CVD_TARGET = 8
const CVD_FLOOR = 6
/** 正常视觉下的 ΔE 硬门槛。 */
const DISTINCT_FLOOR = 15
/** 数据标记对承载面的对比度。 */
const MARK_CONTRAST = 3
/** 有序色阶里对比度最低的一档对承载面的下限。 */
const RAMP_CONTRAST = 2
/** 两套色板同一色槽、或有序色阶各档之间允许的色相偏差（度）。 */
const HUE_TOLERANCE = 30
/** 彩度低于它时色相不可靠，不参与色相比较。 */
const HUE_CHROMA_MIN = 0.02
const MAX_SLOTS = 8

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

function summarize(id: PaletteCheckId, worst: number | null, findings: PaletteFinding[]): PaletteCheck {
  const status: PaletteStatus = findings.some(f => f.status === 'fail') ? 'fail' : findings.length > 0 ? 'warn' : 'pass'
  return { id, status, worst, findings }
}

function pairsOf(count: number, mode: 'adjacent' | 'all'): Array<[number, number]> {
  const out: Array<[number, number]> = []
  if (mode === 'adjacent') {
    for (let i = 0; i + 1 < count; i++)
      out.push([i, i + 1])
    return out
  }
  const head = Math.min(3, count)
  for (let i = 0; i < head; i++) {
    for (let j = i + 1; j < head; j++)
      out.push([i, j])
  }
  return out
}

function report(mode: PaletteMode, checks: PaletteCheck[]): PaletteReport {
  return Object.freeze({ mode, ok: checks.every(c => c.status !== 'fail'), checks: Object.freeze(checks) })
}

/**
 * 分类色板的六项检查，亮暗两套各跑一遍。色板至多 8 色；色槽从 1 起报告。
 * 固定色相顺序是结构性保证：给了另一模式的 reference 时核对两套同一色槽的色相一致。
 */
export function validateCategoricalPalette(colors: readonly Rgba[], options: CategoricalPaletteOptions): PaletteReport {
  if (colors.length === 0 || colors.length > MAX_SLOTS)
    throw invalidArgument(`分类色板必须有 1–${MAX_SLOTS} 个颜色`, { count: colors.length })
  const { mode, surface, pairs, reference } = options
  const lch = colors.map(toOklch)
  const checks: PaletteCheck[] = []

  if (reference) {
    if (reference.length !== colors.length)
      throw invalidArgument('reference 必须与色板一样长', { count: colors.length, reference: reference.length })
    const findings: PaletteFinding[] = []
    let worst = 0
    reference.map(toOklch).forEach((other, i) => {
      const own = lch[i]!
      if (own.c < HUE_CHROMA_MIN || other.c < HUE_CHROMA_MIN)
        return
      const d = hueDistance(own.h, other.h)
      worst = Math.max(worst, d)
      if (d > HUE_TOLERANCE)
        findings.push({ slots: [i + 1], value: d, status: 'fail' })
    })
    checks.push(summarize('order', worst, findings))
  }
  else {
    checks.push({ id: 'order', status: 'skip', worst: null, findings: [] })
  }

  const [low, high] = LIGHTNESS_BAND[mode]
  const center = (low + high) / 2
  const lightFindings: PaletteFinding[] = []
  let farthest = lch[0]!.l
  lch.forEach(({ l }, i) => {
    if (Math.abs(l - center) > Math.abs(farthest - center))
      farthest = l
    if (l < low || l > high)
      lightFindings.push({ slots: [i + 1], value: l, status: 'fail' })
  })
  checks.push(summarize('lightness', farthest, lightFindings))

  const chromaFindings: PaletteFinding[] = []
  lch.forEach(({ c }, i) => {
    if (c < CHROMA_FLOOR)
      chromaFindings.push({ slots: [i + 1], value: c, status: 'fail' })
  })
  checks.push(summarize('chroma', Math.min(...lch.map(x => x.c)), chromaFindings))

  const pairList = pairsOf(colors.length, pairs)
  const cvdFindings: PaletteFinding[] = []
  let cvdWorst = Number.POSITIVE_INFINITY
  for (const kind of ['protan', 'deutan'] as const) {
    const simulated = colors.map(c => simulateCvd(c, kind))
    for (const [i, j] of pairList) {
      const d = deltaEOk(simulated[i]!, simulated[j]!)
      cvdWorst = Math.min(cvdWorst, d)
      if (d < CVD_TARGET)
        cvdFindings.push({ slots: [i + 1, j + 1], value: d, status: d < CVD_FLOOR ? 'fail' : 'warn', cvd: kind })
    }
  }
  checks.push(summarize('cvd', pairList.length > 0 ? cvdWorst : null, cvdFindings))

  const distinctFindings: PaletteFinding[] = []
  let distinctWorst = Number.POSITIVE_INFINITY
  for (const [i, j] of pairList) {
    const d = deltaEOk(colors[i]!, colors[j]!)
    distinctWorst = Math.min(distinctWorst, d)
    if (d < DISTINCT_FLOOR)
      distinctFindings.push({ slots: [i + 1, j + 1], value: d, status: 'fail' })
  }
  checks.push(summarize('distinct', pairList.length > 0 ? distinctWorst : null, distinctFindings))

  const contrastFindings: PaletteFinding[] = []
  const ratios = colors.map(c => contrastRatio(c, surface))
  ratios.forEach((ratio, i) => {
    if (ratio < MARK_CONTRAST)
      contrastFindings.push({ slots: [i + 1], value: ratio, status: 'warn' })
  })
  checks.push(summarize('contrast', Math.min(...ratios), contrastFindings))

  return report(mode, checks)
}

/**
 * 有序色阶（漏斗阶段、档位）检查：单色相、明度严格单调、对比度最低的一档对承载面 ≥ 2:1。
 */
export function validateOrdinalRamp(colors: readonly Rgba[], options: OrdinalRampOptions): PaletteReport {
  if (colors.length < 2)
    throw invalidArgument('有序色阶至少要有 2 档', { count: colors.length })
  const { mode, surface } = options
  const lch = colors.map(toOklch)
  const checks: PaletteCheck[] = []

  const chromatic = lch.map((x, i) => ({ ...x, slot: i + 1 })).filter(x => x.c >= HUE_CHROMA_MIN)
  const hueFindings: PaletteFinding[] = []
  let hueWorst = 0
  for (let i = 0; i < chromatic.length; i++) {
    for (let j = i + 1; j < chromatic.length; j++) {
      const d = hueDistance(chromatic[i]!.h, chromatic[j]!.h)
      hueWorst = Math.max(hueWorst, d)
      if (d > HUE_TOLERANCE)
        hueFindings.push({ slots: [chromatic[i]!.slot, chromatic[j]!.slot], value: d, status: 'fail' })
    }
  }
  checks.push(summarize('hue', hueWorst, hueFindings))

  const sign = Math.sign(lch[1]!.l - lch[0]!.l)
  const monotonicFindings: PaletteFinding[] = []
  for (let i = 1; i < lch.length; i++) {
    const step = lch[i]!.l - lch[i - 1]!.l
    if (sign === 0 || Math.sign(step) !== sign)
      monotonicFindings.push({ slots: [i, i + 1], value: step, status: 'fail' })
  }
  checks.push(summarize('monotonic', null, monotonicFindings))

  const ratios = colors.map(c => contrastRatio(c, surface))
  const weakest = Math.min(...ratios)
  const contrastFindings: PaletteFinding[] = weakest < RAMP_CONTRAST
    ? [{ slots: [ratios.indexOf(weakest) + 1], value: weakest, status: 'fail' }]
    : []
  checks.push(summarize('contrast', weakest, contrastFindings))

  return report(mode, checks)
}
