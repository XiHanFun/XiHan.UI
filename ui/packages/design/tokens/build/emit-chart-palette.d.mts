/** sRGB 颜色，r、g、b 为 0–255（可带小数）。 */
export interface Rgb { r: number, g: number, b: number }

export interface PaletteCheck {
  label: string
  /** 该项最差的测量值；只判成立与否的项为 null。 */
  worst: number | null
  limit: string
  pass: boolean
  /** 最差值落在哪个色槽或哪一对色槽，从 1 起。 */
  where: string
}

export interface PaletteSlot { hue: string, light: string, dark: string }
export interface PaletteSolution { worst: number, anyPair: number, slots: PaletteSlot[] }

type ColorTree = Record<string, Record<string, { $type: string, $value: string }>>

export const MODES: ['light', 'dark']
export const SLOTS: number
export const STEPS: string[]
export const FIRST_HUE: string
export const EXCLUDED_HUES: Record<string, string>
export const ON_COLORS: string[]
export const RULES: {
  lightness: Record<'light' | 'dark', [number, number]>
  chroma: number
  contrast: number
  adjacent: { distinct: number, cvd: number }
  head: { slots: number, distinct: number, cvd: number }
  anyPair: number
  hueCluster: { span: number, max: number }
  danger: number
  onContrast: number
  rampContrast: number
  hueTolerance: number
  neutralChroma: number
  armLightness: number
  centerContrast: number
}

export function toOklab(color: Rgb): { l: number, a: number, b: number }
export function toOklch(color: Rgb): { l: number, c: number, h: number }
export function fromOklch(color: { l: number, c: number, h: number }): Rgb
export function parseOklch(value: string): Rgb
export function formatHex(color: Rgb): string
export function relativeLuminance(color: Rgb): number
export function contrastRatio(a: Rgb, b: Rgb): number
export function deltaEOk(a: Rgb, b: Rgb): number
export function simulateCvd(color: Rgb, kind: 'protan' | 'deutan'): Rgb
export function cvdDelta(a: Rgb, b: Rgb): number
export function hueCrowding(hues: number[], span?: number): number

export function checkCategorical(colors: Rgb[], options: { mode: 'light' | 'dark', surface: Rgb, danger?: Rgb[] }): PaletteCheck[]
export function checkOrder(light: Rgb[], dark: Rgb[], brand: Rgb): PaletteCheck[]
export function checkOnColors(fills: Rgb[], texts: Rgb[]): PaletteCheck[]
export function checkOrdinal(colors: Rgb[], options: { surface: Rgb }): PaletteCheck[]
export function checkSequential(colors: Rgb[], options: { surface: Rgb }): PaletteCheck[]
export function checkDiverging(colors: [Rgb, Rgb, Rgb], options: { surface: Rgb, danger?: Rgb[] }): PaletteCheck[]
export function checkRiseFall(rise: Rgb, fall: Rgb, options: { surface: Rgb, success: Rgb, danger: Rgb }): PaletteCheck[]
export function checkNeutrals(colors: { other: Rgb, deemphasis: Rgb }, categorical: Rgb[], options: { surface: Rgb }): PaletteCheck[]

export function loadPrimitiveColors(): Promise<{ colors: ColorTree, hues: string[] }>
export function dangerColors(colors: ColorTree): Rgb[]
export function resolvePrimitive(colors: ColorTree, ref: string): Rgb
export function loadSurfaces(colors: ColorTree): Promise<Record<'light' | 'dark', Rgb>>
export function solveCategorical(colors: ColorTree, palette: string[], surfaces: Record<'light' | 'dark', Rgb>): PaletteSolution
export function pickOnColor(colors: ColorTree, fill: Rgb): { ref: string, ratio: number }
export function paletteDocument(colors: ColorTree, surfaces: Record<'light' | 'dark', Rgb>, solution: PaletteSolution): Record<string, unknown>
