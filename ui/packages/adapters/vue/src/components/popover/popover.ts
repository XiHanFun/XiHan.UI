import type { PopoverApi, PopoverSchema } from '@xihan-ui/headless'
import type { Placement, Size } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { providePopover, usePopoverContext } from './context'
import { usePopover } from './use-popover'

type PopoverProps = PopoverSchema['props']

/** 默认插槽的载荷：浮层的展开态与开合命令。 */
export type PopoverRootSlotProps = Pick<PopoverApi, 'open' | 'setOpen'>

export const XhPopoverRoot = defineComponent({
  name: 'XhPopoverRoot',
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    modal: { type: Boolean, default: false },
    closeOnEscape: { type: Boolean, default: true },
    closeOnInteractOutside: { type: Boolean, default: true },
    translations: { type: Object as PropType<PopoverProps['translations']>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<PopoverProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<PopoverProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: PopoverRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: PopoverProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = usePopover(withXhConfig('popover', props) as PopoverProps, notify)
    providePopover(ctx)
    return () => slots.default?.({ open: ctx.api.value.open, setOpen: ctx.api.value.setOpen })
  },
})

export const XhPopoverTrigger = defineComponent({
  name: 'XhPopoverTrigger',
  setup(_, { slots }) {
    const ctx = usePopoverContext()
    return () => h('button', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhPopoverPositioner = defineComponent({
  name: 'XhPopoverPositioner',
  setup(_, { slots }) {
    const ctx = usePopoverContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhPopoverContent = defineComponent({
  name: 'XhPopoverContent',
  setup(_, { slots }) {
    const ctx = usePopoverContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhPopoverTitle = defineComponent({
  name: 'XhPopoverTitle',
  setup(_, { slots }) {
    const ctx = usePopoverContext()
    return () => h('h2', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPopoverDescription = defineComponent({
  name: 'XhPopoverDescription',
  setup(_, { slots }) {
    const ctx = usePopoverContext()
    return () => h('p', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPopoverCloseTrigger = defineComponent({
  name: 'XhPopoverCloseTrigger',
  setup(_, { slots }) {
    const ctx = usePopoverContext()
    return () => h('button', ctx.api.value.getCloseTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPopoverArrow = defineComponent({
  name: 'XhPopoverArrow',
  setup() {
    const ctx = usePopoverContext()
    return () => h('div', ctx.api.value.getArrowProps() as Record<string, unknown>)
  },
})
