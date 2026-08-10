import type { CollapsibleSchema } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
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
    size: { type: String as PropType<Size>, default: undefined },
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<CollapsibleProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<CollapsibleProps, 'onOpenChange'>['open']) => true,
  },
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
