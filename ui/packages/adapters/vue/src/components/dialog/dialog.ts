import type { DialogSchema } from '@xihan-ui/headless'
import type { Size } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, Teleport } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideDialog, useDialogContext } from './context'
import { useDialog } from './use-dialog'

type DialogProps = DialogSchema['props']

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
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<DialogProps['translations']>, default: undefined },
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<DialogProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<DialogProps, 'onOpenChange'>['open']) => true,
  },
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
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDialogContent = defineComponent({
  name: 'XhDialogContent',
  setup(_, { slots }) {
    const ctx = useDialogContext()
    return () => {
      if (!ctx.rendered.value)
        return null
      const api = ctx.api.value
      return h(Teleport, { to: 'body' }, [
        api.open || ctx.rendered.value
          ? h('div', {
              ...api.getBackdropProps() as Record<string, unknown>,
              ref: (el: unknown) => { ctx.backdropRef.value = el as HTMLElement },
            })
          : null,
        h('div', api.getPositionerProps() as Record<string, unknown>, [
          h('div', {
            ...api.getContentProps() as Record<string, unknown>,
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
