import type { Service } from '@xihan-ui/core'
import type { SplitterApi, SplitterSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectSplitter, splitterMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface SplitterContext {
  api: SplitterApi
  service: Service<SplitterSchema>
  /** 容器节点，机器在拖拽开始时拿它量矩形。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useSplitter(props: SplitterSchema['props']): SplitterContext {
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)

  // 机器的挂载效应会立刻读 refs，交在 onCreate 里才赶得上；传 getter 而非节点，ref 在挂载后才有值
  const onCreate = useCallback((service: Service<SplitterSchema>) => {
    service.refs.set('getRootEl', () => rootRef.current)
  }, [])

  const service = useMachine(splitterMachine, () => props, { scope, onCreate })

  return { api: connectSplitter(service, reactNormalize), service, rootRef }
}
