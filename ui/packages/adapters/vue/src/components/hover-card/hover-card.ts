import type { HoverCardApi, HoverCardSchema } from '@xihan-ui/headless'
import type { Direction, Placement, Size } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, mergeProps, Teleport } from 'vue'
import { mergeIntoChild } from '../../runtime/as-child'
import { useScrollbars } from '../../runtime/use-scrollbars'
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
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useHoverCardContext()
    return () => {
      const attrs = {
        ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
      }
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, attrs, 'hover-card')
        if (merged)
          return merged
      }
      return h('button', attrs, children)
    }
  },
})

export const XhHoverCardPositioner = defineComponent({
  name: 'XhHoverCardPositioner',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useHoverCardContext()
    // 卡片内容的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
    const bars = useScrollbars({ scrollable: () => ctx.contentRef.value })
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
  },
})

export const XhHoverCardContent = defineComponent({
  name: 'XhHoverCardContent',
  setup(_, { slots }) {
    const ctx = useHoverCardContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
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
