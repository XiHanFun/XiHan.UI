import { defineComponent } from 'vue'
import { radioProps } from './interface'
import type { RadioProps } from './interface'

export default defineComponent({
  name: 'Radio',
  props: radioProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-radio">
        {slots.default?.()}
      </div>
    )
  }
})
