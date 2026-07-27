import type { Direction, Orientation } from '@xihan-ui/core'
import type { ListboxItemGroupProps, ListboxItemProps, ListboxSchema, ListboxSelectionMode } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import {
  provideListbox,
  provideListboxItem,
  provideListboxItemGroup,
  useListboxContext,
  useListboxItemContext,
  useListboxItemGroupContext,
} from './context'
import { useListbox } from './use-listbox'

type ListboxProps = ListboxSchema['props']

export const XhListboxRoot = defineComponent({
  name: 'XhListboxRoot',
  // 缺省值的唯一事实源在 connect —— 凡是 connect 有兜底的一律 default: undefined
  // （loop 与 typeahead 尤其：裸 Boolean 声明会把缺省压成 false，回绕与连打就默默关掉了）
  props: {
    value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    multiple: Boolean,
    selectionMode: { type: String as PropType<ListboxSelectionMode>, default: undefined },
    disabled: Boolean,
    loop: { type: Boolean, default: undefined },
    typeahead: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
  },
  // value-change 携带 { value }；update:value 携带裸集合，支持 v-model:value。
  // 回传的恒是数组（单选也是长度 ≤ 1 的数组），形状不随模式变
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const notify: ListboxProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useListbox(props as ListboxProps, notify)
    provideListbox(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      selectionMode: ctx.api.value.selectionMode,
      focusedValue: ctx.api.value.focusedValue,
      isSelected: ctx.api.value.isSelected,
      setValue: ctx.api.value.setValue,
      select: ctx.api.value.select,
      toggle: ctx.api.value.toggle,
    }))
  },
})

export const XhListboxLabel = defineComponent({
  name: 'XhListboxLabel',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxContent = defineComponent({
  name: 'XhListboxContent',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxItemGroup = defineComponent({
  name: 'XhListboxItemGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useListboxContext()
    const group = computed<ListboxItemGroupProps>(() => ({ value: props.value }))
    provideListboxItemGroup({ group })
    return () => h('div', ctx.api.value.getItemGroupProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxItemGroupLabel = defineComponent({
  name: 'XhListboxItemGroupLabel',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    const { group } = useListboxItemGroupContext()
    return () => h('span', ctx.api.value.getItemGroupLabelProps(group.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxItem = defineComponent({
  name: 'XhListboxItem',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useListboxContext()
    const item = computed<ListboxItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideListboxItem({ item })
    // 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
    // 容器判自己"焦点在列表内"退出 Tab 序列，又没有条目认领得了这个锚点，
    // 整组零个 Tab 停靠点，键盘用户再也进不来。卸载前把焦点离场如实上报，
    // 且只有自己正持有焦点时才报——否则删掉任一无关条目都会把光标一并清掉。
    // v-for 不带 key 时 Vue 会就地复用节点：被删的是"最后一个组件实例"，
    // 而持有焦点的那个 DOM 节点还在、value 却被改成了别的条目。此时锚点仍指着旧值、
    // 已无人认领，键盘就此失灵。自己正持有焦点且 value 变了，就按新值重报一次。
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
      // 整个列表一起卸载时根部件先停机，此刻无焦点可言（送事件还会在 dev 下抛）
      if (service.getStatus() !== 'Started')
        return
      // 判据是「本节点当下正持有焦点」，不是「值对得上」：v-for 就地复用时
      // 被卸载的是末位实例、它的 value 可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'LIST.BLUR' })
    })
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhListboxItemText = defineComponent({
  name: 'XhListboxItemText',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    const { item } = useListboxItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhListboxItemIndicator = defineComponent({
  name: 'XhListboxItemIndicator',
  setup(_, { slots }) {
    const ctx = useListboxContext()
    const { item } = useListboxItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})
