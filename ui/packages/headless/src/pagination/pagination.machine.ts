import type { PropFn } from '@xihan-ui/machine'
import type { PaginationSchema } from './pagination.types'
import { setup } from '@xihan-ui/machine'
import { clampPage, normalizePageSize, totalPagesOf } from './pagination.range'

const { createMachine } = setup<PaginationSchema>()

export const PAGINATION_PAGE_SIZE = 10
export const PAGINATION_SIBLING_COUNT = 1

/** 总页数由 props 现算：count 与 pageSize 随时会被宿主改，缓存下来只会拿到过期的页数。 */
function pageCount(prop: PropFn<PaginationSchema>): number {
  return totalPagesOf(prop('count'), prop('pageSize') ?? PAGINATION_PAGE_SIZE)
}

/**
 * 走一步。先把当前页夹回合法区间再加减：count 变小之后内部值可能停在一个已不存在的页上，
 * 而界面显示的是夹过的页（connect 同样夹）。此时按"上一页"该从看得见的那一页往回走，
 * 从那个越界的旧值往回走的话，用户得连点好几下才看得到反应。
 */
function step(current: number, direction: 1 | -1, totalPages: number): number {
  return clampPage(clampPage(current, totalPages) + direction, totalPages)
}

// 页码住在 context 的 cell 里，不编码进状态：cell 本身就是受控/非受控的收口点
// （page prop 给定即受控，读直取 prop，写只发 onPageChange 不落内部值），
// 因此不需要影子事件与受控守卫。机器只有一个状态，逻辑全在 context + actions。
export const paginationMachine = createMachine({
  name: 'pagination',
  context: ({ prop, cell }) => ({
    page: cell<number>(() => ({
      value: prop('page'),
      defaultValue: prop('defaultPage') ?? 1,
      onChange: page => prop('onPageChange')?.({
        page,
        // 回调里一并给出每页条数：作者拿到这一条就够发请求了
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
      // 越界页码在写入口就夹掉：受控宿主拿到的回调值永远是可用的页
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
