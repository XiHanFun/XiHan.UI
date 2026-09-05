import type { Direction, Placement, Size } from '@xihan-ui/core'
import type { PopoverApi, PopoverSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, mergeProps, Teleport } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { useScrollbars } from '../../runtime/use-scrollbars'
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
    /** 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给。 */
    dir: { type: String as PropType<Direction>, default: undefined },
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
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots }) {
    const ctx = usePopoverContext()
    return () => {
      const attrs = {
        ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
      }
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, attrs, 'popover')
        if (merged)
          return merged
      }
      return h('button', attrs, children)
    }
  },
})

export const XhPopoverPositioner = defineComponent({
  name: 'XhPopoverPositioner',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = usePopoverContext()
    // 面板内容的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
    const bars = useScrollbars({ scrollable: () => ctx.contentRef.value })
    // 定位层搬到 portal 落点，逃开祖先的层叠上下文
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
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
