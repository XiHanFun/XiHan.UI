import { defineComponent } from 'vue'
import { emptyProps } from './interface'
import type { EmptyProps } from './interface'

export default defineComponent({
  name: 'Empty',
  props: emptyProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-empty">
        {slots.default?.()}
      </div>
    )
  }
})
