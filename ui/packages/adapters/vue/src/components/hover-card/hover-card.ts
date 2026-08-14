import type { HoverCardApi, HoverCardSchema } from '@xihan-ui/headless'
import type { Direction, Placement, Size } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { provideHoverCard, useHoverCardContext } from './context'
import { useHoverCard } from './use-hover-card'

type HoverCardProps = HoverCardSchema['props']

/** 默认插槽的载荷：浮层的开合状态与程序化开合的方法。 */
export type HoverCardRootSlotProps = Pick<HoverCardApi, 'open' | 'setOpen'>

export const XhHoverCardRoot = defineComponent({
  name: 'XhHoverCardRoot',
  // 缺省值由机器与 connect 给出，这里一律 default: undefined
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    openDelay: { type: Number, default: undefined },
    closeDelay: { type: Number, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    disabled: Boolean,
    size: { type: String as PropType<Size>, default: undefined },
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<HoverCardProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<HoverCardProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: HoverCardRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: HoverCardProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useHoverCard(props as HoverCardProps, notify)
    provideHoverCard(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      setOpen: ctx.api.value.setOpen,
    }))
  },
})

export const XhHoverCardTrigger = defineComponent({
  name: 'XhHoverCardTrigger',
  setup(_, { slots }) {
    const ctx = useHoverCardContext()
    return () => h('button', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhHoverCardPositioner = defineComponent({
  name: 'XhHoverCardPositioner',
  setup(_, { slots }) {
    const ctx = useHoverCardContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhHoverCardContent = defineComponent({
  name: 'XhHoverCardContent',
  setup(_, { slots }) {
    const ctx = useHoverCardContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhHoverCardArrow = defineComponent({
  name: 'XhHoverCardArrow',
  setup() {
    const ctx = useHoverCardContext()
    return () => h('div', ctx.api.value.getArrowProps() as Record<string, unknown>)
  },
})
