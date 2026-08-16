import type { Scope } from '@xihan-ui/kernel'
import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/machine'
import type { MaybeRefOrGetter } from 'vue'
import { isDev, startDeprecationScan } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { toValue } from 'vue'
import { attachFormReset } from './attach-form-reset'
import { createVueRuntime } from './create-vue-runtime'

// 废弃探测只启动一次：第一个组件建机器时借路启动，之后的组件全走这个开关。
// 生产构建里 isDev() 为 false，跳过；登记表为空时扫描器内部早退，零开销。
let deprecationScanStarted = false

function ensureDeprecationScan(): void {
  if (deprecationScanStarted)
    return
  deprecationScanStarted = true
  if (isDev())
    startDeprecationScan()
}

export function useMachine<T extends MachineSchema>(
  machine: MachineConfig<T>,
  userProps: MaybeRefOrGetter<Partial<T['props']>> = {} as never,
  scope?: Scope,
): Service<T> {
  ensureDeprecationScan()
  const service = createService(machine, {
    // 每次展开成新对象，让 machine 的身份缓存失效
    props: () => ({ ...toValue(userProps) }) as never,
    runtime: createVueRuntime(),
    scope,
  })
  attachFormReset(service)
  return service
}
