import type { Direction, Orientation } from '@xihan-ui/core'
import type { TabsActivationMode, TabsSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideTabs, useTabsContext } from './context'
import { useTabs } from './use-tabs'

type TabsProps = TabsSchema['props']

export const XhTabsRoot = defineComponent({
  name: 'XhTabsRoot',
  // 全部 default: undefined，缺省值由 connect 决定
  props: {
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    activationMode: { type: String as PropType<TabsActivationMode>, default: undefined },
    loop: { type: Boolean, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸值
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
    // 本节点持有焦点时，value 变更重报焦点标签，卸载时上报列表失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const svc = ctx.service
      if (svc.getStatus() !== 'Started')
        return
      if (itemEl.value && svc.scope.getActiveElement() === itemEl.value)
        svc.send({ type: 'TRIGGER.FOCUS', value: next })
    })
    onBeforeUnmount(() => {
      if (ctx.service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按 value 比对
      if (itemEl.value && ctx.service.scope.getActiveElement() === itemEl.value)
        ctx.service.send({ type: 'LIST.BLUR' })
    })
    return () => h(
      'button',
      { ...ctx.api.value.getTriggerProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>, ref: itemEl },
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
