import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { ReasoningApi, ReasoningProps, ReasoningTranslations, ToolCallSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideReasoning, useReasoningContext } from './context'
import { useReasoning } from './use-reasoning'

type MachineProps = ToolCallSchema['props']

/** 默认插槽的载荷：开合、还在不在想、想了多久，以及当前该显示哪句状态文案。 */
export type ReasoningRootSlotProps = Pick<ReasoningApi, 'open' | 'streaming' | 'disabled' | 'durationMs' | 'statusText' | 'setOpen'>

export const XhReasoningRoot = defineComponent({
  name: 'XhReasoningRoot',
  props: {
    streaming: Boolean,
    startTime: { type: Number, default: undefined },
    endTime: { type: Number, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    // 用 undefined 而非裸 Boolean，缺省值由机器给出
    autoDisclosure: { type: Boolean, default: undefined },
    disabled: Boolean,
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<ReasoningTranslations>>, default: undefined },
  },
  emits: {
    'open-change': (_details: PayloadOf<MachineProps, 'onOpenChange'>) => true,
    'update:open': (_open: boolean) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ReasoningRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const configured = withXhConfig('reasoning', props)
    const machineProps: MachineProps = {
      // 还在写就是还在跑，自动开合据此走
      get running() {
        return props.streaming
      },
      get open() {
        return props.open
      },
      get defaultOpen() {
        return props.defaultOpen
      },
      get autoDisclosure() {
        return props.autoDisclosure
      },
      get disabled() {
        return props.disabled
      },
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
    }
    const viewProps: ReasoningProps = {
      get streaming() {
        return props.streaming
      },
      get startTime() {
        return props.startTime
      },
      get endTime() {
        return props.endTime
      },
      get variant() {
        return props.variant
      },
      get tone() {
        return props.tone
      },
      get size() {
        return configured.size
      },
      get translations() {
        return configured.translations
      },
    }
    const ctx = useReasoning(machineProps, viewProps)
    provideReasoning(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      streaming: ctx.api.value.streaming,
      disabled: ctx.api.value.disabled,
      durationMs: ctx.api.value.durationMs,
      statusText: ctx.api.value.statusText,
      setOpen: ctx.api.value.setOpen,
    }))
  },
})

export const XhReasoningTrigger = defineComponent({
  name: 'XhReasoningTrigger',
  setup(_, { slots }) {
    const ctx = useReasoningContext()
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhReasoningIcon = defineComponent({
  name: 'XhReasoningIcon',
  setup(_, { slots }) {
    const ctx = useReasoningContext()
    // 状态图形位：跟着在不在想换色，对读屏隐藏
    return () => h('span', ctx.api.value.getIconProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhReasoningIndicator = defineComponent({
  name: 'XhReasoningIndicator',
  setup(_, { slots }) {
    const ctx = useReasoningContext()
    return () => h('span', ctx.api.value.getIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhReasoningLabel = defineComponent({
  name: 'XhReasoningLabel',
  setup(_, { slots }) {
    const ctx = useReasoningContext()
    // 不给内容时显示当前状态那一句
    return () => h(
      'span',
      ctx.api.value.getLabelProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.statusText,
    )
  },
})

export const XhReasoningDuration = defineComponent({
  name: 'XhReasoningDuration',
  setup(_, { slots }) {
    const ctx = useReasoningContext()
    return () => h('span', ctx.api.value.getDurationProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhReasoningContent = defineComponent({
  name: 'XhReasoningContent',
  setup(_, { slots }) {
    const ctx = useReasoningContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})
