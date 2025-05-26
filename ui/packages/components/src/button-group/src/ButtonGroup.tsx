import { defineComponent } from 'vue'
import { buttongroupProps } from './interface'
import type { ButtonGroupProps } from './interface'

export default defineComponent({
  name: 'ButtonGroup',
  props: buttongroupProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-button-group">
        {slots.default?.()}
      </div>
    )
  }
})
