/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 已解析的色彩模式：值域封闭，不含 'system'。
export type ColorMode = 'light' | 'dark'
// 密度档位。comfortable 是基线。
export type Density = 'comfortable' | 'compact'
export type Direction = 'ltr' | 'rtl'
export type Contrast = 'default' | 'more'
export type VisualMotion = 'default' | 'reduce'
export type Transparency = 'default' | 'reduce'
// 材质档：standard 是缺省；liquid 下浮在内容之上的导航层部件换成液态面。
export type Material = 'standard' | 'liquid'
export type BrandId = string & { readonly __brand: 'BrandId' }

export function brandId(s: string): BrandId {
  return s as BrandId
}

/** 已完全定型的八维视觉环境；与 VisualEnvironmentAttrs 一一对应。 */
export interface VisualEnvironmentState {
  readonly mode: ColorMode
  readonly brand: BrandId
  readonly density: Density
  readonly dir: Direction
  readonly contrast: Contrast
  readonly motion: VisualMotion
  readonly transparency: Transparency
  readonly material: Material
}

/**
 * 用户/服务端可提交的意图。undefined = 继承父作用域；system = 跟随系统媒体查询。
 * brand、density、dir 与 material 没有对应的平台 media feature，因此不接受 system。
 */
export interface VisualEnvironmentPreference {
  mode?: ColorMode | 'system'
  brand?: BrandId
  density?: Density
  dir?: Direction
  contrast?: Contrast | 'system'
  motion?: VisualMotion | 'system'
  transparency?: Transparency | 'system'
  material?: Material
}

/** PortalVisualBridge 识别的八个显式 DOM 轴。 */
export interface VisualEnvironmentAttrs {
  readonly 'data-theme': ColorMode
  readonly 'data-brand': string
  readonly 'data-density': Density
  readonly 'data-contrast': Contrast
  readonly 'data-motion': VisualMotion
  readonly 'data-transparency': Transparency
  readonly 'data-material': Material
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
  material: 'standard',
}

export const BASELINE_THEME: ThemeState = {
  mode: BASELINE_VISUAL_ENVIRONMENT.mode,
  brand: BASELINE_VISUAL_ENVIRONMENT.brand,
  density: BASELINE_VISUAL_ENVIRONMENT.density,
  dir: BASELINE_VISUAL_ENVIRONMENT.dir,
  contrast: BASELINE_VISUAL_ENVIRONMENT.contrast,
}
