// id 生成端口 + 确定性回退（§4.2.4）。
// 适配器注入 SSR 安全的实现（Vue 3.5 useId）；core 只提供测试/vanilla 回退。

export interface IdGenerator {
  /** 生成一个稳定的 scope id（组件实例级），SSR/CSR 必须一致。 */
  scopeId: () => string
  /** 由 scopeId 派生 part id，格式固定 `${component}:${scopeId}:${part}`（§4.2.4）。 */
  partId: (component: string, scopeId: string, part: string) => string
}

function partIdOf(component: string, scopeId: string, part: string): string {
  return `${component}:${scopeId}:${part}`
}

/**
 * 计数器回退实现（测试与 vanilla 场景，不用于 SSR）。
 * @param prefix scope id 前缀，默认 'xh'。
 */
export function createCounterIdGenerator(prefix = 'xh'): IdGenerator {
  let n = 0
  return {
    scopeId: () => `${prefix}-${++n}`,
    partId: partIdOf,
  }
}
