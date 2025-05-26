import { defineComponent } from 'vue'
import { paginationProps } from './interface'
import type { PaginationProps } from './interface'

export default defineComponent({
  name: 'Pagination',
  props: paginationProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-pagination">
        {slots.default?.()}
      </div>
    )
  }
})
