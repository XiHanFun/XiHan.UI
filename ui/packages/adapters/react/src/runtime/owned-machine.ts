/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 由服务自己持有、建好即启动的机器，以及把宿主组件订上去的 hook。
//
// 命令式服务的队列机器没有 DOM 锚点，不必等宿主树提交。宿主树用 flushSync 提交，
// 但从业务组件的 effect 里懒建服务时 React 正处在提交上下文，flushSync 只能排队、
// 提示要等这轮 effect 跑完才渲：机器与端口若跟着宿主的渲染体走，createToastService()
// 返回后紧接着那条命令就落在窗口期里。机器归服务持有、当场 start，端口随即接上，
// 宿主组件只负责订阅与渲染，什么时候提交都不再影响命令能否入队。

import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/core'
import type { XhConfig } from '../config/config'
import type { ReactRuntime } from './create-react-runtime'
import { createService } from '@xihan-ui/core'
import { useSyncExternalStore } from 'react'
import { applyXhConfigDefaults } from './config-defaults'
import { createReactRuntime } from './create-react-runtime'
import { ensureDevChecks, getServerVersion, useIsomorphicLayoutEffect } from './use-machine'

export interface OwnedMachine<T extends MachineSchema> {
  /** 建好即已 Started；宿主还没提交也照常收命令。 */
  readonly service: Service<T>
  /** 停机；之后的事件由机器静默丢弃，端口那一层另有「已卸载」的把关。 */
  dispose: () => void
}

interface OwnedMachineInternal<T extends MachineSchema> extends OwnedMachine<T> {
  runtime: ReactRuntime
}

/**
 * 建一台由调用方持有的机器并当场 start。
 * getProps 每次调用都要返回当下最新的 props；全局配置经 getConfig 合入，与组件树内 useMachine 的口径一致。
 */
export function createOwnedMachine<T extends MachineSchema>(
  machine: MachineConfig<T>,
  getProps: () => Partial<T['props']>,
  getConfig: () => XhConfig,
): OwnedMachine<T> {
  ensureDevChecks()
  const runtime = createReactRuntime()
  const service = createService(machine, {
    props: () => applyXhConfigDefaults(machine.name, { ...getProps() }, getConfig()) as never,
    runtime,
  })
  runtime.mount()
  const owned: OwnedMachineInternal<T> = {
    service,
    runtime,
    dispose: () => runtime.unmount(),
  }
  return owned
}

/**
 * 把宿主组件订到一台服务持有的机器上：cell 变了就重渲，提交后再跑排队的 flush 回调与 tracker。
 * 不负责挂载与卸载，那两步归持有机器的服务。
 */
export function useOwnedMachine<T extends MachineSchema>(owned: OwnedMachine<T>): Service<T> {
  const { runtime, service } = owned as OwnedMachineInternal<T>
  // 与 useMachine 同序：先立渲染中标记并记下本次读到的版本号，再订阅
  runtime.beginRender()
  useSyncExternalStore(runtime.subscribe, runtime.getVersion, getServerVersion)
  // 不给依赖数组：每次提交后都跑，DOM 刚落定
  useIsomorphicLayoutEffect(() => {
    runtime.flushCommitted()
    runtime.runTrackers()
  })
  return service
}
