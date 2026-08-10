import type { StepsSchema } from '@xihan-ui/headless'
import type { Direction, Orientation, Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideSteps, provideStepsItem, useStepsContext, useStepsItem } from './context'
import { useSteps } from './use-steps'

type StepsProps = StepsSchema['props']

export const XhStepsRoot = defineComponent({
  name: 'XhStepsRoot',
  // 全部 default: undefined，缺省值由 connect 决定
  props: {
    step: { type: Number, default: undefined },
    defaultStep: { type: Number, default: undefined },
    count: { type: Number, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    linear: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // step-change 携带 { step }，update:step 携带裸下标
  emits: ['step-change', 'update:step'],
  setup(props, { slots, emit }) {
    const notify: StepsProps['onStepChange'] = (details) => {
      emit('step-change', details)
      emit('update:step', details.step)
    }
    const ctx = useSteps(props as StepsProps, notify)
    provideSteps(ctx)
    // 经插槽暴露状态与前进/后退方法，供步骤条外的按钮使用
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      step: ctx.api.value.step,
      count: ctx.api.value.count,
      complete: ctx.api.value.complete,
      setStep: ctx.api.value.setStep,
      goToNextStep: ctx.api.value.goToNextStep,
      goToPrevStep: ctx.api.value.goToPrevStep,
    }))
  },
})

export const XhStepsList = defineComponent({
  name: 'XhStepsList',
  setup(_, { slots }) {
    const ctx = useStepsContext()
    return () => h('div', ctx.api.value.getListProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhStepsItem = defineComponent({
  name: 'XhStepsItem',
  props: {
    // 步骤下标，兼收字符串以支持模板属性字面量与 WC 侧的 DOM 属性
    value: { type: [Number, String] as PropType<number | string>, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useStepsContext()
    provideStepsItem(() => ({ index: Number(props.value), disabled: props.disabled }))
    return () => h(
      'div',
      ctx.api.value.getItemProps({ index: Number(props.value), disabled: props.disabled }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhStepsTrigger = defineComponent({
  name: 'XhStepsTrigger',
  setup(_, { slots }) {
    const ctx = useStepsContext()
    const item = useStepsItem()
    // 本节点持有焦点时，下标变更重报焦点步骤，卸载时上报列表失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => item().index, (next, prev) => {
      if (next === prev)
        return
      const svc = ctx.service
      if (svc.getStatus() !== 'Started')
        return
      if (itemEl.value && svc.scope.getActiveElement() === itemEl.value)
        svc.send({ type: 'TRIGGER.FOCUS', step: next })
    })
    onBeforeUnmount(() => {
      if (ctx.service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按下标比对
      if (itemEl.value && ctx.service.scope.getActiveElement() === itemEl.value)
        ctx.service.send({ type: 'LIST.BLUR' })
    })
    return () => h(
      'button',
      { ...ctx.api.value.getTriggerProps(item()) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhStepsIndicator = defineComponent({
  name: 'XhStepsIndicator',
  setup(_, { slots }) {
    const ctx = useStepsContext()
    const item = useStepsItem()
    return () => h('span', ctx.api.value.getIndicatorProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

export const XhStepsTitle = defineComponent({
  name: 'XhStepsTitle',
  setup(_, { slots }) {
    const ctx = useStepsContext()
    const item = useStepsItem()
    return () => h('span', ctx.api.value.getTitleProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

export const XhStepsDescription = defineComponent({
  name: 'XhStepsDescription',
  setup(_, { slots }) {
    const ctx = useStepsContext()
    const item = useStepsItem()
    return () => h('span', ctx.api.value.getDescriptionProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

// 连接线写在 item 之内，身份从 item 上下文取
export const XhStepsSeparator = defineComponent({
  name: 'XhStepsSeparator',
  setup(_, { slots }) {
    const ctx = useStepsContext()
    const item = useStepsItem()
    return () => h('div', ctx.api.value.getSeparatorProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

/** 面板挂在 list 之外，自带 value 与 trigger 配对；value 等于 count 的面板即完成页 */
export const XhStepsContent = defineComponent({
  name: 'XhStepsContent',
  props: {
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useStepsContext()
    return () => h(
      'div',
      ctx.api.value.getContentProps({ index: Number(props.value) }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
