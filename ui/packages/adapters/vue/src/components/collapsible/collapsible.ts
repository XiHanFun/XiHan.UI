import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { CollapsibleSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { provideCollapsible, useCollapsibleContext } from './context'
import { useCollapsible } from './use-collapsible'

type CollapsibleProps = CollapsibleSchema['props']

export const XhCollapsibleRoot = defineComponent({
  name: 'XhCollapsibleRoot',
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
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

/** 触发器与其同排内容住的那一行；只写触发器时可以不用它 */
export const XhCollapsibleHeader = defineComponent({
  name: 'XhCollapsibleHeader',
  setup(_, { slots }) {
    const ctx = useCollapsibleContext()
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCollapsibleTrigger = defineComponent({
  name: 'XhCollapsibleTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useCollapsibleContext()
    return () => {
      const part = mergePartProps(ctx.api.value.getTriggerProps() as Record<string, unknown>, attrs)
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, part, 'collapsible')
        if (merged)
          return merged
      }
      return h('button', part, children)
    }
  },
})

export const XhCollapsibleIndicator = defineComponent({
  name: 'XhCollapsibleIndicator',
  setup(_, { slots }) {
    const ctx = useCollapsibleContext()
    return () => h('span', ctx.api.value.getIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCollapsibleContent = defineComponent({
  name: 'XhCollapsibleContent',
  setup(_, { slots }) {
    const ctx = useCollapsibleContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})
