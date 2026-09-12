import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { PaginationApi, PaginationEllipsisSide, PaginationPageSizeChangeDetails, PaginationSchema, PaginationTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhPortal } from '../../runtime/portal'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { providePagination, usePaginationContext } from './context'
import { usePagination } from './use-pagination'

type PaginationProps = PaginationSchema['props']

/** 默认插槽的载荷：当前页与总量口径、页码序列与条目区间、前后页页码，以及翻页与按当前页切数据的动作。 */
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

export const XhPaginationRoot = defineComponent({
  name: 'XhPaginationRoot',
  // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    count: { type: Number },
    pageSize: { type: Number },
    defaultPageSize: { type: Number },
    pageSizeOptions: { type: Array as PropType<number[]> },
    page: { type: Number },
    defaultPage: { type: Number },
    siblingCount: { type: Number },
    dir: { type: String as PropType<Direction> },
    translations: { type: Object as PropType<Partial<PaginationTranslations>> },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    openDelay: { type: Number },
    closeDelay: { type: Number },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
  },
  // page-change 携带 { page, pageSize }，update:page 携带裸页码；
  // 换档同时改页码，两个 update 都发，v-model:page 与 v-model:page-size 才不会各说各话
  emits: {
    'page-change': (_details: PayloadOf<PaginationProps, 'onPageChange'>) => true,
    'update:page': (_page: PayloadOf<PaginationProps, 'onPageChange'>['page']) => true,
    'page-size-change': (_details: PaginationPageSizeChangeDetails) => true,
    'update:pageSize': (_pageSize: PaginationPageSizeChangeDetails['pageSize']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: PaginationRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: PaginationProps['onPageChange'] = (details) => {
      emit('page-change', details)
      emit('update:page', details.page)
    }
    const notifyPageSize: PaginationProps['onPageSizeChange'] = (details) => {
      emit('page-size-change', details)
      emit('update:pageSize', details.pageSize)
      emit('update:page', details.page)
    }
    const ctx = usePagination(withXhConfig('pagination', props) as PaginationProps, notify, notifyPageSize)
    providePagination(ctx)
    // 根节点渲染为 nav 地标
    return () => h('nav', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      page: ctx.api.value.page,
      pageSize: ctx.api.value.pageSize,
      pageSizeOptions: ctx.api.value.pageSizeOptions,
      count: ctx.api.value.count,
      totalPages: ctx.api.value.totalPages,
      pages: ctx.api.value.pages,
      pageItems: ctx.api.value.pageItems,
      openEllipsis: ctx.api.value.openEllipsis,
      pageRange: ctx.api.value.pageRange,
      previousPage: ctx.api.value.previousPage,
      nextPage: ctx.api.value.nextPage,
      setPage: ctx.api.value.setPage,
      goToPrevPage: ctx.api.value.goToPrevPage,
      goToNextPage: ctx.api.value.goToNextPage,
      setPageSize: ctx.api.value.setPageSize,
      slice: ctx.api.value.slice,
    }))
  },
})

export const XhPaginationPrevTrigger = defineComponent({
  name: 'XhPaginationPrevTrigger',
  setup(_, { slots }) {
    const ctx = usePaginationContext()
    return () => h('button', ctx.api.value.getPrevTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPaginationNextTrigger = defineComponent({
  name: 'XhPaginationNextTrigger',
  setup(_, { slots }) {
    const ctx = usePaginationContext()
    return () => h('button', ctx.api.value.getNextTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPaginationItem = defineComponent({
  name: 'XhPaginationItem',
  props: {
    // 这一项对应的页码，兼收字符串
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = usePaginationContext()
    return () => h(
      'button',
      ctx.api.value.getItemProps({ page: Number(props.value) }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhPaginationEllipsisTrigger = defineComponent({
  name: 'XhPaginationEllipsisTrigger',
  props: {
    /** 这是哪一侧的省略位：首页与窗口之间是 start，窗口与末页之间是 end。 */
    side: { type: String as PropType<PaginationEllipsisSide>, default: 'start' },
  },
  setup(props, { slots }) {
    const ctx = usePaginationContext()
    // 摊开的那一个是定位锚点；两个省略位共用一份定位层，谁开着谁认领
    return () => {
      const open = ctx.api.value.openEllipsis === props.side
      return h('button', {
        ...ctx.api.value.getEllipsisTriggerProps({ side: props.side }) as Record<string, unknown>,
        ref: (el: unknown) => {
          if (open)
            ctx.ellipsisRef.value = el as HTMLElement
        },
      }, slots.default?.())
    }
  },
})

/** 信息区：不写默认插槽时铺 api.summaryText */
export const XhPaginationSummary = defineComponent({
  name: 'XhPaginationSummary',
  slots: Object as SlotsType<{
    default?: (props: { summaryText: string, start: number, end: number, count: number }) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = usePaginationContext()
    return () => {
      const api = ctx.api.value
      return h(
        'div',
        api.getSummaryProps() as Record<string, unknown>,
        slots.default
          ? slots.default({
              summaryText: api.summaryText,
              start: api.pageRange.start,
              end: api.pageRange.end,
              count: api.count,
            })
          : api.summaryText,
      )
    }
  },
})

/** 跳页输入框：敲页码按回车即跳 */
export const XhPaginationJumper = defineComponent({
  name: 'XhPaginationJumper',
  setup() {
    const ctx = usePaginationContext()
    return () => h('input', ctx.api.value.getJumperProps() as Record<string, unknown>)
  },
})

/**
 * 每页条数控制器：装的是库里的 select，不再是原生下拉。
 *
 * 组合发生在这一层——连接层把整份 select 的 api 摆在 api.pageSizeSelect 上，
 * 这里照它铺角色节点（DOM 上带 data-scope="select"，吃的是 select 那份皮肤）。
 * 档位与档位文字都由连接层从 pageSizeOptions 与 translations.pageSizeOption 算好。
 */
export const XhPaginationPageSizeSelect = defineComponent({
  name: 'XhPaginationPageSizeSelect',
  props: {
    /** 本实例的 PageSizeSelect Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 渲染出来是「挂载点 + 被搬走的浮层」两截，作者写的 class 与 style 得自己接住落到挂载点上
  inheritAttrs: false,
  setup(props, { attrs }) {
    const ctx = usePaginationContext()
    return () => {
      const api = ctx.api.value
      const select = api.pageSizeSelect
      return [
        h('div', mergeProps(api.getPageSizeSelectProps() as Record<string, unknown>, attrs), [
          h('div', select.getRootProps() as Record<string, unknown>, [
            h('div', select.getControlProps() as Record<string, unknown>, [
              h('button', {
                ...select.getTriggerProps() as Record<string, unknown>,
                ref: (el: unknown) => { ctx.pageSizeTriggerRef.value = el as HTMLElement },
              }, [
                h('span', select.getValueTextProps() as Record<string, unknown>, select.displayText),
                h('span', select.getIndicatorProps() as Record<string, unknown>),
              ]),
            ]),
          ]),
        ]),
        h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.pageSizeTriggerRef }, () => [
          h('div', {
            ...select.getPositionerProps() as Record<string, unknown>,
            ref: (el: unknown) => { ctx.pageSizePositionerRef.value = el as HTMLElement },
          }, [
            h('div', {
              ...select.getContentProps() as Record<string, unknown>,
              // 收起跟着退场闸门走，与省略位那层同一套写法
              style: ctx.pageSizeVisible.value ? undefined : { display: 'none' },
              ref: (el: unknown) => { ctx.pageSizeContentRef.value = el as HTMLElement },
            }, [
              h('div', select.getListProps() as Record<string, unknown>, select.collection.map(option =>
                h('div', {
                  ...select.getItemProps({ value: option.value }) as Record<string, unknown>,
                  key: option.value,
                }, [
                  h('span', select.getItemTextProps({ value: option.value }) as Record<string, unknown>, option.label),
                  h('span', select.getItemIndicatorProps({ value: option.value }) as Record<string, unknown>),
                ]))),
            ]),
          ]),
        ]),
      ]
    }
  },
})

export const XhPaginationPositioner = defineComponent({
  name: 'XhPaginationPositioner',
  props: {
    /** 本实例的省略页 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = usePaginationContext()
    // 折叠页码列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
    const bars = useScrollbars({ scrollable: () => ctx.contentRef.value })
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.ellipsisRef }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
  },
})

export const XhPaginationContent = defineComponent({
  name: 'XhPaginationContent',
  slots: Object as SlotsType<{
    default?: (props: { pages: number[] }) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = usePaginationContext()
    return () => {
      const open = ctx.api.value.openEllipsis
      const folded = ctx.api.value.pageItems.find(
        item => item.type === 'ellipsis' && item.side === open,
      )
      return h('div', {
        ...ctx.api.value.getContentProps() as Record<string, unknown>,
        // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}
        // （补了退场就一帧都播不出来），真正的收起落成内联 display
        style: ctx.visible.value ? undefined : { display: 'none' },
        ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
      }, slots.default?.({ pages: folded?.type === 'ellipsis' ? folded.pages : [] }))
    }
  },
})
