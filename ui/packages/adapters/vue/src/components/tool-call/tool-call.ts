import type { Size, Tone } from '@xihan-ui/core'
import type { ToolCallApi, ToolCallPhase, ToolCallProps, ToolCallSchema, ToolCallTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { isToolCallRunning } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideToolCall, useToolCallContext } from './context'
import { useToolCall } from './use-tool-call'

type MachineProps = ToolCallSchema['props']

/** 默认插槽的载荷：开合、阶段与在不在跑，一句可播报的状态文本，以及跑了多久。 */
export type ToolCallRootSlotProps = Pick<ToolCallApi, 'open' | 'phase' | 'running' | 'disabled' | 'statusText' | 'durationMs' | 'setOpen'>

export const XhToolCallRoot = defineComponent({
  name: 'XhToolCallRoot',
  props: {
    phase: { type: String as PropType<ToolCallPhase>, default: undefined },
    startTime: { type: Number, default: undefined },
    endTime: { type: Number, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    // 用 undefined 而非裸 Boolean，缺省值由机器给出
    autoDisclosure: { type: Boolean, default: undefined },
    disabled: Boolean,
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<ToolCallTranslations>>, default: undefined },
  },
  emits: {
    'open-change': (_details: PayloadOf<MachineProps, 'onOpenChange'>) => true,
    'update:open': (_open: boolean) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ToolCallRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const configured = withXhConfig('tool-call', props)
    // 作者只写 phase，跑不跑由纯函数折出来交给机器
    const machineProps: MachineProps = {
      get running() {
        return isToolCallRunning(props.phase ?? 'input-available')
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
    const viewProps: ToolCallProps = {
      get phase() {
        return props.phase
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
    const ctx = useToolCall(machineProps, viewProps)
    provideToolCall(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      phase: ctx.api.value.phase,
      running: ctx.api.value.running,
      disabled: ctx.api.value.disabled,
      statusText: ctx.api.value.statusText,
      durationMs: ctx.api.value.durationMs,
      setOpen: ctx.api.value.setOpen,
    }))
  },
})

export const XhToolCallTrigger = defineComponent({
  name: 'XhToolCallTrigger',
  setup(_, { slots }) {
    const ctx = useToolCallContext()
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToolCallIndicator = defineComponent({
  name: 'XhToolCallIndicator',
  setup(_, { slots }) {
    const ctx = useToolCallContext()
    return () => h('span', ctx.api.value.getIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToolCallLabel = defineComponent({
  name: 'XhToolCallLabel',
  setup(_, { slots }) {
    const ctx = useToolCallContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToolCallSummary = defineComponent({
  name: 'XhToolCallSummary',
  setup(_, { slots }) {
    const ctx = useToolCallContext()
    // 一行参数摘要，收起时也看得见这次查的是什么
    return () => h('span', ctx.api.value.getSummaryProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToolCallStatus = defineComponent({
  name: 'XhToolCallStatus',
  setup(_, { slots }) {
    const ctx = useToolCallContext()
    // 不给内容时念阶段对应的那一句
    return () => h(
      'span',
      ctx.api.value.getStatusProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.statusText,
    )
  },
})

export const XhToolCallDuration = defineComponent({
  name: 'XhToolCallDuration',
  setup(_, { slots }) {
    const ctx = useToolCallContext()
    // 时长文案由作者现场代入：模板串里的秒数是宿主的事，连接层不做插值
    return () => h('span', ctx.api.value.getDurationProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToolCallApproval = defineComponent({
  name: 'XhToolCallApproval',
  setup(_, { slots }) {
    const ctx = useToolCallContext()
    // 常驻在开关与详情之间：审批闸门不该被折叠藏起来
    return () => h('div', ctx.api.value.getApprovalProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToolCallContent = defineComponent({
  name: 'XhToolCallContent',
  setup(_, { slots }) {
    const ctx = useToolCallContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhToolCallInput = defineComponent({
  name: 'XhToolCallInput',
  setup(_, { slots }) {
    const ctx = useToolCallContext()
    return () => h('div', ctx.api.value.getInputProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToolCallOutput = defineComponent({
  name: 'XhToolCallOutput',
  setup(_, { slots }) {
    const ctx = useToolCallContext()
    return () => h('div', ctx.api.value.getOutputProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToolCallError = defineComponent({
  name: 'XhToolCallError',
  setup(_, { slots }) {
    const ctx = useToolCallContext()
    // 流被中止时未拿到结果的调用会被收尾成出错但拿不到原因，这一格要容忍空内容
    return () => h('div', ctx.api.value.getErrorProps() as Record<string, unknown>, slots.default?.())
  },
})
