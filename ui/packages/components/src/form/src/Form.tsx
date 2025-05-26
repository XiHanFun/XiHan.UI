import { defineComponent } from 'vue'
import { formProps } from './interface'
import type { FormProps } from './interface'

export default defineComponent({
  name: 'Form',
  props: formProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-form">
        {slots.default?.()}
      </div>
    )
  }
})
