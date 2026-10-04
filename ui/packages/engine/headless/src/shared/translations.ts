/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 组件文案的取值：语言包里的那一桶垫底，实例（已并上全局配置）给的键逐条压上去。
// 组件自己不写英文兜底，缺省一律是 en-US 语言包里自己那一桶。

/**
 * 并出一个组件看到的文案。写成 undefined 的键不算给过，照旧取语言包。
 * 一个键都没覆盖时原样返回那一桶，不新建对象：下游按引用记忆的缓存才认得出没变。
 */
export function resolveTranslations<D extends object, O extends object>(defaults: D, overrides: O | undefined): D & Partial<O> {
  if (!overrides)
    return defaults as D & Partial<O>
  let out: Record<string, unknown> | undefined
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined)
      continue
    out ??= { ...defaults } as Record<string, unknown>
    out[key] = value
  }
  return (out ?? defaults) as D & Partial<O>
}
