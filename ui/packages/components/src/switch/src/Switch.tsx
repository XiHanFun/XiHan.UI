import { defineComponent } from 'vue'
import { switchProps } from './interface'
import type { SwitchProps } from './interface'

export default defineComponent({
  name: 'Switch',
  props: switchProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-switch">
        {slots.default?.()}
      </div>
    )
  }
})
