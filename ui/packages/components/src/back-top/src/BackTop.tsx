import { defineComponent } from 'vue'
import { backtopProps } from './interface'
import type { BackTopProps } from './interface'

export default defineComponent({
  name: 'BackTop',
  props: backtopProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-back-top">
        {slots.default?.()}
      </div>
    )
  }
})
