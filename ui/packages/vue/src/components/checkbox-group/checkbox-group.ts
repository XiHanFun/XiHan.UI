import type { Orientation } from '@xihan-ui/core'
import type { CheckboxGroupItemProps, CheckboxGroupSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import {
  provideCheckboxGroup,
  provideCheckboxGroupItem,
  useCheckboxGroupContext,
  useCheckboxGroupItemContext,
} from './context'
import { useCheckboxGroup } from './use-checkbox-group'

type CheckboxGroupProps = CheckboxGroupSchema['props']

export const XhCheckboxGroupRoot = defineComponent({
  name: 'XhCheckboxGroupRoot',
  props: {
    // 数组值给 default: undefined 才表达得了"非受控"；
    // 落成 () => [] 会被当作"受控且当前为空"，用户从此再也勾不动
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: undefined },
    itemValues: { type: Array as PropType<string[]>, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    name: { type: String, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
  },
  // value-change 携带 { value }；update:value 携带裸数组，支持 v-model:value
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const notify: CheckboxGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useCheckboxGroup(props as CheckboxGroupProps, notify)
    provideCheckboxGroup(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      checkedState: ctx.api.value.checkedState,
      isChecked: ctx.api.value.isChecked,
      setValue: ctx.api.value.setValue,
      toggleValue: ctx.api.value.toggleValue,
    }))
  },
})

export const XhCheckboxGroupLabel = defineComponent({
  name: 'XhCheckboxGroupLabel',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCheckboxGroupItem = defineComponent({
  name: 'XhCheckboxGroupItem',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useCheckboxGroupContext()
    const item = computed<CheckboxGroupItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideCheckboxGroupItem({ item })
    // 表单影子由条目自行装配，作者只写方框与文本；
    // 不暴露成独立组件，避免这份原生输入脱离条目单独出现、或被写成非 input 标签
    return () => h('div', ctx.api.value.getItemProps(item.value) as Record<string, unknown>, [
      h('input', ctx.api.value.getItemHiddenInputProps(item.value) as Record<string, unknown>),
      ...(slots.default?.() ?? []),
    ])
  },
})

export const XhCheckboxGroupItemControl = defineComponent({
  name: 'XhCheckboxGroupItemControl',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    const { item } = useCheckboxGroupItemContext()
    // 插槽留给作者放对勾图形：方框本身对读屏隐藏，里面塞什么都不会被念出来
    return () => h('span', ctx.api.value.getItemControlProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCheckboxGroupItemText = defineComponent({
  name: 'XhCheckboxGroupItemText',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    const { item } = useCheckboxGroupItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhCheckboxGroupTrigger = defineComponent({
  name: 'XhCheckboxGroupTrigger',
  setup(_, { slots }) {
    const ctx = useCheckboxGroupContext()
    // 与条目同形的 role=checkbox 节点（div 而非 button）：Space 由 connect 自己接管，
    // 三态 aria-checked 也只有非原生控件才表达得出 mixed
    return () => h('div', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
