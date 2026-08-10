// @xihan-ui/backgrounds —— 视觉层：WebGL2 背景效果与数据驱动粒子点云，框架无关。
//
// 两条主线：
//   1) 程序化效果 —— 传一个效果对象与一份参数，createBackgroundSurface 就把它铺在任意元素背景上；
//   2) 点云 —— 图片、文字、SVG、参数方程都能采样成 PointCloud，交给 particles 效果显示，
//      两份点云之间自动形变过渡。
//
// 本包不依赖任何框架，也不引第三方；WebGL2 缺席时自动降级成 CSS 静态背景。

export {
  boolSpec,
  builtinEffects,
  clearEffects,
  colorSpec,
  defineEffect,
  effectNames,
  enumSpec,
  getEffect,
  numberSpec,
  registerBuiltinEffects,
  registerEffect,
  registerEffects,
  resolveEffect,
} from './effects/index'

export {
  auroraEffect,
  beamEffect,
  flowFieldEffect,
  fluidEffect,
  glassEffect,
  grainEffect,
  meshEffect,
  nebulaEffect,
  orbEffect,
  particlesEffect,
  plasmaEffect,
  rippleEffect,
  starfieldEffect,
  waveEffect,
} from './effects/index'
export { joinScheduler, scheduledCount } from './engine/scheduler'

export type { Tickable } from './engine/scheduler'

export { createBackgroundSurface } from './engine/surface'

export {
  bool,
  defaultParams,
  hexToRgb,
  isHexColor,
  num,
  resolveParam,
  resolveParams,
  rgb,
  str,
} from './params'

export {
  boundsOf,
  createCloud,
  createRng,
  lerpArrays,
  mergeClouds,
  normalizeCloud,
  resample,
  scatterShell,
} from './sources/cloud'

export { drawableToCloud, imageToCloud, loadImage } from './sources/image'
export type { ImageCloudOptions, ImageSource } from './sources/image'

export { fitSize, MAX_RASTER_SIZE, rasterize } from './sources/raster'
export type { RasterResult } from './sources/raster'

export { sampleImageData } from './sources/sampler'
export type { SampleChannel, SampleOptions } from './sources/sampler'

export { heartAt, SHAPE_NAMES, shapeCloud } from './sources/shape'
export type { ShapeName, ShapeOptions } from './sources/shape'

export { pathToCloud, svgToCloud } from './sources/svg'
export type { PathCloudOptions } from './sources/svg'

export { textToCloud } from './sources/text'
export type { TextCloudOptions } from './sources/text'

export type {
  BackgroundBackend,
  BackgroundEffect,
  BackgroundQuality,
  BackgroundSurface,
  BackgroundSurfaceOptions,
  BooleanParamSpec,
  CloudParticleSpec,
  ColorParamSpec,
  EffectContext,
  EnumParamSpec,
  MorphOptions,
  NumberParamSpec,
  ParamSpec,
  ParamSpecMap,
  ParamValue,
  ParamValues,
  ParticleBlend,
  ParticleSpec,
  PointCloud,
  ProceduralParticleSpec,
  UniformMap,
  UniformValue,
} from './types'
