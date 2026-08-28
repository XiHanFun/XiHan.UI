import type { PopselectApi, PopselectItemProps, PopselectNode, PopselectNodeMeta, PopselectTranslations } from '@xihan-ui/headless'
import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import type { PopselectNotifiers, PopselectRootProps } from './use-popselect'
import { computed, defineComponent, h, mergeProps, onBeforeUnmount, ref, Teleport, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { providePopselect, providePopselectItem, usePopselectContext, usePopselectItemContext } from './context'
import { usePopselect } from './use-popselect'

/** 默认插槽的载荷：浮层开合、选中集合与条目数据，以及改动它们的方法。 */
export type PopselectRootSlotProps = Pick<
  PopselectApi,
  'open' | 'value' | 'collection' | 'focusedValue' | 'canClear' | 'isSelected' | 'setOpen' | 'setValue' | 'select' | 'clear'
>

export const XhPopselectRoot = defineComponent({
  name: 'XhPopselectRoot',
  // 有 connect 或机器兜底的 prop 一律 default: undefined
  props: {
    collection: { type: Array as PropType<PopselectNode[]>, default: undefined },
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    multiple: Boolean,
    disabled: Boolean,
    loop: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    closeOnEscape: { type: Boolean, default: undefined },
    closeOnInteractOutside: { type: Boolean, default: undefined },
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<PopselectTranslations>>, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值；回传的选中值恒为数组，单选时长度 ≤ 1
  emits: {
    'value-change': (_details: PayloadOf<PopselectNotifiers, 'onValueChange'>) => true,
    'open-change': (_details: PayloadOf<PopselectNotifiers, 'onOpenChange'>) => true,
    'update:value': (_value: PayloadOf<PopselectNotifiers, 'onValueChange'>['value']) => true,
    'update:open': (_open: PayloadOf<PopselectNotifiers, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: PopselectRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: PopselectNotifiers = {
      onValueChange: (details) => {
        emit('value-change', details)
        emit('update:value', details.value)
      },
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
    }
    const ctx = usePopselect(withXhConfig('popselect', props) as PopselectRootProps, notify)
    providePopselect(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      value: ctx.api.value.value,
      collection: ctx.api.value.collection,
      focusedValue: ctx.api.value.focusedValue,
      canClear: ctx.api.value.canClear,
      isSelected: ctx.api.value.isSelected,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      select: ctx.api.value.select,
      clear: ctx.api.value.clear,
    }))
  },
})

/** 盒：触发器与清空按钮在里面并排，描边、底色与聚焦环都长在它上面。 */
export const XhPopselectControl = defineComponent({
  name: 'XhPopselectControl',
  setup(_, { slots }) {
    const ctx = usePopselectContext()
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPopselectTrigger = defineComponent({
  name: 'XhPopselectTrigger',
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots }) {
    const ctx = usePopselectContext()
    return () => {
      const attrs = {
        ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
      }
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, attrs, 'popselect')
        if (merged)
          return merged
      }
      return h('button', attrs, children)
    }
  },
})

/** 清空钮：盒里 trigger 的兄弟节点，有选中值才显出；没写内容时由皮肤画叉。 */
export const XhPopselectClearTrigger = defineComponent({
  name: 'XhPopselectClearTrigger',
  setup(_, { slots }) {
    const ctx = usePopselectContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPopselectPositioner = defineComponent({
  name: 'XhPopselectPositioner',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = usePopselectContext()
    // 候选列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
    const bars = useScrollbars({ scrollable: () => ctx.contentRef.value })
    // 定位层搬到 portal 落点，逃开祖先的层叠上下文
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
  },
})

export const XhPopselectContent = defineComponent({
  name: 'XhPopselectContent',
  setup(_, { slots }) {
    const ctx = usePopselectContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.() ?? renderItems(ctx.api.value.collection, slots.item))
  },
})

export const XhPopselectItem = defineComponent({
  name: 'XhPopselectItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = usePopselectContext()
    const item = computed<PopselectItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    providePopselectItem({ item })
    // 本条目持有焦点时，value 变更重报焦点条目，卸载时上报列表失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const { listbox } = ctx
      if (listbox.getStatus() !== 'Started')
        return
      if (itemEl.value && listbox.scope.getActiveElement() === itemEl.value)
        listbox.send({ type: 'ITEM.FOCUS', value: next })
    })
    onBeforeUnmount(() => {
      const { listbox } = ctx
      if (listbox.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && listbox.scope.getActiveElement() === itemEl.value)
        listbox.send({ type: 'LIST.BLUR' })
    })
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhPopselectItemText = defineComponent({
  name: 'XhPopselectItemText',
  setup(_, { slots }) {
    const ctx = usePopselectContext()
    const { item } = usePopselectItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhPopselectItemIndicator = defineComponent({
  name: 'XhPopselectItemIndicator',
  setup(_, { slots }) {
    const ctx = usePopselectContext()
    const { item } = usePopselectItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 浮层里没写默认插槽时按 collection 铺开的条目，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要在条目之外放别的节点就写默认插槽。
 */
function renderItems(
  collection: readonly PopselectNodeMeta[],
  itemSlot?: (node: PopselectNodeMeta) => VNode[],
): VNode[] {
  return collection.map(node =>
    h(XhPopselectItem, { key: node.value, value: node.value }, () => [
      h(XhPopselectItemText, null, () => itemSlot?.(node) ?? node.label),
      h(XhPopselectItemIndicator),
    ]),
  )
}
