import type { XhConfig } from '../config/config'
import { SIZE_IS_NOT_AXIS, useXhConfig } from '../config/config'

/**
 * 能由全局配置垫底的 props。
 *
 * 只收那些「同一个键在所有组件上是同一件事」的：locale 是 BCP 47 标记，size 是三轴那档。
 * translations 不在此列——它按组件名分桶，合并要知道自己是谁，仍走 withXhConfig。
 */
const GLOBAL_KEYS = ['locale', 'size'] as const satisfies ReadonlyArray<keyof XhConfig>

/**
 * 把全局配置垫进一份机器 props：键在、实例没给（undefined）才填。
 *
 * 「键在」这条判据是精确的：Vue 的 props 对象为每个声明过的 prop 都留了键（没传即 undefined），
 * 各 use-*.ts 交上来的对象字面量同理。所以没声明 size 的组件不会平白多出一个 size。
 * 一个都没填时原样返回，不新建对象。
 */
export function applyXhConfigDefaults<T extends object>(
  machine: string,
  props: T,
  config: XhConfig,
): T {
  let out: T | undefined
  for (const key of GLOBAL_KEYS) {
    if (key === 'size' && SIZE_IS_NOT_AXIS.has(machine))
      continue
    const value = config[key]
    if (value === undefined || !(key in props) || (props as Record<string, unknown>)[key] !== undefined)
      continue
    out ??= { ...props }
    ;(out as Record<string, unknown>)[key] = value
  }
  return out ?? props
}

/** 取当前作用域的配置读取器；只能在 setup 期调用。 */
export function useXhConfigDefaults(): () => XhConfig {
  const config = useXhConfig()
  return () => config.value
}
