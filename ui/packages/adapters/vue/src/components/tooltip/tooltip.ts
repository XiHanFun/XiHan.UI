import type { TooltipSchema } from '@xihan-ui/headless'
import type { Placement } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { provideTooltip, useTooltipContext } from './context'
import { useTooltip } from './use-tooltip'

type TooltipProps = TooltipSchema['props']

export const XhTooltipRoot = defineComponent({
  name: 'XhTooltipRoot',
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    openDelay: { type: Number, default: undefined },
    closeDelay: { type: Number, default: undefined },
    disabled: Boolean,
    tone: { type: String, default: undefined },
    size: { type: String, default: undefined },
  },
  // open-change 携带 { open }；update:open 携带裸布尔，支持 v-model:open
  emits: ['open-change', 'update:open'],
  setup(props, { slots, emit }) {
    const notify: TooltipProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useTooltip(props as TooltipProps, notify)
    provideTooltip(ctx)
    return () => slots.default?.({ open: ctx.api.value.open, setOpen: ctx.api.value.setOpen })
  },
})

export const XhTooltipTrigger = defineComponent({
  name: 'XhTooltipTrigger',
  setup(_, { slots }) {
    const ctx = useTooltipContext()
    return () => h('button', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTooltipPositioner = defineComponent({
  name: 'XhTooltipPositioner',
  setup(_, { slots }) {
    const ctx = useTooltipContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTooltipContent = defineComponent({
  name: 'XhTooltipContent',
  setup(_, { slots }) {
    const ctx = useTooltipContext()
    return () => h('div', ctx.api.value.getContentProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTooltipArrow = defineComponent({
  name: 'XhTooltipArrow',
  setup(_, { slots }) {
    const ctx = useTooltipContext()
    return () => h('div', ctx.api.value.getArrowProps() as Record<string, unknown>, slots.default?.())
  },
})
