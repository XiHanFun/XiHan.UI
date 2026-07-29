import type { Direction, Orientation } from '@xihan-ui/core'
import type { ToggleGroupSchema, ToggleGroupValue } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideToggleGroup, useToggleGroupContext } from './context'
import { useToggleGroup } from './use-toggle-group'

type ToggleGroupProps = ToggleGroupSchema['props']

export const XhToggleGroupRoot = defineComponent({
  name: 'XhToggleGroupRoot',
  // 全部 default: undefined，缺省值由 connect 决定
  props: {
    value: { type: [String, Array] as PropType<ToggleGroupValue>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<ToggleGroupValue>, default: undefined },
    multiple: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    disallowEmpty: { type: Boolean, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    loop: { type: Boolean, default: undefined },
    rovingFocus: { type: Boolean, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸值；裸值形态跟随 multiple，单选为字符串、多选为数组
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const notify: ToggleGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useToggleGroup(props as ToggleGroupProps, notify)
    provideToggleGroup(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToggleGroupItem = defineComponent({
  name: 'XhToggleGroupItem',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
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
