import type { ApprovalApi, ApprovalSchema, ApprovalScope, ApprovalStatus, ApprovalTranslations } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideApproval, useApprovalContext } from './context'
import { useApproval } from './use-approval'

type Props = ApprovalSchema['props']

/** 默认插槽的载荷：判定状态、能不能批，以及三个动作入口。 */
export type ApprovalRootSlotProps = Pick<
  ApprovalApi,
  'status' | 'settled' | 'busy' | 'grantedScopes' | 'note' | 'canApprove' | 'announcement' | 'approve' | 'deny' | 'setGrantedScopes' | 'setNote'
>

/** 逐项插槽的载荷。 */
export interface ApprovalScopeSlotProps {
  scope: ApprovalScope
  granted: boolean
}

export const XhApprovalRoot = defineComponent({
  name: 'XhApprovalRoot',
  props: {
    requestId: { type: String, default: undefined },
    status: { type: String as PropType<ApprovalStatus>, default: undefined },
    defaultStatus: { type: String as PropType<ApprovalStatus>, default: undefined },
    timeoutMs: { type: Number, default: undefined },
    scopes: { type: Array as PropType<readonly ApprovalScope[]>, default: undefined },
    grantedScopes: { type: Array as PropType<readonly string[]>, default: undefined },
    defaultGrantedScopes: { type: Array as PropType<readonly string[]>, default: undefined },
    note: { type: String, default: undefined },
    defaultNote: { type: String, default: undefined },
    busy: Boolean,
    // 用 undefined 而非裸 Boolean，缺省值由机器与 connect 给出
    denyOnEscape: { type: Boolean, default: undefined },
    denyOnUnmount: { type: Boolean, default: undefined },
    live: { type: String as PropType<'polite' | 'assertive'>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<ApprovalTranslations>>, default: undefined },
  },
  emits: {
    'decision': (_details: PayloadOf<Props, 'onDecision'>) => true,
    'granted-scopes-change': (_details: PayloadOf<Props, 'onGrantedScopesChange'>) => true,
    'update:grantedScopes': (_value: string[]) => true,
    'note-change': (_details: PayloadOf<Props, 'onNoteChange'>) => true,
    'update:note': (_value: string) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ApprovalRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useApproval(withXhConfig('approval', props) as Props, {
      onDecision: details => emit('decision', details),
      onGrantedScopesChange: (details) => {
        emit('granted-scopes-change', details)
        emit('update:grantedScopes', details.value)
      },
      onNoteChange: (details) => {
        emit('note-change', details)
        emit('update:note', details.value)
      },
    })
    provideApproval(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      status: ctx.api.value.status,
      settled: ctx.api.value.settled,
      busy: ctx.api.value.busy,
      grantedScopes: ctx.api.value.grantedScopes,
      note: ctx.api.value.note,
      canApprove: ctx.api.value.canApprove,
      announcement: ctx.api.value.announcement,
      approve: ctx.api.value.approve,
      deny: ctx.api.value.deny,
      setGrantedScopes: ctx.api.value.setGrantedScopes,
      setNote: ctx.api.value.setNote,
    }))
  },
})

export const XhApprovalTitle = defineComponent({
  name: 'XhApprovalTitle',
  setup(_, { slots }) {
    const ctx = useApprovalContext()
    return () => h('h3', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhApprovalDescription = defineComponent({
  name: 'XhApprovalDescription',
  setup(_, { slots }) {
    const ctx = useApprovalContext()
    return () => h('p', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhApprovalLiveRegion = defineComponent({
  name: 'XhApprovalLiveRegion',
  setup(_, { slots }) {
    const ctx = useApprovalContext()
    // 不给内容时念状态对应的那一句
    return () => h(
      'div',
      ctx.api.value.getLiveRegionProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.announcement,
    )
  },
})

export const XhApprovalScopeGroup = defineComponent({
  name: 'XhApprovalScopeGroup',
  setup(_, { slots }) {
    const ctx = useApprovalContext()
    return () => h('div', ctx.api.value.getScopeGroupProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhApprovalScopeItem = defineComponent({
  name: 'XhApprovalScopeItem',
  props: {
    scopeValue: { type: String, required: true },
    scopeLabel: { type: String, default: undefined },
    scopeRequired: { type: Boolean, default: undefined },
    scopeDisabled: { type: Boolean, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: ApprovalScopeSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useApprovalContext()
    const scope = (): ApprovalScope => ({
      value: props.scopeValue,
      label: props.scopeLabel,
      required: props.scopeRequired,
      disabled: props.scopeDisabled,
    })
    return () => h(
      'div',
      ctx.api.value.getScopeItemProps(scope()) as Record<string, unknown>,
      slots.default?.({ scope: scope(), granted: ctx.api.value.isScopeGranted(props.scopeValue) }),
    )
  },
})

export const XhApprovalScopeIndicator = defineComponent({
  name: 'XhApprovalScopeIndicator',
  props: {
    scopeValue: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useApprovalContext()
    return () => h(
      'span',
      ctx.api.value.getScopeIndicatorProps({ value: props.scopeValue }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhApprovalScopeLabel = defineComponent({
  name: 'XhApprovalScopeLabel',
  props: {
    scopeValue: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useApprovalContext()
    // 排在勾选项之内，文本自然构成它的可及名
    return () => h(
      'span',
      ctx.api.value.getScopeLabelProps({ value: props.scopeValue }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhApprovalNote = defineComponent({
  name: 'XhApprovalNote',
  setup() {
    const ctx = useApprovalContext()
    // 自闭合的输入格，内容由 value 给，不收插槽
    return () => h('input', ctx.api.value.getNoteProps() as Record<string, unknown>)
  },
})

export const XhApprovalTimer = defineComponent({
  name: 'XhApprovalTimer',
  setup(_, { slots }) {
    const ctx = useApprovalContext()
    // 对读屏隐藏：逐秒变化的数字进活区会不停打断
    return () => h('div', ctx.api.value.getTimerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhApprovalResult = defineComponent({
  name: 'XhApprovalResult',
  setup(_, { slots }) {
    const ctx = useApprovalContext()
    // 判定落定后才露出；文字由播报区念，这一格对读屏隐藏
    return () => h('div', ctx.api.value.getResultProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhApprovalFooter = defineComponent({
  name: 'XhApprovalFooter',
  setup(_, { slots }) {
    const ctx = useApprovalContext()
    return () => h('div', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhApprovalApproveTrigger = defineComponent({
  name: 'XhApprovalApproveTrigger',
  setup(_, { slots }) {
    const ctx = useApprovalContext()
    return () => h('button', ctx.api.value.getApproveTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhApprovalDenyTrigger = defineComponent({
  name: 'XhApprovalDenyTrigger',
  setup(_, { slots }) {
    const ctx = useApprovalContext()
    return () => h('button', ctx.api.value.getDenyTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
