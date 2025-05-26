import { defineComponent } from 'vue'
import { buttonProps } from './interface'
import type { ButtonProps } from './interface'

export default defineComponent({
  name: 'Button',
  props: buttonProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-button">
        {slots.default?.()}
      </div>
    )
  }
})
