import { defineComponent } from 'vue'
import { timelineProps } from './interface'
import type { TimelineProps } from './interface'

export default defineComponent({
  name: 'Timeline',
  props: timelineProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-timeline">
        {slots.default?.()}
      </div>
    )
  }
})
