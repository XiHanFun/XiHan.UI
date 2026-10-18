// @xihan-ui/viz 与 @xihan-ui/core/color 的颜色换算是两条独立的实现：viz 不依赖任何包，自带一份。
// 两边共同的那部分——sRGB 伽马、OKLab 矩阵、OKLab 与 OKLCH 的极坐标换算——在同一组样本上必须逐位相同
// （色相只差取余带出的最后一位，见 HUE_ULP），改坏任一边这里都红。
// 刻意不同的口径不在这里对拍：出色域时 viz 固定明度与色相降彩度、core 按通道截断；
// viz 的 parseColor 宽松、core 的 colorParse 严格；近灰（彩度不到 1e-4）的色相 core 一律取 hint。
import { describe, expect, it } from 'vitest'
import * as core from '../../../packages/engine/core/src/color'
import * as viz from '../../../packages/engine/viz/src/color/space'

/** 0–1 上每 1/4096 一点、8 位通道的 256 个值，外加两个分段点（0.04045、0.0031308）两侧各一段密集的点。 */
const UNIT = [
  ...Array.from({ length: 4097 }, (_, i) => i / 4096),
  ...Array.from({ length: 256 }, (_, i) => i / 255),
  ...Array.from({ length: 401 }, (_, i) => 0.0384 + i * 0.00001),
  ...Array.from({ length: 401 }, (_, i) => 0.0027 + i * 0.000002),
]

/** 8 位网格每 15 一档，加全部灰阶与六个纯色。 */
const RGB: viz.Rgba[] = []
for (let r = 0; r <= 255; r += 15) {
  for (let g = 0; g <= 255; g += 15) {
    for (let b = 0; b <= 255; b += 15)
      RGB.push({ r, g, b, a: 1 })
  }
}
for (let v = 0; v <= 255; v++)
  RGB.push({ r: v, g: v, b: v, a: 1 })
RGB.push({ r: 255, g: 0, b: 0, a: 1 }, { r: 0, g: 255, b: 0, a: 1 }, { r: 0, g: 0, b: 255, a: 1 }, { r: 0, g: 255, b: 255, a: 1 }, { r: 255, g: 0, b: 255, a: 1 }, { r: 255, g: 255, b: 0, a: 1 })

/** OKLCH 网格：L 每 0.05、C 每 0.02（到 0.4）、H 每 15°，色域内外都有。 */
const OKLCH: viz.Oklch[] = []
for (let i = 0; i <= 20; i++) {
  for (let j = 0; j <= 20; j++) {
    for (let h = 0; h < 360; h += 15)
      OKLCH.push({ l: i / 20, c: j / 50, h, alpha: 1 })
  }
}

/**
 * 色相差的上界：360 量级上的一个 ulp。两边把 atan2 换成的角度收进 [0, 360) 的写法不同——
 * viz 是 (x + 360) % 360，core 是负角才加 360——正角在 viz 那边绕一圈再取余，最后一位会差；
 * 除此之外的任何差都超过这个界。
 */
const HUE_ULP = 360 * Number.EPSILON

/** 逐个比、全部不同之处一起报出来，不在第一处就停。 */
function mismatches<T>(samples: readonly T[], same: (sample: T) => boolean): T[] {
  return samples.filter(sample => !same(sample))
}

describe('viz 与 core 的颜色换算逐位一致', () => {
  it('sRGB 伽马：编码 → 线性光', () => {
    expect(mismatches(UNIT, x => Object.is(viz.srgbToLinear(x), core.colorSrgbToLinear(x)))).toEqual([])
  })

  it('sRGB 伽马：线性光 → 编码', () => {
    expect(mismatches(UNIT, x => Object.is(viz.linearToSrgb(x), core.colorLinearToSrgb(x)))).toEqual([])
  })

  it('sRGB → OKLCH：OKLab 正向矩阵与极坐标', () => {
    const differ = mismatches(RGB, (color) => {
      const ours = viz.toOklch(color)
      const theirs = core.colorRgbaToOklch(color)
      // 近灰的色相两边各有取舍，只比明度与彩度
      const hueComparable = theirs.c >= 1e-4
      return Object.is(ours.l, theirs.l) && Object.is(ours.c, theirs.c) && (!hueComparable || Math.abs(ours.h - theirs.h) <= HUE_ULP)
    })
    expect(differ.map(color => viz.formatHex(color))).toEqual([])
  })

  it('oKLCH → 线性 sRGB：极坐标与 OKLab 逆矩阵，色域外也不截断', () => {
    const differ = mismatches(OKLCH, (color) => {
      const ours = viz.oklabToLinearRgb(viz.oklchToOklab(color))
      const theirs = core.colorOklchToLinearRgb({ l: color.l, c: color.c, h: color.h, a: color.alpha })
      return ours.every((v, i) => Object.is(v, theirs[i]))
    })
    expect(differ.map(color => `oklch(${color.l} ${color.c} ${color.h})`)).toEqual([])
  })
})
