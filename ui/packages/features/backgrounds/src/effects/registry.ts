// 效果注册表。按名字取效果是给配置化场景用的（参数存在数据库里、由界面下拉切换），
// 直接传效果对象则完全不经过它——注册表不参与打包决策，没注册的效果会被摇掉。

import type { BackgroundEffect } from '../types'

const registry = new Map<string, BackgroundEffect>()

/** 注册一个效果；同名后注册的覆盖先注册的。 */
export function registerEffect(effect: BackgroundEffect): void {
  registry.set(effect.name, effect)
}

export function registerEffects(effects: readonly BackgroundEffect[]): void {
  for (const effect of effects)
    registerEffect(effect)
}

export function getEffect(name: string): BackgroundEffect | undefined {
  return registry.get(name)
}

/** 已注册效果的名字，按注册顺序。 */
export function effectNames(): readonly string[] {
  return [...registry.keys()]
}

export function clearEffects(): void {
  registry.clear()
}

/** 把「效果对象或名字」统一成效果对象。名字没注册时抛错，因为拿不到效果就什么都画不了。 */
export function resolveEffect(effect: BackgroundEffect | string): BackgroundEffect {
  if (typeof effect !== 'string')
    return effect
  const found = registry.get(effect)
  if (found === undefined)
    throw new Error(`[visual] 未注册的效果：${effect}。先调用 registerEffect() 或直接传效果对象。`)
  return found
}
