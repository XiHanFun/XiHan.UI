import type { Service } from '@xihan-ui/core'
import type { StepsApi, StepsSchema } from '@xihan-ui/headless'
import { connectSteps, stepsMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface StepsContext {
  api: StepsApi
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<StepsSchema>
}

export function useSteps(props: StepsSchema['props']): StepsContext {
  const scope = useReactScope()
  const service = useMachine(stepsMachine, () => props, { scope })
  return { api: connectSteps(service, reactNormalize), service }
}
