import type { ToggleGroupNode, ToggleGroupNodeMeta, ToggleGroupSchema, ToggleGroupValue } from '@xihan-ui/headless'
import type { Direction, Orientation, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideToggleGroup, useToggleGroupContext } from './context'
import { useToggleGroup } from './use-toggle-group'

type ToggleGroupProps = ToggleGroupSchema['props']

export const XhToggleGroupRoot = defineComponent({
  name: 'XhToggleGroupRoot',
  // 全部 default: undefined，缺省值由 connect 决定
  props: {
    collection: { type: Array as PropType<ToggleGroupNode[]>, default: undefined },
    value: { type: [String, Array] as PropType<ToggleGroupValue>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<ToggleGroupValue>, default: undefined },
    multiple: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    disallowEmpty: { type: Boolean, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    loop: { type: Boolean, default: undefined },
    rovingFocus: { type: Boolean, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸值；裸值形态跟随 multiple，单选为字符串、多选为数组
  emits: {
    'value-change': (_details: PayloadOf<ToggleGroupProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<ToggleGroupProps, 'onValueChange'>['value']) => true,
  },
  setup(props, { slots, emit }) {
    const notify: ToggleGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useToggleGroup(props as ToggleGroupProps, notify)
    provideToggleGroup(ctx)
    return () => h(
      'div',
      ctx.api.value.getRootProps() as Record<string, unknown>,
      slots.default
        ? slots.default()
        : props.collection
          ? renderDefaultTree(ctx.api.value.collection, slots.item)
          : [],
    )
  },
})

export const XhToggleGroupItem = defineComponent({
  name: 'XhToggleGroupItem',
  props: {
    value: { type: String, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useToggleGroupContext()
    // 本条目持有焦点时，value 变更重报焦点条目，卸载时上报整组失焦
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
    // 用原生 button，激活交给平台
    return () => h(
      'button',
      { ...ctx.api.value.getItemProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

/**
 * 没写默认插槽时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写默认插槽，行为不变。
 * 条目底下没有文本部件，文字直接落在条目里。
 */
function renderDefaultTree(
  collection: readonly ToggleGroupNodeMeta[],
  itemSlot?: (node: ToggleGroupNodeMeta) => VNode[],
): VNode[] {
  return collection.map(node => h(
    XhToggleGroupItem,
    { key: node.value, value: node.value },
    () => itemSlot?.(node) ?? node.label,
  ))
}
