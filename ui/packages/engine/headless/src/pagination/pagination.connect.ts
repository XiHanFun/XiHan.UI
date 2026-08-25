import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { PaginationApi, PaginationSchema } from './pagination.types'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
import { OVERLAY_PLACEMENT_LIST, overlayPositioned } from '../shared/overlay'
import { paginationAnatomy } from './pagination.anatomy'
import { PAGINATION_PAGE_SIZE_OPTIONS, PAGINATION_SIBLING_COUNT } from './pagination.machine'
import { buildPageItems, buildPageSequence, clampPage, normalizeCount, normalizePageSize, pageRangeOf, totalPagesOf } from './pagination.range'

const parts = paginationAnatomy.build()

/** 低于这个高度不写：面板挤成一条缝还不如让它溢出去，作者至少看得见。 */
const AVAILABLE_H_FLOOR = 80

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_pagination-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

export function connectPagination<T extends PropTypes>(
  service: Service<PaginationSchema>,
  normalize: NormalizeProps<T>,
): PaginationApi<T> {
  const { context, prop, send, state, scope } = service
  const ids = scope.ids('pagination', 'content')

  const count = normalizeCount(prop('count'))
  const pageSize = normalizePageSize(context.get('pageSize'))
  const totalPages = totalPagesOf(count, pageSize)
  // 显示用的页码一律夹过：count 变小后内部值可能停在已不存在的页上
  const page = clampPage(context.get('page'), totalPages)
  const siblingCount = prop('siblingCount') ?? PAGINATION_SIBLING_COUNT

  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  const translations = prop('translations')
  const label = {
    root: translations?.root ?? 'Pagination',
    prevTrigger: translations?.prevTrigger ?? 'Previous page',
    nextTrigger: translations?.nextTrigger ?? 'Next page',
    item: translations?.item ?? ((value: number) => `Page ${value}`),
    ellipsis: translations?.ellipsis ?? ((n: number) => `${n} more pages`),
  }

  const setPage = (next: number): void => {
    send({ type: 'PAGE.SET', page: next })
  }

  // 展开态是复合状态，state.get() 拿到的是叶子路径，一律用 matches 判
  const open = state.matches('visible')
  const openEllipsis = open ? context.get('openEllipsis') : null
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? OVERLAY_PLACEMENT_LIST
  const stateAttr = open ? 'open' : 'closed'
  const items = buildPageItems(page, totalPages, siblingCount)
  /** 摊开的那一侧折了哪几页；没摊开时是空的。 */
  const foldedPages = items.find(
    item => item.type === 'ellipsis' && item.side === openEllipsis,
  )
  const folded = foldedPages?.type === 'ellipsis' ? foldedPages.pages : []

  // 档位表只做取值来源，不决定长相：升序去重、每档至少 1
  const pageSizeOptions = [...new Set((prop('pageSizeOptions') ?? PAGINATION_PAGE_SIZE_OPTIONS).map(normalizePageSize))]
    .sort((a, b) => a - b)

  return {
    page,
    pageSize,
    pageSizeOptions,
    count,
    totalPages,
    pages: buildPageSequence(page, totalPages, siblingCount),
    pageItems: items,
    openEllipsis,
    pageRange: pageRangeOf(page, pageSize, count),
    previousPage: canGoPrev ? page - 1 : null,
    nextPage: canGoNext ? page + 1 : null,
    setPage,
    goToPrevPage: () => send({ type: 'PAGE.PREV' }),
    goToNextPage: () => send({ type: 'PAGE.NEXT' }),
    setPageSize: next => send({ type: 'PAGE_SIZE.SET', pageSize: next }),
    closeEllipsis: () => send({ type: 'ELLIPSIS.CLOSE' }),
    slice: data => data.slice((page - 1) * pageSize, page * pageSize),

    // 根节点是 nav 地标，aria-label 用于区分同页的多个分页器
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-label': label.root,
      // 只有作者显式给了才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-empty': dataAttr(totalPages === 0),
    }),

    // 首尾两端的按钮是单体控件，用原生 disabled（不可聚焦、脱出 Tab 序列）
    getPrevTriggerProps: () => normalize.button({
      ...parts['prev-trigger'].attrs,
      'type': 'button',
      'aria-label': label.prevTrigger,
      'disabled': !canGoPrev || undefined,
      'data-disabled': dataAttr(!canGoPrev),
      // 不再判一次 canGoPrev：边界由机器的夹取守住，值没变 cell 也不会通知宿主
      'onClick': () => send({ type: 'PAGE.PREV' }),
    }),

    getNextTriggerProps: () => normalize.button({
      ...parts['next-trigger'].attrs,
      'type': 'button',
      'aria-label': label.nextTrigger,
      'disabled': !canGoNext || undefined,
      'data-disabled': dataAttr(!canGoNext),
      'onClick': () => send({ type: 'PAGE.NEXT' }),
    }),

    getItemProps: (item) => {
      // 总页数为 0 时谁都不是当前页，此时的页码 1 只是兜底读数
      const current = totalPages > 0 && item.page === page
      return normalize.button({
        ...parts.item.attrs,
        [ITEM_VALUE_ATTR]: item.page,
        'type': 'button',
        'aria-label': label.item(item.page),
        // aria-current 不是布尔属性，规范里默认值就是 "false"，省略即"不是当前项"
        'aria-current': current ? 'page' : undefined,
        'data-current': dataAttr(current),
        // 不写 tabindex：分页是一组各自独立的按钮，每个页码都是一个 Tab 停靠点
        'onClick': () => setPage(item.page),
      })
    },

    /**
     * 省略位不是死占位而是可展开的按钮：折进去的那几页得有路走到。
     *
     * 悬停摊开，点一下也摊开——纯 hover 会把键盘用户挡在外面，而这几页
     * 除了它没有别的入口（跳页输入框要求先知道页号）。
     */
    getEllipsisProps: props => normalize.button({
      ...parts.ellipsis.attrs,
      'type': 'button',
      'data-side': props.side,
      'aria-label': label.ellipsis(
        (items.find(item => item.type === 'ellipsis' && item.side === props.side) as
        | { pages: number[] }
        | undefined)?.pages.length ?? 0,
      ),
      'aria-expanded': openEllipsis === props.side ? 'true' : 'false',
      'aria-haspopup': 'true',
      'aria-controls': openEllipsis === props.side ? ids.content : undefined,
      'data-state': openEllipsis === props.side ? 'open' : 'closed',
      'onPointerenter': () => send({ type: 'ELLIPSIS.ENTER', side: props.side }),
      'onPointerleave': () => send({ type: 'ELLIPSIS.LEAVE' }),
      'onClick': () => send({ type: 'ELLIPSIS.TOGGLE', side: props.side }),
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向与三视觉轴，这里各打一遍
      'dir': prop('dir'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点滚出可视区时引擎置位，样式据此收起
      'data-hidden': dataAttr(position?.hidden),
      // 落位才露：皮肤基线把定位层藏着，带这个才显示
      'data-positioned': dataAttr(overlayPositioned(position)),
      'style': {
        position: 'fixed',
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
        ...availableHeightVar(position?.availableHeight),
      },
    }),

    /** 面板里就是一串页码按钮，作者照 folded 渲染 item。 */
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      // 一组各自独立的按钮，不是 listbox：Tab 自然走得过去，不必再造一套 roving
      'role': 'group',
      'aria-label': label.ellipsis(folded.length),
      'data-state': stateAttr,
      'data-placement': placement,
      'data-size': prop('size'),
      'hidden': !open || undefined,
      // 指针落到面板上即撤销收起等待，斜着划过去不会半路关掉
      'onPointerenter': () => send({ type: 'ELLIPSIS.ENTER' }),
      'onPointerleave': () => send({ type: 'ELLIPSIS.LEAVE' }),
    }),
  }
}
