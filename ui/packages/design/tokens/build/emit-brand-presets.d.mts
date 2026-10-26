type Step = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950'

/** WCAG 相对亮度：分量先截进 [0,1]。 */
export function relativeLuminance(l: number, c: number, h: number): number
/** 缺省品牌的色相（277）。 */
export const DEFAULT_BRAND_HUE: number
/** 基线品牌曲线（色相 258 那一族）的 11 档 oklch 字面量：预设与缺省品牌对齐相对亮度的目标。 */
export function baselineScale(): Record<Step, string>
/** 一个色相上的品牌梯度：11 档的相对亮度逐档对齐 base（基线品牌曲线的 11 档 oklch 字面量）。 */
export function deriveBrandPreset(hue: number, base: Record<Step, string>): Record<Step, string>
