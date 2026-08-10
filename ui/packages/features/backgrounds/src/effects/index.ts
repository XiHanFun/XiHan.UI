// 内置效果集合。注册表只在按名字取效果时才需要，
// 直接传效果对象的用法完全不经过它，没引到的效果会被打包器摇掉。

import type { BackgroundEffect } from '../types'
import { particlesEffect } from './cloud'
import { auroraEffect, beamEffect, plasmaEffect } from './energy'
import { fluidEffect, glassEffect, grainEffect, meshEffect } from './flow'
import { registerEffects } from './registry'
import { flowFieldEffect, nebulaEffect, starfieldEffect } from './space'
import { orbEffect, rippleEffect, waveEffect } from './wave'

export const builtinEffects: readonly BackgroundEffect[] = [
  fluidEffect,
  glassEffect,
  meshEffect,
  grainEffect,
  plasmaEffect,
  auroraEffect,
  beamEffect,
  rippleEffect,
  orbEffect,
  waveEffect,
  starfieldEffect,
  nebulaEffect,
  flowFieldEffect,
  particlesEffect,
]

/** 把内置效果全部注册进注册表，之后就能按名字取用。 */
export function registerBuiltinEffects(): void {
  registerEffects(builtinEffects)
}

export { particlesEffect } from './cloud'
export {
  boolSpec,
  colorSpec,
  defineEffect,
  enumSpec,
  numberSpec,
} from './define'
export { auroraEffect, beamEffect, plasmaEffect } from './energy'
export { fluidEffect, glassEffect, grainEffect, meshEffect } from './flow'
export {
  clearEffects,
  effectNames,
  getEffect,
  registerEffect,
  registerEffects,
  resolveEffect,
} from './registry'
export { flowFieldEffect, nebulaEffect, starfieldEffect } from './space'
export { orbEffect, rippleEffect, waveEffect } from './wave'
