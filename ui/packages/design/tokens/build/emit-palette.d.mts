/** 基线品牌曲线的色相（258）：在它上面派生出的那一族就是基线本身。 */
export const BASE_HUE: number
/** 一个色相的 11 档（50 … 950），值是 oklch() 字面量。 */
export function derivePalette(hue: number): Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950', string>
