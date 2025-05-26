import { defineComponent } from 'vue'
import { checkboxProps } from './interface'
import type { CheckboxProps } from './interface'

export default defineComponent({
  name: 'Checkbox',
  props: checkboxProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-checkbox">
        {slots.default?.()}
      </div>
    )
  }
})
