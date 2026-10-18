/** WCAG 相对亮度：分量先截进 [0,1]。 */
export function relativeLuminance(l: number, c: number, h: number): number
/** 一个色相上的预设品牌梯度：11 档的相对亮度逐档对齐 base（缺省品牌的 11 档 oklch 字面量）。 */
export function deriveBrandPreset(hue: number, base: Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950', string>): Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950', string>
