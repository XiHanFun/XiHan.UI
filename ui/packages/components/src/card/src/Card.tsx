import { defineComponent } from 'vue'
import { cardProps } from './interface'
import type { CardProps } from './interface'

export default defineComponent({
  name: 'Card',
  props: cardProps,
  setup(props, { slots }) {
    return () => (
      <div class="xh-card">
        {slots.default?.()}
      </div>
    )
  }
})
