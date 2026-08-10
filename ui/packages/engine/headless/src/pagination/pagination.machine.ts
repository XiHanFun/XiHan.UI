import type { PropFn } from '@xihan-ui/machine'
import type { PaginationSchema } from './pagination.types'
import { setup } from '@xihan-ui/machine'
import { clampPage, normalizePageSize, totalPagesOf } from './pagination.range'

const { createMachine } = setup<PaginationSchema>()

export const PAGINATION_PAGE_SIZE = 10
export const PAGINATION_SIBLING_COUNT = 1

/** 总页数由 props 现算，不缓存。 */
function pageCount(prop: PropFn<PaginationSchema>): number {
  return totalPagesOf(prop('count'), prop('pageSize') ?? PAGINATION_PAGE_SIZE)
}

/** 走一步：先把当前页夹回合法区间再加减，与 connect 显示的页码保持一致。 */
function step(current: number, direction: 1 | -1, totalPages: number): number {
  return clampPage(clampPage(current, totalPages) + direction, totalPages)
}

// 页码住在 context 的 cell 里，由 cell 收口受控/非受控；机器只有一个状态。
export const paginationMachine = createMachine({
  name: 'pagination',
  context: ({ prop, cell }) => ({
    page: cell<number>(() => ({
      value: prop('page'),
      defaultValue: prop('defaultPage') ?? 1,
      onChange: page => prop('onPageChange')?.({
        page,
        // 回调里一并给出每页条数
        pageSize: normalizePageSize(prop('pageSize') ?? PAGINATION_PAGE_SIZE),
      }),
    })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'PAGE.SET': { actions: ['setPage'] },
        'PAGE.PREV': { actions: ['goPrev'] },
        'PAGE.NEXT': { actions: ['goNext'] },
      },
    },
  },
  implementations: {
    actions: {
      // 越界页码在写入口就夹掉，回调值恒是可用的页
      setPage: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'PAGE.SET')
          context.set('page', clampPage(e.page, pageCount(prop)))
      },
      goPrev: ({ context, prop }) => context.set('page', step(context.get('page'), -1, pageCount(prop))),
      goNext: ({ context, prop }) => context.set('page', step(context.get('page'), 1, pageCount(prop))),
    },
  },
})
