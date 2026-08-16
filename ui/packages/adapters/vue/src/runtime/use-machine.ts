import type { Scope } from '@xihan-ui/kernel'
import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/machine'
import type { MaybeRefOrGetter } from 'vue'
import { isDev, VERSION as KERNEL_VERSION } from '@xihan-ui/kernel'
import { checkLockstepVersion, printMetadataBannerOnce, registerRuntimeHost } from '@xihan-ui/kernel/metadata'
import { createService } from '@xihan-ui/machine'
import { toValue } from 'vue'
import { version as VUE_VERSION } from '../../package.json'
import { attachFormReset } from './attach-form-reset'
import { createVueRuntime } from './create-vue-runtime'

// 废弃探测与锁步版本检查都只启动一次：第一个组件建机器时借路启动，之后的组件全走这个开关。
// 生产构建里 isDev() 为 false，跳过；登记表为空时扫描器内部早退，零开销。
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
    // 注意:废弃扫描不进 Vue 的组件树摇入口——它每个组件都会带一份(约 1.8 kB gzip),
    // 组件级体积棘轮量得出来。需要时手动启动:
    //   import { startDeprecationScan } from '@xihan-ui/kernel/deprecations'
    //   if (import.meta.env.DEV) startDeprecationScan()
    // Web Components 侧在 defineXhElements() 里自动启动,那边没有逐组件入口的棘轮。
  }
}

export function useMachine<T extends MachineSchema>(
  machine: MachineConfig<T>,
  userProps: MaybeRefOrGetter<Partial<T['props']>> = {} as never,
  scope?: Scope,
): Service<T> {
  ensureDevChecks()
  const service = createService(machine, {
    // 每次展开成新对象，让 machine 的身份缓存失效
    props: () => ({ ...toValue(userProps) }) as never,
    runtime: createVueRuntime(),
    scope,
  })
  attachFormReset(service)
  return service
}
