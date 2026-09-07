import type { Service } from '@xihan-ui/core'
import type { ClipboardApi, ClipboardSchema } from '@xihan-ui/headless'
import { clipboardMachine, connectClipboard } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface ClipboardContext {
  api: ClipboardApi
  service: Service<ClipboardSchema>
}

export function useClipboard(props: ClipboardSchema['props']): ClipboardContext {
  // connect 要派生 label 与 input 的 id，因此建 scope：同页多份 IDREF 才不会相撞
  const scope = useReactScope()
  const service = useMachine(clipboardMachine, () => props, { scope })
  return { api: connectClipboard(service, reactNormalize), service }
}
