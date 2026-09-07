// 命令式服务共用的配置源。三个服务各自把宿主树渲到自建容器里，接不到组件树里的
// XhConfigProvider，只能自己在宿主里套一层；这里把那段收在一处。
// 源可以是取值函数，运行期跟着应用切语言；没有响应式源的用句柄上的 setConfig 命令式推。
import type { XhConfig } from '../config/config'

/** 配置源：给常量或取值函数都行。 */
export type XhConfigSource = XhConfig | (() => XhConfig) | undefined

export interface ServiceConfigSource {
  /** 宿主渲染时读一次。 */
  read: () => XhConfig
  /** 换一份配置源，并通知宿主重渲。 */
  set: (next: XhConfigSource) => void
  subscribe: (fn: () => void) => () => void
}

export function createServiceConfig(initial?: XhConfigSource): ServiceConfigSource {
  let source = initial
  const subs = new Set<() => void>()
  return {
    read: () => (typeof source === 'function' ? source() : source) ?? {},
    set: (next) => {
      source = next
      for (const fn of [...subs]) fn()
    },
    subscribe: (fn) => {
      subs.add(fn)
      return () => void subs.delete(fn)
    },
  }
}
