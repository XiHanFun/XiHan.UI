import { defineComponent } from 'vue'
import { segmentedProps } from './interface'
import type { SegmentedProps } from './interface'

export default defineComponent({
  name: 'Segmented',
  props: segmentedProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-segmented">
        {slots.default?.()}
      </div>
    )
  }
})
