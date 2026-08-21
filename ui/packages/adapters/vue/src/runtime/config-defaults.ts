import type { XhConfig } from '../config/config'
import { fillXhConfigDefaults } from '@xihan-ui/headless'
import { useXhConfig } from '../config/config'

/**
 * 把全局配置垫进一份机器 props：locale 与 size 在实例没给时回落全局，
 * translations 按组件名分桶、仍走 withXhConfig。一个都没填时原样返回。
 */
export function applyXhConfigDefaults<T extends object>(machine: string, props: T, config: XhConfig): T {
  return fillXhConfigDefaults(machine, props, config)
}

/** 取当前作用域的配置读取器；只能在 setup 期调用。 */
export function useXhConfigDefaults(): () => XhConfig {
  const config = useXhConfig()
  return () => config.value
}
