import type { Service } from '@xihan-ui/core'
import type { MessageFeedApi, MessageFeedSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { createRuntimeConfig } from '@xihan-ui/core'
import { connectMessageFeed, messageFeedMachine } from '@xihan-ui/headless'
import { useEffect, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactIdGenerator, useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

type Props = MessageFeedSchema['props']

export interface MessageFeedContext {
  service: Service<MessageFeedSchema>
  api: MessageFeedApi
  /** 根节点，条目集合的归属容器。 */
  rootRef: RefObject<HTMLElement | null>
  /** overflow:auto 的滚动容器节点。 */
  viewportRef: RefObject<HTMLElement | null>
  /** 内容包裹层节点，尺寸变化的观察目标。 */
  contentRef: RefObject<HTMLElement | null>
}

export function useMessageFeed(props: Props): MessageFeedContext {
  const idGenerator = useReactIdGenerator()
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const viewportRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  const service = useMachine(messageFeedMachine, () => props, {
    scope,
    // 粘底副作用在机器的挂载效应里建句柄，四处取值口得赶在那之前交出去
    onCreate: (svc: Service<MessageFeedSchema>) => {
      // 无 DOM 环境不装 config，此时粘底效应整套不挂载
      if (typeof document !== 'undefined')
        svc.refs.set('config', createRuntimeConfig({ scope, idGenerator }))
      svc.refs.set('getRootEl', () => rootRef.current)
      svc.refs.set('getViewportEl', () => viewportRef.current)
      svc.refs.set('getContentEl', () => contentRef.current)
    },
  })

  // 不给依赖数组：每次提交后重读节点，换了就让句柄重绑
  const bound = useRef<[Element | null, Element | null]>([null, null])
  useEffect(() => {
    const next: [Element | null, Element | null] = [viewportRef.current, contentRef.current]
    if (next[0] === bound.current[0] && next[1] === bound.current[1])
      return
    bound.current = next
    service.refs.get('stick')?.retarget()
  })

  return { service, api: connectMessageFeed(service, reactNormalize), rootRef, viewportRef, contentRef }
}
