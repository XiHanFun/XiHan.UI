/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use machine 相关实现。

import type { MachineConfig, MachineSchema, Scope, Service } from '@xihan-ui/core'
import type { MaybeRefOrGetter } from 'vue'
import type { VueRuntimeOptions } from './create-vue-runtime'
import { VERSION as CORE_VERSION, createService, isDev } from '@xihan-ui/core'
import { checkLockstepVersion, printMetadataBannerOnce, registerRuntimeHost } from '@xihan-ui/core/metadata'
import { computed, toValue } from 'vue'
import { version as VUE_VERSION } from '../../package.json'
import { attachFormReset } from './attach-form-reset'
import { applyXhConfigDefaults, useXhConfigDefaults } from './config-defaults'
import { createVueRuntime } from './create-vue-runtime'

// 锁步版本检查只跑一次：第一个组件建机器时借路启动，之后的组件全走这个开关。
// 生产构建里 isDev() 为 false，跳过。
let devChecksStarted = false

function ensureDevChecks(): void {
  if (devChecksStarted)
    return
  devChecksStarted = true
  // 宿主登记不分 dev/prod:元数据要能报出运行在哪个适配器上
  registerRuntimeHost('vue', VUE_VERSION)
  if (isDev()) {
    checkLockstepVersion('vue', VUE_VERSION, CORE_VERSION)
    // 引用即打印:首个组件建机器时打一次启动横幅(整页一次,生产静默)
    printMetadataBannerOnce()
  }
}

export interface UseMachineOptions {
  /** 机器何时 start，见 VueRuntimeOptions.start；组件只用缺省的 'mounted'。 */
  start?: VueRuntimeOptions['start']
}

export function useMachine<T extends MachineSchema>(
  machine: MachineConfig<T>,
  userProps: MaybeRefOrGetter<Partial<T['props']>> = {} as never,
  scope?: Scope,
  options: UseMachineOptions = {},
): Service<T> {
  ensureDevChecks()
  // 全局配置在这一处并进来：所有跑机器的组件都从这里取 props，不必逐个接线。
  // 与 WC 侧 MachineController 里那一处对位，两个适配器的生效面因此一致
  const config = useXhConfigDefaults()
  // service 的 props() 调用极频繁：连接层每读一个 prop 就走一遍。放进 computed 里，
  // 响应式依赖没动时复用同一份展开结果（machine 的身份缓存跟着命中），
  // 依赖一动就产出新对象，身份缓存照旧失效。组件的 props、attrs、注入的上下文与全局配置
  // 都是响应式的，缓存的失效面与组件自己的重渲一致。
  const props = computed(() => applyXhConfigDefaults(machine.name, { ...toValue(userProps) }, config()))
  const service = createService(machine, {
    props: () => props.value as never,
    runtime: createVueRuntime({ start: options.start }),
    scope,
  })
  attachFormReset(service)
  return service
}
