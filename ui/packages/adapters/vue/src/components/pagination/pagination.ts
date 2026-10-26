/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 pagination 相关实现。

import type { Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { PaginationApi, PaginationEllipsisSide, PaginationPageSizeChangeDetails, PaginationSchema, PaginationTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { paginationStructure } from '@xihan-ui/headless'
import { defineComponent, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhPortal } from '../../runtime/portal'
import { renderStructure } from '../../runtime/structure'
import { useOverlayScrollbars } from '../../runtime/use-overlay-scrollbars'
import { providePagination, usePaginationContext } from './context'
import { usePagination } from './use-pagination'

type PaginationProps = PaginationSchema['props']

/** 默认插槽的载荷：当前页与总量口径、页码序列与条目区间、前后页页码，以及翻页与按当前页切分数据的动作。 */
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
    /** 整组不可交互：按钮、跳页与每页条数一并禁用。 */
    disabled: { type: Boolean, default: undefined },
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
    // 根节点渲染为 nav 地标；没写默认插槽时铺标准结构
    return () => {
      const api = ctx.api.value
      const body = slots.default
        ? slots.default({
            page: api.page,
            pageSize: api.pageSize,
            pageSizeOptions: api.pageSizeOptions,
            count: api.count,
            totalPages: api.totalPages,
            pages: api.pages,
            pageItems: api.pageItems,
            openEllipsis: api.openEllipsis,
            pageRange: api.pageRange,
            previousPage: api.previousPage,
            nextPage: api.nextPage,
            setPage: api.setPage,
            goToPrevPage: api.goToPrevPage,
            goToNextPage: api.goToNextPage,
            setPageSize: api.setPageSize,
            slice: api.slice,
          })
        : renderDefaultStructure(api)
      return h('nav', api.getRootProps(), body)
    }
  },
})

/** 跳到首页；按需放在上一页之前，没写内容时由皮肤画双箭头。 */
export const XhPaginationFirstTrigger = defineComponent({
  name: 'XhPaginationFirstTrigger',
  setup(_, { slots }) {
    const ctx = usePaginationContext()
    return () => h('button', ctx.api.value.getFirstTriggerProps(), slots.default?.())
  },
})

export const XhPaginationPrevTrigger = defineComponent({
  name: 'XhPaginationPrevTrigger',
  setup(_, { slots }) {
    const ctx = usePaginationContext()
    return () => h('button', ctx.api.value.getPrevTriggerProps(), slots.default?.())
  },
})

export const XhPaginationNextTrigger = defineComponent({
  name: 'XhPaginationNextTrigger',
  setup(_, { slots }) {
    const ctx = usePaginationContext()
    return () => h('button', ctx.api.value.getNextTriggerProps(), slots.default?.())
  },
})

/** 跳到末页；按需放在下一页之后，没写内容时由皮肤画双箭头。 */
export const XhPaginationLastTrigger = defineComponent({
  name: 'XhPaginationLastTrigger',
  setup(_, { slots }) {
    const ctx = usePaginationContext()
    return () => h('button', ctx.api.value.getLastTriggerProps(), slots.default?.())
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
      ctx.api.value.getItemProps({ page: Number(props.value) }),
      slots.default?.(),
    )
  },
})

export const XhPaginationEllipsisTrigger = defineComponent({
  name: 'XhPaginationEllipsisTrigger',
  props: {
    /** 该省略位所在的一侧：首页与窗口之间是 start，窗口与末页之间是 end。 */
    side: { type: String as PropType<PaginationEllipsisSide>, default: 'start' },
  },
  setup(props, { slots }) {
    const ctx = usePaginationContext()
    // 摊开的那一个是定位锚点；两个省略位共用一份定位层，谁开着谁认领
    return () => {
      const open = ctx.api.value.openEllipsis === props.side
      return h('button', {
        ...ctx.api.value.getEllipsisTriggerProps({ side: props.side }),
        ref: (el: unknown) => {
          if (open)
            ctx.ellipsisRef.value = el as HTMLElement
        },
      }, slots.default?.())
    }
  },
})

/** 信息区：未写默认插槽时铺设 api.summaryText */
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
        api.getSummaryProps(),
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

/** 跳页输入框：输入页码按回车即跳转 */
export const XhPaginationJumper = defineComponent({
  name: 'XhPaginationJumper',
  setup() {
    const ctx = usePaginationContext()
    return () => h('input', ctx.api.value.getJumperProps())
  },
})

/**
 * 每页条数控制器：装配的是库内的 select，不再是原生下拉。
 *
 * 组合发生在这一层：连接层把整份 select 的 api 放在 api.pageSizeSelect 上，
 * 这里据此铺设角色节点（DOM 上带 data-scope="select"，使用 select 的皮肤）。
 * 档位与档位文字都由连接层从 pageSizeOptions 与 translations.pageSizeOption 计算。
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
        h('div', mergeProps(api.getPageSizeSelectProps(), attrs), [
          h('div', select.getRootProps(), [
            h('div', select.getControlProps(), [
              h('button', {
                ...select.getTriggerProps(),
                ref: (el: unknown) => { ctx.pageSizeTriggerRef.value = el as HTMLElement },
              }, [
                h('span', select.getValueTextProps(), select.displayText),
                h('span', select.getIndicatorProps()),
              ]),
            ]),
          ]),
        ]),
        h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.pageSizeTriggerRef, present: ctx.pageSizeVisible.value }, () => [
          h('div', {
            ...select.getPositionerProps(),
            ref: (el: unknown) => { ctx.pageSizePositionerRef.value = el as HTMLElement },
          }, [
            h('div', {
              ...select.getContentProps(),
              // 收起跟着退场闸门走，与省略位那层同一套写法
              style: ctx.pageSizeVisible.value ? undefined : { display: 'none' },
              ref: (el: unknown) => { ctx.pageSizeContentRef.value = el as HTMLElement },
            }, [
              h('div', select.getListProps(), select.collection.map(option =>
                h('div', {
                  ...select.getItemProps({ value: option.value }),
                  key: option.value,
                }, [
                  h('span', select.getItemTextProps({ value: option.value }), option.label),
                  h('span', select.getItemIndicatorProps({ value: option.value })),
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
    // 浮层里的条子走 4px 档
    const bars = useOverlayScrollbars({ present: () => ctx.visible.value, scrollable: () => ctx.contentRef.value, props: { size: 'sm' } })
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.ellipsisRef, present: ctx.visible.value }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps(), attrs),
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
        ...ctx.api.value.getContentProps(),
        // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}
        // （补了退场就一帧都播不出来），真正的收起落成内联 display
        style: ctx.visible.value ? undefined : { display: 'none' },
        ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
      }, slots.default?.({ pages: folded?.type === 'ellipsis' ? folded.pages : [] }))
    }
  },
})

/** 标准结构里各部件对应的组件。 */
const PAGINATION_PARTS = {
  'prev-trigger': XhPaginationPrevTrigger,
  'item': XhPaginationItem,
  'ellipsis-trigger': XhPaginationEllipsisTrigger,
  'next-trigger': XhPaginationNextTrigger,
}

/**
 * 未写默认插槽时照 paginationStructure 铺开的整套结构：上一页、折叠后的页码序列与下一页，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。
 */
function renderDefaultStructure(api: PaginationApi): VNode[] {
  return renderStructure(paginationStructure(api), PAGINATION_PARTS)
}
