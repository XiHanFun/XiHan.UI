import { defineComponent } from 'vue'
import { transferProps } from './interface'
import type { TransferProps } from './interface'

export default defineComponent({
  name: 'Transfer',
  props: transferProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-transfer">
        {slots.default?.()}
      </div>
    )
  }
})
