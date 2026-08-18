import type { TooltipApi, TooltipSchema } from '@xihan-ui/headless'
import type { Placement, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, mergeProps, Teleport } from 'vue'
import { mergeIntoChild } from '../../runtime/as-child'
import { provideTooltip, useTooltipContext } from './context'
import { useTooltip } from './use-tooltip'

type TooltipProps = TooltipSchema['props']

/** 默认插槽的载荷：展开状态与开合方法。 */
export type TooltipRootSlotProps = Pick<TooltipApi, 'open' | 'setOpen'>

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
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // open-change 携带 { open }；update:open 携带裸布尔，支持 v-model:open
  emits: {
    'open-change': (_details: PayloadOf<TooltipProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<TooltipProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TooltipRootSlotProps) => VNode[]
  }>,
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
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useTooltipContext()
    return () => {
      const attrs = {
        ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
      }
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, attrs, 'tooltip')
        if (merged)
          return merged
      }
      return h('button', attrs, children)
    }
  },
})

export const XhTooltipPositioner = defineComponent({
  name: 'XhTooltipPositioner',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useTooltipContext()
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, slots.default?.()),
    ])
  },
})

export const XhTooltipContent = defineComponent({
  name: 'XhTooltipContent',
  setup(_, { slots }) {
    const ctx = useTooltipContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤给 content 声明了 display 来盖掉 UA 的 [hidden]{display:none}
      // （盒子得先在，退场才播得出来），所以真正的收起落成内联 display
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhTooltipArrow = defineComponent({
  name: 'XhTooltipArrow',
  setup(_, { slots }) {
    const ctx = useTooltipContext()
    return () => h('div', ctx.api.value.getArrowProps() as Record<string, unknown>, slots.default?.())
  },
})
