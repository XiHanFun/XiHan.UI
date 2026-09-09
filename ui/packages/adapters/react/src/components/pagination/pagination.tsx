import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { PaginationApi, PaginationEllipsisSide, PaginationSchema, PaginationTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useMemo } from 'react'
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

/** 根上自有的那些取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'nav'>, 'children' | 'dir'>

export interface XhPaginationRootProps extends RootElementProps {
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
export function XhPaginationRoot({
  count,
  pageSize,
  defaultPageSize,
  pageSizeOptions,
  page,
  defaultPage,
  siblingCount,
  dir,
  translations,
  placement,
  offset,
  openDelay,
  closeDelay,
  tone,
  size,
  onPageChange,
  onPageSizeChange,
  children,
  ...rest
}: XhPaginationRootProps): ReactNode {
  const machineProps = {
    count,
    pageSize,
    defaultPageSize,
    pageSizeOptions,
    page,
    defaultPage,
    siblingCount,
    dir,
    translations,
    placement,
    offset,
    openDelay,
    closeDelay,
    tone,
    size,
    onPageChange,
    onPageSizeChange,
  }
  const ctx = usePagination(withXhConfig('pagination', machineProps) as PaginationProps)
  const api = ctx.api
  return (
    <PaginationProvider value={ctx}>
      <nav {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
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

/**
 * 一档条位。单拎成组件是因为条目的聚焦上报与指针离开都不冒泡，
 * React 的同名合成事件挂在根容器上收不到，得逐条改装成原生监听器。
 */
function PageSizeOption({ value, label }: { value: string, label: string }): ReactNode {
  const select = usePaginationContext().api.pageSizeSelect
  const item = useMemo(() => ({ value }), [value])
  const bind = useNativeEvents(
    select.getItemProps(item) as Record<string, unknown>,
    ['onFocus', 'onPointerLeave'],
  )
  return (
    <div {...mergeReactProps(bind.attrs, { ref: bind.ref })}>
      <span {...select.getItemTextProps(item) as Record<string, unknown>}>{label}</span>
      <span {...select.getItemIndicatorProps(item) as Record<string, unknown>} />
    </div>
  )
}

export interface XhPaginationPageSizeSelectProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/**
 * 每页条数控制器：装的是库里的 select，不再是原生下拉。
 *
 * 组合发生在这一层——连接层把整份 select 的 api 摆在 api.pageSizeSelect 上，
 * 这里照它铺角色节点（DOM 上带 data-scope="select"，吃的是 select 那份皮肤）。
 * 档位与档位文字都由连接层从 pageSizeOptions 与 translations.pageSizeOption 算好。
 */
export function XhPaginationPageSizeSelect({ container, ...rest }: XhPaginationPageSizeSelectProps): ReactNode {
  const ctx = usePaginationContext()
  const api = ctx.api
  const select = api.pageSizeSelect
  return (
    <>
      <div {...mergeReactProps(api.getPageSizeSelectProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        <div {...select.getRootProps() as Record<string, unknown>}>
          <div {...select.getControlProps() as Record<string, unknown>}>
            <button
              {...mergeReactProps(
                select.getTriggerProps() as Record<string, unknown>,
                { ref: (el: HTMLButtonElement | null) => { ctx.pageSizeTriggerRef.current = el } },
              )}
            >
              <span {...select.getValueTextProps() as Record<string, unknown>}>{select.displayText}</span>
              <span {...select.getIndicatorProps() as Record<string, unknown>} />
            </button>
          </div>
        </div>
      </div>
      <XhPortal container={container ?? ctx.portalContainer}>
        <div
          {...mergeReactProps(
            select.getPositionerProps() as Record<string, unknown>,
            { ref: (el: HTMLDivElement | null) => { ctx.pageSizePositionerRef.current = el } },
          )}
        >
          <div
            {...mergeReactProps(
              select.getContentProps() as Record<string, unknown>,
              {
                // 收起跟着退场闸门走，与省略位那层同一套写法
                style: ctx.pageSizeVisible ? undefined : { display: 'none' },
                ref: (el: HTMLDivElement | null) => { ctx.pageSizeContentRef.current = el },
              },
            )}
          >
            <div {...select.getListProps() as Record<string, unknown>}>
              {select.collection.map(option => (
                <PageSizeOption key={option.value} value={option.value} label={option.label} />
              ))}
            </div>
          </div>
        </div>
      </XhPortal>
    </>
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
