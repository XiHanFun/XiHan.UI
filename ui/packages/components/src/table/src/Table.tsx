import { defineComponent } from 'vue'
import { tableProps } from './interface'
import type { TableProps } from './interface'

export default defineComponent({
  name: 'Table',
  props: tableProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-table">
        {slots.default?.()}
      </div>
    )
  }
})
