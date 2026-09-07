import type { Service } from '@xihan-ui/core'
import type { TimerApi, TimerSchema } from '@xihan-ui/headless'
import { connectTimer, timerMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface TimerContext {
  api: TimerApi
  /** 机器实例，供调用方直接送事件。 */
  service: Service<TimerSchema>
}

// 不建 scope：connect 不派生任何 id
export function useTimer(props: TimerSchema['props']): TimerContext {
  const service = useMachine(timerMachine, () => props)
  return { api: connectTimer(service, reactNormalize), service }
}
