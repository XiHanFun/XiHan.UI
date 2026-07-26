// 生命周期与通用类型契约。

/** 任意字符串键字典。 */
export type Dict<T = unknown> = Record<string, T>

/** 可释放资源。dispose 必须幂等。 */
export interface Disposable {
  /** 幂等：重复调用无副作用、不抛错。 */
  dispose: () => void
  /** dev 构建下为 true 便于断言。 */
  readonly disposed?: boolean
}

/** 与 machine effects 的实现签名兼容（effects 返回 cleanup）。 */
export type Cleanup = () => void

/** 把 Disposable 适配成 machine effect 期望的 Cleanup。 */
export function toCleanup(d: Disposable): Cleanup {
  return () => d.dispose()
}

/** 方向。 */
export type Direction = 'ltr' | 'rtl'

/** 朝向。注意与"导航轴"区分：RadioGroup 视觉横排但四个方向键都要响应。 */
export type Orientation = 'horizontal' | 'vertical'

/** ARIA 布尔值：真时输出 'true'，假时省略（返回 undefined）。 */
export type MaybeBooleanish = boolean | undefined
