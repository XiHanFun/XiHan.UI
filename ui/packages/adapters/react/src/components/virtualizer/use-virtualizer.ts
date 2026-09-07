import type { Service } from '@xihan-ui/core'
import type { VirtualizerApi, VirtualizerSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectVirtualizer, virtualizerMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface VirtualizerContext {
  service: Service<VirtualizerSchema>
  api: VirtualizerApi
  /** 真正 overflow:auto 的那层：内核的尺寸观察与滚动监听都挂在它身上。 */
  viewportRef: RefObject<HTMLElement | null>
  /** 撑出总长的那层，条目的定位上下文。 */
  contentRef: RefObject<HTMLElement | null>
}

export function useVirtualizer(props: VirtualizerSchema['props']): VirtualizerContext {
  const scope = useReactScope()
  const viewportRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  const service = useMachine(virtualizerMachine, () => props, {
    scope,
    // 内核建立、尺寸观察与滚动监听都在机器的挂载效应里跑，两处取值口得赶在那之前交出去
    onCreate: (svc: Service<VirtualizerSchema>) => {
      svc.refs.set('getViewportEl', () => viewportRef.current)
      svc.refs.set('getContentEl', () => contentRef.current)
    },
  })

  return { service, api: connectVirtualizer(service, reactNormalize), viewportRef, contentRef }
}
