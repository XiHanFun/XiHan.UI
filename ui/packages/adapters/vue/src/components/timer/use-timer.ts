import type { TimerApi, TimerSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { connectTimer, timerMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface TimerContext {
  api: ComputedRef<TimerApi>
  /** 机器实例，供组合式调用方直接送事件。 */
  service: Service<TimerSchema>
}

// 不建 scope：connect 不派生任何 id
export function useTimer(
  props: TimerSchema['props'],
  handlers: Pick<TimerSchema['props'], 'onComplete' | 'onTick'> = {},
): TimerContext {
  const service = useMachine(timerMachine, () => ({ ...props, ...handlers }))
  const api = computed(() => connectTimer(service, vueNormalize))
  return { api, service }
}
