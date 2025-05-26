import { defineComponent } from 'vue'
import { stepsProps } from './interface'
import type { StepsProps } from './interface'

export default defineComponent({
  name: 'Steps',
  props: stepsProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-steps">
        {slots.default?.()}
      </div>
    )
  }
})
