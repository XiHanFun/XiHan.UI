import type { Service } from '@xihan-ui/core'
import type { ToggleApi, ToggleSchema } from '@xihan-ui/headless'
import { connectToggle, toggleMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface ToggleContext {
  api: ToggleApi
  service: Service<ToggleSchema>
}

export function useToggle(props: ToggleSchema['props']): ToggleContext {
  const service = useMachine(toggleMachine, () => props)
  return { api: connectToggle(service, reactNormalize), service }
}
