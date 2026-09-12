/** 作者声明的数字身份：缺省、空串或非有限值都视为未声明。 */
export function normalizeHeatmapNumber(value: number | string | null | undefined): number | undefined {
  if (value == null || value === '')
    return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** 作者声明的字符串身份：缺省与空串视为未声明，其余值稳定转成字符串。 */
export function normalizeHeatmapString(value: number | string | null | undefined): string | undefined {
  if (value == null || value === '')
    return undefined
  return String(value)
}
