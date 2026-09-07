import type { Service } from '@xihan-ui/core'
import type { SortableApi, SortableSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectSortable, sortableMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface SortableContext {
  api: SortableApi
  service: Service<SortableSchema>
  /** 容器节点，机器在拾起时拿它找项、量矩形。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useSortable(props: SortableSchema['props']): SortableContext {
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上；传 getter 而非节点，ref 在挂载后才有值
  const onCreate = useCallback((service: Service<SortableSchema>) => {
    service.refs.set('getRootEl', () => rootRef.current)
  }, [])

  const service = useMachine(sortableMachine, () => props, { scope, onCreate })

  return { api: connectSortable(service, reactNormalize), service, rootRef }
}
