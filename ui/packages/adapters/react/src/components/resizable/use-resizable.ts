import type { Service } from '@xihan-ui/core'
import type { ResizableApi, ResizableSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectResizable, resizableMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface ResizableContext {
  api: ResizableApi
  service: Service<ResizableSchema>
  /** 容器节点，机器在按下时拿它量矩形。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useResizable(props: ResizableSchema['props']): ResizableContext {
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上；传 getter 而非节点，ref 在挂载后才有值
  const onCreate = useCallback((service: Service<ResizableSchema>) => {
    service.refs.set('getRootEl', () => rootRef.current)
  }, [])

  const service = useMachine(resizableMachine, () => props, { scope, onCreate })

  return { api: connectResizable(service, reactNormalize), service, rootRef }
}
