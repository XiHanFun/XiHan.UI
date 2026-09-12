/** 数组按元素严格逐位比较；受控值每次归一成新数组时避免引用误判。 */
export function sameArray<T>(a: readonly T[], b: readonly T[] | undefined): boolean {
  return b !== undefined && a.length === b.length && a.every((value, index) => value === b[index])
}

/** 裸值归一为单元素数组；null 是显式空集合，undefined 保留非受控语义。 */
export function toArray<T>(value: T | readonly T[] | null | undefined): T[] | undefined {
  if (value === undefined)
    return undefined
  if (value === null)
    return []
  return Array.isArray(value) ? [...value] : [value as T]
}

/** 集合值去重并保留首次出现顺序。 */
export function uniqueArray<T>(values: readonly T[]): T[] {
  return [...new Set(values)]
}
