import type { InfiniteScrollApi, InfiniteScrollSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useCallback } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { InfiniteScrollProvider, useInfiniteScrollContext } from './context'
import { useInfiniteScroll } from './use-infinite-scroll'

type InfiniteScrollProps = InfiniteScrollSchema['props']

/** 函数式 children 的载荷：取数所处的阶段，以及正在取数与已关掉两个状态。 */
export type InfiniteScrollRootSlotProps = Pick<InfiniteScrollApi, 'phase' | 'loading' | 'disabled'>

export interface XhInfiniteScrollRootProps {
  /** 提前量（px）：哨兵离可视区还有这么远就算进入，默认 0。 */
  distance?: number
  /** 关掉：不再观察，也不再触发。列表已经没有下一页时用它。 */
  disabled?: boolean
  /** 正在取数：其间不观察、不重复触发。取完由宿主写回 false。 */
  loading?: boolean
  /** 裁剪出可视区的滚动容器，缺省即整页滚动；distance 的提前量扩的正是这块区域。 */
  target?: HTMLElement | null
  /** 该取下一页了。 */
  onLoad?: InfiniteScrollProps['onLoad']
  children?: SlotChildren<InfiniteScrollRootSlotProps>
}

/** 根节点是列表的外壳，状态挂在它身上；滚动本身走浏览器原生通路，组件不接管。 */
export function XhInfiniteScrollRoot({ children, target, ...props }: XhInfiniteScrollRootProps): ReactNode {
  const getTarget = useCallback(() => target ?? null, [target])
  const ctx = useInfiniteScroll(props as InfiniteScrollProps, getTarget)
  const api = ctx.api
  return (
    <InfiniteScrollProvider value={ctx}>
      <div {...api.getRootProps() as Record<string, unknown>}>
        {renderSlot(children, { phase: api.phase, loading: api.loading, disabled: api.disabled })}
      </div>
    </InfiniteScrollProvider>
  )
}

XhInfiniteScrollRoot.xhEvents = ['load'] as const

export interface XhInfiniteScrollLoadMoreTriggerProps extends ComponentPropsWithRef<'button'> {}
/**
 * 取下一页的按钮：与哨兵是同一条通路的两个入口。
 * 读屏在虚拟光标模式下不产生滚动事件，哨兵那条路够不着，这个按钮是它的键盘等价通路。
 * 文案写在 children 里，组件不代填。
 */
export function XhInfiniteScrollLoadMoreTrigger({ children, ...rest }: XhInfiniteScrollLoadMoreTriggerProps): ReactNode {
  const ctx = useInfiniteScrollContext()
  return (
    <button {...mergeReactProps(ctx.api.getLoadMoreTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhInfiniteScrollSentinelProps extends ComponentPropsWithRef<'div'> {}
/** 摆在列表末尾的哨兵，进可视区即报「该取下一页了」。 */
export function XhInfiniteScrollSentinel({ children, ...rest }: XhInfiniteScrollSentinelProps): ReactNode {
  const ctx = useInfiniteScrollContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getSentinelProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.sentinelRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}
