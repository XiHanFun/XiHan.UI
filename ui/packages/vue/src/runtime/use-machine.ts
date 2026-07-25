import type { Scope } from '@xihan-ui/core'
import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/machine'
import type { MaybeRefOrGetter } from 'vue'
import { createService } from '@xihan-ui/machine'
import { toValue } from 'vue'
import { createVueRuntime } from './create-vue-runtime'

export function useMachine<T extends MachineSchema>(
  machine: MachineConfig<T>,
  userProps: MaybeRefOrGetter<Partial<T['props']>> = {} as never,
  scope?: Scope,
): Service<T> {
  return createService(machine, {
    // 展开成新快照：Vue props 对象身份稳定但字段会变，展开让 machine 的身份缓存正确失效
    props: () => ({ ...toValue(userProps) }) as never,
    runtime: createVueRuntime(),
    scope,
  })
}
