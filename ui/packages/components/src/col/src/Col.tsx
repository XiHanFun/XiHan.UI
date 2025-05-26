import { defineComponent } from 'vue'
import { colProps } from './interface'
import type { ColProps } from './interface'

export default defineComponent({
  name: 'Col',
  props: colProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-col">
        {slots.default?.()}
      </div>
    )
  }
})
