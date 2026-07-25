// 已解析的色彩模式：值域封闭，不含 'system'。
export type ColorMode = 'light' | 'dark'
// 密度档位。comfortable 是基线（等于不写属性时的表现）。
export type Density = 'comfortable' | 'compact'
export type Direction = 'ltr' | 'rtl'
export type Contrast = 'base' | 'more'
export type BrandId = string & { readonly __brand: 'BrandId' }

export function brandId(s: string): BrandId {
  return s as BrandId
}

/** 已完全定型的五维元组；与 ThemeAttrs 一一对应，SSR 与客户端严格等价。 */
export interface ThemeState {
  readonly mode: ColorMode
  readonly brand: BrandId
  readonly density: Density
  readonly dir: Direction
  readonly contrast: Contrast
}

/**
 * 用户/服务端可提交的意图。undefined = 继承父作用域；'system' = 跟随系统媒体查询
 * （仅 mode 与 contrast 合法，只有这两维有对应 media feature）。
 */
export interface ThemePreference {
  mode?: ColorMode | 'system'
  brand?: BrandId
  density?: Density
  dir?: Direction
  contrast?: Contrast | 'system'
}

/** 投影到 DOM 的属性集合：五个属性全部非空、全部恒写。 */
export interface ThemeAttrs {
  readonly 'data-theme': ColorMode
  readonly 'data-brand': string
  readonly 'data-density': Density
  readonly 'data-contrast': Contrast
  readonly 'dir': Direction
}

export const BASELINE_THEME: ThemeState = {
  mode: 'light',
  brand: 'xihan' as BrandId,
  density: 'comfortable',
  dir: 'ltr',
  contrast: 'base',
}
