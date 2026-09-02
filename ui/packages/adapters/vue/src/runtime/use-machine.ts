import type { Scope } from '@xihan-ui/kernel'
import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/machine'
import type { MaybeRefOrGetter } from 'vue'
import { isDev, VERSION as KERNEL_VERSION } from '@xihan-ui/kernel'
import { checkLockstepVersion, printMetadataBannerOnce, registerRuntimeHost } from '@xihan-ui/kernel/metadata'
import { createService } from '@xihan-ui/machine'
import { toValue } from 'vue'
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
    checkLockstepVersion('vue', VUE_VERSION, KERNEL_VERSION)
    // 引用即打印:首个组件建机器时打一次启动横幅(整页一次,生产静默)
    printMetadataBannerOnce()
  }
}

export function useMachine<T extends MachineSchema>(
  machine: MachineConfig<T>,
  userProps: MaybeRefOrGetter<Partial<T['props']>> = {} as never,
  scope?: Scope,
): Service<T> {
  ensureDevChecks()
  // 全局配置在这一处并进来：所有跑机器的组件都从这里取 props，不必逐个接线。
  // 与 WC 侧 MachineController 里那一处对位，两个适配器的生效面因此一致
  const config = useXhConfigDefaults()
  const service = createService(machine, {
    // 每次展开成新对象，让 machine 的身份缓存失效
    props: () => applyXhConfigDefaults(machine.name, { ...toValue(userProps) }, config()) as never,
    runtime: createVueRuntime(),
    scope,
  })
  attachFormReset(service)
  return service
}
