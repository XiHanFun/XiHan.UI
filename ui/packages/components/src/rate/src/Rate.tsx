import { defineComponent } from 'vue'
import { rateProps } from './interface'
import type { RateProps } from './interface'

export default defineComponent({
  name: 'Rate',
  props: rateProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-rate">
        {slots.default?.()}
      </div>
    )
  }
})
