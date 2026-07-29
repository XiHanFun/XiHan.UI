import type { Direction } from '@xihan-ui/core'
import type { PaginationSchema, PaginationTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { providePagination, usePaginationContext } from './context'
import { usePagination } from './use-pagination'

type PaginationProps = PaginationSchema['props']

export const XhPaginationRoot = defineComponent({
  name: 'XhPaginationRoot',
  // 缺省值由 connect 给出，这里一律 default: undefined
  props: {
    count: { type: Number, default: undefined },
    pageSize: { type: Number, default: undefined },
    page: { type: Number, default: undefined },
    defaultPage: { type: Number, default: undefined },
    siblingCount: { type: Number, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    translations: { type: Object as PropType<Partial<PaginationTranslations>>, default: undefined },
  },
  // page-change 携带 { page, pageSize }，update:page 携带裸页码
  emits: ['page-change', 'update:page'],
  setup(props, { slots, emit }) {
    const notify: PaginationProps['onPageChange'] = (details) => {
      emit('page-change', details)
      emit('update:page', details.page)
    }
    const ctx = usePagination(props as PaginationProps, notify)
    providePagination(ctx)
    // 根节点渲染为 nav 地标
    return () => h('nav', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      page: ctx.api.value.page,
      pageSize: ctx.api.value.pageSize,
      count: ctx.api.value.count,
      totalPages: ctx.api.value.totalPages,
      pages: ctx.api.value.pages,
      pageRange: ctx.api.value.pageRange,
      previousPage: ctx.api.value.previousPage,
      nextPage: ctx.api.value.nextPage,
      setPage: ctx.api.value.setPage,
      goToPrevPage: ctx.api.value.goToPrevPage,
      goToNextPage: ctx.api.value.goToNextPage,
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

export const XhPaginationEllipsis = defineComponent({
  name: 'XhPaginationEllipsis',
  setup(_, { slots }) {
    const ctx = usePaginationContext()
    return () => h('span', ctx.api.value.getEllipsisProps() as Record<string, unknown>, slots.default?.())
  },
})
