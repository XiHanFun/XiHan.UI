import type { Direction, Orientation } from '@xihan-ui/core'
import type { CarouselSchema, CarouselTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideCarousel, useCarouselContext } from './context'
import { useCarousel } from './use-carousel'

type CarouselProps = CarouselSchema['props']

export const XhCarouselRoot = defineComponent({
  name: 'XhCarouselRoot',
  // 全部 default: undefined —— 缺省值的唯一事实源在 connect（loop / allowMouseDrag 尤其：
  // 裸 Boolean 声明会把缺省压成 false，两个适配器就各有一份默认，改一处另一处不动）
  props: {
    page: { type: Number, default: undefined },
    defaultPage: { type: Number, default: undefined },
    slideCount: { type: Number, default: undefined },
    slidesPerPage: { type: Number, default: undefined },
    slidesPerMove: { type: Number, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    loop: { type: Boolean, default: undefined },
    // 布尔或毫秒：true 用默认间隔，数值即间隔
    autoplay: { type: [Boolean, Number] as PropType<boolean | number>, default: undefined },
    allowMouseDrag: { type: Boolean, default: undefined },
    spacing: { type: String, default: undefined },
    translations: { type: Object as PropType<Partial<CarouselTranslations>>, default: undefined },
  },
  // page-change 携带 { page }；update:page 携带裸页码，支持 v-model:page
  emits: ['page-change', 'update:page'],
  setup(props, { slots, emit }) {
    const notify: CarouselProps['onPageChange'] = (details) => {
      emit('page-change', details)
      emit('update:page', details.page)
    }
    const ctx = useCarousel(props as CarouselProps, notify)
    provideCarousel(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      page: ctx.api.value.page,
      totalPages: ctx.api.value.totalPages,
      slideCount: ctx.api.value.slideCount,
      slideRange: ctx.api.value.slideRange,
      pageSnapPoints: ctx.api.value.pageSnapPoints,
      canScrollPrev: ctx.api.value.canScrollPrev,
      canScrollNext: ctx.api.value.canScrollNext,
      autoplaying: ctx.api.value.autoplaying,
      paused: ctx.api.value.paused,
      dragging: ctx.api.value.dragging,
      isInView: ctx.api.value.isInView,
      setPage: ctx.api.value.setPage,
      goToPrev: ctx.api.value.goToPrev,
      goToNext: ctx.api.value.goToNext,
      play: ctx.api.value.play,
      pause: ctx.api.value.pause,
      resume: ctx.api.value.resume,
    }))
  },
})

export const XhCarouselViewport = defineComponent({
  name: 'XhCarouselViewport',
  setup(_, { slots }) {
    const ctx = useCarouselContext()
    return () => h('div', ctx.api.value.getViewportProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCarouselItemGroup = defineComponent({
  name: 'XhCarouselItemGroup',
  setup(_, { slots }) {
    const ctx = useCarouselContext()
    return () => h('div', ctx.api.value.getItemGroupProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCarouselItem = defineComponent({
  name: 'XhCarouselItem',
  props: {
    // 下标由作者声明。也收字符串：模板里写 index="0"（不带冒号）拿到的就是字符串，
    // Vue 只对 Boolean 型 prop 做属性转型，数字得自己收口
    index: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useCarouselContext()
    return () => h(
      'div',
      ctx.api.value.getItemProps({ index: Number(props.index) }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhCarouselPrevTrigger = defineComponent({
  name: 'XhCarouselPrevTrigger',
  setup(_, { slots }) {
    const ctx = useCarouselContext()
    return () => h('button', ctx.api.value.getPrevTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCarouselNextTrigger = defineComponent({
  name: 'XhCarouselNextTrigger',
  setup(_, { slots }) {
    const ctx = useCarouselContext()
    return () => h('button', ctx.api.value.getNextTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCarouselIndicatorGroup = defineComponent({
  name: 'XhCarouselIndicatorGroup',
  setup(_, { slots }) {
    const ctx = useCarouselContext()
    return () => h('div', ctx.api.value.getIndicatorGroupProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCarouselIndicator = defineComponent({
  name: 'XhCarouselIndicator',
  props: {
    // 指示点对应的页码，0 基；同样收字符串（模板里的属性字面量）
    index: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useCarouselContext()
    return () => h(
      'button',
      ctx.api.value.getIndicatorProps({ index: Number(props.index) }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
