import { defineComponent } from 'vue'
import { inputProps } from './interface'
import type { InputProps } from './interface'

export default defineComponent({
  name: 'Input',
  props: inputProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-input">
        {slots.default?.()}
      </div>
    )
  }
})
