import type { AlertSchema, AlertTranslations } from '@xihan-ui/headless'
import type { Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideAlert, useAlertContext } from './context'
import { useAlert } from './use-alert'

type AlertProps = AlertSchema['props']

export const XhAlertRoot = defineComponent({
  name: 'XhAlertRoot',
  props: {
    tone: String as PropType<Tone>,
    // 三态：不传即由 connect 决定缺省，传 false 才真的关掉
    closable: { type: Boolean, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    translations: Object as PropType<Partial<AlertTranslations>>,
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<AlertProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<AlertProps, 'onOpenChange'>['open']) => true,
  },
  setup(props, { slots, emit }) {
    const notify: AlertProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useAlert(withXhConfig('alert', props) as AlertProps, notify)
    provideAlert(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhAlertIndicator = defineComponent({
  name: 'XhAlertIndicator',
  setup(_, { slots }) {
    const ctx = useAlertContext()
    return () => h('span', ctx.api.value.getIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhAlertTitle = defineComponent({
  name: 'XhAlertTitle',
  setup(_, { slots }) {
    const ctx = useAlertContext()
    return () => h('div', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhAlertDescription = defineComponent({
  name: 'XhAlertDescription',
  setup(_, { slots }) {
    const ctx = useAlertContext()
    return () => h('div', ctx.api.value.getDescriptionProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhAlertCloseTrigger = defineComponent({
  name: 'XhAlertCloseTrigger',
  setup(_, { slots }) {
    const ctx = useAlertContext()
    return () => h('button', ctx.api.value.getCloseTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
