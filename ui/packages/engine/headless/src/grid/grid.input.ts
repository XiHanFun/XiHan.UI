/** Grid 逐档声明允许出现的固定键。 */
export const GRID_TIER_NAMES = ['base', 'sm', 'md', 'lg', 'xl'] as const

export type GridTierName = typeof GRID_TIER_NAMES[number]
export type GridTierInput = number | string | Readonly<Partial<Record<GridTierName, number | string | null | undefined>>>
export type NormalizedGridTier = number | Partial<Record<GridTierName, number>>

/** 单值行列数归一；空值表示未声明，非法数字同样让位给 connect 缺省。 */
export function normalizeGridCount(value: number | string | null | undefined): number | undefined {
  if (value == null || value === '')
    return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

/**
 * 把单值、逐档对象或 JSON 对象声明归一成 connect 可消费的数字结构。
 * 非法 JSON、数组、非有限值与未知键都不进入结果。
 */
export function normalizeGridTier(value: GridTierInput | null | undefined): NormalizedGridTier | undefined {
  if (value == null || value === '')
    return undefined
  let source: unknown = value
  if (typeof source === 'string' && source.trimStart().startsWith('{')) {
    try {
      source = JSON.parse(source)
    }
    catch {
      return undefined
    }
  }
  if (Array.isArray(source))
    return undefined
  if (source === null || typeof source !== 'object')
    return normalizeGridCount(source as number | string)

  const out: Partial<Record<GridTierName, number>> = {}
  for (const name of GRID_TIER_NAMES) {
    const raw = (source as Record<string, unknown>)[name]
    if (typeof raw !== 'number' && typeof raw !== 'string')
      continue
    const parsed = normalizeGridCount(raw)
    if (parsed !== undefined)
      out[name] = parsed
  }
  return out
}
