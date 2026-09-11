/** 只校验值结构，不依赖异步候选树是否已经加载。 */
export function assertCascaderPath(path: unknown): asserts path is readonly string[] {
  if (!Array.isArray(path) || path.length === 0)
    throw new TypeError('[xh] Cascader 路径必须是非空字符串数组')
  for (let index = 0; index < path.length; index++) {
    if (typeof path[index] !== 'string')
      throw new TypeError('[xh] Cascader 路径的每一段都必须是字符串')
  }
}

export function encodeCascaderPath(path: readonly string[]): string {
  assertCascaderPath(path)
  return JSON.stringify(path)
}
