import type { MasonryColumns, MasonryGap, MasonryMeasurement, MasonryProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectMasonry, distributeMasonry, measureMasonry, resolveMasonryColumns, sameMasonryHeights } from '@xihan-ui/headless'
import { Children, Fragment, isValidElement, useCallback, useRef, useState } from 'react'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'

/**
 * 把 children 摊成一个个项。
 *
 * `Children.toArray` 把数组与 null / undefined / 布尔一并处理掉，这里只再摊平片段
 * 与滤掉纯空白文本：片段不摊平就整段算一项，一列里会塞进所有内容；纯空白一个像素都不画，
 * 留着会占掉一个格位。
 */
function masonryItems(children: ReactNode): ReactNode[] {
  const out: ReactNode[] = []
  for (const node of Children.toArray(children)) {
    if (typeof node === 'string') {
      if (node.trim() !== '')
        out.push(node)
      continue
    }
    if (isValidElement(node) && node.type === Fragment) {
      out.push(...masonryItems((node.props as { children?: ReactNode }).children))
      continue
    }
    out.push(node)
  }
  return out
}

export interface XhMasonryProps extends ComponentPropsWithRef<'div'> {
  /**
   * 分几列，不写按三列。也收断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数，
   * 没写的档沿用比它窄的那一档。换档看的是容器自身的宽度，不是视口宽度。
   */
  columns?: MasonryColumns
  /** 列与列、项与项之间的间距档位；换算成哪个令牌归皮肤。 */
  gap?: MasonryGap
  /** 按文档序逐列填；不写则最短列优先。 */
  sequential?: boolean
}

/** 瀑布流容器：列按当前档位铺，项按量到的高度落进某一列。 */
export function XhMasonry({ columns, gap, sequential, children, ...rest }: XhMasonryProps): ReactNode {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  /** 当前挂着观察器的节点，与新一轮比对后才决定要不要重挂。 */
  const observedRef = useRef<HTMLElement[]>([])
  /** 容器自身的宽度，换档看它。 */
  const [width, setWidth] = useState(0)
  /** 按作者写的项序排好的实测高度。 */
  const [heights, setHeights] = useState<readonly number[]>([])

  /** Headless 只产出测量快照；是否写入 React 状态仍由适配器决定。 */
  const publishMeasurement = useCallback((measurement: MasonryMeasurement): void => {
    setWidth(previous => (previous === measurement.width ? previous : measurement.width))
    setHeights(previous => (sameMasonryHeights(previous, measurement.heights) ? previous : measurement.heights))
  }, [])

  /** 量一遍容器宽度与每一项的高度。量到的与上一遍一样就不写，否则量一次重排一次没完。 */
  const measure = useCallback((): void => {
    const el = rootRef.current
    if (!el)
      return
    publishMeasurement(measureMasonry(el))
  }, [publishMeasurement])

  /** 项增删后把观察器挂到新的一批节点上，再量一遍。节点没变就不重挂：重挂会白白多跑一轮回调。 */
  const sync = useCallback((): void => {
    const el = rootRef.current
    if (!el)
      return
    const measurement = measureMasonry(el)
    const next = [el, ...measurement.items]
    const changed = next.length !== observedRef.current.length
      || next.some((node, index) => node !== observedRef.current[index])
    if (observerRef.current && changed) {
      observerRef.current.disconnect()
      for (const node of next) observerRef.current.observe(node)
      observedRef.current = next
    }
    publishMeasurement(measurement)
  }, [publishMeasurement])

  useIsomorphicLayoutEffect(() => {
    const win = rootRef.current?.ownerDocument.defaultView
    // 无布局环境没有 ResizeObserver：只在提交后量，之后不再跟随尺寸变化
    if (win && typeof win.ResizeObserver === 'function')
      observerRef.current = new win.ResizeObserver(() => measure())
    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
      observedRef.current = []
    }
  }, [measure])

  // 不给依赖数组：每次提交后都对一遍观察名单并量一次，此刻节点已落进 DOM
  useIsomorphicLayoutEffect(sync)

  const items = masonryItems(children)
  const columnCount = resolveMasonryColumns(columns, width)
  const assign = distributeMasonry(
    items.map((_, index) => heights[index] ?? 0),
    columnCount,
    sequential ?? false,
  )
  const api = connectMasonry({ columns, gap, sequential } satisfies MasonryProps, reactNormalize)

  const rendered: ReactNode[] = []
  for (let column = 0; column < columnCount; column++) {
    const kids: ReactNode[] = []
    items.forEach((child, index) => {
      if (assign[index] !== column)
        return
      // 项各包一层：量高度要有个稳定的盒子，作者写什么内容都不影响
      // 键跟着作者写的 key 走，同一列内增删才不会连累后面几项重建
      const key = isValidElement(child) && child.key != null ? child.key : `xh-masonry-item-${index}`
      kids.push(
        <div key={key} {...api.getItemProps({ index, column }) as Record<string, unknown>}>
          {child}
        </div>,
      )
    })
    rendered.push(
      <div key={column} {...api.getColumnProps({ index: column }) as Record<string, unknown>}>
        {kids}
      </div>,
    )
  }

  return (
    <div
      {...mergeReactProps(
        api.getRootProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: rootRef },
      )}
    >
      {rendered}
    </div>
  )
}
