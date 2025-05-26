import { defineComponent } from 'vue'
import { rowProps } from './interface'
import type { RowProps } from './interface'

export default defineComponent({
  name: 'Row',
  props: rowProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-row">
        {slots.default?.()}
      </div>
    )
  }
})
