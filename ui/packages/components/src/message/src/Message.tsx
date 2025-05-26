import { defineComponent } from 'vue'
import { messageProps } from './interface'
import type { MessageProps } from './interface'

export default defineComponent({
  name: 'Message',
  props: messageProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-message">
        {slots.default?.()}
      </div>
    )
  }
})
