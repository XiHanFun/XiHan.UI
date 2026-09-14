import { beforeEach, describe, expect, it } from 'vitest'
import { BUILTIN_EFFECT_NAMES } from '../src/effects/builtin-names'
import { defineEffect, numberSpec } from '../src/effects/define'
import { builtinEffects, registerBuiltinEffects } from '../src/effects/index'
import {
  clearEffects,
  effectNames,
  getEffect,
  registerEffect,
  resolveEffect,
} from '../src/effects/registry'

const dummy = defineEffect({
  name: 'dummy',
  params: { speed: numberSpec('速度', 0, 1, 0.1, 0.5) },
  fragment: 'void main() { fragColor = vec4(0.0); }',
})

describe('注册表', () => {
  beforeEach(() => {
    clearEffects()
  })

  it('注册后能按名字取回同一个对象', () => {
    registerEffect(dummy)
    expect(getEffect('dummy')).toBe(dummy)
    expect(resolveEffect('dummy')).toBe(dummy)
  })

  it('直接传效果对象时完全不经过注册表', () => {
    expect(resolveEffect(dummy)).toBe(dummy)
    expect(getEffect('dummy')).toBeUndefined()
  })

  it('取未注册的名字抛错，而不是静默返回空让画面莫名其妙全黑', () => {
    expect(() => resolveEffect('不存在')).toThrow(/未注册的效果/)
  })

  it('名字清单与内置效果一一对应', () => {
    expect([...BUILTIN_EFFECT_NAMES].sort()).toEqual(builtinEffects.map(effect => effect.name).sort())
  })

  it('内置效果名没注册时，错误信息点名 registerBuiltinEffects 与导出标识符', () => {
    expect(() => resolveEffect('aurora')).toThrow(/registerBuiltinEffects\(\)/)
    expect(() => resolveEffect('aurora')).toThrow(/auroraEffect/)
    expect(() => resolveEffect('flow-field')).toThrow(/flowFieldEffect/)
  })

  it('非内置名字仍指向 registerEffect', () => {
    expect(() => resolveEffect('不存在')).toThrow(/先调用 registerEffect\(\)/)
  })

  it('同名后注册的覆盖先注册的', () => {
    const replacement = defineEffect({ ...dummy })
    registerEffect(dummy)
    registerEffect(replacement)
    expect(getEffect('dummy')).toBe(replacement)
  })

  it('注册内置效果后，清单里的每一个都取得到', () => {
    registerBuiltinEffects()
    expect(effectNames().length).toBe(builtinEffects.length)
    for (const effect of builtinEffects)
      expect(getEffect(effect.name)).toBe(effect)
  })
})
