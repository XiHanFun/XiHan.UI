import type { TourApi, TourSchema, TourStep } from '@xihan-ui/headless'
import type { Placement } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, mergeProps, Teleport } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideTour, useTourContext } from './context'
import { useTour } from './use-tour'

type TourProps = TourSchema['props']

/** 默认插槽的载荷：引导的开合与步序状态，以及开关、走步、放弃与校准位置的动作。 */
export type TourRootSlotProps = Pick<
  TourApi,
  | 'open'
  | 'step'
  | 'count'
  | 'currentStep'
  | 'firstStep'
  | 'lastStep'
  | 'progressText'
  | 'setOpen'
  | 'setStep'
  | 'goToNextStep'
  | 'goToPrevStep'
  | 'skip'
  | 'remeasure'
>

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
    autoScroll: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<TourProps['translations']>, default: undefined },
  },
  // open-change / step-change 携带对象；update:* 携带裸值，支持 v-model:open 与 v-model:step
  emits: {
    'open-change': (_details: PayloadOf<TourProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<TourProps, 'onOpenChange'>['open']) => true,
    'step-change': (_details: PayloadOf<TourProps, 'onStepChange'>) => true,
    'update:step': (_step: PayloadOf<TourProps, 'onStepChange'>['step']) => true,
    'complete': (_details: PayloadOf<TourProps, 'onComplete'>) => true,
    'skip': (_details: PayloadOf<TourProps, 'onSkip'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TourRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useTour(withXhConfig('tour', props) as TourProps, {
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
      remeasure: ctx.api.value.remeasure,
    }))
  },
})

export const XhTourBackdrop = defineComponent({
  name: 'XhTourBackdrop',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到遮罩上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useTourContext()
    // 与浮层同去一个落点：遮罩留在原地就会被面板甩下，两层不再叠在一起
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', {
        ...mergeProps(ctx.api.value.getBackdropProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.backdropRef.value = el as HTMLElement },
      }, slots.default?.()),
    ])
  },
})

export const XhTourSpotlight = defineComponent({
  name: 'XhTourSpotlight',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到高亮框上
  inheritAttrs: false,
  setup(_, { attrs }) {
    const ctx = useTourContext()
    // 高亮框与遮罩是同一层暗幕的两半，必须一起搬
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', mergeProps(ctx.api.value.getSpotlightProps() as Record<string, unknown>, attrs)),
    ])
  },
})

export const XhTourPositioner = defineComponent({
  name: 'XhTourPositioner',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useTourContext()
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, slots.default?.()),
    ])
  },
})

export const XhTourContent = defineComponent({
  name: 'XhTourContent',
  setup(_, { slots }) {
    const ctx = useTourContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
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
