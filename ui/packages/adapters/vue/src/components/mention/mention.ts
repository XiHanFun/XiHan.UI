import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { MentionApi, MentionInputEl, MentionItemProps, MentionNode, MentionNodeMeta, MentionSchema, MentionTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, mergeProps, onMounted, onUnmounted, onUpdated, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhPortal } from '../../runtime/portal'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
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
    triggerPrefix: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    collection: { type: Array as PropType<MentionNode[]>, default: undefined },
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    loading: Boolean,
    name: { type: String, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    placeholder: { type: String, default: undefined },
    loop: { type: Boolean, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    /** 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给。 */
    dir: { type: String as PropType<Direction>, default: undefined },
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
    /** 铺开 collection 时空态里那句话；不写走内建英文。 */
    empty?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: MentionProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyQuery: MentionProps['onQueryChange'] = details => emit('query-change', details)
    const notifySelect: MentionProps['onSelect'] = details => emit('select', details)
    const notifyOpen: MentionProps['onOpenChange'] = details => emit('open-change', details)

    const ctx = useMention(withXhConfig('mention', useFormControlProps(props)) as MentionProps, {
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
          ? renderDefaultTree(ctx.api.value.collection, slots.item, slots.empty)
          : [],
    )
  },
})

/** 标题；必须是原生 label，getLabelProps 的 for 恒写向输入框。 */
export const XhMentionLabel = defineComponent({
  name: 'XhMentionLabel',
  setup(_, { slots }) {
    const ctx = useMentionContext()
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 单行输入框；正文写在它身上，候选浮层贴着它落位。 */
export const XhMentionInput = defineComponent({
  name: 'XhMentionInput',
  setup() {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useMentionContext()
    return () => h('input', fieldLabel.value({
      ...fieldWiring.value,
      ...ctx.api.value.getInputProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.inputRef.value = el as MentionInputEl },
    }))
  },
})

export const XhMentionPositioner = defineComponent({
  name: 'XhMentionPositioner',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useMentionContext()
    // 候选列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
    const bars = useScrollbars({ scrollable: () => ctx.contentRef.value })
    // 定位层搬到 portal 落点，逃开祖先的层叠上下文
    return () => h(XhPortal, { to: ctx.portalTarget.value, source: ctx.inputRef }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
  },
})

export const XhMentionContent = defineComponent({
  name: 'XhMentionContent',
  setup(_, { slots }) {
    const ctx = useMentionContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/** 一条候选都没有时显出的空态；与候选面板同级。 */
export const XhMentionEmpty = defineComponent({
  name: 'XhMentionEmpty',
  setup(_, { slots }) {
    const ctx = useMentionContext()
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 候选还在取时顶上来的在途占位；与候选面板同级。 */
export const XhMentionLoading = defineComponent({
  name: 'XhMentionLoading',
  setup(_, { slots }) {
    const ctx = useMentionContext()
    return () => h('div', ctx.api.value.getLoadingProps() as Record<string, unknown>, slots.default?.())
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
  emptySlot?: () => VNode[],
): VNode[] {
  const emptyText = emptySlot?.() ?? 'No results'
  return [
    h(XhMentionInput),
    h(XhMentionPositioner, null, () => [
      h(XhMentionContent, null, () => collection.map(node =>
        h(XhMentionItem, { key: node.value, value: node.value }, () => [
          h(XhMentionItemText, null, () => itemSlot?.(node) ?? node.label),
        ]),
      )),
      h(XhMentionEmpty, null, () => emptyText),
    ]),
  ]
}
