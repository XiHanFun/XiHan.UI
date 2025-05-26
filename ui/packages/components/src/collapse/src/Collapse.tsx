import { defineComponent } from 'vue'
import { collapseProps } from './interface'
import type { CollapseProps } from './interface'

export default defineComponent({
  name: 'Collapse',
  props: collapseProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-collapse">
        {slots.default?.()}
      </div>
    )
  }
})
