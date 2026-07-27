import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { PaginationApi, PaginationSchema } from './pagination.types'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
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
  // 显示用的页码一律夹过：宿主把 count 改小之后内部值会停在一个已不存在的页上，
  // 不夹的话 aria-current 会落空、上一页/下一页也会从一个看不见的位置起算
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

    // 根节点是 nav 地标：一页上常常同时有列表分页与评论分页，没有名字读屏念出来是两个"导航"
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-label': label.root,
      // 只有作者显式给了才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
      'data-empty': dataAttr(totalPages === 0),
    }),

    // 首尾两端的按钮是单体控件，用原生 disabled：不可聚焦、也进不了 Tab 序列，
    // 这正是"这条路走不通"该有的表现。集合条目才用 aria-disabled（禁用后仍要可聚焦）。
    getPrevTriggerProps: () => normalize.button({
      ...parts['prev-trigger'].attrs,
      'type': 'button',
      'aria-label': label.prevTrigger,
      'disabled': !canGoPrev || undefined,
      'data-disabled': dataAttr(!canGoPrev),
      // 不在这里再判一次 canGoPrev：边界由机器的夹取守住（首页再往回还是首页，
      // 值没变 cell 也不会通知宿主）。多一道判断只是把同一条边界写两遍，
      // 而且哪一份都没法单独验——删掉任意一份，行为一模一样。
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
      // 总页数为 0 时谁都不是当前页：一页都没有，"停在第 1 页"只是个兜底读数，
      // 不该让某个页码按钮对读屏自称当前项
      const selected = totalPages > 0 && item.page === page
      return normalize.button({
        ...parts.item.attrs,
        [ITEM_VALUE_ATTR]: item.page,
        'type': 'button',
        'aria-label': label.item(item.page),
        // aria-current 不是布尔属性（取值是 page/step/date… 这类词），规范里它的默认值就是
        // "false"，省略即"不是当前项"，语义没有歧义。给每个页码都写一遍 false 只是噪音。
        'aria-current': selected ? 'page' : undefined,
        'data-selected': dataAttr(selected),
        // 不写 tabindex：分页是一组各自独立的按钮，不是 roving tabindex 的复合控件，
        // 每个页码都该是一个 Tab 停靠点（用户要能 Tab 到某一页再按 Enter）
        'onClick': () => setPage(item.page),
      })
    },

    // 省略号是纯视觉占位：读屏念 "…" 只会念出一串标点噪音，
    // 而页码从 3 直接跳到 20 本身已经把"中间还有页"说清楚了
    getEllipsisProps: () => normalize.element({
      ...parts.ellipsis.attrs,
      'aria-hidden': 'true',
    }),
  }
}
