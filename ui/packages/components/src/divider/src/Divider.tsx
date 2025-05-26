import { defineComponent } from 'vue'
import { dividerProps } from './interface'
import type { DividerProps } from './interface'

export default defineComponent({
  name: 'Divider',
  props: dividerProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-divider">
        {slots.default?.()}
      </div>
    )
  }
})
