import type { VirtualizerApi, VirtualizerSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useRef } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { useVirtualizerContext, VirtualizerProvider } from './context'
import { useVirtualizer } from './use-virtualizer'

type VirtualizerProps = VirtualizerSchema['props']

/** 函数式 children 的载荷：此刻该渲染的条目与总长、可视区首末下标与滚动态，以及滚动与量尺寸的动作。 */
export type VirtualizerRootSlotProps = Pick<
  VirtualizerApi,
  | 'virtualItems'
  | 'totalSize'
  | 'startIndex'
  | 'endIndex'
  | 'scrolling'
  | 'lanes'
  | 'scrollToIndex'
  | 'measureElement'
  | 'measure'
>

export interface XhVirtualizerRootProps {
  /** 总条数。 */
  count?: number
  /** 每条的估算主轴尺寸（px）；等高列表直接给一个数字。 */
  estimateSize?: number | ((index: number) => number)
  /** 可视区前后各多渲几条。 */
  overscan?: number
  /** 横向列表（主轴是行内轴）。 */
  horizontal?: boolean
  /** 相邻两条之间的主轴间距（px）。 */
  gap?: number
  /** 条目身份；列表会增删时给稳定 key，测量缓存才跟得住条目。 */
  getItemKey?: (index: number) => string | number
  /** 列表起点距滚动容器起点的距离（px）。 */
  scrollMargin?: number
  /** 列表前后的内边距（px）。 */
  paddingStart?: number
  paddingEnd?: number
  /** 多列网格的列数；条目按下标轮流落到各道上。 */
  lanes?: number
  /** 该渲什么变了。 */
  onChange?: VirtualizerProps['onChange']
  children?: SlotChildren<VirtualizerRootSlotProps>
}

export function XhVirtualizerRoot({ children, ...props }: XhVirtualizerRootProps): ReactNode {
  const ctx = useVirtualizer(props as VirtualizerProps)
  const api = ctx.api
  return (
    <VirtualizerProvider value={ctx}>
      <div {...api.getRootProps() as Record<string, unknown>}>
        {renderSlot(children, {
          virtualItems: api.virtualItems,
          totalSize: api.totalSize,
          startIndex: api.startIndex,
          endIndex: api.endIndex,
          scrolling: api.scrolling,
          lanes: api.lanes,
          scrollToIndex: api.scrollToIndex,
          measureElement: api.measureElement,
          measure: api.measure,
        })}
      </div>
    </VirtualizerProvider>
  )
}

XhVirtualizerRoot.xhEvents = ['change'] as const

export interface XhVirtualizerViewportProps extends ComponentPropsWithRef<'div'> {}
/** 视口节点经 ref 交给机器，由内核在效应里接上。 */
export function XhVirtualizerViewport({ children, ...rest }: XhVirtualizerViewportProps): ReactNode {
  const ctx = useVirtualizerContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getViewportProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.viewportRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhVirtualizerContentProps extends ComponentPropsWithRef<'div'> {}
export function XhVirtualizerContent({ children, ...rest }: XhVirtualizerContentProps): ReactNode {
  const ctx = useVirtualizerContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhVirtualizerItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 这个节点是第几条。 */
  value: number | string
  /** 是否把真实尺寸回喂给内核；不开时条目尺寸按 estimateSize 算。 */
  measure?: boolean
}

export function XhVirtualizerItem({ value, measure, children, ...rest }: XhVirtualizerItemProps): ReactNode {
  const ctx = useVirtualizerContext()
  const el = useRef<HTMLElement | null>(null)

  // 不给依赖数组：每次提交后都量一次，此刻节点已落进 DOM
  const { api } = ctx
  useEffect(() => {
    if (measure)
      api.measureElement(el.current)
  })

  return (
    <div
      {...mergeReactProps(
        ctx.api.getItemProps({ index: Number(value) }) as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (node: HTMLDivElement | null) => { el.current = node } },
      )}
    >
      {children}
    </div>
  )
}
