// id 生成端口 + 计数器回退实现。SSR 安全的实现（如 Vue 的 useId）由适配器注入。

export interface IdGenerator {
  /** 生成一个组件实例级的 scope id。 */
  scopeId: () => string
  /** 由 scopeId 派生 part id，格式固定 `${component}:${scopeId}:${part}`。 */
  partId: (component: string, scopeId: string, part: string) => string
}

function partIdOf(component: string, scopeId: string, part: string): string {
  return `${component}:${scopeId}:${part}`
}

// 计数器必须在模块级：调用点大多每个组件实例新建一个生成器，计数器若随生成器走，
// 各实例的首个 scopeId 都是 'xh-1'，DOM id 撞车会让 aria-controls / aria-labelledby 串到别的实例。
let counter = 0

/**
 * 基于自增计数器的 IdGenerator，用于测试与 vanilla 场景；计数不跨端一致，不可用于 SSR。
 * @param prefix scope id 前缀，默认 'xh'。
 */
export function createCounterIdGenerator(prefix = 'xh'): IdGenerator {
  return {
    scopeId: () => `${prefix}-${++counter}`,
    partId: partIdOf,
  }
}
