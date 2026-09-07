import type { Service } from '@xihan-ui/core'
import type { LayoutApi, LayoutSchema } from '@xihan-ui/headless'
import { connectLayout, layoutMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface LayoutContext {
  api: LayoutApi
  service: Service<LayoutSchema>
}

/** 把手要用 aria-controls 指向侧栏，两者的 id 必须同源，所以显式建 scope。 */
export function useLayout(props: LayoutSchema['props']): LayoutContext {
  const scope = useReactScope()
  const service = useMachine(layoutMachine, () => props, { scope })
  return { api: connectLayout(service, reactNormalize), service }
}
