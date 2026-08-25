import type { PropFn } from '@xihan-ui/machine'
import type { PaginationSchema } from './pagination.types'
import { setup } from '@xihan-ui/machine'
import { clampPage, normalizePageSize, pageForResize, totalPagesOf } from './pagination.range'

const { createMachine } = setup<PaginationSchema>()

export const PAGINATION_PAGE_SIZE = 10
export const PAGINATION_SIBLING_COUNT = 1
/** 每页条数的缺省档位表。只做取值来源，长相归作者。 */
export const PAGINATION_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/** 总页数现算，不缓存。每页条数住在 cell 里，不能再从 prop 直读——受控与非受控两条路只有 cell 认得全。 */
function pageCount(prop: PropFn<PaginationSchema>, pageSize: number): number {
  return totalPagesOf(prop('count'), pageSize)
}

/** 走一步：先把当前页夹回合法区间再加减，与 connect 显示的页码保持一致。 */
function step(current: number, direction: 1 | -1, totalPages: number): number {
  return clampPage(clampPage(current, totalPages) + direction, totalPages)
}

// 页码住在 context 的 cell 里，由 cell 收口受控/非受控；机器只有一个状态。
export const paginationMachine = createMachine({
  name: 'pagination',
  context: ({ prop, cell }) => {
    // 先建每页条数：页码的回调要报出当下的档位，而档位在非受控时只有 cell 认得
    // 只给 pageSize 仍是受控，与升级前一字不差；只给 defaultPageSize 才由组件自持
    const pageSize = cell<number>(() => ({
      value: prop('pageSize'),
      defaultValue: prop('defaultPageSize') ?? PAGINATION_PAGE_SIZE,
    }))

    return {
      pageSize,
      page: cell<number>(() => ({
        value: prop('page'),
        defaultValue: prop('defaultPage') ?? 1,
        onChange: page => prop('onPageChange')?.({
          page,
          // 回调里一并给出每页条数
          pageSize: normalizePageSize(pageSize.get()),
        }),
      })),
    }
  },
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'PAGE.SET': { actions: ['setPage'] },
        'PAGE_SIZE.SET': { actions: ['setPageSize'] },
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
          context.set('page', clampPage(e.page, pageCount(prop, context.get('pageSize'))))
      },
      // 换档要连页码一起改：先写页码再写档位，两条回调发出去时看到的是同一份新状态
      setPageSize: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'PAGE_SIZE.SET')
          return
        const next = normalizePageSize(e.pageSize)
        const current = normalizePageSize(context.get('pageSize'))
        if (next === current)
          return
        context.set('page', pageForResize(context.get('page'), current, next))
        context.set('pageSize', next)
        prop('onPageSizeChange')?.({ pageSize: next, page: context.get('page') })
      },
      goPrev: ({ context, prop }) => context.set('page', step(context.get('page'), -1, pageCount(prop, context.get('pageSize')))),
      goNext: ({ context, prop }) => context.set('page', step(context.get('page'), 1, pageCount(prop, context.get('pageSize')))),
    },
  },
})
