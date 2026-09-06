import type { Service } from '@xihan-ui/core'
import type { SwitchApi, SwitchSchema } from '@xihan-ui/headless'
import { connectSwitch, switchMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface SwitchContext {
  api: SwitchApi
  service: Service<SwitchSchema>
}

export function useSwitch(props: SwitchSchema['props']): SwitchContext {
  const service = useMachine(switchMachine, () => props)
  return { api: connectSwitch(service, reactNormalize), service }
}
