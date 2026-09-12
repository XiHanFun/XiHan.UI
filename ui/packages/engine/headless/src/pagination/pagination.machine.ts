import type { PositionResult, PropFn, Service } from '@xihan-ui/core'
import type { SelectSchema } from '../select'
import type { PaginationEllipsisSide } from './pagination.range'
import type { PaginationSchema, PaginationTranslations } from './pagination.types'
import { setup } from '@xihan-ui/core'
import { OVERLAY_OFFSET, OVERLAY_PLACEMENT_LIST } from '../shared/overlay'
import { trackOverlayLayer, trackPresenceResources } from '../shared/overlay-shell'
import { clampPage, normalizePageSize, pageForResize, pageSizeOptionsOf, totalPagesOf } from './pagination.range'

const { createMachine } = setup<PaginationSchema>()

export const PAGINATION_PAGE_SIZE = 10
export const PAGINATION_SIBLING_COUNT = 1
/** 每页条数的缺省档位表。只做取值来源，长相归作者。 */
export const PAGINATION_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/** 指针停在省略位多久才摊开（ms）。 */
export const PAGINATION_OPEN_DELAY = 200
/** 指针离开后多久收起（ms）：留出斜着划进浮层的时间。 */
export const PAGINATION_CLOSE_DELAY = 300

/** 文案桶：缺省英文，作者给了哪条就换哪条。连接层与内嵌下拉的档位文字都从这里取。 */
export function paginationLabels(prop: PropFn<PaginationSchema>): PaginationTranslations {
  const translations = prop('translations')
  return {
    root: translations?.root ?? 'Pagination',
    prevTrigger: translations?.prevTrigger ?? 'Previous page',
    nextTrigger: translations?.nextTrigger ?? 'Next page',
    item: translations?.item ?? ((value: number) => `Page ${value}`),
    ellipsis: translations?.ellipsis ?? ((n: number) => `${n} more pages`),
    pageSizeSelect: translations?.pageSizeSelect ?? 'Items per page',
    pageSizeOption: translations?.pageSizeOption ?? ((size: number) => `${size} / page`),
    summary: translations?.summary ?? ((start: number, end: number, total: number) => `${start}-${end} of ${total}`),
    jumper: translations?.jumper ?? 'Go to page',
  }
}

/**
 * 喂给内嵌下拉的那份 props：档位表与当前档都受控于分页机，换档经回调送回来。
 * 三个视觉轴与方向一并透传，下拉在分页行里与页码格子同一档。
 */
export function paginationPageSizeSelectProps(service: Service<PaginationSchema>): SelectSchema['props'] {
  const { prop, context, send } = service
  const label = paginationLabels(prop)
  return {
    collection: pageSizeOptionsOf(prop('pageSizeOptions') ?? PAGINATION_PAGE_SIZE_OPTIONS)
      .map(size => ({ value: String(size), label: label.pageSizeOption(size) })),
    value: [String(normalizePageSize(context.get('pageSize')))],
    dir: prop('dir'),
    tone: prop('tone'),
    size: prop('size'),
    onValueChange: ({ value }) => {
      // 清空是下拉自带的键盘动作（Delete / Backspace），而分页没有「不分页」这一档：
      // 落空即不发事件，受控的档位于是原样留着
      const next = Number(value[0])
      if (Number.isFinite(next))
        send({ type: 'PAGE_SIZE.SET', pageSize: next })
    },
  }
}

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
  // 省略位的 Layer 与消解资源由根效应持有，逻辑关闭后等 Presence 真实退场再归还。
  effects: ['trackLayer'],
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
      effects: ['trackPosition'],
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
      trackLayer: ({ refs, send, flush, state, track }) => trackPresenceResources({
        presence: () => refs.get('presence'),
        open: () => state.matches('visible'),
        track,
        acquire: () => trackOverlayLayer({
          config: refs.get('config'),
          registerLayer: refs.get('registerLayer'),
          flush,
          active: () => state.matches('visible'),
          onDismiss: () => send({ type: 'ELLIPSIS.CLOSE' }),
        }),
      }),
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
