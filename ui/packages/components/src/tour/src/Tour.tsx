import { defineComponent } from 'vue'
import { tourProps } from './interface'
import type { TourProps } from './interface'

export default defineComponent({
  name: 'Tour',
  props: tourProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-tour">
        {slots.default?.()}
      </div>
    )
  }
})
