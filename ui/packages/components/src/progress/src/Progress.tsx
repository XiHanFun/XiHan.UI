import { defineComponent } from 'vue'
import { progressProps } from './interface'
import type { ProgressProps } from './interface'

export default defineComponent({
  name: 'Progress',
  props: progressProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-progress">
        {slots.default?.()}
      </div>
    )
  }
})
