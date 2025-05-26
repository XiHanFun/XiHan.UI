import { defineComponent } from 'vue'
import { inputnumberProps } from './interface'
import type { InputNumberProps } from './interface'

export default defineComponent({
  name: 'InputNumber',
  props: inputnumberProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-input-number">
        {slots.default?.()}
      </div>
    )
  }
})
