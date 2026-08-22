import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { PaginationApi, PaginationSchema } from './pagination.types'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
import { paginationAnatomy } from './pagination.anatomy'
import { PAGINATION_PAGE_SIZE, PAGINATION_SIBLING_COUNT } from './pagination.machine'
import { buildPageSequence, clampPage, normalizeCount, normalizePageSize, pageRangeOf, totalPagesOf } from './pagination.range'

const parts = paginationAnatomy.build()

export function connectPagination<T extends PropTypes>(
  service: Service<PaginationSchema>,
  normalize: NormalizeProps<T>,
): PaginationApi<T> {
  const { context, prop, send } = service

  const count = normalizeCount(prop('count'))
  const pageSize = normalizePageSize(prop('pageSize') ?? PAGINATION_PAGE_SIZE)
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
  }

  const setPage = (next: number): void => {
    send({ type: 'PAGE.SET', page: next })
  }

  return {
    page,
    pageSize,
    count,
    totalPages,
    pages: buildPageSequence(page, totalPages, siblingCount),
    pageRange: pageRangeOf(page, pageSize, count),
    previousPage: canGoPrev ? page - 1 : null,
    nextPage: canGoNext ? page + 1 : null,
    setPage,
    goToPrevPage: () => send({ type: 'PAGE.PREV' }),
    goToNextPage: () => send({ type: 'PAGE.NEXT' }),
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

    // 省略号是纯视觉占位，对读屏隐藏
    getEllipsisProps: () => normalize.element({
      ...parts.ellipsis.attrs,
      'aria-hidden': 'true',
    }),
  }
}
