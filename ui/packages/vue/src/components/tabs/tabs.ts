import type { Orientation } from '@xihan-ui/core'
import type { TabsActivationMode, TabsSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideTabs, useTabsContext } from './context'
import { useTabs } from './use-tabs'

type TabsProps = TabsSchema['props']

export const XhTabsRoot = defineComponent({
  name: 'XhTabsRoot',
  // 全部 default: undefined —— 缺省值的唯一事实源在 connect（loop 尤其：
  // 裸 Boolean 声明会把缺省压成 false，回绕就默默关掉了）
  props: {
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    activationMode: { type: String as PropType<TabsActivationMode>, default: undefined },
    loop: { type: Boolean, default: undefined },
  },
  // value-change 携带 { value }；update:value 携带裸值，支持 v-model:value
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const notify: TabsProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useTabs(props as TabsProps, notify)
    provideTabs(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTabsList = defineComponent({
  name: 'XhTabsList',
  setup(_, { slots }) {
    const ctx = useTabsContext()
    return () => h('div', ctx.api.value.getListProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTabsTrigger = defineComponent({
  name: 'XhTabsTrigger',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useTabsContext()
    return () => h(
      'button',
      ctx.api.value.getTriggerProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhTabsContent = defineComponent({
  name: 'XhTabsContent',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTabsContext()
    return () => h(
      'div',
      ctx.api.value.getContentProps({ value: props.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
