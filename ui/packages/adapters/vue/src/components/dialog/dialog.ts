import type { DialogApi, DialogSchema } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, mergeProps, Teleport } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
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
    translations: { type: Object as PropType<DialogProps['translations']>, default: undefined },
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<DialogProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<DialogProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: DialogRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: DialogProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useDialog(withXhConfig('dialog', props) as DialogProps, notify)
    provideDialog(ctx)
    return () => slots.default?.({ open: ctx.api.value.open, setOpen: ctx.api.value.setOpen })
  },
})

export const XhDialogTrigger = defineComponent({
  name: 'XhDialogTrigger',
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useDialogContext()
    return () => {
      const attrs = ctx.api.value.getTriggerProps() as Record<string, unknown>
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, attrs, 'dialog')
        if (merged)
          return merged
      }
      return h('button', attrs, children)
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
      return h(Teleport, { to: ctx.portalTarget.value }, [
        api.open || ctx.rendered.value
          ? h('div', {
              ...api.getBackdropProps() as Record<string, unknown>,
              ref: (el: unknown) => { ctx.backdropRef.value = el as HTMLElement },
            })
          : null,
        h('div', api.getPositionerProps() as Record<string, unknown>, [
          h('div', {
            ...mergeProps(api.getContentProps() as Record<string, unknown>, attrs),
            ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
          }, slots.default?.()),
        ]),
      ])
    }
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

export const XhDialogCloseTrigger = defineComponent({
  name: 'XhDialogCloseTrigger',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('button', ctx.api.value.getCloseTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
