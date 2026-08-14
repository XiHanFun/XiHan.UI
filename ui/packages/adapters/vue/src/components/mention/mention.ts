import type { MentionApi, MentionInputEl, MentionInputHost, MentionItemProps, MentionNode, MentionNodeMeta, MentionSchema, MentionTranslations } from '@xihan-ui/headless'
import type { ControlVariant, Placement, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, onMounted, onUnmounted, onUpdated, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideMention, provideMentionItem, useMentionContext, useMentionItemContext } from './context'
import { useMention } from './use-mention'

type MentionProps = MentionSchema['props']

/** 默认插槽的载荷：浮层开合、正文与查询串、高亮候选，以及改写正文与收起浮层的句柄。 */
export type MentionRootSlotProps = Pick<
  MentionApi,
  | 'open'
  | 'value'
  | 'query'
  | 'activePrefix'
  | 'highlightedValue'
  | 'setValue'
  | 'close'
>

export const XhMentionRoot = defineComponent({
  name: 'XhMentionRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    prefix: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    collection: { type: Array as PropType<MentionNode[]>, default: undefined },
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    disabled: Boolean,
    placeholder: { type: String, default: undefined },
    loop: { type: Boolean, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    translations: { type: Object as PropType<MentionTranslations>, default: undefined },
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值
  emits: {
    'value-change': (_details: PayloadOf<MentionProps, 'onValueChange'>) => true,
    'query-change': (_details: PayloadOf<MentionProps, 'onQueryChange'>) => true,
    'select': (_details: PayloadOf<MentionProps, 'onSelect'>) => true,
    'open-change': (_details: PayloadOf<MentionProps, 'onOpenChange'>) => true,
    'update:value': (_value: PayloadOf<MentionProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: MentionRootSlotProps) => VNode[]
    /** 铺开 collection 时每条候选的文本插槽。 */
    item?: (props: MentionNodeMeta) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: MentionProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyQuery: MentionProps['onQueryChange'] = details => emit('query-change', details)
    const notifySelect: MentionProps['onSelect'] = details => emit('select', details)
    const notifyOpen: MentionProps['onOpenChange'] = details => emit('open-change', details)

    const ctx = useMention(withXhConfig('mention', props) as MentionProps, {
      onValueChange: notifyValue,
      onQueryChange: notifyQuery,
      onSelect: notifySelect,
      onOpenChange: notifyOpen,
    })
    provideMention(ctx)

    // 首帧结算一次候选条数，之后的增删由条目自己上报
    onMounted(ctx.syncItems)
    onUpdated(ctx.syncItems)

    return () => h(
      'div',
      ctx.api.value.getRootProps() as Record<string, unknown>,
      slots.default
        ? slots.default({
            open: ctx.api.value.open,
            value: ctx.api.value.value,
            query: ctx.api.value.query,
            activePrefix: ctx.api.value.activePrefix,
            highlightedValue: ctx.api.value.highlightedValue,
            setValue: ctx.api.value.setValue,
            close: ctx.api.value.close,
          })
        : props.collection
          ? renderDefaultTree(ctx.api.value.collection, slots.item)
          : [],
    )
  },
})

export const XhMentionInput = defineComponent({
  name: 'XhMentionInput',
  props: {
    /**
     * 输入框渲染成哪个标签，默认 textarea。
     * 写 input 即单行宿主：connect 随之补上 type、role 与 aria-expanded。
     */
    as: { type: String as PropType<MentionInputHost>, default: 'textarea' },
  },
  setup(props) {
    const ctx = useMentionContext()
    return () => h(props.as, {
      ...ctx.api.value.getInputProps({ as: props.as }) as Record<string, unknown>,
      ref: (el: unknown) => { ctx.inputRef.value = el as MentionInputEl },
    })
  },
})

export const XhMentionPositioner = defineComponent({
  name: 'XhMentionPositioner',
  setup(_, { slots }) {
    const ctx = useMentionContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhMentionContent = defineComponent({
  name: 'XhMentionContent',
  setup(_, { slots }) {
    const ctx = useMentionContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhMentionItem = defineComponent({
  name: 'XhMentionItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useMentionContext()
    const item = computed<MentionItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideMentionItem({ item })
    // 候选的进出与改名由条目自己上报，机器据此结算条数并摘掉悬空高亮
    onMounted(ctx.syncItems)
    onUnmounted(ctx.syncItems)
    // 节点就地复用时数量不变但身份换了，需按 value 另行上报
    watch(() => props.value, ctx.syncItems)
    return () => h('div', ctx.api.value.getItemProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhMentionItemText = defineComponent({
  name: 'XhMentionItemText',
  setup(_, { slots }) {
    const ctx = useMentionContext()
    const { item } = useMentionItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 过滤仍归调用方：collection 就是此刻该显示的那几条候选。
 */
function renderDefaultTree(
  collection: readonly MentionNodeMeta[],
  itemSlot?: (node: MentionNodeMeta) => VNode[],
): VNode[] {
  return [
    h(XhMentionInput),
    h(XhMentionPositioner, null, () => [
      h(XhMentionContent, null, () => collection.map(node =>
        h(XhMentionItem, { key: node.value, value: node.value }, () => [
          h(XhMentionItemText, null, () => itemSlot?.(node) ?? node.label),
        ]),
      )),
    ]),
  ]
}
