import { defineComponent } from 'vue'
import { selectProps } from './interface'
import type { SelectProps } from './interface'

export default defineComponent({
  name: 'Select',
  props: selectProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-select">
        {slots.default?.()}
      </div>
    )
  }
})
