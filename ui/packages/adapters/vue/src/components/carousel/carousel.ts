import type { Direction, Orientation } from '@xihan-ui/core'
import type { CarouselApi, CarouselSchema, CarouselTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideCarousel, useCarouselContext } from './context'
import { useCarousel } from './use-carousel'

type CarouselProps = CarouselSchema['props']

/** 默认插槽的载荷：当前页与翻页区间、自动播放与拖拽状态，以及翻页、播放的命令。 */
export type CarouselRootSlotProps = Pick<
  CarouselApi,
  | 'page'
  | 'totalPages'
  | 'slideCount'
  | 'slideRange'
  | 'pageSnapPoints'
  | 'canScrollPrev'
  | 'canScrollNext'
  | 'autoplaying'
  | 'paused'
  | 'autoplayStopped'
  | 'dragging'
  | 'isInView'
  | 'setPage'
  | 'goToPrev'
  | 'goToNext'
  | 'play'
  | 'pause'
  | 'resume'
>

export const XhCarouselRoot = defineComponent({
  name: 'XhCarouselRoot',
  // 缺省值由 connect 给出，这里一律 default: undefined
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
    allowPointerDrag: { type: Boolean, default: undefined },
    spacing: { type: String, default: undefined },
    translations: { type: Object as PropType<Partial<CarouselTranslations>>, default: undefined },
  },
  // page-change 携带 { page }，update:page 携带裸页码
  emits: {
    'page-change': (_details: PayloadOf<CarouselProps, 'onPageChange'>) => true,
    'update:page': (_page: PayloadOf<CarouselProps, 'onPageChange'>['page']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: CarouselRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: CarouselProps['onPageChange'] = (details) => {
      emit('page-change', details)
      emit('update:page', details.page)
    }
    const ctx = useCarousel(withXhConfig('carousel', props) as CarouselProps, notify)
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
      autoplayStopped: ctx.api.value.autoplayStopped,
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

export const XhCarouselList = defineComponent({
  name: 'XhCarouselList',
  setup(_, { slots }) {
    const ctx = useCarouselContext()
    return () => h('div', ctx.api.value.getListProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCarouselItem = defineComponent({
  name: 'XhCarouselItem',
  props: {
    // 下标由作者声明，兼收字符串以支持模板里写 index="0"
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

/**
 * 播放 / 暂停开关。开了 autoplay 就该把它渲出来：
 * 自动翻页得有一处能停住，且停住之后不会被别的交互重新点着。
 *
 * 插槽拿到的 `stopped` 是「用户按停了没有」，不含悬停与焦点那两路的临时按住。
 */
export const XhCarouselAutoplayTrigger = defineComponent({
  name: 'XhCarouselAutoplayTrigger',
  slots: Object as SlotsType<{
    default?: (props: { stopped: boolean }) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useCarouselContext()
    return () => h(
      'button',
      ctx.api.value.getAutoplayTriggerProps() as Record<string, unknown>,
      slots.default?.({ stopped: ctx.api.value.autoplayStopped }),
    )
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
    // 指示点对应的页码，0 基；兼收字符串
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
