import type { Scope } from '@xihan-ui/kernel'
import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/machine'
import type { MaybeRefOrGetter } from 'vue'
import { createService } from '@xihan-ui/machine'
import { toValue } from 'vue'
import { attachFormReset } from './attach-form-reset'
import { createVueRuntime } from './create-vue-runtime'

export function useMachine<T extends MachineSchema>(
  machine: MachineConfig<T>,
  userProps: MaybeRefOrGetter<Partial<T['props']>> = {} as never,
  scope?: Scope,
): Service<T> {
  const service = createService(machine, {
    // 每次展开成新对象，让 machine 的身份缓存失效
    props: () => ({ ...toValue(userProps) }) as never,
    runtime: createVueRuntime(),
    scope,
  })
  attachFormReset(service)
  return service
}
