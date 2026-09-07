import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { PaginationApi, PaginationEllipsisSide, PaginationSchema, PaginationTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { PaginationProvider, usePaginationContext } from './context'
import { usePagination } from './use-pagination'

type PaginationProps = PaginationSchema['props']

/** 函数式 children 的载荷：当前页与总量口径、页码序列与条目区间、前后页页码，以及翻页与按当前页切数据的动作。 */
export type PaginationRootSlotProps = Pick<
  PaginationApi,
  | 'page'
  | 'pageSize'
  | 'pageSizeOptions'
  | 'pageItems'
  | 'openEllipsis'
  | 'count'
  | 'totalPages'
  | 'pages'
  | 'pageRange'
  | 'previousPage'
  | 'nextPage'
  | 'setPage'
  | 'goToPrevPage'
  | 'goToNextPage'
  | 'setPageSize'
  | 'slice'
>

export interface XhPaginationRootProps {
  /** 总条数。 */
  count?: number
  pageSize?: number
  defaultPageSize?: number
  pageSizeOptions?: number[]
  page?: number
  defaultPage?: number
  /** 当前页两侧各留几个页码。 */
  siblingCount?: number
  dir?: Direction
  translations?: Partial<PaginationTranslations>
  placement?: Placement
  offset?: number
  openDelay?: number
  closeDelay?: number
  tone?: Tone
  size?: Size
  onPageChange?: PaginationProps['onPageChange']
  onPageSizeChange?: PaginationProps['onPageSizeChange']
  children?: SlotChildren<PaginationRootSlotProps>
}

/** 根节点渲染为 nav 地标。 */
export function XhPaginationRoot({ children, ...props }: XhPaginationRootProps): ReactNode {
  const ctx = usePagination(withXhConfig('pagination', props) as PaginationProps)
  const api = ctx.api
  return (
    <PaginationProvider value={ctx}>
      <nav {...api.getRootProps() as Record<string, unknown>}>
        {renderSlot(children, {
          page: api.page,
          pageSize: api.pageSize,
          pageSizeOptions: api.pageSizeOptions,
          count: api.count,
          totalPages: api.totalPages,
          pages: api.pages,
          pageItems: api.pageItems,
          openEllipsis: api.openEllipsis,
          pageRange: api.pageRange,
          previousPage: api.previousPage,
          nextPage: api.nextPage,
          setPage: api.setPage,
          goToPrevPage: api.goToPrevPage,
          goToNextPage: api.goToNextPage,
          setPageSize: api.setPageSize,
          slice: api.slice,
        })}
      </nav>
    </PaginationProvider>
  )
}

export interface XhPaginationPrevTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhPaginationPrevTrigger({ children, ...rest }: XhPaginationPrevTriggerProps): ReactNode {
  const ctx = usePaginationContext()
  return <button {...mergeReactProps(ctx.api.getPrevTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhPaginationNextTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhPaginationNextTrigger({ children, ...rest }: XhPaginationNextTriggerProps): ReactNode {
  const ctx = usePaginationContext()
  return <button {...mergeReactProps(ctx.api.getNextTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhPaginationItemProps extends Omit<ComponentPropsWithRef<'button'>, 'value'> {
  /** 这一项对应的页码，兼收字符串。 */
  value: number | string
}
export function XhPaginationItem({ value, children, ...rest }: XhPaginationItemProps): ReactNode {
  const ctx = usePaginationContext()
  return (
    <button
      {...mergeReactProps(
        ctx.api.getItemProps({ page: Number(value) }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </button>
  )
}

export interface XhPaginationEllipsisTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 这是哪一侧的省略位：首页与窗口之间是 start，窗口与末页之间是 end。 */
  side?: PaginationEllipsisSide
}
export function XhPaginationEllipsisTrigger({ side = 'start', children, ...rest }: XhPaginationEllipsisTriggerProps): ReactNode {
  const ctx = usePaginationContext()
  // pointerenter / pointerleave 不冒泡，React 的同名合成事件收不到直接派到节点上的那一份；
  // 装成原生监听器，到达路径才与另外两家一致
  const bind = useNativeEvents(
    ctx.api.getEllipsisTriggerProps({ side }) as Record<string, unknown>,
    ['onPointerEnter', 'onPointerLeave'],
  )
  // 摊开的那一个是定位锚点；两个省略位共用一份定位层，谁开着谁认领
  const open = ctx.api.openEllipsis === side
  return (
    <button
      {...mergeReactProps(
        bind.attrs,
        { ref: bind.ref },
        rest as Record<string, unknown>,
        {
          ref: (el: HTMLButtonElement | null) => {
            if (open)
              ctx.ellipsisRef.current = el
          },
        },
      )}
    >
      {children}
    </button>
  )
}

/** 信息区的载荷：算好的整句，以及构成它的三个数。 */
export interface PaginationSummarySlotProps {
  summaryText: string
  start: number
  end: number
  count: number
}

export interface XhPaginationSummaryProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children?: SlotChildren<PaginationSummarySlotProps>
}
/** 信息区：不写 children 时铺 api.summaryText。 */
export function XhPaginationSummary({ children, ...rest }: XhPaginationSummaryProps): ReactNode {
  const ctx = usePaginationContext()
  const api = ctx.api
  const body = children == null
    ? api.summaryText
    : renderSlot(children, {
        summaryText: api.summaryText,
        start: api.pageRange.start,
        end: api.pageRange.end,
        count: api.count,
      })
  return <div {...mergeReactProps(api.getSummaryProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{body}</div>
}

export interface XhPaginationJumperProps extends ComponentPropsWithRef<'input'> {}
/** 跳页输入框：敲页码按回车即跳。 */
export function XhPaginationJumper({ ...rest }: XhPaginationJumperProps): ReactNode {
  const ctx = usePaginationContext()
  return <input {...mergeReactProps(ctx.api.getJumperProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

/** 每页条数控制器的载荷：可选档位与它们的显示文字。 */
export interface PaginationPageSizeSelectSlotProps {
  options: number[]
  label: (size: number) => string
}

export interface XhPaginationPageSizeSelectProps extends Omit<ComponentPropsWithRef<'select'>, 'children'> {
  children?: SlotChildren<PaginationPageSizeSelectSlotProps>
}
export function XhPaginationPageSizeSelect({ children, ...rest }: XhPaginationPageSizeSelectProps): ReactNode {
  const ctx = usePaginationContext()
  const api = ctx.api
  // 档位由作者渲染成 option：原生 select 的子节点不是角色节点，用不着再立一个部件
  const body = children == null
    ? api.pageSizeOptions.map(size => <option key={size} value={String(size)}>{String(size)}</option>)
    : renderSlot(children, { options: api.pageSizeOptions, label: (size: number) => String(size) })
  return (
    <select {...mergeReactProps(api.getPageSizeSelectProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {body}
    </select>
  )
}

export interface XhPaginationPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhPaginationPositioner({ children, container, ...rest }: XhPaginationPositionerProps): ReactNode {
  const ctx = usePaginationContext()
  // 折叠页码列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current })
  return (
    <XhPortal container={container ?? ctx.portalContainer}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
        {bars.render()}
      </div>
    </XhPortal>
  )
}

/** 面板的载荷：这一侧折进去的那几页。 */
export interface PaginationContentSlotProps {
  pages: number[]
}

export interface XhPaginationContentProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children?: SlotChildren<PaginationContentSlotProps>
}
export function XhPaginationContent({ children, ...rest }: XhPaginationContentProps): ReactNode {
  const ctx = usePaginationContext()
  const open = ctx.api.openEllipsis
  const folded = ctx.api.pageItems.find(item => item.type === 'ellipsis' && item.side === open)
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），真正的收起落成内联 display
          style: ctx.visible ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {renderSlot(children, { pages: folded?.type === 'ellipsis' ? folded.pages : [] })}
    </div>
  )
}
