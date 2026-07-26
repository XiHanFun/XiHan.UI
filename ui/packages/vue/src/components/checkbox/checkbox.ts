import type { CheckboxSchema } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { useCheckbox } from './use-checkbox'

type CheckboxProps = CheckboxSchema['props']

export const XhCheckbox = defineComponent({
  name: 'XhCheckbox',
  props: {
    checked: { type: Boolean, default: undefined },
    defaultChecked: Boolean,
    disabled: Boolean,
  },
  // checked-change 携带 { checked }；update:checked 携带裸布尔，支持 v-model:checked
  emits: ['checked-change', 'update:checked'],
  setup(props, { emit }) {
    const notify: CheckboxProps['onCheckedChange'] = (details) => {
      emit('checked-change', details)
      emit('update:checked', details.checked)
    }
    const { api } = useCheckbox(props as CheckboxProps, notify)
    return () => h('button', api.value.getRootProps() as Record<string, unknown>, [
      h('span', api.value.getIndicatorProps() as Record<string, unknown>),
    ])
  },
})
