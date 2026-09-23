/** 一个色相的 11 档（50 … 950），值是 oklch() 字面量。 */
export function derivePalette(hue: number): Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950', string>
