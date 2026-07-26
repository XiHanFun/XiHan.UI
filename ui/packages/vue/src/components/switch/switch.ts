import type { SwitchSchema } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { useSwitch } from './use-switch'

type SwitchProps = SwitchSchema['props']

export const XhSwitch = defineComponent({
  name: 'XhSwitch',
  props: {
    checked: { type: Boolean, default: undefined },
    defaultChecked: Boolean,
    disabled: Boolean,
  },
  // checked-change 携带 { checked }；update:checked 携带裸布尔，支持 v-model:checked
  emits: ['checked-change', 'update:checked'],
  setup(props, { emit }) {
    const notify: SwitchProps['onCheckedChange'] = (details) => {
      emit('checked-change', details)
      emit('update:checked', details.checked)
    }
    const { api } = useSwitch(props as SwitchProps, notify)
    return () => h('button', api.value.getRootProps() as Record<string, unknown>, [
      h('span', api.value.getThumbProps() as Record<string, unknown>),
    ])
  },
})
