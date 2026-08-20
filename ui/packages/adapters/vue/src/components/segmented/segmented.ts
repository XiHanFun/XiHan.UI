import type { SegmentedItemProps, SegmentedNode, SegmentedNodeMeta, SegmentedSchema } from '@xihan-ui/headless'
import type { Direction, Orientation, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideSegmented, provideSegmentedItem, useSegmentedContext, useSegmentedItemContext } from './context'
import { useSegmented } from './use-segmented'

type SegmentedProps = SegmentedSchema['props']

export const XhSegmentedRoot = defineComponent({
  name: 'XhSegmentedRoot',
  // 全部 default: undefined，缺省值由机器与 connect 决定
  props: {
    collection: { type: Array as PropType<SegmentedNode[]>, default: undefined },
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    name: { type: String, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    loop: { type: Boolean, default: undefined },
    block: { type: Boolean, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸值
  emits: {
    'value-change': (_details: PayloadOf<SegmentedProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<SegmentedProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: () => VNode[]
    /** 铺开 collection 时每一段的文本插槽。 */
    item?: (props: SegmentedNodeMeta) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: SegmentedProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useSegmented(props as SegmentedProps, notify)
    provideSegmented(ctx)
    // 写了默认插槽就整套结构自理：隐藏输入也要自己放一个 XhSegmentedHiddenInput，
    // 否则给了 name 也没有任何东西参与提交
    return () => h(
      'div',
      { ...ctx.api.value.getRootProps() as Record<string, unknown>, ref: ctx.rootRef },
      slots.default
        ? slots.default()
        : props.collection
          ? renderDefaultTree(ctx.api.value.collection, slots.item)
          : [],
    )
  },
})

export const XhSegmentedItem = defineComponent({
  name: 'XhSegmentedItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useSegmentedContext()
    const item = computed<SegmentedItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideSegmentedItem({ item })
    // 本段持有焦点时，value 变更重报焦点段，卸载时上报整组失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'ITEM.FOCUS', value: next })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'GROUP.BLUR' })
    })
    // 用原生 button，Enter/Space 的激活交给平台
    return () => h(
      'button',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhSegmentedItemText = defineComponent({
  name: 'XhSegmentedItemText',
  setup(_, { slots }) {
    const ctx = useSegmentedContext()
    const { item } = useSegmentedItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 会滑动的选中标记，位置由机器量好写进内联样式的私有槽；无选中项时收起。 */
export const XhSegmentedIndicator = defineComponent({
  name: 'XhSegmentedIndicator',
  setup() {
    const ctx = useSegmentedContext()
    return () => h('span', ctx.api.value.getIndicatorProps() as Record<string, unknown>)
  },
})

/** 表单出口：给了 name 才带上它，提交的就是当前选中值。 */
export const XhSegmentedHiddenInput = defineComponent({
  name: 'XhSegmentedHiddenInput',
  setup() {
    const ctx = useSegmentedContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 指示器排在最前：它绝对定位，靠文档序让后面的段压在它上面，段里的文字才不会被盖住。
 */
function renderDefaultTree(
  collection: readonly SegmentedNodeMeta[],
  itemSlot?: (node: SegmentedNodeMeta) => VNode[],
): VNode[] {
  return [
    h(XhSegmentedIndicator),
    ...collection.map(node => h(XhSegmentedItem, { key: node.value, value: node.value }, () => [
      h(XhSegmentedItemText, null, () => itemSlot?.(node) ?? node.label),
    ])),
    h(XhSegmentedHiddenInput),
  ]
}
