import type { PositionResult } from '@xihan-ui/kernel'
import type { PropFn } from '@xihan-ui/machine'
import type { PaginationEllipsisSide } from './pagination.range'
import type { PaginationSchema } from './pagination.types'
import { createDismissLayer } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { OVERLAY_OFFSET, OVERLAY_PLACEMENT_LIST } from '../shared/overlay'
import { clampPage, normalizePageSize, pageForResize, totalPagesOf } from './pagination.range'

const { createMachine } = setup<PaginationSchema>()

export const PAGINATION_PAGE_SIZE = 10
export const PAGINATION_SIBLING_COUNT = 1
/** 每页条数的缺省档位表。只做取值来源，长相归作者。 */
export const PAGINATION_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/** 指针停在省略位多久才摊开（ms）。 */
export const PAGINATION_OPEN_DELAY = 200
/** 指针离开后多久收起（ms）：留出斜着划进浮层的时间。 */
export const PAGINATION_CLOSE_DELAY = 300

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
    // 只给 pageSize 即受控，档位由外部持有；只给 defaultPageSize 才由组件自持
    const pageSize = cell<number>(() => ({
      value: prop('pageSize'),
      defaultValue: prop('defaultPageSize') ?? PAGINATION_PAGE_SIZE,
    }))

    return {
      pageSize,
      // 摊开的是哪一侧的省略位；同时只开一个，一份定位层就够
      openEllipsis: cell<PaginationEllipsisSide | null>(() => ({ defaultValue: null })),
      // 定位结果由 trackPosition 回填
      position: cell<PositionResult | null>(() => ({ defaultValue: null })),
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
  initialState: () => 'closed',
  // 翻页与省略位的浮层是两件正交的事：翻页在哪个态下都该生效，挂根上不逐态复制
  on: {
    'PAGE.SET': { actions: ['setPage'] },
    'PAGE_SIZE.SET': { actions: ['setPageSize'] },
    'PAGE.PREV': { actions: ['goPrev'] },
    'PAGE.NEXT': { actions: ['goNext'] },
  },
  states: {
    closed: {
      on: {
        // 悬停先进等待态，停够时长才摊开
        'ELLIPSIS.ENTER': { target: 'opening', actions: ['openEllipsis'] },
        // 点一下不走延时
        'ELLIPSIS.TOGGLE': { target: 'visible.open', actions: ['openEllipsis'] },
      },
    },
    opening: {
      effects: ['waitForOpenDelay'],
      on: {
        'after.openDelay': { target: 'visible.open' },
        // 等待期内点一下立即摊开
        'ELLIPSIS.TOGGLE': { target: 'visible.open', actions: ['openEllipsis'] },
        // 等待期内离开只撤销等待
        'ELLIPSIS.LEAVE': { target: 'closed', actions: ['clearEllipsis'] },
        'ELLIPSIS.CLOSE': { target: 'closed', actions: ['clearEllipsis'] },
      },
    },
    // 复合态：两个子态下浮层都可见，定位与消解层挂在这一层
    visible: {
      initial: 'open',
      effects: ['trackPosition', 'trackLayer'],
      states: {
        open: {
          on: {
            'ELLIPSIS.LEAVE': { target: 'visible.closing' },
            // 点已摊开的那一侧即收起；点另一侧则换过去
            'ELLIPSIS.TOGGLE': [
              { guard: 'isSameEllipsis', target: 'closed', actions: ['clearEllipsis'] },
              { actions: ['openEllipsis'] },
            ],
            'ELLIPSIS.CLOSE': { target: 'closed', actions: ['clearEllipsis'] },
          },
        },
        closing: {
          effects: ['waitForCloseDelay'],
          on: {
            'after.closeDelay': { target: 'closed', actions: ['clearEllipsis'] },
            // 等待期内指针落回省略位或浮层即撤销收起
            'ELLIPSIS.ENTER': { target: 'visible.open' },
            'ELLIPSIS.TOGGLE': [
              { guard: 'isSameEllipsis', target: 'closed', actions: ['clearEllipsis'] },
              { target: 'visible.open', actions: ['openEllipsis'] },
            ],
            'ELLIPSIS.CLOSE': { target: 'closed', actions: ['clearEllipsis'] },
          },
        },
      },
    },
  },
  implementations: {
    guards: {
      // 点的就是此刻摊开的那一侧
      isSameEllipsis: ({ context, event }) => {
        const e = event.current()
        return e.type === 'ELLIPSIS.TOGGLE' && e.side === context.get('openEllipsis')
      },
    },
    effects: {
      waitForOpenDelay: ({ prop, send }) => {
        const timer = setTimeout(send, prop('openDelay') ?? PAGINATION_OPEN_DELAY, { type: 'after.openDelay' })
        return () => clearTimeout(timer)
      },
      waitForCloseDelay: ({ prop, send }) => {
        const timer = setTimeout(send, prop('closeDelay') ?? PAGINATION_CLOSE_DELAY, { type: 'after.closeDelay' })
        return () => clearTimeout(timer)
      },
      /** 摊开期间跟着锚点定位；坐标算出来之前皮肤把浮层藏着。 */
      trackPosition: ({ refs, prop, context, flush }) => {
        // 进入可见态先清上一次的坐标：不清的话重开会按上次的位置判「已落位」，
        // 页面滚过就在旧位置闪一帧
        context.set('position', null)
        const engine = refs.get('position')
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 等 DOM 落定再挂：坐标依赖浮层自己的尺寸
        flush(() => {
          if (disposed)
            return
          const anchor = refs.get('getAnchorEl')()
          const floating = refs.get('getFloatingEl')()
          if (!anchor || !floating)
            return
          stop = engine.attach(
            anchor,
            floating,
            {
              placement: prop('placement') ?? OVERLAY_PLACEMENT_LIST,
              offset: prop('offset') ?? OVERLAY_OFFSET,
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
              dir: prop('dir'),
              // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高
              size: true,
            },
            result => context.set('position', result),
          )
        })

        return () => {
          disposed = true
          stop?.()
        }
      },
      /** 摊开期间把层压入消解栈：Escape 与点外面都能收起。不建焦点域、不锁滚动。 */
      trackLayer: ({ refs, send }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()
        const dismiss = createDismissLayer({
          config,
          layer,
          onDismiss: () => send({ type: 'ELLIPSIS.CLOSE' }),
        })

        return () => {
          dismiss.dispose()
          disposeLayer()
        }
      },
    },
    actions: {
      openEllipsis: ({ context, event }) => {
        const e = event.current()
        if ((e.type === 'ELLIPSIS.ENTER' || e.type === 'ELLIPSIS.TOGGLE') && e.side)
          context.set('openEllipsis', e.side)
      },
      clearEllipsis: ({ context }) => context.set('openEllipsis', null),
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
