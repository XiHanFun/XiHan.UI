/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 下层判定：液态部件下面压着什么，决定它取浅色调还是深色调、能不能换通透档。
//
// 页面读不到渲染出来的像素，只能读两样东西：作者在图片、视频、画布区域上的声明
// （data-xh-backdrop="light | dark"，杂乱时加 data-xh-backdrop-busy），以及 DOM 的计算背景色。
// 两样都读不到时记为未知，按杂乱处理，不透明度留在可读下限。

/** 黑白字对比度相等的相对亮度，与语气层、墨色域的分界同一个数。 */
export const CROSSOVER = 0.179
/** 滞回：均值落在分界 ± 这一段里时保持上一次的色调，内容滚过分界附近时不来回闪。 */
export const HYSTERESIS = 0.04
/** 采样点亮度跨度超过它就算杂乱：下层一半深一半浅时，通透档保证不了对比度。 */
export const SPREAD_LIMIT = 0.25

export type LiquidTone = 'light' | 'dark'

/** 一个采样点：下层的相对亮度（读不到为 null），以及这一点上下层是不是杂乱。 */
export interface BackdropSample {
  luminance: number | null
  busy: boolean
}

/** 判定结果：色调，以及能否换通透档。 */
export interface LiquidReading {
  tone: LiquidTone
  clear: boolean
}

/**
 * 由一组采样点判定色调与通透档。
 * 一个点都读不到时：之前判过就沿用之前的色调（不换通透档），从没判过返回 null——部件留在静态形态。
 */
export function readBackdrop(samples: readonly BackdropSample[], previous: LiquidTone | null): LiquidReading | null {
  const known = samples.map(sample => sample.luminance).filter((value): value is number => value !== null)
  if (known.length === 0)
    return previous ? { tone: previous, clear: false } : null
  const mean = known.reduce((sum, value) => sum + value, 0) / known.length
  const spread = Math.max(...known) - Math.min(...known)
  let tone: LiquidTone = previous ?? (mean > CROSSOVER ? 'light' : 'dark')
  if (mean > CROSSOVER + HYSTERESIS)
    tone = 'light'
  else if (mean < CROSSOVER - HYSTERESIS)
    tone = 'dark'
  const clear = known.length === samples.length && samples.every(sample => !sample.busy) && spread <= SPREAD_LIMIT
  return { tone, clear }
}

/** sRGB 0–1 分量的相对亮度（WCAG）。 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const linear = (v: number): number => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

function hasOwnText(el: Element): boolean {
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === 3 && node.textContent?.trim())
      return true
  }
  return false
}

/**
 * 取一个点的下层：按命中栈的绘制顺序从上往下看，跳过液态部件自己。
 * 命中栈里既有压在下面的兄弟节点，也有部件的祖先（例如透明的定位容器），透明的一律跳过，
 * 第一个画了东西的才是下层：声明优先；背景图、渐变按杂乱的未知算；不透明底色即下层的颜色。
 * 那块底色之上有文字时记为杂乱：透景下的文字会与标签抢对比度。
 */
export function sampleAt(
  doc: Document,
  x: number,
  y: number,
  exclude: (el: Element) => boolean,
  luminanceOf: (color: string) => number | null,
): BackdropSample {
  const view = doc.defaultView
  if (!view)
    return { luminance: null, busy: true }
  let content = false
  for (const hit of doc.elementsFromPoint(x, y)) {
    if (exclude(hit))
      continue
    const declared = hit.getAttribute('data-xh-backdrop')
    if (declared === 'light' || declared === 'dark')
      return { luminance: declared === 'light' ? 1 : 0, busy: hit.hasAttribute('data-xh-backdrop-busy') }
    const style = view.getComputedStyle(hit)
    if (style.backgroundImage !== 'none')
      return { luminance: null, busy: true }
    const luminance = luminanceOf(style.backgroundColor)
    if (luminance !== null)
      return { luminance, busy: content || hit.closest('[data-xh-backdrop-busy]') !== null }
    if (hasOwnText(hit))
      content = true
  }
  // 一路都是透明的：页面画在画布色上，按根的配色方案取
  const scheme = view.getComputedStyle(doc.documentElement).colorScheme
  return { luminance: /\bdark\b/.test(scheme) ? 0 : 1, busy: content }
}

/** 部件上的 3 × 2 个采样点（视口坐标）。 */
export function samplePoints(rect: { left: number, top: number, width: number, height: number }): Array<[number, number]> {
  const points: Array<[number, number]> = []
  for (const fx of [0.15, 0.5, 0.85]) {
    for (const fy of [0.3, 0.7])
      points.push([rect.left + rect.width * fx, rect.top + rect.height * fy])
  }
  return points
}

/** 光源方向：从部件中心指向指针的单位向量，两位小数；指针落在中心时返回 null。 */
export function lightDirection(rect: { left: number, top: number, width: number, height: number }, x: number, y: number): [number, number] | null {
  const dx = x - (rect.left + rect.width / 2)
  const dy = y - (rect.top + rect.height / 2)
  const length = Math.hypot(dx, dy)
  if (length < 1)
    return null
  return [Math.round((dx / length) * 100) / 100, Math.round((dy / length) * 100) / 100]
}
