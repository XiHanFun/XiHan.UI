import type { BackgroundEffect } from '../src/types'
import { describe, expect, it } from 'vitest'
import { builtinEffects } from '../src/effects/index'
import {
  buildCloudVertex,
  buildFragment,
  buildProceduralVertex,
} from '../src/engine/glsl'
import { defaultParams, isHexColor, resolveParams } from '../src/params'

/**
 * 判据按「一个效果要能真的被调」写：
 * 参数规格自洽、uniforms() 喂出去的每个键在着色器里确实声明过、
 * 着色器里声明的每个 uniform 也确实有人喂。
 *
 * 后两条是这套测试的核心：任何一边对不上，表现都是「参数拖了没反应」或者「某项恒为 0」，
 * 而这两种症状在浏览器里既不报错也不好查。
 */

/** 两个通道共用的内置 uniform，由引擎统一上传。 */
const ENGINE_UNIFORMS = new Set([
  'u_resolution',
  'u_time',
  'u_pointer',
  'u_pointerAmt',
  'u_px',
  // 形变进度由 surface 驱动，不归效果管
  'u_morph',
])

/** 取出一个效果实际会编译的全部着色器源码。 */
function sourcesOf(effect: BackgroundEffect): string[] {
  const shared = effect.shared ?? ''
  const out: string[] = []
  if (effect.fragment !== undefined)
    out.push(buildFragment(shared, effect.fragment))
  const spec = effect.particles
  if (spec !== undefined) {
    out.push(spec.mode === 'cloud'
      ? buildCloudVertex(shared, spec.body)
      : buildProceduralVertex(shared, spec.body))
  }
  return out
}

function declaredUniforms(source: string): Set<string> {
  const names = new Set<string>()
  const pattern = /uniform\s+(?:highp\s+|mediump\s+|lowp\s+)?\w+\s+(\w+)\s*;/g
  let match = pattern.exec(source)
  while (match !== null) {
    names.add(match[1]!)
    match = pattern.exec(source)
  }
  return names
}

function fedUniforms(effect: BackgroundEffect): string[] {
  const params = defaultParams(effect.params)
  const map = effect.uniforms?.({ params, width: 320, height: 200, time: 1.5 }) ?? {}
  return Object.keys(map)
}

describe('效果清单', () => {
  it('名字唯一', () => {
    const names = builtinEffects.map(e => e.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('每个效果至少画点什么——不是流场就是粒子', () => {
    for (const effect of builtinEffects)
      expect(effect.fragment !== undefined || effect.particles !== undefined).toBe(true)
  })
})

describe.each(builtinEffects.map(e => [e.name, e] as const))('%s', (_name, effect) => {
  it('参数规格自洽', () => {
    expect(Object.keys(effect.params).length).toBeGreaterThan(0)
    for (const [key, spec] of Object.entries(effect.params)) {
      expect(spec.label.length, `${key} 缺少可读标签`).toBeGreaterThan(0)
      if (spec.kind === 'number') {
        expect(spec.min, `${key} 的 min 必须小于 max`).toBeLessThan(spec.max)
        expect(spec.step, `${key} 的 step 必须为正`).toBeGreaterThan(0)
        expect(spec.default).toBeGreaterThanOrEqual(spec.min)
        expect(spec.default).toBeLessThanOrEqual(spec.max)
      }
      if (spec.kind === 'color')
        expect(isHexColor(spec.default), `${key} 的默认色不是合法十六进制`).toBe(true)
      if (spec.kind === 'enum')
        expect(spec.values).toContain(spec.default)
    }
  })

  it('默认参数原样过一遍解析不发生漂移', () => {
    const defaults = defaultParams(effect.params)
    expect(resolveParams(effect.params, defaults)).toEqual(defaults)
  })

  it('uniforms() 喂出去的每个键都在着色器里声明过', () => {
    const sources = sourcesOf(effect)
    const declared = new Set<string>()
    for (const source of sources) {
      for (const name of declaredUniforms(source))
        declared.add(name)
    }
    for (const key of fedUniforms(effect))
      expect(declared.has(key), `${effect.name} 喂了 ${key}，但没有任何着色器声明它`).toBe(true)
  })

  it('着色器里声明的每个 uniform 都有人喂', () => {
    const fed = new Set(fedUniforms(effect))
    for (const source of sourcesOf(effect)) {
      for (const name of declaredUniforms(source)) {
        if (ENGINE_UNIFORMS.has(name))
          continue
        expect(fed.has(name), `${effect.name} 声明了 ${name}，但 uniforms() 从不喂它，运行期恒为 0`).toBe(true)
      }
    }
  })

  it('uniform 的值都是有限数', () => {
    const params = defaultParams(effect.params)
    const map = effect.uniforms?.({ params, width: 320, height: 200, time: 3 }) ?? {}
    for (const [key, value] of Object.entries(map)) {
      const list = typeof value === 'number' ? [value] : value
      for (const n of list)
        expect(Number.isFinite(n), `${effect.name} 的 ${key} 出现了非有限数`).toBe(true)
    }
  })

  it('降级背景返回可用的 CSS 值', () => {
    if (effect.fallback === undefined)
      return
    const css = effect.fallback(defaultParams(effect.params))
    expect(typeof css).toBe('string')
    expect(css.length).toBeGreaterThan(0)
    expect(css).not.toContain('undefined')
    expect(css).not.toContain('NaN')
  })

  it('程序化粒子的数量随密度参数变化且非负', () => {
    const spec = effect.particles
    if (spec === undefined || spec.mode !== 'procedural')
      return
    const params = defaultParams(effect.params)
    const count = typeof spec.count === 'function' ? spec.count(params) : spec.count
    expect(count).toBeGreaterThanOrEqual(0)
    expect(Number.isFinite(count)).toBe(true)

    if (typeof spec.count === 'function') {
      const zeroed: Record<string, number | string | boolean> = { ...params }
      for (const key of ['density', 'sparks', 'motes']) {
        if (key in zeroed)
          zeroed[key] = 0
      }
      expect(spec.count(zeroed)).toBeLessThanOrEqual(count)
    }
  })
})
