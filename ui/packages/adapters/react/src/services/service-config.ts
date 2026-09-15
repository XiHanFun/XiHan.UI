/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 命令式服务共用的配置源。三个服务各自把宿主树渲到自建容器里，接不到组件树里的
// XhConfigProvider，只能自己在宿主里套一层；这里把那段收在一处。
// 源可以是取值函数，运行期跟着应用切语言；没有响应式源的用句柄上的 setConfig 命令式推。
import type { XhConfig } from '../config/config'

/** 配置源：传常量或取值函数均可。 */
export type XhConfigSource = XhConfig | (() => XhConfig) | undefined

export interface ServiceConfigSource {
  /** 宿主渲染时读取一次。 */
  read: () => XhConfig
  /** 更换配置源，并通知宿主重渲。 */
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
