import type { Direction } from '@xihan-ui/core'
import type { PaginationSchema, PaginationTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { providePagination, usePaginationContext } from './context'
import { usePagination } from './use-pagination'

type PaginationProps = PaginationSchema['props']

export const XhPaginationRoot = defineComponent({
  name: 'XhPaginationRoot',
  // 全部 default: undefined —— 缺省值的唯一事实源在 connect（pageSize 与 siblingCount 尤其：
  // 在这里补默认值，两个适配器就有了两份默认，改一处另一处不动）
  props: {
    count: { type: Number, default: undefined },
    pageSize: { type: Number, default: undefined },
    page: { type: Number, default: undefined },
    defaultPage: { type: Number, default: undefined },
    siblingCount: { type: Number, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    translations: { type: Object as PropType<Partial<PaginationTranslations>>, default: undefined },
  },
  // page-change 携带 { page, pageSize }；update:page 携带裸页码，支持 v-model:page
  emits: ['page-change', 'update:page'],
  setup(props, { slots, emit }) {
    const notify: PaginationProps['onPageChange'] = (details) => {
      emit('page-change', details)
      emit('update:page', details.page)
    }
    const ctx = usePagination(props as PaginationProps, notify)
    providePagination(ctx)
    // 根节点是 nav 地标：分页器是"跳到某一页"的导航，不是一堆散落的按钮。
    // 换成 div 的话 aria-label 无处安放，读屏也不再把它当成可跳转的地标。
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
    // 身份声明叫 value 而不是 page：与本仓其余集合类部件同名（tabs/select/radio-group），
    // WC 侧也只观察 value 这一个作者属性，改名会让运行期改写页码在 WC 上静默不生效。
    // 收 String 是因为它常常来自模板里的属性字面量（以及 WC 侧的 DOM 属性）
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
