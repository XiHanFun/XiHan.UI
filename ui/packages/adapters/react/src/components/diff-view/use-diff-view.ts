import type { Service } from '@xihan-ui/core'
import type { DiffViewApi, DiffViewSchema } from '@xihan-ui/headless'
import { connectDiffView, diffViewMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

type Props = DiffViewSchema['props']

export interface DiffViewContext {
  service: Service<DiffViewSchema>
  api: DiffViewApi
}

export function useDiffView(props: Props): DiffViewContext {
  const scope = useReactScope()
  const service = useMachine(diffViewMachine, () => props, { scope })
  return { service, api: connectDiffView(service, reactNormalize) }
}
