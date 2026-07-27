import type { Direction, Orientation } from '@xihan-ui/core'
import type { RadioGroupItemProps, RadioGroupSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h, onBeforeUnmount } from 'vue'
import { provideRadioGroup, provideRadioGroupItem, useRadioGroupContext, useRadioGroupItemContext } from './context'
import { useRadioGroup } from './use-radio-group'

type RadioGroupProps = RadioGroupSchema['props']

export const XhRadioGroupRoot = defineComponent({
  name: 'XhRadioGroupRoot',
  props: {
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    disabled: Boolean,
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    name: { type: String, default: undefined },
  },
  // value-change 携带 { value }；update:value 携带裸值，支持 v-model:value
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const notify: RadioGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useRadioGroup(props as RadioGroupProps, notify)
    provideRadioGroup(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhRadioGroupLabel = defineComponent({
  name: 'XhRadioGroupLabel',
  setup(_, { slots }) {
    const ctx = useRadioGroupContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhRadioGroupItem = defineComponent({
  name: 'XhRadioGroupItem',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useRadioGroupContext()
    const item = computed<RadioGroupItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideRadioGroupItem({ item })
    // 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
    // 容器判自己"焦点在组内"退出 Tab 序列，又没有条目认领得了这个锚点，
    // 整组零个 Tab 停靠点，键盘用户再也进不来。卸载前把焦点离场如实上报，
    // 且只有自己正持有焦点时才报——否则删掉任一无关条目都会把光标一并清掉。
    onBeforeUnmount(() => {
      const { service } = ctx
      // 整组一起卸载时根部件先停机，此刻无焦点可言（送事件还会在 dev 下抛）
      if (service.getStatus() !== 'Started')
        return
      if (service.context.get('focusedValue') === props.value)
        service.send({ type: 'GROUP.BLUR' })
    })
    // 隐藏输入与 indicator 都由条目自行装配，作者只写文本；
    // 不暴露成独立组件，避免它们脱离条目单独出现
    return () => h('div', ctx.api.value.getItemProps(item.value) as Record<string, unknown>, [
      h('input', ctx.api.value.getHiddenInputProps(item.value) as Record<string, unknown>),
      h('span', ctx.api.value.getIndicatorProps(item.value) as Record<string, unknown>),
      ...(slots.default?.() ?? []),
    ])
  },
})

export const XhRadioGroupItemText = defineComponent({
  name: 'XhRadioGroupItemText',
  setup(_, { slots }) {
    const ctx = useRadioGroupContext()
    const { item } = useRadioGroupItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})
