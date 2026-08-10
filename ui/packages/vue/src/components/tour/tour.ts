import type { TourSchema, TourStep } from '@xihan-ui/headless'
import type { Placement } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideTour, useTourContext } from './context'
import { useTour } from './use-tour'

type TourProps = TourSchema['props']

export const XhTourRoot = defineComponent({
  name: 'XhTourRoot',
  // 全部 default: undefined —— 缺省值的唯一事实源在 machine 与 connect
  props: {
    steps: { type: Array as PropType<TourStep[]>, default: undefined },
    step: { type: Number, default: undefined },
    defaultStep: { type: Number, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    closeOnEscape: { type: Boolean, default: undefined },
    closeOnInteractOutside: { type: Boolean, default: undefined },
    showBackdrop: { type: Boolean, default: undefined },
    spotlightPadding: { type: Number, default: undefined },
    translations: { type: Object as PropType<TourProps['translations']>, default: undefined },
  },
  // open-change / step-change 携带对象；update:* 携带裸值，支持 v-model:open 与 v-model:step
  emits: ['open-change', 'update:open', 'step-change', 'update:step', 'complete', 'skip'],
  setup(props, { slots, emit }) {
    const ctx = useTour(props as TourProps, {
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
      onStepChange: (details) => {
        emit('step-change', details)
        emit('update:step', details.step)
      },
      onComplete: details => emit('complete', details),
      onSkip: details => emit('skip', details),
    })
    provideTour(ctx)
    // 经插槽暴露状态与走步、放弃等命令，供浮层外的按钮使用
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      step: ctx.api.value.step,
      count: ctx.api.value.count,
      currentStep: ctx.api.value.currentStep,
      firstStep: ctx.api.value.firstStep,
      lastStep: ctx.api.value.lastStep,
      progressText: ctx.api.value.progressText,
      setOpen: ctx.api.value.setOpen,
      setStep: ctx.api.value.setStep,
      goToNextStep: ctx.api.value.goToNextStep,
      goToPrevStep: ctx.api.value.goToPrevStep,
      skip: ctx.api.value.skip,
    }))
  },
})

export const XhTourBackdrop = defineComponent({
  name: 'XhTourBackdrop',
  setup(_, { slots }) {
    const ctx = useTourContext()
    return () => h('div', {
      ...ctx.api.value.getBackdropProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.backdropRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTourSpotlight = defineComponent({
  name: 'XhTourSpotlight',
  setup() {
    const ctx = useTourContext()
    return () => h('div', ctx.api.value.getSpotlightProps() as Record<string, unknown>)
  },
})

export const XhTourPositioner = defineComponent({
  name: 'XhTourPositioner',
  setup(_, { slots }) {
    const ctx = useTourContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTourContent = defineComponent({
  name: 'XhTourContent',
  setup(_, { slots }) {
    const ctx = useTourContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

// 标题与描述的文字取自步骤声明，有插槽则用插槽
export const XhTourTitle = defineComponent({
  name: 'XhTourTitle',
  setup(_, { slots }) {
    const ctx = useTourContext()
    return () => h(
      'h2',
      ctx.api.value.getTitleProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.currentStep?.title,
    )
  },
})

export const XhTourDescription = defineComponent({
  name: 'XhTourDescription',
  setup(_, { slots }) {
    const ctx = useTourContext()
    return () => h(
      'p',
      ctx.api.value.getDescriptionProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.currentStep?.description,
    )
  },
})

export const XhTourProgressText = defineComponent({
  name: 'XhTourProgressText',
  setup(_, { slots }) {
    const ctx = useTourContext()
    return () => h(
      'span',
      ctx.api.value.getProgressTextProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.progressText,
    )
  },
})

export const XhTourPrevTrigger = defineComponent({
  name: 'XhTourPrevTrigger',
  setup(_, { slots }) {
    const ctx = useTourContext()
    return () => h('button', ctx.api.value.getPrevTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTourNextTrigger = defineComponent({
  name: 'XhTourNextTrigger',
  setup(_, { slots }) {
    const ctx = useTourContext()
    return () => h('button', ctx.api.value.getNextTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTourSkipTrigger = defineComponent({
  name: 'XhTourSkipTrigger',
  setup(_, { slots }) {
    const ctx = useTourContext()
    return () => h('button', ctx.api.value.getSkipTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTourCloseTrigger = defineComponent({
  name: 'XhTourCloseTrigger',
  setup(_, { slots }) {
    const ctx = useTourContext()
    return () => h('button', ctx.api.value.getCloseTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTourArrow = defineComponent({
  name: 'XhTourArrow',
  setup() {
    const ctx = useTourContext()
    return () => h('div', ctx.api.value.getArrowProps() as Record<string, unknown>)
  },
})
