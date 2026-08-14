// 内置效果的名字。只有字符串、不引效果对象，注册表引它不会把 14 个效果打进包。

export type BuiltinEffectName
  = | 'fluid'
    | 'glass'
    | 'mesh'
    | 'grain'
    | 'plasma'
    | 'aurora'
    | 'beam'
    | 'ripple'
    | 'orb'
    | 'wave'
    | 'starfield'
    | 'nebula'
    | 'flow-field'
    | 'particles'

/** 顺序与 builtinEffects 一致，一一对应由测试守着。 */
export const BUILTIN_EFFECT_NAMES: readonly BuiltinEffectName[] = [
  'fluid',
  'glass',
  'mesh',
  'grain',
  'plasma',
  'aurora',
  'beam',
  'ripple',
  'orb',
  'wave',
  'starfield',
  'nebula',
  'flow-field',
  'particles',
]
