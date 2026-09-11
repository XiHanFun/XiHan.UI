import type { OverlayBackdropVariant, Size } from '@xihan-ui/core'
import type { DialogApi, DialogSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { provideDialog, useDialogContext } from './context'
import { useDialog } from './use-dialog'

type DialogProps = DialogSchema['props']

/** 默认插槽的载荷：展开态与改展开的动作。 */
export type DialogRootSlotProps = Pick<DialogApi, 'open' | 'setOpen'>

export const XhDialogRoot = defineComponent({
  name: 'XhDialogRoot',
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    modal: { type: Boolean, default: true },
    role: { type: String as PropType<'dialog' | 'alertdialog'>, default: 'dialog' },
    closeOnEscape: { type: Boolean, default: true },
    closeOnInteractOutside: { type: Boolean, default: undefined },
    restoreFocus: { type: Boolean, default: true },
    initialFocus: { type: String, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    variant: { type: String as PropType<OverlayBackdropVariant>, default: undefined },
    translations: { type: Object as PropType<DialogProps['translations']>, default: undefined },
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<DialogProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<DialogProps, 'onOpenChange'>['open']) => true,
    'exit-complete': () => true,
  },
  slots: Object as SlotsType<{
    default?: (props: DialogRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: DialogProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useDialog(withXhConfig('dialog', props) as DialogProps, notify, () => emit('exit-complete'))
    provideDialog(ctx)
    return () => slots.default?.({ open: ctx.api.value.open, setOpen: ctx.api.value.setOpen })
  },
})

export const XhDialogTrigger = defineComponent({
  name: 'XhDialogTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useDialogContext()
    return () => {
      const part = mergePartProps(ctx.api.value.getTriggerProps() as Record<string, unknown>, attrs)
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, part, 'dialog')
        if (merged)
          return merged
      }
      return h('button', part, children)
    }
  },
})

export const XhDialogContent = defineComponent({
  name: 'XhDialogContent',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 content 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useDialogContext()
    return () => {
      if (!ctx.rendered.value)
        return null
      const api = ctx.api.value
      const backdrop = api.getBackdropProps() as Record<string, unknown>
      return h(XhPortal, { to: ctx.portalTarget.value }, () => [
        !backdrop.hidden
          ? h('div', {
              ...backdrop,
              ref: (el: unknown) => { ctx.backdropRef.value = el as HTMLElement },
            })
          : null,
        h('div', api.getPositionerProps() as Record<string, unknown>, [
          h('div', {
            ...mergeProps(api.getContentProps() as Record<string, unknown>, attrs),
            hidden: !ctx.rendered.value || undefined,
            ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
          }, slots.default?.()),
        ]),
      ])
    }
  },
})

export const XhDialogHeader = defineComponent({
  name: 'XhDialogHeader',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('header', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 语气徽记：不给内容就由皮肤按节点上的 data-tone 画兜底字形，塞了节点即整枚换掉。 */
export const XhDialogIndicator = defineComponent({
  name: 'XhDialogIndicator',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('span', ctx.api.value.getIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDialogTitle = defineComponent({
  name: 'XhDialogTitle',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('h2', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDialogDescription = defineComponent({
  name: 'XhDialogDescription',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('p', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDialogBody = defineComponent({
  name: 'XhDialogBody',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('div', ctx.api.value.getBodyProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDialogFooter = defineComponent({
  name: 'XhDialogFooter',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('footer', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDialogCloseTrigger = defineComponent({
  name: 'XhDialogCloseTrigger',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('button', ctx.api.value.getCloseTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
