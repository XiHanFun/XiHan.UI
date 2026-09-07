import type { Service } from '@xihan-ui/core'
import type { LoadingBarApi, LoadingBarSchema } from '@xihan-ui/headless'
import { connectLoadingBar, loadingBarMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface LoadingBarContext {
  api: LoadingBarApi
  service: Service<LoadingBarSchema>
}

export function useLoadingBar(props: LoadingBarSchema['props']): LoadingBarContext {
  const service = useMachine(loadingBarMachine, () => props)
  return { api: connectLoadingBar(service, reactNormalize), service }
}
