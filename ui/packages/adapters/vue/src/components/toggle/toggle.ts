import type { ToggleSchema } from '@xihan-ui/headless'
import type { ActionVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { useToggle } from './use-toggle'

type ToggleProps = ToggleSchema['props']

export const XhToggle = defineComponent({
  name: 'XhToggle',
  props: {
    pressed: { type: Boolean, default: undefined },
    defaultPressed: Boolean,
    disabled: Boolean,
    variant: String as PropType<ActionVariant>,
    tone: String as PropType<Tone>,
    size: String as PropType<Size>,
  },
  // pressed-change 携带 { pressed }；update:pressed 携带裸布尔，支持 v-model:pressed
  emits: ['pressed-change', 'update:pressed'],
  setup(props, { emit, slots }) {
    const notify: ToggleProps['onPressedChange'] = (details) => {
      emit('pressed-change', details)
      emit('update:pressed', details.pressed)
    }
    const { api } = useToggle(props as ToggleProps, notify)
    return () => h('button', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})
