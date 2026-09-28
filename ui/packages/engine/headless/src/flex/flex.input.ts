/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 flex 相关实现。

/** Flex 逐档声明允许出现的固定键，与 Grid 同一套档位。 */
export const FLEX_TIER_NAMES = ['base', 'sm', 'md', 'lg', 'xl'] as const

export type FlexTierName = typeof FLEX_TIER_NAMES[number]

/**
 * 把特性上写的单值或 JSON 对象归一成 connect 可消费的形态：
 * 空串与缺席即未声明；以 `{` 开头的按逐档对象解析，只收五个档位键上的字符串值；
 * 非法 JSON、数组与不认识的键都不进入结果，其余原样当作单值。取值是否合法由皮肤的规则集决定。
 */
export function normalizeFlexTier(value: string | null | undefined): string | Partial<Record<FlexTierName, string>> | undefined {
  if (value == null || value === '')
    return undefined
  if (!value.trimStart().startsWith('{'))
    return value
  let source: unknown
  try {
    source = JSON.parse(value)
  }
  catch {
    return undefined
  }
  if (source === null || typeof source !== 'object' || Array.isArray(source))
    return undefined
  const out: Partial<Record<FlexTierName, string>> = {}
  for (const name of FLEX_TIER_NAMES) {
    const raw = (source as Record<string, unknown>)[name]
    if (typeof raw === 'string' && raw !== '')
      out[name] = raw
  }
  return out
}
