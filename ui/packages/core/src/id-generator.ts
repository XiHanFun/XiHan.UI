// id 生成端口 + 确定性回退。
// 适配器注入 SSR 安全的实现（Vue 3.5 useId）；core 只提供测试/vanilla 回退。

export interface IdGenerator {
  /** 生成一个稳定的 scope id（组件实例级），SSR/CSR 必须一致。 */
  scopeId: () => string
  /** 由 scopeId 派生 part id，格式固定 `${component}:${scopeId}:${part}`。 */
  partId: (component: string, scopeId: string, part: string) => string
}

function partIdOf(component: string, scopeId: string, part: string): string {
  return `${component}:${scopeId}:${part}`
}

// 计数器提到模块级：调用点大多是"每个组件实例新建一个生成器"，
// 计数器若随生成器走，每个实例拿到的首个 scopeId 都是 'xh-1'——
// 同页多个实例产出完全相同的 DOM id，aria-controls / aria-labelledby
// 会按 IDREF 串到别的实例的部件上（读屏因此宣读错面板）。
let counter = 0

/**
 * 计数器回退实现（测试与 vanilla 场景，不用于 SSR）。
 * @param prefix scope id 前缀，默认 'xh'。
 */
export function createCounterIdGenerator(prefix = 'xh'): IdGenerator {
  return {
    scopeId: () => `${prefix}-${++counter}`,
    partId: partIdOf,
  }
}
