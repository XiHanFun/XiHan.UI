import type { Service } from '@xihan-ui/core'
import type { InfiniteScrollApi, InfiniteScrollSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectInfiniteScroll, infiniteScrollMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface InfiniteScrollContext {
  api: InfiniteScrollApi
  service: Service<InfiniteScrollSchema>
  /** 哨兵节点：观察器盯的就是它。 */
  sentinelRef: RefObject<HTMLElement | null>
}

/** 观察在机器的效应里跑，两处 DOM 取值口经 refs 交进去；getTargetEl 返回滚动容器，null 即整页滚动。 */
export function useInfiniteScroll(
  props: InfiniteScrollSchema['props'],
  getTargetEl: () => HTMLElement | null = () => null,
): InfiniteScrollContext {
  const sentinelRef = useRef<HTMLElement | null>(null)
  // 效应只挂一次，取值器每帧换新：转发器读这一份，滚动容器换了当场跟上
  const targetRef = useRef(getTargetEl)
  targetRef.current = getTargetEl

  const service = useMachine(infiniteScrollMachine, () => props, {
    // 观察在机器的挂载效应里就要建起来，DOM 侧的取值口得赶在那之前交出去
    onCreate: (svc: Service<InfiniteScrollSchema>) => {
      svc.refs.set('getSentinelEl', () => sentinelRef.current)
      svc.refs.set('getTargetEl', () => targetRef.current())
    },
  })

  return { api: connectInfiniteScroll(service, reactNormalize), service, sentinelRef }
}
