import type { ReasoningApi, ReasoningProps, ReasoningTranslations, ToolCallSchema } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideReasoning, useReasoningContext } from './context'
import { useReasoning } from './use-reasoning'

type MachineProps = ToolCallSchema['props']

/** 默认插槽的载荷：开合、还在不在想，以及想了多久。 */
export type ReasoningRootSlotProps = Pick<ReasoningApi, 'open' | 'streaming' | 'disabled' | 'durationMs' | 'setOpen'>

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
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhReasoningDuration = defineComponent({
  name: 'XhReasoningDuration',
  setup(_, { slots }) {
    const ctx = useReasoningContext()
    // 时长文案由作者现场代入：模板串里的秒数是宿主的事，连接层不做插值
    return () => h('span', ctx.api.value.getDurationProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhReasoningContent = defineComponent({
  name: 'XhReasoningContent',
  setup(_, { slots }) {
    const ctx = useReasoningContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})
