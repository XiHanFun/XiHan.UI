import type { CollapsibleSchema } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { provideCollapsible, useCollapsibleContext } from './context'
import { useCollapsible } from './use-collapsible'

type CollapsibleProps = CollapsibleSchema['props']

export const XhCollapsibleRoot = defineComponent({
  name: 'XhCollapsibleRoot',
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
  },
  // open-change 携带 { open }；update:open 携带裸布尔，支持 v-model:open
  emits: ['open-change', 'update:open'],
  setup(props, { slots, emit }) {
    const notify: CollapsibleProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useCollapsible(props as CollapsibleProps, notify)
    provideCollapsible(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCollapsibleTrigger = defineComponent({
  name: 'XhCollapsibleTrigger',
  setup(_, { slots }) {
    const ctx = useCollapsibleContext()
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCollapsibleContent = defineComponent({
  name: 'XhCollapsibleContent',
  setup(_, { slots }) {
    const ctx = useCollapsibleContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})
