// 生命周期与通用类型契约。

/** 任意字符串键字典。 */
export type Dict<T = unknown> = Record<string, T>

/** 可释放资源。 */
export interface Disposable {
  /** 幂等，重复调用无副作用。 */
  dispose: () => void
  /** dev 构建下标记是否已释放。 */
  readonly disposed?: boolean
}

/** 清理函数，与 machine effects 的返回签名一致。 */
export type Cleanup = () => void

/** 把 Disposable 适配成 machine effect 期望的 Cleanup。 */
export function toCleanup(d: Disposable): Cleanup {
  return () => d.dispose()
}

/** 方向。 */
export type Direction = 'ltr' | 'rtl'

/** 朝向。 */
export type Orientation = 'horizontal' | 'vertical'

/** ARIA 布尔值：真时输出 'true'，假时省略（返回 undefined）。 */
export type MaybeBooleanish = boolean | undefined
