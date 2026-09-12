// 已解析的色彩模式：值域封闭，不含 'system'。
export type ColorMode = 'light' | 'dark'
// 密度档位。comfortable 是基线。
export type Density = 'comfortable' | 'compact'
export type Direction = 'ltr' | 'rtl'
export type Contrast = 'default' | 'more'
export type VisualMotion = 'default' | 'reduce'
export type Transparency = 'default' | 'reduce'
export type BrandId = string & { readonly __brand: 'BrandId' }

export function brandId(s: string): BrandId {
  return s as BrandId
}

/** 已完全定型的七维视觉环境；与 VisualEnvironmentAttrs 一一对应。 */
export interface VisualEnvironmentState {
  readonly mode: ColorMode
  readonly brand: BrandId
  readonly density: Density
  readonly dir: Direction
  readonly contrast: Contrast
  readonly motion: VisualMotion
  readonly transparency: Transparency
}

/**
 * 用户/服务端可提交的意图。undefined = 继承父作用域；system = 跟随系统媒体查询。
 * brand、density 与 dir 没有对应的平台 media feature，因此不接受 system。
 */
export interface VisualEnvironmentPreference {
  mode?: ColorMode | 'system'
  brand?: BrandId
  density?: Density
  dir?: Direction
  contrast?: Contrast | 'system'
  motion?: VisualMotion | 'system'
  transparency?: Transparency | 'system'
}

/** PortalVisualBridge 识别的七个显式 DOM 轴。 */
export interface VisualEnvironmentAttrs {
  readonly 'data-theme': ColorMode
  readonly 'data-brand': string
  readonly 'data-density': Density
  readonly 'data-contrast': Contrast
  readonly 'data-motion': VisualMotion
  readonly 'data-transparency': Transparency
  readonly 'dir': Direction
}

/** 旧主题 API 的明确五轴视图；解析与状态均由 VisualEnvironmentController 持有。 */
export type ThemeState = Pick<VisualEnvironmentState, 'mode' | 'brand' | 'density' | 'dir' | 'contrast'>
export type ThemePreference = Pick<VisualEnvironmentPreference, 'mode' | 'brand' | 'density' | 'dir' | 'contrast'>
export type ThemeAttrs = Pick<VisualEnvironmentAttrs, 'data-theme' | 'data-brand' | 'data-density' | 'data-contrast' | 'dir'>

export const BASELINE_VISUAL_ENVIRONMENT: VisualEnvironmentState = {
  mode: 'light',
  brand: 'xihan' as BrandId,
  density: 'comfortable',
  dir: 'ltr',
  contrast: 'default',
  motion: 'default',
  transparency: 'default',
}

export const BASELINE_THEME: ThemeState = {
  mode: BASELINE_VISUAL_ENVIRONMENT.mode,
  brand: BASELINE_VISUAL_ENVIRONMENT.brand,
  density: BASELINE_VISUAL_ENVIRONMENT.density,
  dir: BASELINE_VISUAL_ENVIRONMENT.dir,
  contrast: BASELINE_VISUAL_ENVIRONMENT.contrast,
}
