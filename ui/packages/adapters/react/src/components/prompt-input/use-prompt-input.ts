import type { Service } from '@xihan-ui/core'
import type { PromptInputApi, PromptInputSchema } from '@xihan-ui/headless'
import { connectPromptInput, promptInputMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

type Props = PromptInputSchema['props']

export interface PromptInputContext {
  service: Service<PromptInputSchema>
  api: PromptInputApi
}

// 整台机器不碰 DOM，不需要 RuntimeConfig
export function usePromptInput(props: Props): PromptInputContext {
  const scope = useReactScope()
  const service = useMachine(promptInputMachine, () => props, { scope })
  return { service, api: connectPromptInput(service, reactNormalize) }
}
