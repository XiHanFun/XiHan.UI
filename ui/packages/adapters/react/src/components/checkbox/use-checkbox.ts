import type { Service } from '@xihan-ui/core'
import type { CheckboxApi, CheckboxSchema } from '@xihan-ui/headless'
import { checkboxMachine, connectCheckbox } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface CheckboxContext {
  api: CheckboxApi
  service: Service<CheckboxSchema>
}

export function useCheckbox(props: CheckboxSchema['props']): CheckboxContext {
  const service = useMachine(checkboxMachine, () => props)
  return { api: connectCheckbox(service, reactNormalize), service }
}
