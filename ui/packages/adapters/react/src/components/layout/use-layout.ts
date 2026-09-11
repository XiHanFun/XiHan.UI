import type { Service } from '@xihan-ui/core'
import type { LayoutApi, LayoutSchema } from '@xihan-ui/headless'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectLayout, layoutMachine } from '@xihan-ui/headless'
import { useMemo } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface LayoutContext {
  api: LayoutApi
  service: Service<LayoutSchema>
}

/** 把手要用 aria-controls 指向侧栏，两者的 id 必须同源，所以显式建 scope。 */
export function useLayout(props: LayoutSchema['props']): LayoutContext {
  const idGenerator = useReactIdGenerator()
  const scope = useMemo(() => createScope(null, idGenerator), [idGenerator])
  const service = useMachine(layoutMachine, () => props, {
    scope,
    // onCreate 早于机器 mount，覆盖式侧栏从第一帧起就与其他浮层共享同一运行时层栈。
    onCreate: (svc) => {
      if (typeof document !== 'undefined')
        svc.refs.set('config', createRuntimeConfig({ scope, idGenerator }))
    },
  })
  return { api: connectLayout(service, reactNormalize), service }
}
