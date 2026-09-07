import type { Service } from '@xihan-ui/core'
import type { AnchorApi, AnchorSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { anchorMachine, connectAnchor } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface AnchorContext {
  api: AnchorApi
  service: Service<AnchorSchema>
  /** list 节点：链接集合的查询容器，同时是指示条量测的参照系。 */
  listRef: RefObject<HTMLElement | null>
}

/** Anchor 不派生 part id，故不另建 scope；getScrollEl 返回判定线所依附的滚动容器，null 即挂在窗口上。 */
export function useAnchor(
  props: AnchorSchema['props'],
  getScrollEl: () => HTMLElement | null = () => null,
): AnchorContext {
  const listRef = useRef<HTMLElement | null>(null)

  // 取值器每帧换、接线只建一次：拿 ref 转一道，别让它成为重建的理由
  const scrollEl = useRef(getScrollEl)
  scrollEl.current = getScrollEl

  // 观察器与量测都在机器的挂载效应里跑，DOM 侧的取值口要赶在那之前交出去
  const onCreate = useCallback((service: Service<AnchorSchema>) => {
    service.refs.set('getListEl', () => listRef.current)
    service.refs.set('getScrollEl', () => scrollEl.current())
  }, [])

  const service = useMachine(anchorMachine, () => props, { onCreate })
  return { api: connectAnchor(service, reactNormalize), service, listRef }
}
