import type { Orientation, Service } from '@xihan-ui/core'
import type { ScrollAreaApi, ScrollAreaProps, ScrollAreaServices, ScrollbarSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectScrollArea, scrollAreaScrollbarProps, scrollbarMachine } from '@xihan-ui/headless'
import { useCallback, useRef } from 'react'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

/** 两条轴各自的节点表。 */
type AxisNodes = Record<Orientation, HTMLElement | null>

export interface ScrollAreaContext {
  /** 两条轴各一台 scrollbar 机器。 */
  services: ScrollAreaServices
  api: ScrollAreaApi
  /** overflow:auto 的那层，两台机器都挂在它身上。 */
  viewportRef: RefObject<HTMLElement | null>
  /** 内容包裹层。 */
  contentRef: RefObject<HTMLElement | null>
  /** 逐轴登记那条滚动条的根节点（即挂载点）。 */
  setScrollbarEl: (axis: Orientation, el: HTMLElement | null) => void
  /** 逐轴登记那条滚动条的轨道节点。 */
  setTrackEl: (axis: Orientation, el: HTMLElement | null) => void
}

/** 滚动区没有自己的机器：按轴各建一台 scrollbar，视口就是它们共同的滚动容器。 */
export function useScrollArea(props: ScrollAreaProps): ScrollAreaContext {
  const scope = useReactScope()
  const viewportRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  // 普通对象而非状态，这两组节点只在机器的效应与事件里读
  const scrollbarEls = useRef<AxisNodes>({ vertical: null, horizontal: null })
  const trackEls = useRef<AxisNodes>({ vertical: null, horizontal: null })

  // 取值器随渲染换，接线只建一次：拿 ref 转一道，每次取值现读这一份
  const latest = useRef(props)
  latest.current = props

  const bind = useCallback((axis: Orientation) => (service: Service<ScrollbarSchema>) => {
    // 传 getter 而非节点，ref 在挂载后才有值；量尺寸与挂监听都在机器的效应里进行
    service.refs.set('getScrollableEl', () => viewportRef.current)
    service.refs.set('getTrackEl', () => trackEls.current[axis])
    service.refs.set('getRootEl', () => scrollbarEls.current[axis])
  }, [])

  // 每次取值现读 props：挂载后改 type / orientation 机器要跟着变
  const vertical = useMachine(
    scrollbarMachine,
    () => scrollAreaScrollbarProps(latest.current, 'vertical'),
    { scope, onCreate: bind('vertical') },
  )
  const horizontal = useMachine(
    scrollbarMachine,
    () => scrollAreaScrollbarProps(latest.current, 'horizontal'),
    { scope, onCreate: bind('horizontal') },
  )
  const services: ScrollAreaServices = { vertical, horizontal }

  return {
    services,
    api: connectScrollArea(services, props, reactNormalize),
    viewportRef,
    contentRef,
    setScrollbarEl: (axis, el) => {
      scrollbarEls.current[axis] = el
    },
    setTrackEl: (axis, el) => {
      trackEls.current[axis] = el
    },
  }
}
